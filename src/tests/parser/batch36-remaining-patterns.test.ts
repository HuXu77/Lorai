import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Batch 36: Remaining Patterns', () => {
    describe('Action: Move Damage', () => {
        it('should parse move damage without "up to" and singular counter (Bestow a Gift)', () => {
            const card = {
                id: 'test-bestow-a-gift',
                name: 'Bestow a Gift',
                type: 'Action',
                abilities: [{ fullText: "Move 1 damage counter from chosen character to chosen opposing character." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('move_damage');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
            expect((abilities[0] as any).effects[0].source.type).toBe('chosen_character');
            expect((abilities[0] as any).effects[0].destination.type).toBe('chosen_opposing_character');
        });
    });

    describe('Action: Can\'t Ready', () => {
        it('should parse chosen exerted character can\'t ready (I\'m Stuck!)', () => {
            const card = {
                id: 'test-im-stuck',
                name: 'I\'m Stuck!',
                type: 'Action',
                abilities: [{ fullText: "Chosen exerted character can't ready at the start of their next turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('restriction');
            expect((abilities[0] as any).effects[0].restriction).toBe('cant_ready');
            expect((abilities[0] as any).effects[0].target.type).toBe('chosen_character');
            expect((abilities[0] as any).effects[0].target.filter.status).toBe('exerted');
        });
    });

    describe('Action: Put Chosen into Inkwell', () => {
        it('should parse put chosen item or location into inkwell (Hide Away)', () => {
            const card = {
                id: 'test-hide-away',
                name: 'Hide Away',
                type: 'Action',
                abilities: [{ fullText: "Put chosen item or location into its player's inkwell facedown and exerted." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('put_into_inkwell');
            expect((abilities[0] as any).effects[0].target.type).toBe('chosen_card');
            expect((abilities[0] as any).effects[0].target.filter.type).toEqual(['item', 'location']);
        });
    });
});
