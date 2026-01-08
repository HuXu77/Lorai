
import { EffectExecutor } from '../../engine/abilities/executor';
import { TurnManager } from '../../engine/actions';
import { GameStateManager, PlayerState } from '../../engine/state';
import { CardInstance, ZoneType } from '../../engine/models';

describe('TDD Batch 9: Static & Name Synergies', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let player: any;
    let card: any;

    beforeEach(() => {
        // Mock Game State
        player = {
            id: 'p1',
            name: 'Player 1',
            costReductions: [], // Specific array for cost reductions
            play: [],
            hand: [],
            deck: [],
            discard: []
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
                info: jest.fn(),
                debug: jest.fn(),
                warn: jest.fn()
            },
            // Mock other methods if needed
            addActiveEffect: jest.fn((effect) => {
                game.state.activeEffects.push(effect);
            })
        };

        executor = new EffectExecutor(turnManager);
    });

    describe('Cost Reduction', () => {
        it('should execute "cost_reduction" by adding to player.costReductions', async () => {
            const effect = {
                type: 'cost_reduction',
                amount: 1,
                filter: { cardType: 'character' },
                duration: 'next_play'
            };
            const context = {
                player,
                card: { instanceId: 'c1', name: 'Source' },
                gameState: game.state,
                eventContext: {} as any
            };

            await executor.execute(effect as any, context);

            expect(player.costReductions.length).toBe(1);
            expect(player.costReductions[0]).toEqual(expect.objectContaining({
                amount: 1,
                filter: { cardType: 'character' },
                duration: 'next_play'
            }));
            // Should NOT be in global activeEffects (or maybe duplicated? but logic reads costReductions)
            // Existing logic reads player.costReductions.
        });
    });

    describe('Restrictions (Cant Sing)', () => {
        it('should execute "restriction" with "cant_sing"', async () => {
            const target = { instanceId: 't1', name: 'Target' };
            const effect = {
                type: 'restriction',
                restriction: 'cant_sing',
                target: { type: 'chosen' } // resolved via mock
            };
            const context = {
                player,
                card: { instanceId: 'c1', name: 'Source' },
                gameState: game.state,
                eventContext: {} as any
            };

            // Mock resolveTargets
            jest.spyOn(executor as any, 'resolveTargets').mockReturnValue([target]);

            await executor.execute(effect as any, context);

            expect(game.state.activeEffects.length).toBe(1);
            expect(game.state.activeEffects[0]).toEqual(expect.objectContaining({
                type: 'restriction',
                restrictionType: 'cant_sing',
                targetCardIds: ['t1']
            }));
        });
    });
});
