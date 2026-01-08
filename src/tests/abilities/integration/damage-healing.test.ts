/**
 * Integration Test: Damage & Healing Effects
 * 
 * Tests the complete pipeline: Parser → Executor → State Change
 */

import { SharedTestFixture } from '../../test-fixtures';
import { CardType, ZoneType } from '../../../engine/models';

describe('Damage & Healing Integration', () => {
    let fixture: any;

    beforeAll(async () => {
        fixture = await SharedTestFixture.getInstance();
    });

    describe('Damage Effects', () => {
        it('should deal damage to a targeted character', async () => {
            const { game, turnManager, p1Id, p2Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            const player2 = game.state.players[p2Id];

            // Setup: Character in play for opponent
            const target = {
                instanceId: 'target-1',
                name: 'Test Character',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p2Id,
                strength: 3,
                willpower: 5,
                damage: 0,
                ready: true
            } as any;
            player2.play.push(target);

            // Setup: Source card with damage effect
            const damageEffect = {
                type: 'damage' as const,
                target: { type: 'chosen_opposing_character' as const },
                amount: 3
            };

            // Execute damage effect
            const context = {
                player: player1,
                card: null,
                gameState: game,
                eventContext: {
                    event: 'CARD_PLAYED',
                    timestamp: Date.now(),
                    player: player1,
                    targetCard: target
                }
            };

            await turnManager.abilitySystem.executor.execute(damageEffect, context);

            // Verify damage was applied
            expect(target.damage).toBe(3);
        });

        it('should banish character when damage >= willpower', async () => {
            const { game, turnManager, p1Id, p2Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            const player2 = game.state.players[p2Id];

            // Setup: Character with low willpower
            const target = {
                instanceId: 'fragile-1',
                name: 'Fragile Character',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p2Id,
                strength: 1,
                willpower: 2,
                damage: 0,
                ready: true
            } as any;
            player2.play.push(target);

            // Execute lethal damage
            const damageEffect = {
                type: 'damage' as const,
                target: { type: 'chosen_opposing_character' as const },
                amount: 5
            };

            const context = {
                player: player1,
                card: null,
                gameState: game,
                eventContext: {
                    event: 'CARD_PLAYED',
                    timestamp: Date.now(),
                    player: player1,
                    targetCard: target
                }
            };

            await turnManager.abilitySystem.executor.execute(damageEffect, context);

            // Character should be banished (moved to discard)
            expect(player2.play.find(c => c.instanceId === 'fragile-1')).toBeUndefined();
            expect(player2.discard.find(c => c.instanceId === 'fragile-1')).toBeDefined();
        });
    });

    describe('Healing Effects', () => {
        it('should remove damage from a character', async () => {
            const { game, turnManager, p1Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];

            // Setup: Damaged character
            const target = {
                instanceId: 'wounded-1',
                name: 'Wounded Character',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p1Id,
                strength: 3,
                willpower: 5,
                damage: 3,
                ready: true
            } as any;
            player1.play.push(target);

            // Execute heal effect
            const healEffect = {
                type: 'heal' as const,
                target: { type: 'chosen_character' as const },
                amount: 2
            };

            const context = {
                player: player1,
                card: null,
                gameState: game,
                eventContext: {
                    event: 'CARD_PLAYED',
                    timestamp: Date.now(),
                    player: player1,
                    targetCard: target
                }
            };

            await turnManager.abilitySystem.executor.execute(healEffect, context);

            // Verify healing was applied
            expect(target.damage).toBe(1);
        });

        it('should not heal below 0 damage', async () => {
            const { game, turnManager, p1Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];

            // Setup: Undamaged character
            const target = {
                instanceId: 'healthy-1',
                name: 'Healthy Character',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p1Id,
                strength: 3,
                willpower: 5,
                damage: 0,
                ready: true
            } as any;
            player1.play.push(target);

            // Execute heal effect 
            const healEffect = {
                type: 'heal' as const,
                target: { type: 'chosen_character' as const },
                amount: 5
            };

            const context = {
                player: player1,
                card: null,
                gameState: game,
                eventContext: {
                    event: 'CARD_PLAYED',
                    timestamp: Date.now(),
                    player: player1,
                    targetCard: target
                }
            };

            await turnManager.abilitySystem.executor.execute(healEffect, context);

            // Damage should remain at 0
            expect(target.damage).toBe(0);
        });
    });

    describe('Remove Damage Effects', () => {
        it('should remove specific damage amount', async () => {
            const { game, turnManager, p1Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];

            // Setup: Damaged character
            const target = {
                instanceId: 'damaged-1',
                name: 'Damaged Character',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p1Id,
                strength: 3,
                willpower: 5,
                damage: 4,
                ready: true
            } as any;
            player1.play.push(target);

            // Execute remove_damage effect
            const removeEffect = {
                type: 'remove_damage' as const,
                target: { type: 'self' as const },
                amount: 3
            };

            const context = {
                player: player1,
                card: target,
                gameState: game,
                eventContext: {
                    event: 'ABILITY_ACTIVATED',
                    timestamp: Date.now(),
                    player: player1
                }
            };

            await turnManager.abilitySystem.executor.execute(removeEffect, context);

            expect(target.damage).toBe(1);
        });
    });
});
