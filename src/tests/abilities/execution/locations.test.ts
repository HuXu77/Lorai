import { EffectExecutor } from '../../../engine/abilities/executor';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { Player, ZoneType } from '../../../engine/models';
import { GameEvent } from '../../../engine/abilities/events';

// Mock dependencies
vi.mock('../../../engine/actions');

describe('Executor: Location & Movement Mechanics', () => {
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
        zone: ZoneType.Play,
        ready: true,
        damage: 0,
        ownerId: 'p1',
        keywords: [],
        locationId: undefined, // New field
        moveCost: type === 'location' ? 1 : undefined
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
            error: vi.fn(),
            debug: vi.fn(),
            action: vi.fn(),
            effect: vi.fn()
        };
        // Mock game.addCardToZone
        game.addCardToZone = vi.fn((player, card, zone) => {
            card.zone = zone;
            if (zone === ZoneType.Hand) player.hand.push(card);
            if (zone === ZoneType.Play) player.play.push(card);
            return card;
        });

        executor = new EffectExecutor(turnManager);
        executor.setTurnManager(turnManager);
    });

    describe('move_to_location', () => {
        it('should move a character to a target location', async () => {
            const char = createCard('c1', 'Simba', 'character');
            const loc = createCard('l1', 'Pride Rock', 'location', 2);
            p1.play = [char, loc];

            // Let's test "Move chosen character to THIS location" (e.g. location ability)
            const effectSelf = {
                type: 'move_to_location',
                target: { type: 'chosen_character' },
                destination: 'self'
            } as any;

            const handler = (executor as any).familyHandlers.get('location');
            expect(handler).toBeDefined();
            (handler as any).resolveTargets = vi.fn().mockReturnValue([char]);

            await executor.execute(effectSelf, {
                player: p1,
                card: loc, // The location used the ability
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(char.locationId).toBe('l1');
        });

        it('should move chosen character to specified location via ID', async () => {
            const char = createCard('c1', 'Simba', 'character');
            const loc = createCard('l1', 'Pride Rock', 'location');
            p1.play = [char, loc];

            const effect = {
                type: 'move_to_location',
                target: { type: 'chosen_character' },
                destinationId: 'l1'
            } as any;

            const handler = (executor as any).familyHandlers.get('location');
            (handler as any).resolveTargets = vi.fn().mockReturnValue([char]);

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(char.locationId).toBe('l1');
        });
    });
});

