import { TestHarness } from '../engine-test-utils';
import { ZoneType } from '../../engine/models';

/**
 * Tests for executor fixes:
 * 1. all_players target resolution (A Whole New World)
 * 2. reveal_opponent_hand_choose_discard effect (The Bare Necessities)
 */
describe('Executor Fixes', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initGame([], []);
    });

    describe('all_players target resolution', () => {
        it('should resolve all_players target to both players', async () => {
            // Setup: Get the executor and create context
            const executor = harness.turnManager.abilitySystem.executor;
            const player1 = harness.getPlayer(harness.p1Id);
            const context = {
                player: player1,
                eventContext: { event: 'test', timestamp: Date.now() },
                card: null as any,
                gameState: harness.game.state
            };

            // Test: Resolve all_players target
            const targets = await executor.resolveTargets(
                { type: 'all_players' },
                context
            );

            // Verify: Should return both players
            expect(targets.length).toBe(2);
            expect(targets.some((t: any) => t.id === harness.p1Id)).toBe(true);
            expect(targets.some((t: any) => t.id === harness.p2Id)).toBe(true);
        });

        it('should handle discard_hand_draw effect for all players (A Whole New World)', async () => {
            const player1 = harness.getPlayer(harness.p1Id);
            const player2 = harness.getPlayer(harness.p2Id);

            // Setup: Give both players cards in hand
            harness.setHand(harness.p1Id, [
                { name: 'P1 Hand Card 1', type: 'Character', cost: 1 } as any,
                { name: 'P1 Hand Card 2', type: 'Character', cost: 2 } as any,
            ]);
            harness.setHand(harness.p2Id, [
                { name: 'P2 Hand Card 1', type: 'Character', cost: 1 } as any,
                { name: 'P2 Hand Card 2', type: 'Character', cost: 2 } as any,
                { name: 'P2 Hand Card 3', type: 'Character', cost: 3 } as any,
            ]);

            // Give both players deck cards to draw from
            for (let i = 0; i < 10; i++) {
                player1.deck.push({
                    name: `P1 Deck Card ${i}`,
                    instanceId: `p1-deck-${i}`,
                    type: 'Character',
                    cost: 1,
                    zone: ZoneType.Deck,
                    ownerId: harness.p1Id
                } as any);
                player2.deck.push({
                    name: `P2 Deck Card ${i}`,
                    instanceId: `p2-deck-${i}`,
                    type: 'Character',
                    cost: 1,
                    zone: ZoneType.Deck,
                    ownerId: harness.p2Id
                } as any);
            }

            const p1HandBefore = player1.hand.length;
            const p2HandBefore = player2.hand.length;
            const drawAmount = 7;

            // Execute the effect
            const executor = harness.turnManager.abilitySystem.executor;
            await executor.execute({
                type: 'discard_hand_draw',
                amount: drawAmount,
                target: { type: 'all_players' }
            } as any, {
                player: player1,
                eventContext: { event: 'test', timestamp: Date.now() },
                card: null as any,
                gameState: harness.game.state
            });

            // Verify: Both players should have discarded their hands and drawn 7
            expect(player1.discard.length).toBeGreaterThanOrEqual(p1HandBefore);
            expect(player2.discard.length).toBeGreaterThanOrEqual(p2HandBefore);
            expect(player1.hand.length).toBe(drawAmount);
            expect(player2.hand.length).toBe(drawAmount);
        });
    });

    describe('opponent_play_reveal_and_discard effect', () => {
        it('should create choice request with all cards including invalid ones', async () => {
            const player1 = harness.getPlayer(harness.p1Id);
            const player2 = harness.getPlayer(harness.p2Id);

            // Setup: Give opponent a mix of character and non-character cards
            const char1 = {
                name: 'Character 1',
                instanceId: 'char1-inst',
                type: 'Character',
                cost: 2,
                zone: ZoneType.Hand,
                ownerId: harness.p2Id
            };
            const action1 = {
                name: 'Action 1',
                instanceId: 'action1-inst',
                type: 'Action',
                cost: 3,
                zone: ZoneType.Hand,
                ownerId: harness.p2Id
            };
            const item1 = {
                name: 'Item 1',
                instanceId: 'item1-inst',
                type: 'Item',
                cost: 4,
                zone: ZoneType.Hand,
                ownerId: harness.p2Id
            };
            player2.hand = [char1, action1, item1] as any[];

            // Track choice requests
            let capturedRequest: any = null;
            harness.turnManager.requestChoice = async (request: any) => {
                capturedRequest = request;
                // Simulate choosing the action card
                return {
                    requestId: request.id,
                    playerId: request.playerId,
                    selectedIds: [action1.instanceId],
                    declined: false,
                    timestamp: Date.now()
                };
            };

            // Execute the effect with non-character filter
            const executor = harness.turnManager.abilitySystem.executor;
            await executor.execute({
                type: 'opponent_play_reveal_and_discard',
                target: { type: 'chosen_opponent' },
                filter: { type: 'not', filter: { type: 'character' } }
            } as any, {
                player: player1,
                eventContext: { event: 'test', timestamp: Date.now(), targetCard: player2 },
                card: null as any,
                gameState: harness.game.state
            });

            // Verify: Choice request should include ALL cards
            expect(capturedRequest).not.toBeNull();
            expect(capturedRequest.options.length).toBe(3); // All 3 cards

            // Character should be invalid
            const charOption = capturedRequest.options.find((o: any) => o.card.name === 'Character 1');
            expect(charOption.valid).toBe(false);

            // Non-characters should be valid
            const actionOption = capturedRequest.options.find((o: any) => o.card.name === 'Action 1');
            const itemOption = capturedRequest.options.find((o: any) => o.card.name === 'Item 1');
            expect(actionOption.valid).toBe(true);
            expect(itemOption.valid).toBe(true);

            // Verify the action card was discarded
            expect(player2.hand.some((c: any) => c.instanceId === action1.instanceId)).toBe(false);
            expect(player2.discard.some((c: any) => c.instanceId === action1.instanceId)).toBe(true);
        });

        it('should show modal even when no valid cards to discard', async () => {
            const player1 = harness.getPlayer(harness.p1Id);
            const player2 = harness.getPlayer(harness.p2Id);

            // Setup: Give opponent only character cards
            const char1 = {
                name: 'Character 1',
                instanceId: 'char1-only',
                type: 'Character',
                cost: 2,
                zone: ZoneType.Hand,
                ownerId: harness.p2Id
            };
            const char2 = {
                name: 'Character 2',
                instanceId: 'char2-only',
                type: 'Character',
                cost: 3,
                zone: ZoneType.Hand,
                ownerId: harness.p2Id
            };
            player2.hand = [char1, char2] as any[];

            // Track choice requests
            let capturedRequest: any = null;
            harness.turnManager.requestChoice = async (request: any) => {
                capturedRequest = request;
                // No valid selection possible
                return {
                    requestId: request.id,
                    playerId: request.playerId,
                    selectedIds: [],
                    declined: false,
                    timestamp: Date.now()
                };
            };

            // Execute the effect with non-character filter
            const executor = harness.turnManager.abilitySystem.executor;
            await executor.execute({
                type: 'opponent_play_reveal_and_discard',
                target: { type: 'chosen_opponent' },
                filter: { type: 'not', filter: { type: 'character' } }
            } as any, {
                player: player1,
                eventContext: { event: 'test', timestamp: Date.now(), targetCard: player2 },
                card: null as any,
                gameState: harness.game.state
            });

            // Verify: Choice request should still be made with all cards
            expect(capturedRequest).not.toBeNull();
            expect(capturedRequest.options.length).toBe(2); // Both character cards shown

            // Both should be invalid
            expect(capturedRequest.options.every((o: any) => o.valid === false)).toBe(true);

            // Prompt should indicate no valid cards
            expect(capturedRequest.prompt).toContain('no valid');

            // No cards should be discarded
            expect(player2.hand.length).toBe(2);
            expect(player2.discard.length).toBe(0);
        });
    });
});
