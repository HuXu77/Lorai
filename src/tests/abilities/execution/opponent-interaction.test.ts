import { EffectExecutor } from '../../../engine/abilities/executor';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { Player, ZoneType } from '../../../engine/models';
import { GameEvent } from '../../../engine/abilities/events';

// Mock dependencies
vi.mock('../../../engine/actions');

describe('Executor: Opponent Interactions', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let p1: Player;
    let p2: Player;

    // Test Helpers
    const createCard = (id: string, name: string, type: string = 'character', cost: number = 1, willpower: number = 2) => ({
        instanceId: id,
        name,
        type,
        cost,
        willpower,
        zone: ZoneType.Play,
        ready: true,
        damage: 0,
        keywords: [],
        subtypes: [],
        ownerId: 'p2'
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
        p2 = setupPlayer('p2', 'Player 2'); // Opponent

        game = new GameStateManager();
        game.state = {
            players: { [p1.id]: p1, [p2.id]: p2 },
            turnPlayerId: p1.id // It's P1's turn
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

        // Ensure requestChoice is not defined so tests use bot logic fallback
        delete turnManager.requestChoice;
    });

    // Helper to get opponent (P2)
    const getOpponent = () => game.getPlayer('p2');

    describe('opponent_loses_lore', () => {
        it('should make opponent lose lore', async () => {
            getOpponent().lore = 5;

            const effect = {
                type: 'opponent_loses_lore',
                amount: 2
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(getOpponent().lore).toBe(3);
            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Opponent lost 2 lore'),
                expect.anything()
            );
        });

        it('should not reduce lore below 0', async () => {
            getOpponent().lore = 1;

            const effect = {
                type: 'opponent_loses_lore',
                amount: 5
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(getOpponent().lore).toBe(0);
        });
    });

    describe('opponent_choice_banish', () => {
        it('should banish opponent character with lowest willpower (bot logic)', async () => {
            const weakChar = createCard('c1', 'Weakling', 'character', 1, 1);
            const strongChar = createCard('c2', 'Strongman', 'character', 5, 5);

            p2.play = [weakChar, strongChar];

            const effect = {
                type: 'opponent_choice_banish'
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            // Expect weakChar to be banished (moved to discard)
            expect(p2.play).toHaveLength(1);
            expect(p2.play[0].instanceId).toBe('c2');
            expect(p2.discard).toHaveLength(1);
            expect(p2.discard[0].instanceId).toBe('c1');

            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Opponent banished Weakling'),
                expect.anything()
            );
        });
    });

    describe('opponent_discard_from_hand', () => {
        it('should force opponent to discard cards', async () => {
            const c1 = createCard('h1', 'Hand 1', 'action');
            const c2 = createCard('h2', 'Hand 2', 'action');
            c1.zone = ZoneType.Hand;
            c2.zone = ZoneType.Hand;
            p2.hand = [c1, c2];

            const effect = {
                type: 'opponent_discard_from_hand',
                amount: 1
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p2.hand).toHaveLength(1);
            expect(p2.discard).toHaveLength(1);
        });
    });

    describe('opponent_play_reveal_and_discard', () => {
        it('should discard highest cost card (bot logic)', async () => {
            // Setup hand: 1 cost, 5 cost
            const cheap = createCard('c1', 'Cheap', 'action', 1);
            const expensive = createCard('c2', 'Expensive', 'action', 5);
            cheap.zone = ZoneType.Hand;
            expensive.zone = ZoneType.Hand;

            p2.hand = [cheap, expensive];

            const effect = {
                type: 'opponent_play_reveal_and_discard'
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            // Expect Expensive to be discarded
            expect(p2.hand).toHaveLength(1);
            expect(p2.hand[0].instanceId).toBe('c1');
            expect(p2.discard).toContainEqual(expect.objectContaining({ instanceId: 'c2' }));
        });
    });

    describe('opponent_choice_action', () => {
        it('should force opponent to banish one of their own characters', async () => {
            // Setup: Opponent has 2 chars. p1 plays effect "Opponent chooses a character and banishes it"
            // Typically formatted as: target: { mine: false, cardType: 'character' }, action: 'banish'

            const c1 = createCard('c1', 'Weak', 'character', 2, 2);
            const c2 = createCard('c2', 'Strong', 'character', 5, 5);
            p2.play = [c1, c2];

            const effect = {
                type: 'opponent_choice_action',
                action: 'banish',
                target: {
                    mine: false,
                    cardType: 'character'
                }
            } as any;

            await executor.execute(effect, {
                player: p1, // Source player
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            // Bot logic for banish: choose cheapest/weakest (c1)
            expect(p2.play).toHaveLength(1);
            expect(p2.play[0].instanceId).toBe('c2');
            expect(p2.discard).toHaveLength(1);
            expect(p2.discard[0].instanceId).toBe('c1');
        });
    });
});
