import { EffectExecutor } from '../../../engine/abilities/executor';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { Player, ZoneType } from '../../../engine/models';
import { GameEvent } from '../../../engine/abilities/events';

describe('Executor: Inkwell Interactions', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let executor: EffectExecutor;
    let p1: Player;
    let p2: Player;

    beforeEach(() => {
        game = new GameStateManager();
        const p1Id = game.addPlayer('Player 1');
        const p2Id = game.addPlayer('Player 2');
        p1 = game.getPlayer(p1Id)!;
        p2 = game.getPlayer(p2Id)!;
        turnManager = new TurnManager(game);
        executor = new EffectExecutor(turnManager);
    });

    // START TEST HELPERS
    const createInk = (player: Player, count: number, exerted: boolean = false) => {
        for (let i = 0; i < count; i++) {
            const card = {
                id: 999,
                instanceId: `ink-${player.id}-${i}`,
                name: 'Ink Card',
                type: 'action',
                ownerId: player.id,
                zone: ZoneType.Inkwell,
                ready: !exerted
            } as any;
            player.inkwell.push(card);
        }
    };
    // END TEST HELPERS

    describe('ready_inkwell', () => {
        it('should ready exerted ink', async () => {
            // Setup: 3 exerted ink
            createInk(p1, 3, true);
            expect(p1.inkwell.filter(c => c.ready).length).toBe(0);

            // Execute: Ready 2 ink
            const effect = {
                type: 'ready_inkwell',
                target: { type: 'self' }, // implicit target is often just count
                amount: 2
            } as any; // Using any as strict AST check might fail locally

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: {
                    event: GameEvent.ABILITY_ACTIVATED,
                    timestamp: Date.now()
                }
            });

            // Verify: 2 ready, 1 exerted
            expect(p1.inkwell.filter(c => c.ready).length).toBe(2);
        });
    });

    describe('exert_inkwell', () => {
        it('should exert opponent ink', async () => {
            // Setup: 3 ready ink for opponent
            createInk(p2, 3, false);
            expect(p2.inkwell.filter(c => c.ready).length).toBe(3);

            // Execute: Exert 2 of opponent's ink
            const effect = {
                type: 'exert_inkwell',
                target: { type: 'opponent' },
                amount: 2
            } as any;

            await executor.execute(effect, {
                player: p1, // P1 executing
                card: {} as any,
                gameState: game,
                eventContext: {
                    event: GameEvent.ABILITY_ACTIVATED,
                    timestamp: Date.now()
                }
            });

            // Verify: 1 ready, 2 exerted
            expect(p2.inkwell.filter(c => c.ready).length).toBe(1);
        });
    });

    // TODO: Debug environment issue preventing play_from_inkwell test from passing (execution logic verified manually)
    describe('play_from_inkwell', () => {
        it('should move card from inkwell to play', async () => {
            // process.stderr.write('>>> TEST START: play_from_inkwell <<<\n');
            // Setup: 1 card in inkwell
            createInk(p1, 1, false);
            const inkCard = p1.inkwell[0];

            // Execute: Play from inkwell
            const effect = {
                type: 'play_from_inkwell',
                target: { type: 'chosen', filter: { zone: 'inkwell' } }
            } as any;

            // Mock turnManager playCard
            turnManager.playCard = vi.fn();

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                payload: { targets: [inkCard] },
                eventContext: {
                    event: GameEvent.ABILITY_ACTIVATED,
                    timestamp: Date.now()
                }
            });

            expect(turnManager.playCard).toHaveBeenCalledWith(p1, inkCard, expect.objectContaining({
                fromZone: 'inkwell'
            }));
        });
    });
});
