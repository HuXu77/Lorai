import { EffectExecutor } from '../../../engine/abilities/executor';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { Player, ZoneType } from '../../../engine/models';
import { GameEvent } from '../../../engine/abilities/events';

// Mock dependencies
vi.mock('../../../engine/actions');

describe('Executor: Control Flow & Conditionals', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let p1: Player;
    let p2: Player;

    // Test Helpers
    const createCard = (id: string, name: string, type: string = 'character', cost: number = 1, stats: any = {}) => ({
        instanceId: id,
        name,
        type,
        cost,
        zone: ZoneType.Play,
        ready: true,
        damage: 0,
        strength: stats.strength || 0,
        willpower: stats.willpower || 1,
        keywords: [],
        subtypes: stats.subtypes || [],
        ownerId: 'p1'
    } as any);

    const setupPlayer = (id: string, name: string) => ({
        id,
        name,
        deck: [],
        hand: [],
        discard: [],
        inkwell: [],
        play: [],
        lore: 0
    } as any);

    beforeEach(() => {
        vi.clearAllMocks();

        p1 = setupPlayer('p1', 'Player 1');
        p2 = setupPlayer('p2', 'Player 2');

        game = new GameStateManager();
        game.state = {
            players: { [p1.id]: p1, [p2.id]: p2 },
            turnPlayerId: p1.id
        };

        turnManager = new TurnManager(game);
        turnManager.game = game;
        turnManager.logger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            action: vi.fn(),
            effect: vi.fn()
        };

        executor = new EffectExecutor(turnManager);
        executor.setTurnManager(turnManager);
    });

    describe('count_check', () => {
        it('should execute if player has enough cards matching filter', async () => {
            // "If you have 2 or more characters..."
            p1.play = [
                createCard('c1', 'A', 'character'),
                createCard('c2', 'B', 'character')
            ];

            const effect = {
                type: 'conditional',
                condition: {
                    type: 'count_check',
                    amount: 2,
                    operator: 'gte',
                    filter: { cardType: 'character' }
                },
                effect: { type: 'gain_lore', amount: 1 }
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.lore).toBe(1);
        });

        it('should NOT execute if count is insufficient', async () => {
            p1.play = [createCard('c1', 'A', 'character')];

            const effect = {
                type: 'conditional',
                condition: {
                    type: 'count_check',
                    amount: 2,
                    operator: 'gte',
                    filter: { cardType: 'character' }
                },
                effect: { type: 'gain_lore', amount: 1 }
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.lore).toBe(0);
        });
    });

    describe('opponent_lore_check', () => {
        it('should check if opponent has enough lore', async () => {
            p2.lore = 10;

            const effect = {
                type: 'conditional',
                condition: {
                    type: 'opponent_lore_check',
                    amount: 10,
                    operator: 'gte'
                },
                effect: { type: 'gain_lore', amount: 1 }
            } as any;

            await executor.execute(effect, {
                player: p1, // I am p1
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.lore).toBe(1);
        });
    });

    describe('self_stat_check', () => {
        it('should check self stats', async () => {
            const card = createCard('c1', 'Strong Guy', 'character', 5, { strength: 5 });

            const effect = {
                type: 'conditional',
                condition: {
                    type: 'self_stat_check',
                    stat: 'strength',
                    value: 5,
                    operator: 'gte'
                },
                effect: { type: 'gain_lore', amount: 1 }
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.lore).toBe(1);
        });
    });

    describe('control_character', () => {
        it('should check if player controls a specific character', async () => {
            p1.play = [createCard('c1', 'Mickey Mouse', 'character')];

            const effect = {
                type: 'conditional',
                condition: {
                    type: 'control_character',
                    name: 'Mickey Mouse'
                },
                effect: { type: 'gain_lore', amount: 1 }
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.lore).toBe(1);
        });
    });
});
