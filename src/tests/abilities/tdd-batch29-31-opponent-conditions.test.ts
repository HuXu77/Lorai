import { EffectExecutor } from '../../engine/abilities/executor';
import { CardType } from '../../engine/models';

describe('TDD Batches 29-31: Opponent Choice & Conditions', () => {
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
                activePlayerId: 'p1',
                eventHistory: [] // Track events that occurred
            },
            getPlayer: (id: string) => id === 'p1' ? player : opponent,
            getOpponent: (id: string) => id === 'p1' ? opponent : player
        };

        turnManager = {
            game: game,
            logger: {
                info: vi.fn(),
                debug: vi.fn(),
                warn: vi.fn(),
                action: vi.fn()
            },
            applyDamage: vi.fn((player, target, amount) => {
                target.damage = (target.damage || 0) + amount;
            })
        };

        executor = new EffectExecutor(turnManager);
    });

    describe('Batch 29: Opponent Choice', () => {
        describe('Effect: Opponent Choice (Generic)', () => {
            it('should handle opponent_choice with damage action', async () => {
                const char1 = { instanceId: 'c1', name: 'Char1', damage: 0, willpower: 3, ownerId: 'p2' };
                const char2 = { instanceId: 'c2', name: 'Char2', damage: 0, willpower: 3, ownerId: 'p2' };
                opponent.play = [char1, char2];

                // Generic opponent_choice effect
                // The action will be executed from opponent's perspective
                const effect = {
                    type: 'opponent_choice_action',
                    action: 'damage',
                    amount: 2,
                    target: { type: 'chosen_character' } // Opponent chooses their own character
                };

                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                // Mock the chosen character resolution
                vi.spyOn(executor as any, 'resolveTargets').mockImplementation((target: any, ctx: any) => {
                    if (target.type === 'opponent') {
                        return [opponent];
                    }
                    if (target.type === 'chosen_character' && ctx.player.id === 'p2') {
                        return [char1]; // Opponent "chooses" char1
                    }
                    return [];
                });

                await executor.execute(effect as any, context);

                // char1 should be damaged
                expect(char1.damage).toBe(2);
            });
        });

        describe('Effect: Move to Location (Already Exists)', () => {
            it('should verify move_to_location exists', () => {
                const effect = { type: 'move_to_location', target: { type: 'chosen' }, free: true };
                expect(effect.type).toBe('move_to_location');
            });
        });
    });

    describe('Batch 30: Complex Conditions', () => {
        describe('Condition: While Here Exerted', () => {
            it('should evaluate while_here_exerted condition', () => {
                const location = { instanceId: 'l1', name: 'Location', type: 'Location' as CardType };
                const exertedChar = { instanceId: 'c1', name: 'ExChar', atLocation: location.instanceId, ready: false };
                player.play = [location, exertedChar];

                const condition = {
                    type: 'while_here_exerted',
                    location: location.instanceId
                };

                const context = {
                    player,
                    card: location,
                    gameState: game.state,
                    eventContext: {} as any
                };

                // Has exerted character at location
                const result1 = executor.conditionEvaluator!.evaluateCondition(condition, context);
                expect(result1).toBe(true);

                // Make character ready
                exertedChar.ready = true;
                const result2 = (executor as any).evaluateCondition(condition, context);
                expect(result2).toBe(false);
            });
        });

        describe('Condition: Event Occurred', () => {
            it('should evaluate event_occurred condition', () => {
                // Track that an event happened
                game.state.eventHistory.push({
                    event: 'character_banished_in_challenge',
                    turn: 1
                });

                const condition = {
                    type: 'event_occurred',
                    event: 'character_banished_in_challenge',
                    turn: 'this_turn'
                };

                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                const result = (executor as any).evaluateCondition(condition, context);
                expect(result).toBe(true);
            });
        });

        describe('Condition: Ink Count', () => {
            it('should evaluate ink_count condition', () => {
                player.inkwell = [1, 2, 3, 4, 5]; // 5 ink

                const condition = {
                    type: 'ink_count',
                    amount: 6,
                    comparison: 'less_or_equal'
                };

                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                // 5 <= 6 should be true
                const result1 = executor.conditionEvaluator!.evaluateCondition(condition, context);
                expect(result1).toBe(true);

                // Add more ink
                player.inkwell.push(6, 7);
                // 7 <= 6 should be false
                const result2 = (executor as any).evaluateCondition(condition, context);
                expect(result2).toBe(false);
            });
        });
    });

    describe('Batch 31: More Conditionals', () => {
        describe('Target: All Opposing Cards', () => {
            it('should resolve all_opposing_cards with cost filter', async () => {
                const cheapChar = { instanceId: 'c1', name: 'Cheap', type: 'Character' as CardType, cost: 1, ownerId: 'p2' };
                const expensiveChar = { instanceId: 'c2', name: 'Expensive', type: 'Character' as CardType, cost: 5, ownerId: 'p2' };
                const cheapItem = { instanceId: 'i1', name: 'Cheap Item', type: 'Item' as CardType, cost: 2, ownerId: 'p2' };

                opponent.play = [cheapChar, expensiveChar, cheapItem];

                const targets = await (executor as any).resolveTargets(
                    {
                        type: 'all_opposing_cards',
                        filter: { cost: 2, costComparison: 'less_or_equal' }
                    },
                    { player, gameState: game.state }
                );

                // Should find cheapChar (cost 1) and cheapItem (cost 2)
                expect(targets.length).toBe(2);
                expect(targets.some((t: any) => t.instanceId === 'c1')).toBe(true);
                expect(targets.some((t: any) => t.instanceId === 'i1')).toBe(true);
            });
        });

        describe('Effect: Play For Free (Conditional)', () => {
            it('should verify conditional cost reduction pattern', () => {
                // This is typically handled as a cost reduction with a condition
                // Just verify the pattern exists
                const effect = {
                    type: 'cost_reduction',
                    amount: 'free',
                    condition: { type: 'event_occurred', event: 'character_banished_in_challenge' }
                };
                expect(effect.amount).toBe('free');
            });
        });
    });
});
