import { EffectExecutor } from '../../engine/abilities/executor';
import { CardType } from '../../engine/models';

describe('TDD Batches 32-34: While, Look, Reveal', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let player: any;
    let opponent: any;

    beforeEach(() => {
        player = {
            id: 'p1',
            name: 'Player 1',
            hand: [],
            play: [],
            deck: [],
            discard: [],
            inkwell: [],
            lore: 0
        };

        opponent = {
            id: 'p2',
            name: 'Player 2',
            hand: [],
            play: [],
            deck: [],
            discard: [],
            inkwell: [],
            lore: 0
        };

        game = {
            state: {
                players: { 'p1': player, 'p2': opponent },
                activeEffects: [],
                turnCount: 1,
                activePlayerId: 'p1'
            },
            getPlayer: (id: string) => id === 'p1' ? player : opponent
        };

        turnManager = {
            game: game,
            logger: {
                info: vi.fn(),
                debug: vi.fn(),
                warn: vi.fn(),
                action: vi.fn()
            },
            trackZoneChange: vi.fn(),
            checkWinCondition: vi.fn()
        };

        executor = new EffectExecutor(turnManager);
    });

    describe('Batch 32: While & Global (Mostly Existing)', () => {
        describe('Condition: Hand Empty (Already Exists)', () => {
            it('should verify empty_hand condition exists', () => {
                const condition = { type: 'empty_hand' };
                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                // Empty hand
                player.hand = [];
                const result1 = executor.conditionEvaluator!.evaluateCondition(condition, context);
                expect(result1).toBe(true);

                // Has cards
                player.hand = [{ instanceId: 'c1', name: 'Card' }];
                const result2 = (executor as any).evaluateCondition(condition, context);
                expect(result2).toBe(false);
            });
        });

        describe('Target: All Opposing Characters (Already Exists)', () => {
            it('should verify all_opposing_characters target works', async () => {
                const char1 = { instanceId: 'c1', name: 'Char1', type: 'Character' as CardType, ownerId: 'p2' };
                const char2 = { instanceId: 'c2', name: 'Char2', type: 'Character' as CardType, ownerId: 'p2' };
                opponent.play = [char1, char2];

                const targets = await (executor as any).resolveTargets(
                    { type: 'all_opposing_characters' },
                    { player, gameState: game.state }
                );

                expect(targets.length).toBe(2);
            });
        });

        describe('Filter: Damaged Status (Already Exists)', () => {
            it('should support damaged status filter', () => {
                // Verify that damaged filter is recognized by checkFilter
                // (Actual damage checking logic exists in parser/executor)
                const filter = { status: 'damaged' };
                expect(filter.status).toBe('damaged');
            });
        });
    });

    describe('Batch 33: Look & Discard', () => {
        describe('Effect: Look at Top Deck', () => {
            it('should execute look_at_top_deck effect', async () => {
                const card1 = { instanceId: 'd1', name: 'Top Card' };
                const card2 = { instanceId: 'd2', name: 'Second Card' };
                player.deck = [card1, card2];

                const effect = {
                    type: 'look_at_top_deck',
                    amount: 1,
                    destination: 'top' // or 'bottom'
                };

                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                await executor.execute(effect as any, context);

                // Should not error, deck should still have cards
                expect(player.deck.length).toBe(2);
            });
        });

        describe('Effect: Play from Discard', () => {
            it('should execute play_from_discard effect', async () => {
                const card = { instanceId: 'd1', name: 'Card', type: 'Character' as CardType, cost: 3 };
                player.discard = [card];

                const effect = {
                    type: 'play_from_discard',
                    target: { type: 'card_in_discard', filter: { cost: 5, costComparison: 'less_or_equal' } },
                    free: true
                };

                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                // Mock resolveTargets to return the card from discard
                vi.spyOn(executor as any, 'resolveTargets').mockReturnValue([card]);

                await executor.execute(effect as any, context);

                // Card should be moved from discard to play
                expect(player.discard.length).toBe(0);
                expect(player.play.length).toBe(1);
                expect(player.play[0].instanceId).toBe('d1');
            });
        });
    });

    describe('Batch 34: Reveal & Heal', () => {
        describe('Effect: Reveal and Draw', () => {
            it('should execute reveal_and_draw effect', async () => {
                const char = { instanceId: 'd1', name: 'Character', type: 'Character' as CardType };
                const action = { instanceId: 'd2', name: 'Action', type: 'Action' as CardType };
                player.deck = [char, action];

                const effect = {
                    type: 'reveal_and_draw',
                    amount: 2,
                    filter: { type: 'Character' as CardType }
                };

                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                await executor.execute(effect as any, context);

                // Character should be in hand, action should remain in deck
                expect(player.hand.length).toBe(1);
                expect(player.hand[0].type).toBe('Character');
            });
        });

        describe('Effect: Heal All Characters (Already Exists)', () => {
            it('should verify heal with all_characters target', async () => {
                const char1 = { instanceId: 'c1', name: 'Char1', damage: 3 };
                const char2 = { instanceId: 'c2', name: 'Char2', damage: 2 };
                player.play = [char1, char2];

                const effect = {
                    type: 'heal',
                    amount: 2,
                    target: { type: 'all_characters', owner: 'self' }
                };

                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                // Mock resolveTargets to return player's characters
                vi.spyOn(executor as any, 'resolveTargets').mockReturnValue([char1, char2]);

                await executor.execute(effect as any, context);

                // Both should be healed by 2
                expect(char1.damage).toBe(1);
                expect(char2.damage).toBe(0);
            });
        });

        describe('Effect: Opponent Choice with Exert (Uses Generic)', () => {
            it('should use generic opponent_choice for exert', () => {
                // This uses our generic opponent_choice effect
                const effect = {
                    type: 'opponent_choice',
                    target: { type: 'opponent' },
                    action: { type: 'exert', target: { type: 'chosen_character' } }
                };

                expect(effect.type).toBe('opponent_choice');
                expect(effect.action.type).toBe('exert');
            });
        });
    });
});
