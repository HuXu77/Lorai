import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { Card } from '../../engine/models';

describe('Batch 5: Questing & Banished Triggers', () => {

    // "Whenever this character quests"
    // Example: Yzma - Alchemist
    // "Whenever this character quests, look at the top card of your deck. Put it on either the top or the bottom of your deck."
    it('should parse "Whenever this character quests"', () => {
        const card: Card = {
            id: 'yzma-alchemist',
            name: 'Yzma',
            fullName: 'Yzma - Alchemist',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "Whenever this character quests, look at the top card of your deck. Put it on either the top or the bottom of your deck."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('card_quested');
        expect((abilities[0] as any).effects.length).toBeGreaterThan(0);
        // We might not parse the complex effect yet, but the trigger should be correct
    });

    // "When this character is banished"
    // Example: Cheshire Cat - Not All There
    // "When this character is banished, banish chosen challenging character."
    it('should parse "When this character is banished"', () => {
        const card: Card = {
            id: 'cheshire-cat-not-all-there',
            name: 'Cheshire Cat',
            fullName: 'Cheshire Cat - Not All There',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "When this character is banished, banish chosen challenging character."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('card_banished');
        expect((abilities[0] as any).effects[0].type).toBe('banish');
    });

    // "Whenever one of your characters is banished"
    // Example: Dr. Facilier - Agent Provocateur
    // "Whenever one of your other characters is banished in a challenge, you may return that card to your hand."
    it('should parse "Whenever one of your other characters is banished"', () => {
        const card: Card = {
            id: 'dr-facilier-agent-provocateur',
            name: 'Dr. Facilier',
            fullName: 'Dr. Facilier - Agent Provocateur',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "Whenever one of your other characters is banished in a challenge, you may return that card to your hand."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('character_banished_in_challenge');
        expect((abilities[0] as any).condition.type).toBe('event_occurred');
        // Check if it captures "other" and "yours"
    });
});
