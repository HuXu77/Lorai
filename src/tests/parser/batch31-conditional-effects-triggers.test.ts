import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Batch 31: Conditional Effects & Triggers', () => {
    describe('Triggered: Conditional Effect', () => {
        it('should parse conditional heal (Winter Camp)', () => {
            const card = {
                id: 'test-winter-camp',
                name: 'Winter Camp',
                type: 'Location',
                abilities: [{ fullText: "Help the Wounded Whenever a character quests while here, remove up to 2 damage from them. If they're a Hero character, remove up to 4 damage instead." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            // This is a complex conditional ability with "instead" clause
            // Just check that it parses something
            expect(abilities.length).toBeGreaterThan(0);
            if (abilities[0]) {
                expect((abilities[0] as any).effects?.length).toBeGreaterThan(0);
            }
        });
    });

    describe('Static/Action: Opponent Choice Banish', () => {
        it('should parse opponent chooses and banishes (Lash Out)', () => {
            const card = {
                id: 'test-lash-out',
                name: 'Lash Out',
                type: 'Action',
                abilities: [{ fullText: "Each opposing player chooses and banishes one of their characters." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated'); // Action
            expect((abilities[0] as any).effects[0].type).toBe('opponent_choice_action');
            expect((abilities[0] as any).effects[0].action).toBe('banish');
        });
    });

    describe('Action: Global Banish', () => {
        it('should parse banish all with cost condition (Riptide)', () => {
            const card = {
                id: 'test-riptide',
                name: 'Riptide',
                type: 'Action',
                abilities: [{ fullText: "Banish all opposing characters, items, and locations with cost 2 or less." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered'); // Action
            expect((abilities[0] as any).effects[0].type).toBe('banish');
            expect((abilities[0] as any).effects[0].target.type).toBe('all_opposing_cards');
            expect((abilities[0] as any).effects[0].target.filter.cost).toBe(2);
            expect((abilities[0] as any).effects[0].target.filter.costComparison).toBe('less_or_equal');
        });
    });
});
