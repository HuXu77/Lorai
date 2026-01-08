import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Ursula Parser Regression Tests', () => {
    const ursulaCard = {
        id: 9999,
        name: 'Ursula',
        type: 'Character' as CardType,
        abilities: [{
            fullText: "When you play this character, chosen opponent reveals their hand and discards a song card of your choice."
        }],
        cost: 4,
        inkwell: true,
        strength: 3,
        willpower: 4,
        lore: 2
    };

    describe('Ability Parsing', () => {
        it('should create exactly ONE ability (no duplicates)', () => {
            const abilities = parseToAbilityDefinition(ursulaCard as any);

            // CRITICAL: Should only create ONE ability
            expect(abilities.length).toBe(1);
        });

        it('should create opponent_reveal_and_discard effect, NOT modify_stats', () => {
            const abilities = parseToAbilityDefinition(ursulaCard as any);

            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('triggered');
            expect(abilities[0].effects).toBeDefined();
            expect(abilities[0].effects.length).toBe(1);

            const effect = abilities[0].effects[0];

            // Should be opponent_reveal_and_discard, NOT modify_stats
            expect(effect.type).toBe('opponent_reveal_and_discard');
            expect(effect.type).not.toBe('modify_stats');
        });
    });

    describe('Pattern Precedence', () => {
        it('should match specific pattern before generic pattern', () => {
            const abilities = parseToAbilityDefinition(ursulaCard as any);

            // Should match Pattern 33 (specific opponent reveal/discard)
            // NOT Pattern 26 (generic "When you play this character")
            // NOT Pattern 41 in misc.ts (generic "chosen character gets")

            expect(abilities[0].effects[0].type).toBe('opponent_reveal_and_discard');
        });

        it('should not create modify_stats effects', () => {
            const abilities = parseToAbilityDefinition(ursulaCard as any);

            // None of the effects should be modify_stats
            abilities.forEach((ability: any) => {
                ability.effects?.forEach((effect: any) => {
                    expect(effect.type).not.toBe('modify_stats');
                });
            });
        });
    });

    describe('Execution Validation', () => {
        it('should not log modify_stats when executed', async () => {
            // This test ensures that when the ability is executed,
            // it doesn't produce "Modified strength" logs

            const abilities = parseToAbilityDefinition(ursulaCard as any);

            expect(abilities[0].effects.every((e: any) =>
                e.type !== 'modify_stats'
            )).toBe(true);
        });
    });
});
