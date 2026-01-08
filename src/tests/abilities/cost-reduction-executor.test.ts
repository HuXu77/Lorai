/**
 * Tests for getModifiedCost execution with cost_reduction_per_character
 * Verifies that cost is correctly reduced based on cards in play
 */

import { AbilitySystemManager } from '../../engine/abilities/ability-system';
import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardType, ZoneType } from '../../engine/models';

describe('getModifiedCost with cost_reduction_per_character', () => {
    let gameState: GameStateManager;
    let turnManager: TurnManager;
    let abilitySystem: AbilitySystemManager;
    let player: any;

    beforeEach(() => {
        gameState = new GameStateManager();
        gameState.addPlayer('p1', 'Test Player 1');
        gameState.addPlayer('p2', 'Test Player 2');
        player = gameState.getPlayer('p1');
        turnManager = new TurnManager({ state: gameState.state } as any);
        abilitySystem = turnManager.abilitySystem;
    });

    describe('Tramp - Street-Smart Dog', () => {
        it('should reduce cost by 1 for each character in play', () => {
            // Add 3 characters to play
            player.addCardToZone({ name: 'Char1', type: CardType.Character } as any, ZoneType.Play);
            player.addCardToZone({ name: 'Char2', type: CardType.Character } as any, ZoneType.Play);
            player.addCardToZone({ name: 'Char3', type: CardType.Character } as any, ZoneType.Play);

            // Create Tramp card with parsed effects
            const tramp = {
                instanceId: 'tramp-1',
                name: 'Tramp',
                fullName: 'Tramp - Street-Smart Dog',
                cost: 7,
                type: 'Character',
                ownerId: 'p1',
                parsedEffects: [{
                    type: 'static',
                    effects: [{
                        type: 'cost_reduction_per_character',
                        reductionPerCharacter: 1,
                        filter: { classification: 'character' },
                        appliesTo: 'self'
                    }]
                }]
            };

            const modifiedCost = abilitySystem.getModifiedCost(tramp, player);

            // 7 base cost - 3 characters = 4
            expect(modifiedCost).toBe(4);
        });

        it('should reduce cost to 0 (not negative) with many characters', () => {
            // Add 10 characters to play
            for (let i = 0; i < 10; i++) {
                player.addCardToZone({ name: `Char${i}`, type: CardType.Character } as any, ZoneType.Play);
            }

            const tramp = {
                instanceId: 'tramp-1',
                name: 'Tramp',
                cost: 7,
                type: 'Character',
                ownerId: 'p1',
                parsedEffects: [{
                    type: 'static',
                    effects: [{
                        type: 'cost_reduction_per_character',
                        reductionPerCharacter: 1,
                        filter: { classification: 'character' },
                        appliesTo: 'self'
                    }]
                }]
            };

            const modifiedCost = abilitySystem.getModifiedCost(tramp, player);

            // 7 - 10 = -3, but should be clamped to 0
            expect(modifiedCost).toBe(0);
        });

        it('should return base cost when no characters in play', () => {
            // No characters in play

            const tramp = {
                instanceId: 'tramp-1',
                name: 'Tramp',
                cost: 7,
                type: 'Character',
                ownerId: 'p1',
                parsedEffects: [{
                    type: 'static',
                    effects: [{
                        type: 'cost_reduction_per_character',
                        reductionPerCharacter: 1,
                        filter: { classification: 'character' },
                        appliesTo: 'self'
                    }]
                }]
            };

            const modifiedCost = abilitySystem.getModifiedCost(tramp, player);

            expect(modifiedCost).toBe(7);
        });
    });

    describe('Sheriff of Nottingham - item count', () => {
        it('should reduce cost by 1 for each item in play', () => {
            // Add 2 items to play
            player.addCardToZone({ name: 'Item1', type: CardType.Item } as any, ZoneType.Play);
            player.addCardToZone({ name: 'Item2', type: CardType.Item } as any, ZoneType.Play);
            // Add a character too (should NOT count)
            player.addCardToZone({ name: 'Char1', type: CardType.Character } as any, ZoneType.Play);

            const sheriff = {
                instanceId: 'sheriff-1',
                name: 'Sheriff of Nottingham',
                cost: 5,
                type: 'Character',
                ownerId: 'p1',
                parsedEffects: [{
                    type: 'static',
                    effects: [{
                        type: 'cost_reduction_per_character',
                        reductionPerCharacter: 1,
                        filter: { classification: 'item' },
                        appliesTo: 'self'
                    }]
                }]
            };

            const modifiedCost = abilitySystem.getModifiedCost(sheriff, player);

            // 5 - 2 items = 3 (character should not count)
            expect(modifiedCost).toBe(3);
        });
    });
});
