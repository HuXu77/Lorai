import { EffectExecutor } from '../../engine/abilities/executor';
import { GameEvent } from '../../engine/abilities/events';

describe('TDD Batch 13: Conditional Effects & Special Triggers', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let player: any;

    beforeEach(() => {
        player = {
            id: 'p1',
            name: 'Player 1',
            hand: [],
            play: [],
            deck: [],
            discard: [],
            inkwell: []
        };

        game = {
            state: {
                players: { 'p1': player },
                activeEffects: [],
                turnCount: 1
            },
            getPlayer: (id: string) => player
        };

        turnManager = {
            game: game,
            logger: {
                info: vi.fn(),
                debug: vi.fn(),
                warn: vi.fn()
            },
            trackZoneChange: vi.fn(),
            addActiveEffect: vi.fn((effect) => {
                game.state.activeEffects.push(effect);
            }),
            checkWinCondition: vi.fn(),
            requestChoice: vi.fn(async (request: any) => ({
                requestId: request.id,
                playerId: request.playerId,
                selectedIds: request.options?.[0]?.id ? [request.options[0].id] : ['yes'],
                timestamp: Date.now()
            }))
        };

        executor = new EffectExecutor(turnManager);
    });

    describe('Effect: Ink from Hand', () => {
        it('should execute "ink_from_hand" by moving a card from hand to inkwell', async () => {
            const cardToInk = {
                instanceId: 'c1',
                name: 'Card to Ink',
                zone: 'hand'
            };

            player.hand = [cardToInk];

            const effect = {
                type: 'ink_from_hand',
                optional: true
            };

            const context = {
                player,
                card: { instanceId: 'source', name: 'Source' },
                gameState: game.state,
                eventContext: {} as any
            };

            await executor.execute(effect as any, context);

            // Should move card from hand to inkwell
            expect(player.hand.length).toBe(0);
            expect(player.inkwell.length).toBe(1);
            expect(player.inkwell[0].instanceId).toBe('c1');
            expect(turnManager.trackZoneChange).toHaveBeenCalledWith(cardToInk, 'hand', 'inkwell');
        });

        it('should handle empty hand gracefully', async () => {
            player.hand = [];

            const effect = {
                type: 'ink_from_hand'
            };

            const context = {
                player,
                card: { instanceId: 'source', name: 'Source' },
                gameState: game.state,
                eventContext: {} as any
            };

            await executor.execute(effect as any, context);

            // Should not crash and not call addCardToZone
            expect(turnManager.trackZoneChange).not.toHaveBeenCalled();
        });
    });

    describe('Restriction: Can\'t Challenge', () => {
        it('should execute "cant_challenge" restriction', async () => {
            const target = { instanceId: 't1', name: 'Target' };

            const effect = {
                type: 'cant_challenge',
                target: { type: 'chosen' },
                duration: 'next_turn'
            };

            const context = {
                player,
                card: { instanceId: 'source', name: 'Source' },
                gameState: game.state,
                eventContext: {} as any
            };

            // Mock resolveTargets
            vi.spyOn(executor as any, 'resolveTargets').mockReturnValue([target]);

            await executor.execute(effect as any, context);

            // Should add to activeEffects
            expect(game.state.activeEffects.length).toBe(1);
            expect(game.state.activeEffects[0].type).toBe('cant_challenge');
            expect(game.state.activeEffects[0].targetCardIds).toContain('t1');
            expect(game.state.activeEffects[0].duration).toBe('next_turn');
        });
    });

    describe('Event: Card Readied', () => {
        it('should verify CARD_READIED event is defined', () => {
            expect(GameEvent.CARD_READIED).toBe('card_readied');
        });
    });

    describe('Conditional Effects', () => {
        it('should handle conditional with hand_empty condition', async () => {
            // hand_empty condition
            player.hand = [];

            const effect = {
                type: 'conditional',
                condition: {
                    type: 'empty_hand'
                },
                effect: {
                    type: 'draw',
                    amount: 1
                }
            };

            const context = {
                player,
                card: { instanceId: 'source', name: 'Source' },
                gameState: game.state,
                eventContext: {} as any
            };

            // Mock executeDraw
            const drawSpy = vi.spyOn(executor as any, 'executeDraw').mockResolvedValue(undefined);

            await executor.execute(effect as any, context);

            // Should execute the 'then' effect because hand is empty
            expect(drawSpy).toHaveBeenCalled();
        });
    });
});
