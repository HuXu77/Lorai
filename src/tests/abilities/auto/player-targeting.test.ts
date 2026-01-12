import { EffectExecutor, GameContext } from '../../../engine/abilities/executor';
import { EffectAST } from '../../../engine/abilities/effect-ast';

// Mock classes/interfaces
class MockPlayer {
    id: string;
    name: string;
    hand: any[] = [];
    deck: any[] = [];
    discard: any[] = [];
    inkwell: any[] = [];
    play: any[] = [];
    lore: number = 0;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        // Start with some cards in deck
        for (let i = 0; i < 10; i++) {
            this.deck.push(new MockCard(`deck_${id}_${i}`, 'Card', id));
        }
    }
}

// MockCard - matches actual Card interface from models.ts
class MockCard {
    instanceId: string;
    name: string;
    ownerId: string;
    type: string = 'character';
    zone: string = 'hand';
    cost: number = 1;
    inkCost?: number;
    damage: number = 0;
    strength?: number;
    willpower?: number;
    lore?: number;
    keywords: string[] = [];
    meta?: any;
    ready: boolean = true;
    exerted: boolean = false;
    playedThisTurn: boolean = false;

    constructor(id: string, name: string, ownerId: string) {
        this.instanceId = id;
        this.name = name;
        this.ownerId = ownerId;
    }
}

class MockTurnManager {
    game: MockGame;
    logger: any;
    choiceHandler: any;

    constructor(game: MockGame) {
        this.game = game;
        this.logger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            action: vi.fn(),
            effect: vi.fn()
        };
        this.choiceHandler = {
            requestChoice: vi.fn(async (request: any) => {
                // Auto-approve generic confirmed, or return generic response
                return {
                    requestId: request.id,
                    playerId: request.playerId,
                    selectedIds: ['yes'], // Default to yes
                    timestamp: Date.now()
                };
            })
        };
    }

    applyDamage = vi.fn();
    banishCard = vi.fn();
    trackZoneChange = vi.fn();
    checkWinCondition = vi.fn();
    addActiveEffect = vi.fn();
}

class MockGame {
    state: any;
    players: Map<string, MockPlayer>;
    turnManager: any; // Circular ref handling

    constructor() {
        this.players = new Map();
        this.state = {
            activePlayerId: 'p1',
            turn: 1,
            phase: 'main',
            activeEffects: [],
            players: {} // Initialize players object in state
        };
    }

    // Helper to add player
    addPlayer(id: string, name: string) {
        const p = new MockPlayer(id, name);
        this.players.set(id, p);
        this.state.players[id] = p; // Add to state.players
        return p;
    }

    getPlayer(id: string) {
        return this.players.get(id);
    }

    getOpponents(playerId: string): MockPlayer[] {
        return Array.from(this.players.values()).filter(p => p.id !== playerId);
    }
}

describe('Player Targeting Verification', () => {
    let game: MockGame;
    let turnManager: MockTurnManager;
    let executor: EffectExecutor;
    let p1: MockPlayer;
    let p2: MockPlayer;
    let p3: MockPlayer;

    beforeEach(() => {
        game = new MockGame();
        p1 = game.addPlayer('p1', 'Player 1');
        p2 = game.addPlayer('p2', 'Player 2');

        turnManager = new MockTurnManager(game);
        game.turnManager = turnManager; // Link back

        executor = new EffectExecutor(turnManager as any);
    });

    it('should allow "all_opponents" to draw cards', async () => {
        // Setup context
        const context: any = {
            player: p1 as any, // Active player is P1
            source: new MockCard('c1', 'Earth Giant', 'p1') as any,
            card: new MockCard('c1', 'Earth Giant', 'p1') as any
        };

        // Define effect: Each opponent draws 1 card
        const effect: any = {
            type: 'draw',
            amount: 1,
            target: { type: 'all_opponents' }
        };

        // Capture initial deck sizes
        const p1DeckBefore = p1.deck.length;
        const p2DeckBefore = p2.deck.length;
        const p1HandBefore = p1.hand.length;
        const p2HandBefore = p2.hand.length;

        // Execute
        await executor.execute(effect, context);

        // Assertions
        // P1 (active player) should NOT draw
        expect(p1.deck.length).toBe(p1DeckBefore);
        expect(p1.hand.length).toBe(p1HandBefore);

        // P2 (opponent) SHOULD draw
        expect(p2.deck.length).toBe(p2DeckBefore - 1);
        expect(p2.hand.length).toBe(p2HandBefore + 1);

        // Log verification
        expect(turnManager.logger.effect).toHaveBeenCalledWith(
            'Player 2',
            expect.stringContaining('Drew 1 card'),
            expect.any(String),
            expect.any(Object)
        );
    });

    it('should allow "all_players" to draw cards', async () => {
        // Setup context
        const context: any = {
            player: p1 as any, // Active player is P1
            source: new MockCard('c2', 'Generous Gift', 'p1') as any,
            card: new MockCard('c2', 'Generous Gift', 'p1') as any
        };

        // Define effect: Each player draws 1 card
        const effect: any = {
            type: 'draw',
            amount: 1,
            target: { type: 'all_players' }
        };

        const p1DeckBefore = p1.deck.length;
        const p2DeckBefore = p2.deck.length;

        // Execute
        await executor.execute(effect, context);

        // Both players should draw
        expect(p1.deck.length).toBe(p1DeckBefore - 1);
        expect(p2.deck.length).toBe(p2DeckBefore - 1);
    });

    it('should allow "opponent" (single target implied or chosen) to draw if handled as all opponents or requires selection', async () => {
        // Note: 'opponent' usually implies choice if there are multiple, but if there's only one opponent (2 player game), it auto-selects.
        // Our resolvePlayerTargets logic for 'opponent' returns current opponent(s).

        const context: any = {
            player: p1 as any,
            source: new MockCard('c3', 'Single Opponent Effect', 'p1') as any,
            card: new MockCard('c3', 'Single Opponent Effect', 'p1') as any
        };

        const effect: any = {
            type: 'draw',
            amount: 1,
            target: { type: 'opponent' }
        };

        const p2DeckBefore = p2.deck.length;

        await executor.execute(effect, context);

        expect(p2.deck.length).toBe(p2DeckBefore - 1);
    });

    it('should handle "all_opponents" discard', async () => {
        // Setup P2 hand
        p2.hand.push(new MockCard('c_discard', 'To Discard', 'p2'));
        expect(p2.hand.length).toBe(1);

        const context: any = {
            player: p1 as any,
            source: new MockCard('c4', 'Hypnotize', 'p1') as any,
            card: new MockCard('c4', 'Hypnotize', 'p1') as any
        };

        const effect: any = {
            type: 'discard',
            amount: 1,
            target: { type: 'all_opponents' }
        };

        await executor.execute(effect, context);

        expect(p2.hand.length).toBe(0);
        expect(p2.discard.length).toBe(1);

        // Log verification
        expect(turnManager.logger.effect).toHaveBeenCalledWith(
            'Player 2',
            expect.stringContaining('Discarded 1 card'),
            expect.any(String),
            expect.any(Object)
        );
    });
});
