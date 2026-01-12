import { EffectExecutor } from '../../../engine/abilities/executor';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { Player, ZoneType } from '../../../engine/models';
import { GameEvent } from '../../../engine/abilities/events';

// Mock dependencies
vi.mock('../../../engine/actions');

describe('Executor: Recursion & Zone Transitions', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let p1: Player;

    // Test Helpers
    const createCard = (id: string, name: string, type: string = 'character', cost: number = 1) => ({
        instanceId: id,
        name,
        type,
        cost,
        zone: ZoneType.Discard,
        ready: true,
        damage: 0,
        ownerId: 'p1',
        keywords: []
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
            error: vi.fn()
        };
        // Mock game.addCardToZone
        game.addCardToZone = vi.fn((player, card, zone) => {
            card.zone = zone;
            if (zone === ZoneType.Hand) player.hand.push(card);
            if (zone === ZoneType.Play) player.play.push(card);
            return card;
        });

        // For play_from_discard test, we want to use the simple fallback logic
        // Set playCard to undefined so it doesn't try to call the complex playCard method
        (turnManager as any).playCard = undefined;

        executor = new EffectExecutor(turnManager);
        executor.setTurnManager(turnManager);
    });

    describe('return_from_discard', () => {
        it('should return chosen card from discard to hand', async () => {
            const card = createCard('c1', 'Dead Guy');
            p1.discard = [card];

            const effect = {
                type: 'return_from_discard',
                target: { type: 'chosen_card_in_discard', count: 1 }
            } as any;

            // Mock resolveTargets on the executor (which is what the family handler calls)
            (executor as any).resolveTargets = vi.fn().mockReturnValue([card]);

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.hand).toHaveLength(1);
            expect(p1.hand[0].name).toBe('Dead Guy');
        });
    });

    describe('put_from_discard', () => {
        it('should put chosen card from discard into play exerted', async () => {
            const card = createCard('c1', 'Reanimated', 'character', 5);
            p1.discard = [card];

            const effect = {
                type: 'put_from_discard',
                target: { type: 'chosen_card_in_discard' },
                exerted: true
            } as any;

            (executor as any).resolveTargets = vi.fn().mockReturnValue([card]);

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.play).toHaveLength(1);
            expect(p1.play[0].ready).toBe(false);
            expect(p1.play[0].name).toBe('Reanimated');
        });
    });

    describe('play_from_discard', () => {
        it('should allowing playing a card from discard for free', async () => {
            const card = createCard('c1', 'Free Play', 'character', 3);
            p1.discard = [card];

            const effect = {
                type: 'play_from_discard',
                target: { type: 'self' },  // Self-targeting will use context.card from discard
                free: true
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,  // Pass the card in discard as context.card
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.play).toHaveLength(1); // Character cards should remain in play
            // If action, it goes to discard. If character, play.
            // Let's assume character for this test to verify 'play' zone
        });
    });
});
