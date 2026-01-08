import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { Card } from '../../engine/models';

describe('Batch 10: Combat Triggers & Play for Free', () => {

    // 1. Combat Triggers: "When this character is challenged"
    // Flynn Rider - Charming Rogue
    it('should parse "Whenever this character is challenged, the challenging player chooses and discards a card"', () => {
        const card = {
            id: 'flynn-rider',
            name: 'Flynn Rider',
            abilities: [
                {
                    type: 'triggered',
                    effect: 'Whenever this character is challenged, the challenging player chooses and discards a card.'
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('card_challenged');
        expect(abilities[0].triggerFilter.target).toBe('self');

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('opponent_discard_choice'); // Or similar
        expect(effects[0].target.type).toBe('challenging_player');
    });

    // 2. Combat Triggers: "When this character is challenged and banished"
    // Cheshire Cat - Not All There
    it('should parse "When this character is challenged and banished, banish the challenging character"', () => {
        const card = {
            id: 'cheshire-cat',
            name: 'Cheshire Cat',
            abilities: [
                {
                    type: 'triggered',
                    effect: 'When this character is challenged and banished, banish the challenging character.'
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('character_challenged_and_banished');

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('banish');
        expect(effects[0].target.type).toBe('challenging_character');
    });

    // Kuzco - Temperamental Emperor
    it('should parse "When this character is challenged and banished, you may banish the challenging character"', () => {
        const card = {
            id: 'kuzco',
            name: 'Kuzco',
            abilities: [
                {
                    type: 'triggered',
                    effect: 'When this character is challenged and banished, you may banish the challenging character.'
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('character_challenged_and_banished');

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('banish');
        expect(effects[0].target.type).toBe('challenging_character');
        expect(effects[0].optional).toBe(true);
    });

    // 3. Play for Free
    // Just in Time
    it('should parse "Play a character with cost 5 or less for free"', () => {
        const card = {
            id: 'just-in-time',
            name: 'Just in Time',
            abilities: [
                {
                    type: 'static', // Action effect
                    effect: 'Play a character with cost 5 or less for free.'
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('static');

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('play_for_free');
        expect(effects[0].filter.cardType).toBe('character');
        expect(effects[0].filter.maxCost).toBe(5);
    });

    // Genie - Powers Unleashed
    it('should parse "you may play an action with cost 5 or less for free"', () => {
        const card = {
            id: 'genie',
            name: 'Genie',
            abilities: [
                {
                    type: 'triggered',
                    effect: 'Whenever this character quests, you may play an action with cost 5 or less for free.'
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('play_for_free');
        expect(effects[0].filter.cardType).toBe('action');
        expect(effects[0].filter.maxCost).toBe(5);
        expect(effects[0].optional).toBe(true);
    });

    // 4. Opponent Discard Choice
    // You Have Forgotten Me
    it('should parse "Each opponent chooses and discards 2 cards"', () => {
        const card = {
            id: 'forgotten-me',
            name: 'You Have Forgotten Me',
            abilities: [
                {
                    type: 'static', // Action effect
                    effect: 'Each opponent chooses and discards 2 cards.'
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('opponent_discard_choice');
        expect(effects[0].amount).toBe(2);
        expect(effects[0].target.type).toBe('all_opponents');
    });

});
