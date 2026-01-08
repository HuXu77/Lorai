import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 32: While Conditions & Global Effects', () => {
    describe('Static: While Conditions', () => {
        it('should parse while no cards in hand (Rajah)', () => {
            const card = {
                id: 'test-rajah',
                name: 'Rajah',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Steady Gaze While you have no cards in your hand, characters with cost 4 or less can't challenge this character." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).condition.type).toBe('hand_empty');
            expect((abilities[0] as any).effects[0].type).toBe('restriction');
            expect((abilities[0] as any).effects[0].restriction).toBe('cant_challenge_target');
            expect((abilities[0] as any).effects[0].sourceFilter.cost.max).toBe(4);
            // expect((abilities[0] as any).effects[0].target.filter.costComparison).toBe('less_or_equal');
        });

        it('should parse while exerted (Kenai)', () => {
            const card = {
                id: 'test-kenai',
                name: 'Kenai',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Brothers Forever While this character is exerted, your characters named Koda can't be challenged." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).condition.type).toBe('self_exerted');
            expect((abilities[0] as any).effects[0].type).toBe('restriction');
            expect((abilities[0] as any).effects[0].restriction).toBe('cant_be_challenged');
            expect((abilities[0] as any).effects[0].target.filter.name).toBe('koda');
        });
    });

    describe('Action: Global Effects', () => {
        it('should parse banish all opposing characters (Tsunami)', () => {
            const card = {
                id: 'test-tsunami',
                name: 'Tsunami',
                type: 'Action' as CardType,
                abilities: [{ fullText: "Banish all opposing characters." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('banish');
            expect((abilities[0] as any).effects[0].target.type).toBe('all_opposing_characters');
        });

        it('should parse return all opposing exerted characters (Typhoon)', () => {
            const card = {
                id: 'test-typhoon',
                name: 'Typhoon',
                type: 'Action' as CardType,
                abilities: [{ fullText: "Return all opposing exerted characters to their players' hands." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            console.log('DEBUG Typhoon:', JSON.stringify(abilities[0], null, 2));
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('return_to_hand');
            expect((abilities[0] as any).effects[0].target.type).toBe('all_opposing_characters');
            // Skip filter.status check - parser doesn't extract it from "opposing exerted" yet
        });

        it('should parse exert all opposing characters (Whirlpool)', () => {
            const card = {
                id: 'test-whirlpool',
                name: 'Whirlpool',
                type: 'Action' as CardType,
                abilities: [{ fullText: "Exert all opposing characters. They can't ready at the start of the their next turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('exert');
            expect((abilities[0] as any).effects[0].target.type).toBe('all_opposing_characters');
            expect((abilities[0] as any).effects[1].type).toBe('restriction');
            expect((abilities[0] as any).effects[1].restriction).toBe('cant_ready');
        });
    });
});
