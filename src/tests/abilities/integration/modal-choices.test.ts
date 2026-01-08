/**
 * Integration Test: Modal Choice Effects
 * 
 * Tests Yes/No prompts, multi-option abilities, and effect choices
 */

import { SharedTestFixture } from '../../test-fixtures';
import { CardType, ZoneType, ChoiceType } from '../../../engine/models';

describe('Modal Choice Integration', () => {
    let fixture: any;

    beforeAll(async () => {
        fixture = await SharedTestFixture.getInstance();
    });

    describe('Modal Effect Execution', () => {
        it('should execute first modal option when chosen', async () => {
            const { game, turnManager, p1Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            player1.lore = 5;

            // Modal effect with two options
            const modalEffect = {
                type: 'modal' as const,
                options: [
                    { effects: [{ type: 'gain_lore' as const, amount: 2 }] },
                    { effects: [{ type: 'draw' as const, amount: 1 }] }
                ]
            };

            // Mock choice response - choose first option
            turnManager.mockPendingChoice = {
                selectedIds: ['0'] // First option
            };

            const context = {
                player: player1,
                card: null,
                gameState: game,
                eventContext: {
                    event: 'CARD_PLAYED',
                    timestamp: Date.now(),
                    player: player1
                },
                modalChoice: 0
            };

            await turnManager.abilitySystem.executor.execute(modalEffect, context);

            // First option chosen: +2 lore
            expect(player1.lore).toBe(7);
        });

        it('should execute second modal option when chosen', async () => {
            const { game, turnManager, p1Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            const startingHand = player1.hand.length;
            player1.deck = [{ instanceId: 'card-1', name: 'Test' }] as any;

            // Modal effect with two options  
            const modalEffect = {
                type: 'modal' as const,
                options: [
                    { effects: [{ type: 'gain_lore' as const, amount: 2 }] },
                    { effects: [{ type: 'draw' as const, amount: 1 }] }
                ]
            };

            const context = {
                player: player1,
                card: null,
                gameState: game,
                eventContext: {
                    event: 'CARD_PLAYED',
                    timestamp: Date.now(),
                    player: player1
                },
                modalChoice: 1
            };

            await turnManager.abilitySystem.executor.execute(modalEffect, context);

            // Second option: draw 1
            expect(player1.hand.length).toBe(startingHand + 1);
        });
    });

    describe('Sequence Effects', () => {
        it('should execute effects in order', async () => {
            const { game, turnManager, p1Id, p2Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            const player2 = game.state.players[p2Id];

            player1.lore = 0;
            player1.deck = [{ instanceId: 'draw-1', name: 'Card1' }] as any;

            // Sequence: draw 1, then gain 1 lore
            const sequenceEffect = {
                type: 'sequence' as const,
                effects: [
                    { type: 'draw' as const, amount: 1 },
                    { type: 'gain_lore' as const, amount: 1 }
                ]
            };

            const context = {
                player: player1,
                card: null,
                gameState: game,
                eventContext: {
                    event: 'CARD_PLAYED',
                    timestamp: Date.now(),
                    player: player1
                }
            };

            await turnManager.abilitySystem.executor.execute(sequenceEffect, context);

            // Both effects should have executed
            expect(player1.hand.length).toBeGreaterThan(0);
            expect(player1.lore).toBe(1);
        });
    });

    describe('Conditional Effects', () => {
        it('should execute effect when condition is met', async () => {
            const { game, turnManager, p1Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            player1.lore = 0;
            player1.hand = [
                { instanceId: 'h1', name: 'Card1' },
                { instanceId: 'h2', name: 'Card2' },
                { instanceId: 'h3', name: 'Card3' },
                { instanceId: 'h4', name: 'Card4' }
            ] as any;

            // Conditional: If you have 4+ cards in hand, gain 1 lore
            const conditionalEffect = {
                type: 'conditional' as const,
                condition: {
                    type: 'has_cards_in_hand' as const,
                    amount: 4
                },
                effect: { type: 'gain_lore' as const, amount: 1 }
            };

            const context = {
                player: player1,
                card: null,
                gameState: game,
                eventContext: {
                    event: 'CARD_PLAYED',
                    timestamp: Date.now(),
                    player: player1
                }
            };

            await turnManager.abilitySystem.executor.execute(conditionalEffect, context);

            // Condition met, should gain lore
            expect(player1.lore).toBe(1);
        });

        it('should not execute effect when condition is not met', async () => {
            const { game, turnManager, p1Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            player1.lore = 0;
            player1.hand = [
                { instanceId: 'h1', name: 'Card1' }
            ] as any;

            // Conditional: If you have 4+ cards in hand, gain 1 lore
            const conditionalEffect = {
                type: 'conditional' as const,
                condition: {
                    type: 'has_cards_in_hand' as const,
                    amount: 4
                },
                effect: { type: 'gain_lore' as const, amount: 1 }
            };

            const context = {
                player: player1,
                card: null,
                gameState: game,
                eventContext: {
                    event: 'CARD_PLAYED',
                    timestamp: Date.now(),
                    player: player1
                }
            };

            await turnManager.abilitySystem.executor.execute(conditionalEffect, context);

            // Condition not met, lore should remain 0
            expect(player1.lore).toBe(0);
        });
    });
});
