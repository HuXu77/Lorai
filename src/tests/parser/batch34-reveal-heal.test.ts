import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 34: Reveal & Heal Patterns', () => {
    describe('Reveal Effects', () => {
        it('should parse reveal top card and put in hand if character (Merlin - Self-Appointed Mentor)', () => {
            const card = {
                id: 'test-merlin',
                name: 'Merlin',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Bag of Tricks When you play this character, you may reveal the top card of your deck. If it's a character card, put it into your hand. Otherwise, put it on the bottom of your deck." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_played');
            expect((abilities[0] as any).effects[0].type).toBe('reveal_and_draw');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
            expect((abilities[0] as any).effects[0].filter.cardType).toBe('character');
        });



        it('should parse simple reveal (Generic)', () => {
            const card = {
                id: 'test-generic-reveal',
                name: 'Generic Reveal',
                type: 'Action' as CardType,
                abilities: [{ fullText: "Reveal the top card of your deck. Put it into your hand." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('reveal_and_draw');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
        });
    });

    describe('Heal Effects', () => {
        it('should parse heal all characters (Hakuna Matata)', () => {
            const card = {
                id: 'test-hakuna',
                name: 'Hakuna Matata',
                type: 'Song',
                abilities: [{ fullText: "Remove up to 3 damage from each of your characters." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('heal');
            expect((abilities[0] as any).effects[0].amount).toBe(3);
            expect((abilities[0] as any).effects[0].target.type).toBe('all_characters'); // or my_characters
            expect((abilities[0] as any).effects[0].target.mine).toBe(true);
        });

        it('should parse heal chosen character (Dinglehopper)', () => {
            const card = {
                id: 'test-dinglehopper',
                name: 'Dinglehopper',
                type: 'Item' as CardType,
                abilities: [{ fullText: "Straighten Hair Exert — Remove up to 1 damage from chosen character." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated');
            expect((abilities[0] as any).costs.length).toBe(1); // Exert only
            expect((abilities[0] as any).costs[0].type).toBe('exert');
            expect((abilities[0] as any).effects[0].type).toBe('heal');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
            expect((abilities[0] as any).effects[0].target.type).toBe('chosen_character');
        });

        it('should parse generic heal with multiple costs', () => {
            const card = {
                id: 'test-generic-heal-cost',
                name: 'Generic Healer',
                type: 'Item' as CardType,
                abilities: [{ fullText: "Exert, 1 Ink — Remove up to 2 damage from chosen character." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated');
            expect((abilities[0] as any).costs.length).toBe(2); // Exert + Ink
            expect((abilities[0] as any).effects[0].type).toBe('heal');
            expect((abilities[0] as any).effects[0].amount).toBe(2);
        });
    });
});
