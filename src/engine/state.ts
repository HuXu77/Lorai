import {
    GameState,
    Player,
    CardInstance,
    ZoneType,
    Card,
    CostReduction,
    ContinuousEffect
} from './models';
import { parseToAbilityDefinition } from './ability-parser';
// import { v4 as uuidv4 } from 'uuid';

// Simple ID generator if we don't want to add uuid dependency yet
const generateId = () => Math.random().toString(36).substring(2, 15);

export class PlayerState implements Player {
    id: string;
    name: string;
    lore: number = 0;
    loreGoal: number = 20;
    deck: CardInstance[] = [];
    hand: CardInstance[] = [];
    play: CardInstance[] = [];
    discard: CardInstance[] = [];
    inkwell: CardInstance[] = [];
    inkedThisTurn: boolean = false;
    costReductions: CostReduction[] = [];
    restrictions: ContinuousEffect[] = [];


    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    /**
     * Create a card instance and add it to a specific zone
     * 
     * Creates a new CardInstance from a Card definition, generates a unique instance ID,
     * parses abilities if not already parsed, and adds it to the specified zone.
     * 
     * **Note**: This method does NOT register the card with the AbilitySystemManager.
     * Registration happens in TurnManager.startGame() for initial cards and
     * TurnManager.playCard() for newly played cards.
     * \n     * @param card - The card definition to instantiate
     * @param zone - The zone to add the card to
     * @returns The created CardInstance
     */
    addCardToZone(card: Card, zone: ZoneType): CardInstance {
        const instance: CardInstance = {
            ...card,
            instanceId: generateId(),
            ownerId: this.id,
            zone: zone,
            ready: true,
            damage: 0,
            turnPlayed: 0,
            meta: {},
            baseStrength: card.strength,
            baseWillpower: card.willpower,
            baseLore: card.lore,
            baseCost: card.cost,
            baseKeywords: card.baseKeywords  // Explicitly copy baseKeywords!
        };

        // Parse abilities if not already parsed
        // Check for abilities array OR fullTextSections OR keywordAbilities
        // Cards like Flynn Rider have keywordAbilities and fullTextSections but no abilities array
        const hasAbilitiesArray = instance.abilities && instance.abilities.length > 0;
        const hasFullTextSections = (instance as any).fullTextSections && (instance as any).fullTextSections.length > 0;
        const hasKeywordAbilities = (instance as any).keywordAbilities && (instance as any).keywordAbilities.length > 0;

        if (!instance.parsedEffects && (hasAbilitiesArray || hasFullTextSections || hasKeywordAbilities)) {
            instance.parsedEffects = parseToAbilityDefinition(instance) as any[];
            console.log(`[CARD INSTANCE] ${instance.name}: parsed ${instance.parsedEffects.length} effects (abilities: ${instance.abilities?.length || 0}, fullTextSections: ${(instance as any).fullTextSections?.length || 0}, keywordAbilities: ${(instance as any).keywordAbilities?.length || 0})`);
        }

        // NOTE: Cannot register here - abilitySystem is on TurnManager, not accessible from PlayerState
        // Registration happens in TurnManager.startGame() for existing cards
        // and TurnManager.playCard() for newly played cards

        this.getZone(zone).push(instance);
        return instance;
    }

    getZone(zone: ZoneType): CardInstance[] {
        switch (zone) {
            case ZoneType.Deck: return this.deck;
            case ZoneType.Hand: return this.hand;
            case ZoneType.Play: return this.play;
            case ZoneType.Discard: return this.discard;
            case ZoneType.Inkwell: return this.inkwell;
            default: throw new Error(`Unknown zone: ${zone}`);
        }
    }
}

export class GameStateManager {
    state: GameState;

    constructor() {
        this.state = {
            players: {},
            turnPlayerId: '',
            phase: 'Beginning', // Start in Beginning phase to prevent premature actions
            turnCount: 1,
            activeEffects: [],
            bag: []
        };
    }

    /**
     * Add a player to the game
     * @param id - Player ID (used as name too if second param not provided)
     * @param name - Optional explicit name
     * @returns Player ID
     */
    addPlayer(id: string, name?: string): string {
        // If name is not provided, use id as the name too (test mode)
        // If name is provided, use separate id and name (production mode)
        const playerName = name || id;

        const player = new PlayerState(id, playerName);
        this.state.players[id] = player;
        return id;
    }

    getActivePlayer(): PlayerState {
        return this.state.players[this.state.turnPlayerId] as PlayerState;
    }

    /**
     * Get players in turn order (active player first, then others)
     * Used for ability queue resolution (The Bag - Rule 8.7)
     */
    getTurnOrder(): PlayerState[] {
        const allPlayers = Object.values(this.state.players) as PlayerState[];
        const activePlayerId = this.state.turnPlayerId;
        const activePlayer = allPlayers.find(p => p.id === activePlayerId);
        const otherPlayers = allPlayers.filter(p => p.id !== activePlayerId);

        return activePlayer ? [activePlayer, ...otherPlayers] : allPlayers;
    }

    getPlayer(id: string): PlayerState {
        return this.state.players[id] as PlayerState;
    }

    // Deep copy for AI observation or undo/redo
    serialize(): string {
        return JSON.stringify(this.state);
    }

    static deserialize(json: string): GameStateManager {
        const manager = new GameStateManager();
        manager.state = JSON.parse(json);

        // Re-hydrate PlayerState objects
        Object.keys(manager.state.players).forEach(id => {
            const rawPlayer = manager.state.players[id];
            const player = new PlayerState(rawPlayer.id, rawPlayer.name);
            Object.assign(player, rawPlayer);
            manager.state.players[id] = player;
        });

        return manager;
    }

    clone(): GameStateManager {
        return GameStateManager.deserialize(this.serialize());
    }
}
