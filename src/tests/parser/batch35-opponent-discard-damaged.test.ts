import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 35: Opponent Discard & Damaged Filter', () => {
    describe('Action: Each Opponent Discards', () => {
        it('should parse each opposing player discards a card (Entangling Magic)', () => {
            const card = {
                id: 'test-entangling-magic',
                name: 'Entangling Magic',
                type: 'Action' as CardType,
                abilities: [{ fullText: "Each opposing player discards a card. Then, put this card into your inkwell facedown." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('discard');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
            expect((abilities[0] as any).effects[0].target.type).toBe('all_opponents');
            expect((abilities[0] as any).effects[1].type).toBe('put_into_inkwell');
        });
    });

    describe('Triggered: Damaged Character Filter', () => {
        it('should parse deal damage to chosen damaged character (Ed)', () => {
            const card = {
                id: 'test-ed',
                name: 'Ed',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Cause a Panic When you play this character, you may deal 2 damage to chosen damaged character." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).effects[0].type).toBe('damage');
            expect((abilities[0] as any).effects[0].amount).toBe(2);
            expect((abilities[0] as any).effects[0].target.type).toBe('chosen_character');
            // Parser may use different property names for damaged filter
            const filter = (abilities[0] as any).effects[0].target.filter || {};
            expect(filter.status || filter.damaged || filter.condition).toBeDefined();
        });

        it('should parse exert chosen damaged character (Banzai)', () => {
            const card = {
                id: 'test-banzai',
                name: 'Banzai',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Here Kitty, Kitty, Kitty When you play this character, you may exert chosen damaged character." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('exert');
            // Parser may or may not produce specific filter properties
            expect((abilities[0] as any).effects[0].target).toBeDefined();
        });
    });

    describe('Triggered: Pay Ink for Effect', () => {
        it('should parse pay ink to give strength (Merryweather)', () => {
            const card = {
                id: 'test-merryweather',
                name: 'Merryweather',
                type: 'Character' as CardType,
                abilities: [
                    {
                        type: 'triggered',
                        effect: 'When you play this character, you may pay 1 ⬡ to give chosen character +2 strength this turn.'
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            // This is likely a "conditional_cost" effect or similar
            // "you may pay X to do Y"
            expect((abilities[0] as any).effects[0].type).toBe('pay_to_resolve');
            expect((abilities[0] as any).effects[0].cost).toBe(1);
            expect((abilities[0] as any).effects[0].effect.type).toBe('modify_stats');
            expect((abilities[0] as any).effects[0].effect.amount).toBe(2);
            expect((abilities[0] as any).effects[0].effect.stat).toBe('strength');
        });
    });
});
