/**
 * Tests for cost_reduction_per_character parsing and execution
 * Covers cards like Tramp - Street-Smart Dog, Sheriff of Nottingham, Chernabog
 */

import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Cost Reduction Per Character Parsing', () => {
    describe('Tramp - Street-Smart Dog', () => {
        it('should parse "For each character you have in play, you pay 1 less to play this character"', () => {
            const card = {
                id: 1443,
                name: 'Tramp',
                fullName: 'Tramp - Street-Smart Dog',
                abilities: [{
                    effect: "For each character you have in play, you pay 1 ⬡ less to play this character.",
                    fullText: "NOW IT'S A PARTY For each character you have in\nplay, you pay 1 ⬡ less to play this character.",
                    name: "NOW IT'S A PARTY",
                    type: "static"
                }],
                cost: 7,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            };

            const abilities = parseToAbilityDefinition(card as any);

            console.log('\n=== TRAMP PARSE RESULT ===');
            console.log(JSON.stringify(abilities, null, 2));
            console.log('===========================\n');

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            // Find the static ability
            const staticAbility = abilities.find(a => a.type === 'static');
            expect(staticAbility).toBeDefined();

            // Verify the effect
            const effect = staticAbility?.effects?.[0];
            expect(effect).toBeDefined();
            expect(effect.type).toBe('cost_reduction_per_character');
            expect(effect.reductionPerCharacter).toBe(1);
            expect(effect.appliesTo).toBe('self');
        });
    });

    describe('Sheriff of Nottingham - Bushel Britches', () => {
        it('should parse "For each item you have in play, you pay 1 less to play this character"', () => {
            const card = {
                id: 1101,
                name: 'Sheriff of Nottingham',
                fullName: 'Sheriff of Nottingham - Bushel Britches',
                abilities: [{
                    effect: "For each item you have in play, you pay 1 ⬡ less to play this character.",
                    fullText: "EVERY LITTLE BIT HELPS For each item you have in\nplay, you pay 1 ⬡ less to play this character.",
                    name: "EVERY LITTLE BIT HELPS",
                    type: "static"
                }],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            };

            const abilities = parseToAbilityDefinition(card as any);

            console.log('\n=== SHERIFF PARSE RESULT ===');
            console.log(JSON.stringify(abilities, null, 2));
            console.log('============================\n');

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            const staticAbility = abilities.find(a => a.type === 'static');
            expect(staticAbility).toBeDefined();

            const effect = staticAbility?.effects?.[0];
            expect(effect).toBeDefined();
            expect(effect.type).toBe('cost_reduction_per_character');
            expect(effect.reductionPerCharacter).toBe(1);
            expect(effect.filter?.classification).toBe('item');
        });
    });

    describe('Seeking the Half Crown (Action)', () => {
        it('should parse "For each Sorcerer character you have in play, you pay 1 less to play this action"', () => {
            const card = {
                id: 9999,
                name: 'Seeking the Half Crown',
                fullName: 'Seeking the Half Crown',
                abilities: [{
                    effect: "For each Sorcerer character you have in play, you pay 1 ⬡ less to play this action.",
                    fullText: "For each Sorcerer character you have in play, you pay 1 ⬡ less to play this action.",
                    type: "static"
                }],
                cost: 6,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Amethyst'
            };

            const abilities = parseToAbilityDefinition(card as any);

            console.log('\n=== SEEKING PARSE RESULT ===');
            console.log(JSON.stringify(abilities, null, 2));
            console.log('============================\n');

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            // Note: For action cards, parser returns 'activated' type
            const costAbility = abilities.find(a => a.effects?.some((e: any) => e.type === 'cost_reduction_per_character'));
            expect(costAbility).toBeDefined();

            const effect = costAbility?.effects?.[0];
            expect(effect).toBeDefined();
            expect(effect.type).toBe('cost_reduction_per_character');
            expect(effect.filter?.classification).toBe('Sorcerer');
        });
    });
});
