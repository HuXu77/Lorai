import { CardLoader } from '../engine/card-loader';
import { GameStateManager } from '../engine/state';
import { TurnManager } from '../engine/actions';
import { Card } from '../engine/models';
import { parseToAbilityDefinition } from '../engine/ability-parser';

/**
 * Shared test fixture for efficient test execution
 * 
 * Uses singleton pattern to share CardLoader across all tests,
 * eliminating redundant allCards.json loading and parsing.
 */
export class SharedTestFixture {
    private static instance: SharedTestFixture | null = null;
    private cardLoader: CardLoader | null = null;
    private allCards: Card[] = [];
    private initialized = false;
    // CRITICAL: Ability parsing cache to prevent redundant parsing
    private abilityCache: Map<number, any[]> = new Map();

    private constructor() {
        // Private constructor for singleton
    }

    /**
     * Get or create the singleton instance
     */
    static async getInstance(): Promise<SharedTestFixture> {
        if (!SharedTestFixture.instance) {
            SharedTestFixture.instance = new SharedTestFixture();
            await SharedTestFixture.instance.initialize();
        }
        return SharedTestFixture.instance;
    }

    /**
     * Initialize the fixture (load cards once)
     */
    private async initialize(): Promise<void> {
        if (this.initialized) return;

        this.cardLoader = new CardLoader();
        await this.cardLoader.loadCards();
        this.allCards = this.cardLoader.getAllCards();
        this.initialized = true;

        console.log(`✅ SharedTestFixture initialized with ${this.allCards.length} cards`);
    }

    /**
     * Get a card by ID
     */
    getCard(id: number): Card | undefined {
        return this.cardLoader?.getCard(id);
    }

    /**
     * Get a card by name (fuzzy match)
     */
    getCardByName(name: string): Card | undefined {
        const exact = this.allCards.find(c => c.name === name || c.fullName === name);
        if (exact) return exact;
        return this.allCards.find(c =>
            c.name.toLowerCase().includes(name.toLowerCase()) ||
            c.fullName.toLowerCase().includes(name.toLowerCase())
        );
    }

    /**
     * Get all loaded cards
     */
    getAllCards(): Card[] {
        return this.allCards;
    }

    /**
     * Get the card loader instance
     */
    getCardLoader(): CardLoader {
        if (!this.cardLoader) {
            throw new Error('SharedTestFixture not initialized');
        }
        return this.cardLoader;
    }

    /**
     * Parse card abilities with caching to prevent redundant parsing
     * CRITICAL: This prevents memory bloat from parsing 2,455 cards multiple times
     */
    parseAbilities(card: Card): any[] {
        // Check cache first
        if (this.abilityCache.has(card.id)) {
            return this.abilityCache.get(card.id)!;
        }

        // Parse and cache
        const abilities = parseToAbilityDefinition(card);
        this.abilityCache.set(card.id, abilities);
        return abilities;
    }

    /**
     * Create a clean game state for testing
     */
    createCleanGameState(): { game: GameStateManager; turnManager: TurnManager; p1Id: string; p2Id: string } {
        const game = new GameStateManager();
        const turnManager = new TurnManager(game);
        const p1Id = game.addPlayer('Player 1');
        const p2Id = game.addPlayer('Player 2');

        return { game, turnManager, p1Id, p2Id };
    }

    /**
     * Reset the singleton (for testing the fixture itself)
     */
    static reset(): void {
        SharedTestFixture.instance = null;
    }
}
