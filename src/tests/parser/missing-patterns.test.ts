import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Missing Patterns Reproduction', () => {
    describe('I\'m Stuck!', () => {
        it('should parse "Chosen character can\'t ready at the start of their next turn"', () => {
            const card = {
                id: 'test-im-stuck',
                name: "I'm Stuck!",
                type: 'Action',
                abilities: [{ fullText: "Chosen character can't ready at the start of their next turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated'); // Action
            expect((abilities[0] as any).effects[0].type).toBe('restriction');
            expect((abilities[0] as any).effects[0].restriction).toBe('cant_ready');
            expect((abilities[0] as any).effects[0].duration).toBe('next_turn');
        });
    });

    describe('Dinner Bell', () => {
        it('should parse "Draw cards equal to the damage on chosen character of yours, then banish them"', () => {
            const card = {
                id: 'test-dinner-bell',
                name: 'Dinner Bell',
                type: 'Item',
                abilities: [{ fullText: "⟳, 2 ⬡ — Draw cards equal to the damage on chosen character of yours, then banish them." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated');
            expect((abilities[0] as any).effects[0].type).toBe('draw_equal_to_damage');
            expect((abilities[0] as any).effects[1].type).toBe('banish');
        });
    });

    describe('Lucky Dime', () => {
        it('should parse "Choose a character of yours and gain lore equal to their ◊"', () => {
            const card = {
                id: 'test-lucky-dime',
                name: 'Lucky Dime',
                type: 'Item',
                abilities: [{ fullText: "⟳, 2 ⬡ — Choose a character of yours and gain lore equal to their ◊." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated');
            expect((abilities[0] as any).effects[0].type).toBe('gain_lore');
            expect((abilities[0] as any).effects[0].amount.type).toBe('stat_of_target');
            expect((abilities[0] as any).effects[0].amount.stat).toBe('lore');
        });
    });
});
