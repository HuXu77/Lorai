
import { EffectExecutor } from '../../engine/abilities/executor';
import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { Player, ZoneType } from '../../engine/models';
import { GameEvent } from '../../engine/abilities/events';

// Mock dependencies
vi.mock('../../engine/actions');

describe('Daisy Duck Reveal Logic', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let p1: Player; // Daisy owner
    let p2: Player; // Opponent

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
        ownerId: 'p2' // Owned by opponent
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
        turnManager.abilitySystem = {
            executor: {
                resolvePlayerTargets: vi.fn().mockReturnValue([p2])
            }
        };
        turnManager.logger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn()
        };
        turnManager.trackZoneChange = vi.fn();

        executor = new EffectExecutor(turnManager);
        executor.setTurnManager(turnManager);
    });

    it('should reveal top card and put into hand if matches condition (Character)', async () => {
        const topCard = createCard('c1', 'Top Character', 'Character');
        p2.deck = [topCard];

        // Mock choice: Put into Hand
        turnManager.requestChoice = vi.fn().mockResolvedValue({
            selectedIds: ['hand']
        });

        // Daisy's effect: Opponent reveals top, if character, may put in hand
        const effect = {
            type: 'opponent_reveal_top',
            target: { type: 'chosen_opponent' }, // Simplified
            conditional_put: {
                if_type: 'character',
                destination: 'hand'
            }
        };

        const context = {
            player: p1,
            card: { instanceId: 'daisy', name: 'Daisy Duck' },
            gameState: game,
            eventContext: { event: GameEvent.ABILITY_ACTIVATED }
        } as any;

        // Execute
        await executor.execute(effect, context);

        // Verify
        // 1. requestChoice called
        expect(turnManager.requestChoice).toHaveBeenCalled();
        // 2. Card moved to hand
        expect(p2.hand).toHaveLength(1);
        expect(p2.hand[0].instanceId).toBe('c1');
        expect(p2.deck).toHaveLength(0);
    });

    it('should reveal top card and put on bottom if does NOT match condition (Item)', async () => {
        const topCard = createCard('i1', 'Top Item', 'Item');
        p2.deck = [topCard];

        // Mock choice: Logic forces bottom if not match, but we still verify choice request call structure if any
        // The handler logic: if !matchesCondition, valid options only Bottom.
        turnManager.requestChoice = vi.fn().mockResolvedValue({
            selectedIds: ['bottom']
        });

        const effect = {
            type: 'opponent_reveal_top',
            target: { type: 'chosen_opponent' },
            conditional_put: {
                if_type: 'character',
                destination: 'hand'
            }
        };

        const context = {
            player: p1,
            card: { instanceId: 'daisy', name: 'Daisy Duck' },
            gameState: game,
            eventContext: { event: GameEvent.ABILITY_ACTIVATED }
        } as any;

        await executor.execute(effect, context);

        expect(turnManager.requestChoice).toHaveBeenCalled();
        // Verify card is back in deck (bottom)
        expect(p2.hand).toHaveLength(0);
        expect(p2.deck).toHaveLength(1);
        expect(p2.deck[0].instanceId).toBe('i1');
    });
});
