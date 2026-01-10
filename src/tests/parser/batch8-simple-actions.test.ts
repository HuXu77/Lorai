
import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Batch 8: Simple Actions', () => {
    describe('Draw', () => {
        it('should parse Draw 2 cards', () => {
            const card = {
                id: 'test-draw-action',
                name: 'Friends on the Other Side',
                type: 'Action',
                abilities: [{ fullText: 'Draw 2 cards.' }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('activated');
            // expect((abilities[0] as any).event).toBe('card_played'); // Simple actions are now parsed as activated
            expect((abilities[0] as any).effects[0].type).toBe('draw');
            expect((abilities[0] as any).effects[0].amount).toBe(2);
        });
    });

    describe('Heal', () => {
        it('should parse Remove damage', () => {
            const card = {
                id: 'test-heal-action',
                name: 'Healing Glow',
                type: 'Action',
                abilities: [{ fullText: 'Remove up to 2 damage from chosen character.' }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('heal');
            expect((abilities[0] as any).effects[0].amount).toBe(2);
        });
    });

    describe('Damage', () => {
        it('should parse Deal damage', () => {
            const card = {
                id: 'test-damage-action',
                name: 'Fire the Cannons!',
                type: 'Action',
                abilities: [{ fullText: 'Deal 2 damage to chosen character.' }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('damage');
            expect((abilities[0] as any).effects[0].amount).toBe(2);
        });
    });

    describe('Banish', () => {
        it('should parse Banish chosen character', () => {
            const card = {
                id: 'test-banish-action',
                name: 'Dragon Fire',
                type: 'Action',
                abilities: [{ fullText: 'Banish chosen character.' }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('banish');
            expect((abilities[0] as any).effects[0].target.type).toBe('chosen_character');
        });
    });

    describe('Return to Hand', () => {
        it('should parse Return to hand', () => {
            const card = {
                id: 'test-return-action',
                name: 'Mother Knows Best',
                type: 'Action',
                abilities: [{ fullText: "Return chosen character to their player's hand." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('return_to_hand');
        });
    });

    describe('Exert', () => {
        it('should parse Exert chosen character', () => {
            const card = {
                id: 'test-exert-action',
                name: 'Freeze',
                type: 'Action',
                abilities: [{ fullText: 'Exert chosen opposing character.' }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('exert');
            expect((abilities[0] as any).effects[0].target.type).toBe('chosen_opposing_character');
        });
    });
});
