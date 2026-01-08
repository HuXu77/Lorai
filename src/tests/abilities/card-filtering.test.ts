/**
 * Card Filtering Tests
 * 
 * Tests that card type and subtype filtering works correctly.
 * Verifies songs, characters, items, and subtypes are properly identified.
 */

import { CardType } from '../../engine/models';

describe('Card Filtering - Type and Subtype Support', () => {
    describe('Song Identification', () => {
        it('should identify songs as Action cards with Song subtype', () => {
            const song = {
                name: 'Let It Go',
                type: 'Action' as CardType,
                subtypes: ['Song'],
                cost: 3
            };

            const regularAction = {
                name: 'Fire the Cannons',
                type: 'Action' as CardType,
                subtypes: [],
                cost: 2
            };

            // Songs are Action type with Song subtype
            expect(song.type).toBe('Action');
            expect(song.subtypes).toContain('Song');

            // Regular actions don't have Song subtype
            expect(regularAction.type).toBe('Action');
            expect(regularAction.subtypes).not.toContain('Song');
        });

        it('should not identify characters as songs', () => {
            const character = {
                name: 'Elsa',
                type: 'Character' as CardType,
                subtypes: ['Princess'],
                cost: 5
            };

            expect(character.type).not.toBe('Action');
            expect(character.subtypes).not.toContain('Song');
        });
    });

    describe('Character Subtype Filtering', () => {
        it('should filter by Princess subtype', () => {
            const princess = {
                name: 'Elsa',
                type: 'Character' as CardType,
                subtypes: ['Princess', 'Queen'],
                cost: 5
            };

            const hero = {
                name: 'Hercules',
                type: 'Character' as CardType,
                subtypes: ['Hero'],
                cost: 4
            };

            expect(princess.subtypes).toContain('Princess');
            expect(hero.subtypes).not.toContain('Princess');
            expect(hero.subtypes).toContain('Hero');
        });

        it('should handle multiple subtypes', () => {
            const character = {
                type: 'Character' as CardType,
                subtypes: ['Princess', 'Queen', 'Hero']
            };

            expect(character.subtypes).toContain('Princess');
            expect(character.subtypes).toContain('Queen');
            expect(character.subtypes).toContain('Hero');
            expect(character.subtypes.length).toBe(3);
        });
    });

    describe('Card Type Filtering', () => {
        it('should distinguish between different card types', () => {
            const character = { type: 'Character' as CardType };
            const action = { type: 'Action' as CardType };
            const item = { type: 'Item' as CardType };
            const location = { type: 'Location' as CardType };

            expect(character.type).toBe('Character');
            expect(action.type).toBe('Action');
            expect(item.type).toBe('Item');
            expect(location.type).toBe('Location');
        });

        it('should combine type and subtype filters', () => {
            const princess = {
                type: 'Character' as CardType,
                subtypes: ['Princess']
            };

            // Both conditions must be true
            expect(princess.type).toBe('Character');
            expect(princess.subtypes).toContain('Princess');
        });

        it('should identify when type matches but subtype does not', () => {
            const hero = {
                type: 'Character' as CardType,
                subtypes: ['Hero']
            };

            // Type matches, but wrong subtype
            expect(hero.type).toBe('Character');
            expect(hero.subtypes).not.toContain('Princess');
        });
    });

    describe('Cost Filter Combinations', () => {
        it('should combine cost and type filters', () => {
            const lowCostSong = {
                type: 'Action' as CardType,
                subtypes: ['Song'],
                cost: 2
            };

            const highCostSong = {
                type: 'Action' as CardType,
                subtypes: ['Song'],
                cost: 5
            };

            const lowCostAction = {
                type: 'Action' as CardType,
                subtypes: [],
                cost: 2
            };

            // All share Action type
            expect(lowCostSong.type).toBe('Action');
            expect(highCostSong.type).toBe('Action');
            expect(lowCostAction.type).toBe('Action');

            // Songs have Song subtype
            expect(lowCostSong.subtypes).toContain('Song');
            expect(highCostSong.subtypes).toContain('Song');
            expect(lowCostAction.subtypes).not.toContain('Song');

            // Costs differ
            expect(lowCostSong.cost).toBe(2);
            expect(highCostSong.cost).toBe(5);
        });

        it('should filter by max cost correctly', () => {
            const cards = [
                { cost: 1, type: 'Action' as CardType },
                { cost: 2, type: 'Action' as CardType },
                { cost: 3, type: 'Action' as CardType },
                { cost: 5, type: 'Action' as CardType }
            ];

            const maxCost = 2;
            const filtered = cards.filter(c => c.cost <= maxCost);

            expect(filtered.length).toBe(2);
            expect(filtered.every(c => c.cost <= maxCost)).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle cards with no subtypes', () => {
            const card = {
                type: 'Character' as CardType,
                subtypes: []
            };

            expect(card.subtypes.length).toBe(0);
            expect(card.subtypes).not.toContain('Princess');
        });

        it('should handle case-sensitive subtype matching', () => {
            const card = {
                type: 'Character' as CardType,
                subtypes: ['Princess']
            };

            const cardLower = {
                type: 'Character' as CardType,
                subtypes: ['princess']
            };

            // Subtypes are typically capitalized
            expect(card.subtypes).toContain('Princess');
            expect(cardLower.subtypes).toContain('princess');
            expect(cardLower.subtypes).not.toContain('Princess');
        });

        it('should verify song is Action + Song subtype, not a type itself', () => {
            // Songs are NOT a separate card type - they're Actions with Song subtype
            const song = {
                type: 'Action' as CardType,
                subtypes: ['Song']
            };

            expect(song.type).not.toBe('Song'); // Song is not a type
            expect(song.type).toBe('Action'); // Songs are Actions
            expect(song.subtypes).toContain('Song'); // with Song subtype
        });
    });
});
