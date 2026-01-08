import { parseToAbilityDefinition } from '../../engine/ability-parser';

/**
 * TDD: Phase 1 Refinement Tests
 * Test preprocessing and pattern improvements BEFORE implementing
 */

describe('Phase 1 Refinements - TDD', () => {

    describe('Refinement 1: Strip Reminder Text', () => {
        it('should parse abilities with reminder text in parentheses', () => {
            const card = {
                id: 12001,
                name: 'Song with Reminder',
                abilities: [{
                    fullText: 'Singer 5 (A character with cost 5 or more can ⟳ to sing this song for free.)',
                    type: 'static',
                    keyword: 'Singer'
                }],
                cost: 3,
                type: 'action-song',
                inkwell: true,
                color: 'Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // Should parse Singer despite reminder text
            expect(abilities.length).toBeGreaterThan(0);
            const singer = abilities.find(a => (a as any).keyword === 'singer');
            expect(singer).toBeDefined();
        });

        it('should parse Challenger with reminder text', () => {
            const card = {
                id: 12002,
                name: 'Character with Reminder',
                abilities: [{
                    fullText: 'Challenger +2 (They get +2 ◇ during challenges.)',
                    type: 'static',
                    keyword: 'Challenger'
                }],
                cost: 4,
                type: 'character',
                inkwell: false,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThan(0);
        });
    });

    describe('Refinement 2: Optional "you may" Effects', () => {
        it('should parse "you may return to hand"', () => {
            const card = {
                id: 12003,
                name: 'Optional Returner',
                abilities: [{
                    fullText: 'When you play this character, you may return chosen character to their owner\'s hand.',
                    type: 'triggered'
                }],
                cost: 3,
                type: 'character',
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            expect(abilities.length).toBeGreaterThan(0);
            const ability = abilities.find(a => (a as any).effects?.[0]?.type === 'return_to_hand');
            expect(ability).toBeDefined();
        });

        it('should parse "you may banish"', () => {
            const card = {
                id: 12004,
                name: 'Optional Banisher',
                abilities: [{
                    fullText: 'You may banish chosen opposing character.',
                    type: 'triggered'
                }],
                cost: 5,
                type: 'action',
                inkwell: false,
                color: 'Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThan(0);
        });

        it('should parse "you may remove damage"', () => {
            const card = {
                id: 12005,
                name: 'Optional Healer',
                abilities: [{
                    fullText: 'During your turn, whenever a card is put into your inkwell, you may remove up to 2 damage from chosen character.',
                    type: 'triggered'
                }],
                cost: 4,
                type: 'character',
                inkwell: true,
                color: 'Amber'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThan(0);
        });
    });

    describe('Refinement 3: Compound/Sequential Effects', () => {
        it('should parse "draw, then discard" compound effect', () => {
            const card = {
                id: 12006,
                name: 'Compound Effect',
                abilities: [{
                    fullText: 'When you play this character, you may draw a card, then choose and discard a card.',
                    type: 'triggered'
                }],
                cost: 2,
                type: 'character',
                inkwell: false,
                color: 'Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            expect(abilities.length).toBeGreaterThan(0);
            // Should handle both draw and discard effects
        });

        it('should parse "deal damage, then banish" compound', () => {
            const card = {
                id: 12007,
                name: 'Damage Then Banish',
                abilities: [{
                    fullText: 'Deal 2 damage to chosen character, then banish them if they have no willpower remaining.',
                    type: 'triggered'
                }],
                cost: 4,
                type: 'action',
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThan(0);
        });
    });

    describe('Refinement Bonus: Better Pattern Flexibility', () => {
        it('should parse variations with "a" vs numbers', () => {
            const card = {
                id: 12008,
                name: 'Draw A Card',
                abilities: [{
                    fullText: 'Draw a card.',
                    type: 'triggered'
                }],
                cost: 1,
                type: 'action',
                inkwell: false,
                color: 'Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            expect(abilities.length).toBeGreaterThan(0);
            const ability = abilities.find(a => (a as any).effects?.[0]?.type === 'draw');
            expect(ability).toBeDefined();
        });

        it('should handle target variations "their owner\'s hand"', () => {
            const card = {
                id: 12009,
                name: 'Return Variation',
                abilities: [{
                    fullText: 'Return chosen character to their owner\'s hand.',
                    type: 'triggered'
                }],
                cost: 2,
                type: 'action',
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThan(0);
        });
    });
});
