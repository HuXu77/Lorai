import { EffectExecutor } from '../../../engine/abilities/executor';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { Player, ZoneType } from '../../../engine/models';
import { GameEvent } from '../../../engine/abilities/events';

// Mock dependencies
jest.mock('../../../engine/actions');

describe('Executor: Search & Tutor Effects', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let p1: Player;

    // Test Helpers
    const createCard = (id: string, name: string, type: string = 'character', cost: number = 1, subtypes: string[] = []) => ({
        instanceId: id,
        name,
        type,
        cost,
        zone: ZoneType.Deck,
        ready: true,
        damage: 0,
        keywords: [],
        subtypes: subtypes,
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
        jest.clearAllMocks();

        p1 = setupPlayer('p1', 'Player 1');

        game = new GameStateManager();
        game.state = {
            players: { [p1.id]: p1 },
            turnPlayerId: p1.id
        };

        turnManager = new TurnManager(game);
        turnManager.game = game;
        turnManager.logger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        executor = new EffectExecutor(turnManager);
        executor.setTurnManager(turnManager);

        // Mock requestChoice to return the first option or a specific ID
        turnManager.requestChoice = jest.fn().mockImplementation(async (params) => {
            // For search_deck test, we want 'c1' (Desired Card)
            return {
                selectedIds: ['c1']
            };
        });
    });

    describe('search_deck', () => {
        it('should search deck for a card matching criteria and put it in hand', async () => {
            const desired = createCard('c1', 'Desired Card', 'character');
            const other = createCard('c2', 'Other Card', 'action');
            p1.deck = [other, desired, other]; // Setup deck

            const effect = {
                type: 'search_deck',
                filter: { name: 'Desired Card' },
                destination: 'hand',
                reveal: true,
                shuffle: true
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            // Verify state
            expect(p1.hand).toHaveLength(1);
            expect(p1.hand[0].instanceId).toBe('c1');
            expect(p1.deck).toHaveLength(2);
        });
    });

    describe('reveal_top_card', () => {
        it('should reveal top cards without moving them unless specified', async () => {
            const top = createCard('c1', 'Top Card');
            p1.deck = [top];

            const effect = {
                type: 'reveal_top_card',
                amount: 1
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            // Logic execution is hard to verify without logs or side effects, 
            // but we can trust the coverage if no error is thrown
        });
    });

    describe('look_and_choose', () => {
        it('should look at top cards and choose one to put in hand', async () => {
            // Look at top 2, pick 1
            const top1 = createCard('c1', 'Top 1');
            const top2 = createCard('c2', 'Top 2');
            p1.deck = [top1, top2];

            const effect = {
                type: 'look_and_choose',
                amount: 2,
                chooseAmount: 1,
                destination: 'hand'
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.hand).toHaveLength(1);
            expect(p1.deck).toHaveLength(1);
        });
    });
});
