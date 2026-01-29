import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 10: Triggered Abilities', () => {
    describe('When Challenged and Banished', () => {
        it('should parse banish challenging character (Cheshire Cat)', () => {
            const card = {
                id: 'test-cheshire',
                name: 'Cheshire Cat',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'Lose Something? When this character is challenged and banished, banish the challenging character.' }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('character_challenged_and_banished');
            expect((abilities[0] as any).effects[0].type).toBe('banish');
            expect((abilities[0] as any).effects[0].target.type).toBe('challenging_character');
        });

        it('should parse may banish challenged character (Prince Phillip)', () => {
            const card = {
                id: 'test-phillip',
                name: 'Prince Phillip',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'Heroism When this character challenges and is banished, you may banish the challenged character.' }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('character_challenged_and_banished');
            expect((abilities[0] as any).effects[0].type).toBe('banish');
            expect((abilities[0] as any).effects[0].optional).toBe(true);
        });
    });

    describe('Whenever Quests', () => {
        it('should parse deal damage effect (Hans)', () => {
            const card = {
                id: 'test-hans',
                name: 'Hans',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'Stage a Little Accident Whenever this character quests, you may deal 1 damage to chosen character.' }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_quested');
            expect((abilities[0] as any).effects[0].type).toBe('damage');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
            expect((abilities[0] as any).effects[0].optional).toBe(true);
        });

        it('should parse cant quest effect (Jasper)', () => {
            const card = {
                id: 'test-jasper',
                name: 'Jasper',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Puppynapping Whenever this character quests, chosen opposing character can't quest during their next turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_quested');
            expect((abilities[0] as any).effects[0].type).toBe('cant_quest');
            expect((abilities[0] as any).effects[0].duration).toBe('next_turn');
        });

        it('should parse look at top card (Yzma)', () => {
            const card = {
                id: 'test-yzma',
                name: 'Yzma',
            } as any;

            // Assuming parseAbility is a helper function that takes the full text and card context
            // and that parseToAbilityDefinition is no longer used directly for this test.
            // The instruction implies a change in the parsing method for this specific test.
            const abilities = parseToAbilityDefinition({
                ...card,
                abilities: [{ fullText: "You're Excused Whenever this character quests, look at the top card of your deck. Put it on either the top or the bottom of your deck." }]
            });
            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_quested');
            expect((abilities[0] as any).effects[0].type).toBe('look_and_move_to_top_or_bottom');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
        });
    });

    describe('When You Play + Lose Lore', () => {
        it('should parse each opponent loses lore (Aladdin)', () => {
            const card = {
                id: 'test-aladdin',
                name: 'Aladdin',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'Improvise When you play this character, each opponent loses 1 lore.' }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_played');
            expect((abilities[0] as any).effects[0].type).toBe('lore_loss');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
            expect((abilities[0] as any).effects[0].target.type).toBe('all_opponents');
        });
    });
});
