import { parseStaticEffects } from '../../engine/parsers/static-effect-parser';
import { EffectExecutor, GameContext } from '../../engine/abilities/executor';
import { GameEvent } from '../../engine/abilities/events';
import { CardType } from '../../engine/models';


describe('TDD Batch 12: Time & Complex Triggers', () => {
    let mockTurnManager: any;
    let mockPlayer: any;
    let mockCard: any;
    let executor: EffectExecutor;

    beforeEach(() => {
        mockPlayer = {
            id: 'p1',
            name: 'Player 1',
            costModifiers: [],
            play: [],
            hand: [],
            deck: [],
            discard: [],
            inkwell: []
        };

        mockCard = {
            instanceId: 'card1',
            name: 'Test Card',
            type: 'Character' as CardType,
            ownerId: 'p1',
            restrictions: []
        };

        const mockGame = {
            state: {
                activeEffects: [] as any[],
                players: { 'p1': mockPlayer }
            },
            addCardToZone: jest.fn((player, card, zone) => {
                // Simulate moving card for tests
                if (zone === 'inkwell' || zone === 'Inkwell') {
                    player.play = player.play.filter((c: any) => c.instanceId !== card.instanceId);
                    player.hand = player.hand.filter((c: any) => c.instanceId !== card.instanceId);
                    player.inkwell.push(card);
                    card.zone = 'inkwell';
                }
                return card;
            })
        };

        mockTurnManager = {
            game: mockGame,
            trackZoneChange: jest.fn(),
            addActiveEffect: jest.fn((effect) => {
                mockGame.state.activeEffects.push(effect);
            }),
            logger: {
                info: console.log,
                debug: console.log,
                warn: console.warn,
                error: jest.fn()
            }
        };

        executor = new EffectExecutor(mockTurnManager);
    });

    describe('1. Effect: Put into Inkwell', () => {
        it('should execute "put_into_inkwell" by moving target to inkwell', async () => {
            const effect = {
                type: 'put_into_inkwell',
                target: { type: 'chosen_character' },
                exerted: true
            };

            const targetCard = { instanceId: 'target_c1', name: 'Ink Target', zone: 'play', ready: true };
            mockPlayer.play = [targetCard];

            const context: GameContext = {
                player: mockPlayer,
                card: mockCard,
                gameState: mockTurnManager.game.state,
                eventContext: {
                    type: 'resolution',
                    event: GameEvent.ABILITY_ACTIVATED,
                    timestamp: Date.now(),
                    targetCard: targetCard
                }
            };

            await executor.execute(effect as any, context);

            expect(mockTurnManager.game.addCardToZone).toHaveBeenCalledWith(mockPlayer, targetCard, 'Inkwell');
            expect(mockTurnManager.trackZoneChange).toHaveBeenCalledWith(targetCard, 'play', 'Inkwell');
            expect(mockPlayer.inkwell).toContain(targetCard);
            expect(targetCard.ready).toBe(false); // exerted: true
        });
    });

    describe('2. Restriction: Can\'t Ready', () => {
        it('should execute "cant_ready" restriction', async () => {
            const effect = {
                type: 'restriction',
                restriction: 'cant_ready',
                target: { type: 'chosen_character' },
                duration: 'next_turn'
            };

            const targetCard = { instanceId: 'target_c2', name: 'Stuck Target' };
            const context: GameContext = {
                player: mockPlayer,
                card: mockCard,
                gameState: mockTurnManager.game.state,
                eventContext: {
                    type: 'resolution',
                    event: GameEvent.ABILITY_ACTIVATED,
                    timestamp: Date.now(),
                    targetCard: targetCard
                }
            };

            await executor.execute(effect as any, context);

            const activeEffect = mockTurnManager.game.state.activeEffects.find((e: any) => e.type === 'restriction');
            expect(activeEffect).toBeDefined();
            expect(activeEffect.restrictionType).toBe('cant_ready');
            expect(activeEffect.targetCardIds).toContain('target_c2');
            expect(activeEffect.duration).toBe('next_turn');
        });
    });
});
