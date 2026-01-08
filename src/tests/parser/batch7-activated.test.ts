
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 7: Activated Abilities', () => {
    describe('Draw', () => {
        it('should parse Draw a card', () => {
            const card = {
                id: 'test-draw-1',
                name: 'Magic Mirror',
                type: 'Item' as CardType,
                abilities: [{ fullText: 'Speak! 4 ⬡, ⟳ — Draw a card.' }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('activated');
            expect((abilities[0] as any).costs[0].amount).toBe(4); // ink cost is first in text "4 ⬡, ⟳"
            expect((abilities[0] as any).costs[0].type).toBe('ink');
            expect((abilities[0] as any).costs[1].type).toBe('exert'); // exert is second
            expect((abilities[0] as any).effects[0].type).toBe('draw');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
        });
    });

    describe('Heal', () => {
        it('should parse Remove damage', () => {
            const card = {
                id: 'test-heal',
                name: 'Dinglehopper',
                type: 'Item' as CardType,
                abilities: [{ fullText: 'Straighten Hair 1 ⬡, ⟳ — Remove up to 1 damage from chosen character.' }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('heal');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
        });
    });

    describe('Exert', () => {
        it('should parse Exert chosen opposing character', () => {
            const card = {
                id: 'test-exert',
                name: 'Elsa',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'Freeze ⟳ — Exert chosen opposing character.' }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('exert');
            expect((abilities[0] as any).effects[0].target.type).toBe('chosen_opposing_character');
        });

        it('should parse Exert with lowercase text (verification repro)', () => {
            const card = {
                id: 'test-exert-lower',
                name: 'Elsa',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'freeze ⟳ — exert chosen opposing character.' }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('exert');
        });
    });

    describe('Damage', () => {
        it('should parse Deal damage', () => {
            const card = {
                id: 'test-damage',
                name: 'Skirmish Giver',
                type: 'Character' as CardType, // Changed to Character to avoid Action routing
                abilities: [{ fullText: 'Skirmish ⟳ — Deal 1 damage to chosen character.' }]
            } as any;

            // Note: Actions usually use triggered parser, but if it has a cost separator it might hit activated
            // Let's assume this is on a character/item for the test

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('damage');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
        });
    });
});
