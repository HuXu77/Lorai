import { EffectExecutor } from '../../engine/abilities/executor';
import { GameEvent } from '../../engine/abilities/events';
import { CardType } from '../../engine/models';

describe('TDD Batches 20-22: Static Complex & Conditional', () => {
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
            getPlayer: (id: string) => id === 'p1' ? player : opponent,
            addCardToZone: vi.fn((player, card, zone) => {
                if (zone === 'hand') {
                    player.hand.push(card);
                    card.zone = 'hand';
                }
            })
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
            applyDamage: vi.fn((player, target, amount) => {
                target.damage = (target.damage || 0) + amount;
            })
        };

        executor = new EffectExecutor(turnManager);
    });

    describe('Batch 20: Static Complex', () => {
        describe('Condition: Self Exerted', () => {
            it('should evaluate self_exerted condition', () => {
                const exertedCard = { instanceId: 'c1', name: 'Exerted', ready: false };
                const readyCard = { instanceId: 'c2', name: 'Ready', ready: true };

                const context = {
                    player,
                    card: exertedCard,
                    gameState: game.state,
                    eventContext: {} as any
                };

                // Test with exerted card
                const condition1 = { type: 'self_exerted' };
                const result1 = executor.conditionEvaluator!.evaluateCondition(condition1, context);
                expect(result1).toBe(true);

                // Test with ready card
                context.card = readyCard;
                const result2 = executor.conditionEvaluator!.evaluateCondition(condition1, context);
                expect(result2).toBe(false);
            });
        });

        describe('Filter: Multiple Subtypes', () => {
            it('should filter by multiple subtypes', () => {
                const prince = { instanceId: 'c1', name: 'Prince', type: 'Character' as CardType, subtypes: ['Prince'] };
                const princess = { instanceId: 'c2', name: 'Princess', type: 'Character' as CardType, subtypes: ['Princess'] };
                const queen = { instanceId: 'c3', name: 'Queen', type: 'Character' as CardType, subtypes: ['Queen'] };
                const commoner = { instanceId: 'c4', name: 'Commoner', type: 'Character' as CardType, subtypes: [] };

                const filter = { subtypes: ['Prince', 'Princess', 'Queen'] };
                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                // Check each card
                expect((executor as any).checkFilter(prince, filter, context)).toBe(true);
                expect((executor as any).checkFilter(princess, filter, context)).toBe(true);
                expect((executor as any).checkFilter(queen, filter, context)).toBe(true);
                expect((executor as any).checkFilter(commoner, filter, context)).toBe(false);
            });
        });

        describe('Event: Card Challenges', () => {
            it('should verify CARD_CHALLENGES event exists', () => {
                expect(GameEvent.CARD_CHALLENGES).toBe('card_challenges');
            });
        });
    });

    describe('Batch 21: Conditional Activated', () => {
        describe('Event: Card Healed', () => {
            it('should verify CARD_HEALED event exists', () => {
                expect(GameEvent.CARD_HEALED).toBeDefined();
            });
        });

        describe('Condition: Played Song This Turn', () => {
            it('should evaluate played_song_this_turn condition', () => {
                // Track that a song was played
                game.state.songsPlayedThisTurn = 1;

                const condition = { type: 'played_song_this_turn' };
                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                const result = (executor as any).evaluateCondition(condition, context);
                expect(result).toBe(true);

                // Test when no song played
                game.state.songsPlayedThisTurn = 0;
                const result2 = (executor as any).evaluateCondition(condition, context);
                expect(result2).toBe(false);
            });
        });

        describe('Effect: Conditional Action', () => {
            it('should execute conditional action (exert or banish)', async () => {
                const princess = { instanceId: 't1', name: 'Princess', subtypes: ['Princess'], ready: true, ownerId: 'p1' };
                const commoner = { instanceId: 't2', name: 'Commoner', subtypes: [], ready: true, ownerId: 'p1' };

                player.play = [princess, commoner];

                // Exert commoner (base action)
                const effect1 = {
                    type: 'conditional_action',
                    base_action: { type: 'exert', target: { type: 'chosen' } },
                    condition: { type: 'target_has_subtype', subtype: 'Princess' },
                    replacement_action: { type: 'banish', target: { type: 'chosen' } }
                };

                const context1 = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {
                        event: '' as any,
                        timestamp: Date.now(),
                        targetCard: commoner
                    }
                };

                await executor.execute(effect1 as any, context1);
                expect(commoner.ready).toBe(false); // Exerted

                // Banish princess (replacement action)
                const context2 = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {
                        event: '' as any,
                        timestamp: Date.now(),
                        targetCard: princess
                    }
                };

                // Mock banish logic
                (turnManager as any).banishCard = vi.fn((player, card) => {
                    player.play = player.play.filter((c: any) => c.instanceId !== card.instanceId);
                });

                await executor.execute(effect1 as any, context2);
                // Princess should be banished (not just exerted)
                expect(turnManager.banishCard).toHaveBeenCalledWith(player, princess);
            });
        });
    });

    describe('Batch 22: Final Push', () => {
        describe('Event: Card Banished', () => {
            it('should verify CARD_BANISHED event exists', () => {
                expect(GameEvent.CARD_BANISHED).toBeDefined();
            });
        });

        describe('Effect: Additional Ink', () => {
            it('should execute additional_ink effect', async () => {
                // Track additional ink uses
                player.additionalInkUsed = false;

                const effect = {
                    type: 'additional_ink'
                };

                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                await executor.execute(effect as any, context);

                // Should grant ability to ink additional card
                expect(player.canInkAdditional).toBe(true);
            });
        });

        describe('Event: Card Played with Type Filter', () => {
            it('should verify CARD_PLAYED event exists', () => {
                expect(GameEvent.CARD_PLAYED).toBe('card_played');
            });
        });
    });
});
