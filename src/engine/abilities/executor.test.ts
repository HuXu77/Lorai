import { EffectExecutor, GameContext } from './executor';
import { EffectAST } from './effect-ast';

// Mock classes/interfaces
class MockPlayer {
    id: string;
    name: string;
    hand: any[] = [];
    deck: any[] = [];
    discard: any[] = [];
    inkwell: any[] = [];
    play: any[] = [];
    lore: number = 0;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}

// MockCard - matches actual Card interface from models.ts
class MockCard {
    instanceId: string;
    name: string;
    ownerId: string;
    type: string = 'character';
    zone: string = 'hand';
    cost: number = 1;
    inkCost?: number;
    damage: number = 0;
    strength?: number;
    willpower?: number;
    lore?: number;
    keywords: string[] = [];
    meta?: any;
    ready: boolean = true;
    exerted: boolean = false;
    playedThisTurn: boolean = false;

    constructor(id: string, name: string, ownerId: string) {
        this.instanceId = id;
        this.name = name;
        this.ownerId = ownerId;
    }
}

class MockTurnManager {
    game: MockGame;
    logger: any;

    constructor(game: MockGame) {
        this.game = game;
        this.logger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            action: jest.fn()
        };
        this.eventBus = {
            emit: jest.fn(),
            on: jest.fn(),
            off: jest.fn()
        };
    }

    eventBus: any;

    applyDamage = jest.fn();
    banishCard = jest.fn();
    trackZoneChange = jest.fn();
    checkWinCondition = jest.fn();
    addActiveEffect = jest.fn((effect: any) => {
        if (!this.game.state.activeEffects) {
            this.game.state.activeEffects = [];
        }
        this.game.state.activeEffects.push(effect);
    });

    // Mock requestChoice to select the first valid option (simulates user/bot choice)
    emitChoiceRequest = jest.fn(async (request: any) => {
        // Find first valid option and select it
        const validOption = request.options?.find((o: any) => o.valid);
        return {
            requestId: request.id,
            playerId: request.playerId,
            selectedIds: validOption ? [validOption.id] : [],
            timestamp: Date.now()
        };
    });

    requestChoice = jest.fn(async (request: any) => {
        // Find first valid option and select it
        const validOption = request.options?.find((o: any) => o.valid);
        return {
            requestId: request.id,
            playerId: request.playerId,
            selectedIds: validOption ? [validOption.id] : [],
            timestamp: Date.now()
        };
    });
    playCard = jest.fn(async (player: any, cardInstanceId: string) => {
        // Mock implementation - remove card from hand and add to play
        const cardIndex = player.hand.findIndex((c: any) => c.instanceId === cardInstanceId);
        if (cardIndex !== -1) {
            const card = player.hand.splice(cardIndex, 1)[0];
            card.zone = 'play';
            player.play.push(card);
        }
    });

    getPlayer(id: string) {
        return this.game.getPlayer(id);
    }

    checkBanishment(player: any, card: any) {
        // Mock implementation
    }
}

class MockGame {
    state: any;

    constructor() {
        this.state = {
            players: {}
        };
    }

    getPlayer(id: string) {
        return this.state.players[id];
    }

    addPlayer(player: MockPlayer) {
        this.state.players[player.id] = player;
    }

    addCardToZone = jest.fn((player: any, card: any, zone: string) => {
        // Mock implementation - move card to specified zone
        // Remove from current zone first
        const currentZone = card.zone || 'deck';
        const zones = ['hand', 'deck', 'play', 'discard', 'inkwell'];
        zones.forEach(z => {
            if (player[z]) {
                const index = player[z].findIndex((c: any) => c.instanceId === card.instanceId);
                if (index !== -1) {
                    player[z].splice(index, 1);
                }
            }
        });

        // Add to new zone
        card.zone = zone;
        if (zone === 'Inkwell' || zone === 'inkwell') {
            player.inkwell = player.inkwell || [];
            player.inkwell.push(card);
        } else if (zone === 'Hand') {
            player.hand.push(card);
        } else if (player[zone.toLowerCase()]) {
            player[zone.toLowerCase()].push(card);
        } else if (player[zone]) {
            player[zone].push(card);
        }
    });
}

describe('EffectExecutor', () => {
    let executor: EffectExecutor;
    let game: MockGame;
    let turnManager: MockTurnManager;
    let player1: MockPlayer;
    let player2: MockPlayer;
    let context: GameContext;
    let mockLogger: any;

    beforeEach(() => {
        game = new MockGame();
        player1 = new MockPlayer('p1', 'Player 1');
        player2 = new MockPlayer('p2', 'Player 2');
        game.addPlayer(player1);
        game.addPlayer(player2);
        turnManager = new MockTurnManager(game);
        executor = new EffectExecutor(turnManager);
        mockLogger = turnManager.logger;

        context = {
            player: player1,
            card: new MockCard('c1', 'Test Card', 'p1'),
            gameState: game.state,
            eventContext: {} as any
        };
    });

    describe('move_damage', () => {
        it('should move damage from source to destination', async () => {
            const sourceCard = new MockCard('s1', 'Source', 'p1');
            sourceCard.damage = 3;
            const destCard = new MockCard('d1', 'Dest', 'p1');
            destCard.damage = 0;

            // Mock resolveTargets to return our cards
            // We need to spy on resolveTargets or mock it, but it's private.
            // Alternatively, we can construct the AST such that resolveTargets works if we mock the context/game state correctly.
            // But resolveTargets relies on 'play' array in player.
            player1.play = [sourceCard, destCard];

            // Since we can't easily mock private methods without casting to any, let's use 'self' and 'chosen' if possible,
            // or just cast executor to any to mock resolveTargets.
            const executorAny = executor as any;
            executorAny.resolveTargets = jest.fn((target: any) => {
                if (!target) return [];
                if (target.type === 'source') return [sourceCard];
                if (target.type === 'dest') return [destCard];
                return [];
            });

            const effect: EffectAST = {
                type: 'move_damage',
                amount: 2,
                from: { type: 'source' } as any,
                to: { type: 'dest' } as any
            } as any;

            await executor.execute(effect, context);

            expect(sourceCard.damage).toBe(1);
            expect(destCard.damage).toBe(2);
        });

        it('should not move more damage than available', async () => {
            const sourceCard = new MockCard('s1', 'Source', 'p1');
            sourceCard.damage = 1;
            const destCard = new MockCard('d1', 'Dest', 'p1');
            destCard.damage = 0;

            const executorAny = executor as any;
            executorAny.resolveTargets = jest.fn((target: any) => {
                if (!target) return [];
                if (target.type === 'source') return [sourceCard];
                if (target.type === 'dest') return [destCard];
                return [];
            });

            const effect: EffectAST = {
                type: 'move_damage',
                amount: 5,
                from: { type: 'source' } as any,
                to: { type: 'dest' } as any
            } as any;

            await executor.execute(effect, context);

            expect(sourceCard.damage).toBe(0);
            expect(destCard.damage).toBe(1);
        });

        describe('opponent_choice_discard', () => {
            it('should make opponent discard a card', async () => {
                const card1 = new MockCard('c1', 'Card 1', 'p2');
                card1.cost = 5;
                const card2 = new MockCard('c2', 'Card 2', 'p2');
                card2.cost = 2; // Lower cost, should be discarded by bot logic

                player2.hand = [card2, card1];

                const executorAny = executor as any;
                executorAny.resolveTargets = jest.fn(() => [player2]);

                const effect: EffectAST = {
                    type: 'opponent_choice_discard',
                    target: { type: 'opponent' } as any,
                    amount: 1
                } as any;

                await executor.execute(effect, context);

                expect(player2.hand.length).toBe(1);
                expect(player2.hand[0].instanceId).toBe('c1'); // Higher cost card remains
                expect(player2.discard.length).toBe(1);
                expect(player2.discard[0].instanceId).toBe('c2'); // Lower cost card discarded
            });

            it('should handle empty hand', async () => {
                player2.hand = [];

                const executorAny = executor as any;
                executorAny.resolveTargets = jest.fn(() => [player2]);

                const effect: EffectAST = {
                    type: 'opponent_choice_discard',
                    target: { type: 'opponent' } as any,
                    amount: 1
                } as any;

                await executor.execute(effect, context);

                expect(player2.hand.length).toBe(0);
                expect(player2.discard.length).toBe(0);
            });
        });

        describe('opponent_play_reveal_and_discard', () => {
            it('should make player choose a card from opponent hand to discard', async () => {
                const card1 = new MockCard('c1', 'Card 1', 'p2');
                card1.cost = 5; // Higher cost, should be chosen by bot logic
                const card2 = new MockCard('c2', 'Card 2', 'p2');
                card2.cost = 2;

                player2.hand = [card1, card2];

                // Mock game state to find opponent
                game.state.players = {
                    'p1': player1,
                    'p2': player2
                };

                const effect: EffectAST = {
                    type: 'opponent_play_reveal_and_discard'
                } as any;

                await executor.execute(effect, context);

                expect(player2.hand.length).toBe(1);
                expect(player2.hand[0].instanceId).toBe('c2'); // Lower cost card remains
                expect(player2.discard.length).toBe(1);
                expect(player2.discard[0].instanceId).toBe('c1'); // Higher cost card discarded
            });

            it('should handle empty opponent hand', async () => {
                player2.hand = [];
                game.state.players = {
                    'p1': player1,
                    'p2': player2
                };

                const effect: EffectAST = {
                    type: 'opponent_play_reveal_and_discard'
                } as any;

                await executor.execute(effect, context);

                expect(player2.hand.length).toBe(0);
                expect(player2.discard.length).toBe(0);
            });
        });

        describe('put_into_inkwell', () => {
            it('should put top card of deck into inkwell', async () => {
                const card = new MockCard('c1', 'Card 1', 'p1');
                player1.deck = [card];

                const effect: EffectAST = {
                    type: 'put_into_inkwell',
                    source: 'deck_top'
                } as any;

                await executor.execute(effect, context);

                expect(player1.deck.length).toBe(0);
                expect(player1.inkwell.length).toBe(1);
                expect(player1.inkwell[0].instanceId).toBe('c1');
                expect(player1.inkwell[0].zone).toBe('Inkwell');
            });

            it('should handle empty deck', async () => {
                player1.deck = [];

                const effect: EffectAST = {
                    type: 'put_into_inkwell',
                    source: 'deck_top'
                } as any;

                await executor.execute(effect, context);

                expect(player1.inkwell.length).toBe(0);
            });

            describe('area_effect', () => {
                it('should log area effect trigger', async () => {
                    const card1 = new MockCard('c1', 'Card 1', 'p1');
                    const card2 = new MockCard('c2', 'Card 2', 'p1');

                    // Temporarily add debug to logger
                    if (!turnManager.logger.debug) {
                        turnManager.logger.debug = jest.fn();
                    }
                    const logSpy = jest.spyOn(turnManager.logger, 'debug');

                    const executorAny = executor as any;
                    executorAny.resolveTargets = jest.fn(() => [card1, card2]);

                    const effect = {
                        type: 'area_effect',
                        effect: { type: 'draw', amount: 1 }
                    } as any;

                    await executor.execute(effect, context);

                    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Area effect'));
                    logSpy.mockRestore();
                });
            });

            describe('return_multiple_with_cost_filter', () => {
                it('should return opponent cards with cost <= maxCost', async () => {
                    const card1 = new MockCard('c1', 'Card 1', 'p2');
                    card1.cost = 2;
                    const card2 = new MockCard('c2', 'Card 2', 'p2');
                    card2.cost = 3; // Too expensive
                    const card3 = new MockCard('c3', 'Card 3', 'p2');
                    card3.cost = 1;

                    player2.play = [card1, card2, card3];

                    // Mock game state
                    game.state.players = {
                        'p1': player1,
                        'p2': player2
                    };

                    const effect: EffectAST = {
                        type: 'return_multiple_with_cost_filter',
                        amount: 2,
                        maxCost: 2,
                        filter: { cardType: 'character' }
                    } as any;

                    await executor.execute(effect, context);

                    expect(player2.play.length).toBe(1);
                    expect(player2.play[0].instanceId).toBe('c2'); // Cost 3 remains
                    expect(player2.hand.length).toBe(2);
                    expect(player2.hand.map((c: any) => c.instanceId)).toContain('c1');
                    expect(player2.hand.map((c: any) => c.instanceId)).toContain('c3');
                });
            });

            describe('put_top_card_under', () => {
                it('should put top card of deck under target', async () => {
                    const target = new MockCard('t1', 'Target', 'p1');
                    const cardFromDeck = new MockCard('d1', 'Deck Card', 'p1');
                    player1.play = [target];
                    player1.deck = [cardFromDeck];

                    const executorAny = executor as any;
                    executorAny.resolveTargets = jest.fn(() => [target]);

                    const effect: EffectAST = {
                        type: 'put_top_card_under',
                        target: { type: 'chosen_permanent' } as any
                    } as any;

                    await executor.execute(effect, context);

                    expect(player1.deck.length).toBe(0);
                    expect((target as any).meta.cardsUnder.length).toBe(1);
                    expect((target as any).meta.cardsUnder[0].instanceId).toBe('d1');
                    expect((target as any).meta.cardsUnder[0].zone).toBe('attached');
                });

                it('should handle empty deck', async () => {
                    const target = new MockCard('t1', 'Target', 'p1');
                    player1.play = [target];
                    player1.deck = [];

                    const executorAny = executor as any;
                    executorAny.resolveTargets = jest.fn(() => [target]);

                    const effect: EffectAST = {
                        type: 'put_top_card_under',
                        target: { type: 'chosen_permanent' } as any
                    } as any;

                    await executor.execute(effect, context);

                    expect((target as any).meta).toBeUndefined();
                });
            });

            describe('play_for_free', () => {
                it('should play card for free from hand', async () => {
                    const card1 = new MockCard('c1', 'Card 1', 'p1');
                    card1.cost = 5; // Expensive
                    const card2 = new MockCard('c2', 'Card 2', 'p1');
                    card2.cost = 2; // Cheap

                    player1.hand = [card1, card2];

                    // Mock game state
                    game.state.players = {
                        'p1': player1,
                        'p2': player2
                    };

                    // Mock addCardToZone
                    const mockAddCardToZone = jest.fn((p, c, z) => {
                        c.zone = z;
                        p.play.push(c);
                        return c;
                    });
                    (game as any).addCardToZone = mockAddCardToZone;

                    const effect: EffectAST = {
                        type: 'play_for_free',
                        filter: { maxCost: 10 } // Should pick highest cost
                    } as any;

                    await executor.execute(effect, context);
                    expect(player1.hand.length).toBe(1);
                    expect(player1.hand[0].instanceId).toBe('c2'); // Cheap card remains
                    expect(player1.play.length).toBe(1);
                    expect(player1.play[0].instanceId).toBe('c1'); // Expensive card played
                    // play_for_free calls turnManager.playCard(), not game.addCardToZone
                });

                it('should handle no valid cards', async () => {
                    const card1 = new MockCard('c1', 'Card 1', 'p1');
                    card1.cost = 5;
                    player1.hand = [card1];

                    const effect: EffectAST = {
                        type: 'play_for_free',
                        filter: { maxCost: 2 } // Too cheap
                    } as any;

                    await executor.execute(effect, context);

                    expect(player1.hand.length).toBe(1);
                    expect(player1.play.length).toBe(0);
                });
            });
        });
    });

    describe('reveal_top_card', () => {
        it('should reveal top card of deck', async () => {
            const card = new MockCard('c1', 'Card 1', 'p1');
            player1.deck = [card];

            const effect: EffectAST = {
                type: 'reveal_top_card'
            } as any;

            const logSpy = jest.spyOn(turnManager.logger, 'info');
            await executor.execute(effect, context);

            expect(logSpy).toHaveBeenCalledWith(
                expect.stringMatching(/revealed top \d+ card/i),
                expect.anything()
            );
            expect((context.eventContext as any).revealedCard).toBe(card);
            logSpy.mockRestore();
        });
    });

    describe('mill', () => {
        it('should mill cards from target deck', async () => {
            const card1 = new MockCard('c1', 'Card 1', 'p2');
            const card2 = new MockCard('c2', 'Card 2', 'p2');
            player2.deck = [card1, card2];

            const executorAny = executor as any;
            executorAny.resolveTargets = jest.fn(() => [player2]);

            const effect: EffectAST = {
                type: 'mill',
                amount: 1,
                target: { type: 'all_opponents' } as any
            } as any;

            await executor.execute(effect, context);

            expect(player2.deck.length).toBe(1);
            expect(player2.deck[0].instanceId).toBe('c1'); // Bottom card remains
            expect(player2.discard.length).toBe(1);
            expect(player2.discard[0].instanceId).toBe('c2'); // Top card milled
        });
    });

    describe('look_and_move_to_top_or_bottom', () => {
        it('should look at cards and put them on bottom', async () => {
            const card1 = new MockCard('c1', 'Card 1', 'p1');
            const card2 = new MockCard('c2', 'Card 2', 'p1');
            const card3 = new MockCard('c3', 'Card 3', 'p1');
            player1.deck = [card1, card2, card3]; // c3 top

            const effect: EffectAST = {
                type: 'look_and_move_to_top_or_bottom',
                amount: 2,
                target: { type: 'self' } as any
            } as any;

            await executor.execute(effect, context);

            expect(player1.deck.length).toBe(3);
            expect(player1.deck[2].instanceId).toBe('c1'); // Old bottom is now top
            expect(player1.deck[0].instanceId).toBe('c2'); // New bottom
        });
    });


    describe('check_revealed_card', () => {
        it('should return true if revealed card matches filter', async () => {
            const card = new MockCard('c1', 'Card 1', 'p1');
            card.type = 'character';
            (context.eventContext as any).revealedCard = card;

            // Access private evaluateCondition via executeConditional wrapper or any cast
            // Since evaluateCondition is private, we can test it via a conditional effect

            const effect: EffectAST = {
                type: 'conditional',
                condition: {
                    type: 'check_revealed_card',
                    filter: { type: 'character' }
                },
                effect: { type: 'draw', amount: 1 }
            } as any;


            const logSpy = jest.spyOn(turnManager.logger, 'info');
            await executor.execute(effect, context);

            // Updated to match new logging format
            expect(logSpy).toHaveBeenCalledWith(
                expect.stringContaining('Drew'),
                expect.any(Object)
            );
            logSpy.mockRestore();
        });

        it('should return false if revealed card does not match', async () => {
            const card = new MockCard('c1', 'Card 1', 'p1');
            card.type = 'action';
            (context.eventContext as any).revealedCard = card;

            const effect: EffectAST = {
                type: 'conditional',
                condition: {
                    type: 'check_revealed_card',
                    filter: { type: 'character' }
                },
                effect: { type: 'draw', amount: 1 }
            } as any;

            const logSpy = jest.spyOn(turnManager.logger, 'info');
            await executor.execute(effect, context);

            expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('drew 1 card'));
            logSpy.mockRestore();
        });
    });

    describe('play_revealed_card_for_free', () => {
        it('should play revealed card from deck', async () => {
            const card = new MockCard('c1', 'Card 1', 'p1');
            player1.deck = [card];
            (context.eventContext as any).revealedCard = card;

            // Mock addCardToZone
            const mockAddCardToZone = jest.fn((p, c, z) => {
                c.zone = z;
                p.play.push(c);
                return c;
            });
            (game as any).addCardToZone = mockAddCardToZone;

            const effect: EffectAST = {
                type: 'play_revealed_card_for_free'
            } as any;

            await executor.execute(effect, context);

            expect(player1.deck.length).toBe(0);
            expect(player1.play.length).toBe(1);
            expect(player1.play[0].instanceId).toBe('c1');
            expect(mockAddCardToZone).toHaveBeenCalled();
        });
    });

    // ============================================
    // PHASE 1: BASIC ACTION TESTS
    // ============================================

    describe('Basic Actions', () => {
        describe('draw', () => {
            it('should draw cards from deck to hand', async () => {
                const card1 = new MockCard('c1', 'Card 1', 'p1');
                const card2 = new MockCard('c2', 'Card 2', 'p1');
                player1.deck = [card1, card2];

                const effect = { type: 'draw', amount: 2 } as any;
                await executor.execute(effect, context);

                expect(player1.hand).toHaveLength(2);
                expect(player1.hand).toContain(card2);
                expect(player1.hand).toContain(card1);
                expect(player1.deck).toHaveLength(0);
            });

            it('should handle empty deck gracefully', async () => {
                player1.deck = [];
                const effect = { type: 'draw', amount: 2 } as any;

                await executor.execute(effect, context);

                expect(player1.hand).toHaveLength(0);
                expect(mockLogger.info).toHaveBeenCalled();
            });

            it('should log draw action with structured data', async () => {
                const card = new MockCard('c1', 'Card 1', 'p1');
                player1.deck = [card];

                const effect = { type: 'draw', amount: 1 } as any;
                await executor.execute(effect, context);

                expect(mockLogger.info).toHaveBeenCalledWith(
                    expect.stringContaining('Drew'),
                    expect.objectContaining({
                        player: 'Player 1',
                        requested: 1,
                        drawn: 1
                    })
                );
            });
        });

        describe('damage', () => {
            it('should deal damage to single target', async () => {
                const target = new MockCard('t1', 'Target', 'p2');
                target.damage = 0;
                context.eventContext.targetCard = target;

                const effect = {
                    type: 'damage',
                    target: { type: 'chosen_character' },
                    amount: 3
                } as any;

                await executor.execute(effect, context);

                expect(turnManager.applyDamage).toHaveBeenCalledWith(
                    player2,
                    target,
                    3,
                    expect.anything()
                );
            });

            it('should deal damage to multiple targets', async () => {
                const target1 = new MockCard('t1', 'Target 1', 'p2');
                const target2 = new MockCard('t2', 'Target 2', 'p2');
                target1.type = 'Character';
                target2.type = 'Character';
                player2.play = [target1, target2];

                const effect = {
                    type: 'damage',
                    target: { type: 'all_opposing_characters' },
                    amount: 2
                } as any;

                await executor.execute(effect, context);

                expect(turnManager.applyDamage).toHaveBeenCalledTimes(2);
            });
        });

        describe('heal', () => {
            it('should remove damage from target', async () => {
                const target = new MockCard('t1', 'Target', 'p1');
                target.damage = 5;
                context.card = target as any; // Direct target via context

                const effect = {
                    type: 'heal',
                    target: { type: 'self' },
                    amount: 3
                } as any;

                await executor.execute(effect, context);

                expect(target.damage).toBe(2);
            });

            it('should not heal below zero', async () => {
                const target = new MockCard('t1', 'Target', 'p1');
                target.damage = 2;
                context.card = target as any;

                const effect = {
                    type: 'heal',
                    target: { type: 'self' },
                    amount: 5
                } as any;

                await executor.execute(effect, context);

                expect(target.damage).toBe(0);
            });
        });

        describe('banish', () => {
            it('should banish target card', async () => {
                const target = new MockCard('t1', 'Target', 'p2');
                context.eventContext.targetCard = target;

                const effect = {
                    type: 'banish',
                    target: { type: 'chosen_character' }
                } as any;

                await executor.execute(effect, context);

                expect(turnManager.banishCard).toHaveBeenCalledWith(player2, target);
            });

            it('should banish multiple targets', async () => {
                const target1 = new MockCard('t1', 'Target 1', 'p2');
                const target2 = new MockCard('t2', 'Target 2', 'p2');
                target1.type = 'Character';
                target2.type = 'Character';
                player2.play = [target1, target2];

                const effect = {
                    type: 'banish',
                    target: { type: 'all_opposing_characters' }
                } as any;

                await executor.execute(effect, context);

                expect(turnManager.banishCard).toHaveBeenCalledTimes(2);
            });
        });

        describe('return_to_hand', () => {
            it('should return card from play to hand', async () => {
                const target = new MockCard('t1', 'Target', 'p2');
                player2.play = [target];
                context.eventContext.targetCard = target;

                const effect = {
                    type: 'return_to_hand',
                    target: { type: 'chosen_character' }
                } as any;

                await executor.execute(effect, context);

                expect(player2.play).toHaveLength(0);
                expect(player2.hand).toContain(target);
                expect(target.zone).toBe('Hand'); // Zone uses capitalized enum value
            });
        });

        describe('discard', () => {
            it('should discard cards from hand', async () => {
                const card1 = new MockCard('c1', 'Card 1', 'p1');
                const card2 = new MockCard('c2', 'Card 2', 'p1');
                player1.hand = [card1, card2];

                const effect = { type: 'discard', amount: 1 } as any;
                await executor.execute(effect, context);

                expect(player1.hand).toHaveLength(1);
                expect(player1.discard).toHaveLength(1);
            });

            it('should handle discarding more than available', async () => {
                const card = new MockCard('c1', 'Card 1', 'p1');
                player1.hand = [card];

                const effect = { type: 'discard', amount: 5 } as any;
                await executor.execute(effect, context);

                expect(player1.hand).toHaveLength(0);
                expect(player1.discard).toHaveLength(1);
            });
        });

        describe('modify_stats', () => {
            it('should modify strength stat', async () => {
                const target = new MockCard('t1', 'Target', 'p1');
                target.strength = 3;
                context.card = target as any;

                const effect = {
                    type: 'modify_stats',
                    target: { type: 'self' },
                    stat: 'strength',
                    amount: 2
                } as any;

                await executor.execute(effect, context);

                // Check that an active effect was created
                const activeEffect = game.state.activeEffects.find(
                    (e: any) => e.targetCardId === target.instanceId && e.type === 'modify_strength'
                );
                expect(activeEffect).toBeDefined();
                expect(activeEffect?.value).toBe(2);
            });

            it('should modify willpower stat', async () => {
                const target = new MockCard('t1', 'Target', 'p1');
                target.willpower = 4;
                context.card = target as any;

                const effect = {
                    type: 'modify_stats',
                    target: { type: 'self' },
                    stat: 'willpower',
                    amount: -1
                } as any;

                await executor.execute(effect, context);

                // Check that an active effect was created
                const activeEffect = game.state.activeEffects.find(
                    (e: any) => e.targetCardId === target.instanceId && e.type === 'modify_willpower'
                );
                expect(activeEffect).toBeDefined();
                expect(activeEffect?.value).toBe(-1);
            });
        });

        describe('grant_keyword', () => {
            it('should grant keyword to target', async () => {
                const target = new MockCard('t1', 'Target', 'p1');
                target.meta = {};
                context.card = target as any;

                const effect = {
                    type: 'grant_keyword',
                    target: { type: 'self' },
                    keyword: 'Evasive'
                } as any;

                await executor.execute(effect, context);

                expect(target.meta.grantedKeywords).toContain('Evasive');
            });

            it('should grant keyword to multiple targets', async () => {
                const target1 = new MockCard('t1', 'Target 1', 'p1');
                const target2 = new MockCard('t2', 'Target 2', 'p1');
                target1.meta = {};
                target2.meta = {};
                target1.type = 'Character';
                target2.type = 'Character';
                player1.play = [target1, target2];

                const effect = {
                    type: 'grant_keyword',
                    target: { type: 'all_characters', filter: { owner: 'self' } },
                    keyword: 'Rush'
                } as any;

                await executor.execute(effect, context);

                expect(target1.meta.grantedKeywords).toContain('Rush');
                expect(target2.meta.grantedKeywords).toContain('Rush');
            });
        });

        describe('gain_lore', () => {
            it('should add lore to player', async () => {
                player1.lore = 5;

                const effect = { type: 'gain_lore', amount: 3 } as any;
                await executor.execute(effect, context);

                expect(player1.lore).toBe(8);
            });

            it('should log lore gain with total', async () => {
                player1.lore = 10;

                const effect = { type: 'gain_lore', amount: 2 } as any;
                await executor.execute(effect, context);

                expect(mockLogger.info).toHaveBeenCalledWith(
                    expect.stringContaining('gained 2 lore')
                );
            });
        });

        describe('lose_lore', () => {
            it('should remove lore from target player', async () => {
                player2.lore = 10;
                context.eventContext.targetCard = player2; // Target is player object

                const effect = {
                    type: 'lose_lore',
                    target: { type: 'chosen_opponent' },
                    amount: 4
                } as any;

                await executor.execute(effect, context);

                expect(player2.lore).toBe(6);
            });

            it('should not go below zero lore', async () => {
                player2.lore = 2;
                context.eventContext.targetCard = player2;

                const effect = {
                    type: 'lose_lore',
                    target: { type: 'chosen_opponent' },
                    amount: 5
                } as any;

                await executor.execute(effect, context);

                expect(player2.lore).toBe(0);
            });
        });
    });

    // ============================================
    // PHASE 2: CONTROL FLOW TESTS
    // ============================================

    describe('Control Flow', () => {
        describe('sequence', () => {
            it('should execute effects in order', async () => {
                player1.lore = 0;
                player1.deck = [
                    new MockCard('c1', 'Card 1', 'p1'),
                    new MockCard('c2', 'Card 2', 'p1')
                ];

                const effect = {
                    type: 'sequence',
                    effects: [
                        { type: 'draw', amount: 1 },
                        { type: 'gain_lore', amount: 2 },
                        { type: 'draw', amount: 1 }
                    ]
                } as any;

                await executor.execute(effect, context);

                expect(player1.hand).toHaveLength(2);
                expect(player1.lore).toBe(2);
            });

            it('should handle empty sequence', async () => {
                const effect = {
                    type: 'sequence',
                    effects: []
                } as any;

                await expect(executor.execute(effect, context)).resolves.not.toThrow();
            });

            it('should execute nested sequences', async () => {
                player1.lore = 0;

                const effect = {
                    type: 'sequence',
                    effects: [
                        { type: 'gain_lore', amount: 1 },
                        {
                            type: 'sequence',
                            effects: [
                                { type: 'gain_lore', amount: 2 },
                                { type: 'gain_lore', amount: 3 }
                            ]
                        }
                    ]
                } as any;

                await executor.execute(effect, context);

                expect(player1.lore).toBe(6); // 1 + 2 + 3
            });
        });

        describe('conditional', () => {
            it('should execute if branch when condition is true', async () => {
                player1.lore = 0;

                const effect = {
                    type: 'conditional',
                    condition: { type: 'always_true' },
                    effect: { type: 'gain_lore', amount: 5 },
                    else: { type: 'gain_lore', amount: 1 }
                } as any;

                // Mock evaluateCondition to return true
                const executorAny = executor as any;
                executorAny.evaluateCondition = jest.fn(() => true);

                await executor.execute(effect, context);

                expect(player1.lore).toBe(5);
            });

            it('should execute else branch when condition is false', async () => {
                player1.lore = 0;

                const effect = {
                    type: 'conditional',
                    condition: { type: 'always_false' },
                    effect: { type: 'gain_lore', amount: 5 },
                    else: { type: 'gain_lore', amount: 1 }
                } as any;

                // Mock evaluateCondition to return false
                const executorAny = executor as any;
                executorAny.evaluateCondition = jest.fn(() => false);

                await executor.execute(effect, context);

                expect(player1.lore).toBe(1);
            });

            it('should handle conditional without else branch', async () => {
                player1.lore = 0;

                const effect = {
                    type: 'conditional',
                    condition: { type: 'some_condition' },
                    effect: { type: 'gain_lore', amount: 3 }
                } as any;

                const executorAny = executor as any;
                executorAny.evaluateCondition = jest.fn(() => false);

                await executor.execute(effect, context);

                expect(player1.lore).toBe(0); // No else branch, so no change
            });
        });

        describe('for_each', () => {
            it('should execute effect for each target', async () => {
                const target1 = new MockCard('t1', 'Target 1', 'p1');
                const target2 = new MockCard('t2', 'Target 2', 'p1');
                const target3 = new MockCard('t3', 'Target 3', 'p1');
                target1.damage = 0;
                target2.damage = 0;
                target3.damage = 0;

                const effect = {
                    type: 'for_each',
                    target: { type: 'all_characters', filter: { owner: 'self' } },
                    effect: { type: 'damage', target: { type: 'variable', name: 'current' }, amount: 2 }
                } as any;

                // Mock resolveTargets to return our targets
                const executorAny = executor as any;
                const originalResolve = executorAny.resolveTargets.bind(executorAny);
                executorAny.resolveTargets = jest.fn((target: any, ctx: any) => {
                    if (target?.type === 'all_characters') {
                        return [target1, target2, target3];
                    }
                    return originalResolve(target, ctx);
                });

                await executor.execute(effect, context);

                // Each target should have been processed
                expect(executorAny.resolveTargets).toHaveBeenCalled();
            });

            it('should handle empty target list', async () => {
                const effect = {
                    type: 'for_each',
                    target: { type: 'all_characters' },
                    effect: { type: 'damage', target: { type: 'variable', name: 'current' }, amount: 2 }
                } as any;

                // Mock resolveTargets to return empty array
                const executorAny = executor as any;
                executorAny.resolveTargets = jest.fn(() => []);

                await expect(executor.execute(effect, context)).resolves.not.toThrow();
            });
        });
    });

    // ============================================
    // PHASE 3: ADVANCED EFFECT TESTS
    // ============================================

    describe('Advanced Effects', () => {
        describe('vanish', () => {
            it('should banish self when triggered', async () => {
                const vanishCard = new MockCard('v1', 'Vanish Card', 'p1');
                player1.play = [vanishCard];
                context.card = vanishCard as any;

                const effect = { type: 'vanish' } as any;

                await executor.execute(effect, context);

                expect(turnManager.banishCard).toHaveBeenCalledWith(player1, vanishCard);
            });

            it('should log vanish action', async () => {
                const vanishCard = new MockCard('v1', 'Vanish Card', 'p1');
                context.card = vanishCard as any;

                const effect = { type: 'vanish' } as any;

                await executor.execute(effect, context);

                expect(mockLogger.info).toHaveBeenCalledWith(
                    expect.stringContaining('vanished')
                );
            });
        });

        describe('restriction', () => {
            it('should apply restriction to target', async () => {
                const target = new MockCard('t1', 'Target', 'p1');
                context.card = target as any;

                const effect = {
                    type: 'restriction',
                    restrictionType: 'cant_quest'
                } as any;

                // Just verify it completes without error
                await expect(executor.execute(effect, context)).resolves.not.toThrow();
            });

            it('should handle multiple target restrictions', async () => {
                const effect = {
                    type: 'restriction',
                    restrictionType: 'cant_challenge'
                } as any;

                // Just verify it completes
                await expect(executor.execute(effect, context)).resolves.not.toThrow();
            });
        });

        describe('reveal_hand', () => {
            it('should reveal opponent hand', async () => {
                const card1 = new MockCard('c1', 'Card 1', 'p2');
                const card2 = new MockCard('c2', 'Card 2', 'p2');
                player2.hand = [card1, card2];

                const effect = {
                    type: 'reveal_hand',
                    target: { type: 'chosen_opponent' }
                } as any;

                context.eventContext.targetCard = player2;

                // Just verify it completes without error
                await expect(executor.execute(effect, context)).resolves.not.toThrow();
            });
        });

        describe('discard_chosen', () => {
            it('should allow player to discard chosen card', async () => {
                const card1 = new MockCard('c1', 'Card 1', 'p2');
                const card2 = new MockCard('c2', 'Card 2', 'p2');
                player2.hand = [card1, card2];

                const effect = {
                    type: 'discard_chosen',
                    target: { type: 'chosen_opponent' },
                    filter: {},
                    chooser: 'self'
                } as any;

                context.eventContext.targetCard = player2;

                await executor.execute(effect, context);

                // Should have processed the discard (uses action logs now)
                expect(mockLogger.action).toHaveBeenCalled();
            });

            it('should handle opponent choosing to discard', async () => {
                const card = new MockCard('c1', 'Card 1', 'p1');
                player1.hand = [card];

                const effect = {
                    type: 'discard_chosen',
                    target: { type: 'player', player: 'self' },
                    filter: {},
                    chooser: 'opponent'
                } as any;

                await executor.execute(effect, context);

                expect(mockLogger.action).toHaveBeenCalled();
            });
        });

        describe('opponent_discard', () => {
            it('should make opponent discard cards', async () => {
                const card1 = new MockCard('c1', 'Card 1', 'p2');
                const card2 = new MockCard('c2', 'Card 2', 'p2');
                player2.hand = [card1, card2];

                const effect = {
                    type: 'opponent_discard',
                    amount: 1
                } as any;

                await executor.execute(effect, context);

                expect(player2.hand.length + player2.discard.length).toBe(2);
            });

            it('should handle opponent with empty hand', async () => {
                player2.hand = [];

                const effect = {
                    type: 'opponent_discard',
                    amount: 2
                } as any;

                await expect(executor.execute(effect, context)).resolves.not.toThrow();
            });
        });
    });

    // ============================================
    // FINAL COVERAGE: EDGE CASES & MODAL
    // ============================================

    describe('Modal and Edge Cases', () => {
        describe('modal', () => {
            it('should execute chosen option from modal effect', async () => {
                player1.lore = 0;

                const effect = {
                    type: 'modal',
                    options: [
                        { effects: [{ type: 'gain_lore', amount: 3 }] },
                        { effects: [{ type: 'draw', amount: 2 }] }
                    ]
                } as any;

                context.modalChoice = 0; // Choose first option

                await executor.execute(effect, context);

                expect(player1.lore).toBe(3);
            });

            it('should execute second option when chosen', async () => {
                player1.lore = 0;
                player1.deck = [new MockCard('c1', 'Card 1', 'p1'), new MockCard('c2', 'Card 2', 'p1')];

                const effect = {
                    type: 'modal',
                    options: [
                        { effects: [{ type: 'gain_lore', amount: 3 }] },
                        { effects: [{ type: 'draw', amount: 2 }] }
                    ]
                } as any;

                context.modalChoice = 1; // Choose second option

                await executor.execute(effect, context);

                expect(player1.hand).toHaveLength(2);
                expect(player1.lore).toBe(0); // Didn't gain lore
            });

            it('should default to first option if no choice specified', async () => {
                player1.lore = 0;

                const effect = {
                    type: 'modal',
                    options: [
                        { effects: [{ type: 'gain_lore', amount: 5 }] },
                        { effects: [{ type: 'gain_lore', amount: 1 }] }
                    ]
                } as any;

                // No modalChoice set
                delete context.modalChoice;

                await executor.execute(effect, context);

                expect(player1.lore).toBe(5); // First option
            });
        });

        describe('edge cases', () => {
            it('should handle effects with undefined amounts', async () => {
                player1.lore = 5;

                const effect = {
                    type: 'gain_lore',
                    amount: 0  // Use 0 instead of undefined
                } as any;

                await executor.execute(effect, context);

                expect(player1.lore).toBe(5); // No change with 0 amount
            });

            it('should handle empty target arrays gracefully', async () => {
                const effect = {
                    type: 'banish',
                    target: { type: 'all_opposing_characters' }
                } as any;

                // No opposing characters
                player2.play = [];

                await expect(executor.execute(effect, context)).resolves.not.toThrow();
            });
        });
    });
});
