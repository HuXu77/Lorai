import { getCurrentStrength, getCurrentWillpower, getCurrentLore } from '../../engine/stat-calculator';
import { CardInstance } from '../../engine/models';

describe('Stat Calculator', () => {
    describe('getCurrentStrength', () => {
        test('should return base strength when no effects', () => {
            const card = {
                instanceId: 'test-1',
                baseStrength: 3,
                strength: 3
            } as CardInstance;

            const gameState = { activeEffects: [] };

            expect(getCurrentStrength(card, gameState)).toBe(3);
        });

        test('should not double-count when strength already modified', () => {
            const card = {
                instanceId: 'test-1',
                baseStrength: 3,
                strength: 5  // Already modified by recalculateEffects
            } as CardInstance;

            const effect = {
                id: 'effect-1',
                sourceCardId: 'source-1',
                targetCardId: 'test-1',
                type: 'modify_strength' as const,
                value: 2,
                duration: 'until_end_of_turn' as const,
                timestamp: Date.now()
            };

            const gameState = { activeEffects: [effect] };

            // Should use baseStrength (3) + effect (2) = 5, NOT strength (5) + effect (2) = 7
            expect(getCurrentStrength(card, gameState)).toBe(5);
        });

        test('should apply multiple effects correctly', () => {
            const card = {
                instanceId: 'test-1',
                baseStrength: 2,
                strength: 7  // Already modified
            } as CardInstance;

            const gameState = {
                activeEffects: [
                    {
                        id: 'e1',
                        sourceCardId: 's1',
                        targetCardId: 'test-1',
                        type: 'modify_strength' as const,
                        value: 3,
                        duration: 'permanent' as const,
                        timestamp: Date.now()
                    },
                    {
                        id: 'e2',
                        sourceCardId: 's2',
                        targetCardId: 'test-1',
                        type: 'modify_strength' as const,
                        value: 2,
                        duration: 'until_end_of_turn' as const,
                        timestamp: Date.now()
                    }
                ]
            };

            // base (2) + e1 (3) + e2 (2) = 7
            expect(getCurrentStrength(card, gameState)).toBe(7);
        });
    });

    describe('getCurrentWillpower', () => {
        test('should return base willpower when no effects', () => {
            const card = {
                instanceId: 'test-1',
                baseWillpower: 4,
                willpower: 4
            } as CardInstance;

            const gameState = { activeEffects: [] };

            expect(getCurrentWillpower(card, gameState)).toBe(4);
        });

        test('should not double-count when willpower already modified', () => {
            const card = {
                instanceId: 'test-1',
                baseWillpower: 2,
                willpower: 5  // Already modified to 2 + 3
            } as CardInstance;

            const effect = {
                id: 'effect-1',
                sourceCardId: 'source-1',
                targetCardId: 'test-1',
                type: 'modify_willpower' as const,
                value: 3,
                duration: 'until_end_of_turn' as const,
                timestamp: Date.now()
            };

            const gameState = { activeEffects: [effect] };

            // CRITICAL: Should be base (2) + effect (3) = 5, NOT willpower (5) + effect (3) = 8
            expect(getCurrentWillpower(card, gameState)).toBe(5);
        });

        test('should handle negative modifiers correctly', () => {
            const card = {
                instanceId: 'test-1',
                baseWillpower: 5,
                willpower: 3
            } as CardInstance;

            const effect = {
                id: 'effect-1',
                sourceCardId: 'source-1',
                targetCardId: 'test-1',
                type: 'modify_willpower' as const,
                value: -2,
                duration: 'until_end_of_turn' as const,
                timestamp: Date.now()
            };

            const gameState = { activeEffects: [effect] };

            expect(getCurrentWillpower(card, gameState)).toBe(3);
        });
    });

    describe('getCurrentLore', () => {
        test('should return base lore when no effects', () => {
            const card = {
                instanceId: 'test-1',
                baseLore: 2,
                lore: 2
            } as CardInstance;

            const gameState = { activeEffects: [] };

            expect(getCurrentLore(card, gameState)).toBe(2);
        });

        test('should not double-count when lore already modified', () => {
            const card = {
                instanceId: 'test-1',
                baseLore: 1,
                lore: 3  // Already modified
            } as CardInstance;

            const effect = {
                id: 'effect-1',
                sourceCardId: 'source-1',
                targetCardId: 'test-1',
                type: 'modify_lore' as const,
                value: 2,
                duration: 'until_end_of_turn' as const,
                timestamp: Date.now()
            };

            const gameState = { activeEffects: [effect] };

            // Should be base (1) + effect (2) = 3, NOT lore (3) + effect (2) = 5
            expect(getCurrentLore(card, gameState)).toBe(3);
        });
    });

    describe('Edge Cases', () => {
        test('should handle cards without base stats', () => {
            const card = {
                instanceId: 'test-1',
                strength: 2
                // No baseStrength defined
            } as CardInstance;

            const gameState = { activeEffects: [] };

            // Should fall back to strength
            expect(getCurrentStrength(card, gameState)).toBe(2);
        });

        test('should not allow negative stats', () => {
            const card = {
                instanceId: 'test-1',
                baseStrength: 1,
                strength: 1
            } as CardInstance;

            const effect = {
                id: 'effect-1',
                sourceCardId: 'source-1',
                targetCardId: 'test-1',
                type: 'modify_strength' as const,
                value: -5,  // Would make strength negative
                duration: 'until_end_of_turn' as const,
                timestamp: Date.now()
            };

            const gameState = { activeEffects: [effect] };

            // Should be clamped to 0
            expect(getCurrentStrength(card, gameState)).toBe(0);
        });
    });
});
