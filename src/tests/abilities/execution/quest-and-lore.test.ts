
import { EffectExecutor } from '../../../engine/abilities/executor';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { Player, ZoneType } from '../../../engine/models';
import { GameEvent } from '../../../engine/abilities/events';

// Mock dependencies
vi.mock('../../../engine/actions');

describe('Executor: Quest, Draw, & Lore Mechanics', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let p1: Player;

    // Helper
    const createCard = (id: string, name: string, cost: number = 3, strength: number = 2, willpower: number = 2) => ({
        instanceId: id,
        name,
        type: 'character',
        cost,
        zone: ZoneType.Play,
        ready: true,
        damage: 0,
        strength,
        willpower,
        ownerId: 'p1',
        keywords: []
    } as any);

    const setupPlayer = (id: string) => ({
        id,
        name: `Player ${id}`,
        deck: [],
        hand: [],
        discard: [],
        inkwell: [],
        play: [],
        lore: 0
    } as any);

    beforeEach(() => {
        vi.clearAllMocks();

        p1 = setupPlayer('p1');
        game = new GameStateManager();
        game.state = {
            players: { [p1.id]: p1 },
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

        // Mock getPlayer
        game.getPlayer = vi.fn((id) => game.state.players[id]);

        executor = new EffectExecutor(turnManager);
        executor.setTurnManager(turnManager);

        // Mock resolveTargets on handler directly if needed, but integration test is better.
        // We rely on executor's resolveTargets (which often needs generic mocks).
        // For simple tests, we can spy on executor.

        // We need to mock executor.resolveTargets because we don't have full TargetResolver logic in this isolated test setup 
        // unless we import it, but cleaner to mock for unit testing logic.
        (executor as any).resolveTargets = vi.fn((target, context) => {
            if (target && (target.type === 'chosen_character' || target.type === 'chosen')) {
                // Return other card if available, or self?
                // Let's assume testing "Quest debuff chosen".
                // Return the only other card in play.
                return p1.play.filter(c => c !== context.card);
            }
            return [];
        });
    });

    describe('quest_debuff_chosen', () => {
        it('should debuff target strength on quest', async () => {
            const quester = createCard('c1', 'Quester');
            const target = createCard('c2', 'Target', 3, 3, 3);

            p1.play = [quester, target];

            const effect = {
                type: 'quest_debuff_chosen',
                target: { type: 'chosen' }, // BaseHandler supports 'chosen' with payload
                amount: 2,
                stat: 'strength'
            } as any;

            // Execute
            await executor.execute(effect, {
                player: p1,
                card: quester,
                gameState: game,
                eventContext: {
                    event: GameEvent.CARD_QUESTED,
                    timestamp: Date.now()
                },
                payload: { targets: [target] } // Pre-resolve target
            });

            expect(target.strength).toBe(1); // 3 - 2
            // Check log
            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Debuffed Target'),
                expect.anything()
            );
        });
    });

    describe('gain_lore_when_damaged', () => {
        it('should register passive effect', async () => {
            const card = createCard('c1', 'Pain Lover');
            p1.play = [card];

            const effect = {
                type: 'gain_lore_when_damaged',
                amount: 1
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: {
                    event: GameEvent.CARD_DAMAGED,
                    timestamp: Date.now()
                }
            });

            // BaseHandler registerPassiveEffect checks?
            // Since we mocked turnManager, we can't easily check passiveEffects array unless we spy on handler.
            // But we can check logger.
            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Gain lore when damaged ability registered'),
                expect.anything()
            );
        });
    });
});
