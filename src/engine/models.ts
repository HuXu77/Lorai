/**
 * The six ink colors in Lorcana.
 * Each card belongs to one color, which determines what inkwell cards can pay for it.
 */
export enum InkColor {
    Amber = 'Amber',
    Amethyst = 'Amethyst',
    Emerald = 'Emerald',
    Ruby = 'Ruby',
    Sapphire = 'Sapphire',
    Steel = 'Steel'
}

/**
 * Card types in Lorcana.
 * Determines how the card can be played and what zones it can exist in.
 */
export enum CardType {
    Character = 'Character',  // Can quest, challenge, and be in play
    Action = 'Action',         // One-time effects, goes to discard
    Item = 'Item',            // Permanent effects, stays in play
    Location = 'Location'     // Provides ongoing benefits
}

/**
 * Game zones where cards can exist.
 * Cards move between zones as the game progresses.
 */
export enum ZoneType {
    Deck = 'Deck',           // Draw pile (facedown)
    Hand = 'Hand',           // Player's hand (hidden from opponent)
    Play = 'Play',           // In play area (characters, items, locations)
    Discard = 'Discard',     // Discard pile (faceup, visible)
    Inkwell = 'Inkwell',     // Ink resources (facedown)
    Bag = 'Bag'             // Temporary zone for pending triggers
}

export interface AbilityRaw {
    type: string;
    fullText: string;
    effect?: string;
    keyword?: string;
    keywordValue?: string;
    [key: string]: any;
}

// Activation cost structure for activated abilities
export interface ActivationCost {
    exert?: boolean;      // Requires exerting (⟳)
    ink?: number;         // Ink cost (⬡)
    banish?: boolean;     // Requires banishing
    discard?: number;     // Requires discarding N cards
}

/**
 * Structured representation of a card ability after parsing.
 * The EffectParser converts natural language card text into this format,
 * which the TurnManager can then execute.
 * 
 * @example
 * Card Text: "When you play this character, draw a card"
 * Parsed Effect:
 * {
 *   trigger: 'on_play',
 *   action: 'draw',
 *   target: 'self',
 *   amount: 1,
 *   rawText: '...'
 * }
 */
export interface CardEffect {
    /** When this effect triggers (e.g., 'on_play', 'on_quest', 'static', 'activated') */
    trigger: string;

    /** What the effect does (e.g., 'draw', 'heal', 'deal_damage', 'modify_strength') */
    action: string;

    /** Who/what is affected (e.g., 'self', 'opponent', 'chosen_character', 'all_characters') */
    target: string;

    /** Numeric value for the effect (damage, draws, stat changes, etc.) */
    amount?: number | 'all';

    /** Original card text (for reference and debugging) */
    rawText: string;

    /** Activation costs for activated abilities (⟳, ink, etc.) */
    cost?: ActivationCost;

    /** How long the effect lasts (e.g., 'until_end_of_turn', 'while_active', 'permanent') */
    duration?: 'while_active' | 'until_next_turn' | 'until_next_turn_start' | 'until_source_next_start' | 'until_end_of_turn';

    /** How often the effect can be used (e.g., 'next_time' for one-shot, 'always' for continuous) */
    usage?: 'next_time' | 'always';

    /** Additional parameters (filters, conditions, nested effects, etc.) */
    params?: any;

    /** Name of the activated ability (e.g., "FREEZE") */
    abilityName?: string;

    /** The effect description for delegation (e.g., for activated abilities, the text after the cost) */
    effectText?: string;
}

export enum ActionType {
    PlayCard = 'PlayCard',
    Quest = 'Quest',
    Challenge = 'Challenge',
    UseAbility = 'UseAbility', // Activated abilities
    PassTurn = 'PassTurn',
    InkCard = 'InkCard',
    SingSong = 'SingSong',
    Concede = 'Concede',
    Move = 'Move'
}

// [Legacy Choice Interfaces Removed - merged into Unified Choice System below]

export interface GameAction {
    type: ActionType;
    playerId: string;
    cardId?: string;
    targetId?: string;
    singerId?: string;
    singerIds?: string[]; // For Sing Together
    abilityIndex?: number;
    shiftTargetId?: string;
    payload?: any;
    modalChoice?: number; // For modal effects ("Choose one:")
    destinationId?: string; // For Move actions (Location ID)
}

export interface Card {
    id: number;
    number: number;        // Card number in set (for image mapping)
    setCode: string;       // Set code (e.g., "1", "2", "Q1") (for image mapping)
    cardId?: string;
    targetId?: string;
    singerId?: string;
    singerIds?: string[]; // For Sing Together
    abilityIndex?: number;
    shiftTargetId?: string;
    payload?: any;
    fullName: string;
    name: string;
    version?: string;
    cost: number;
    inkwell: boolean;
    color: InkColor;
    type: CardType;

    // Character/Location specific
    strength?: number;
    willpower?: number;
    lore?: number;
    moveCost?: number; // For locations
    challenger?: number; // Challenger bonus (only applies when attacking)

    subtypes: string[];
    abilities: AbilityRaw[];
    fullText?: string;
    fullTextSections?: string[];

    // Runtime properties (parsed)
    parsedEffects?: CardEffect[];
    baseKeywords?: string[];
}

export interface CardInstance extends Card {
    instanceId: string; // Unique ID for this specific card in the game
    ownerId: string;
    zone: ZoneType;
    ready: boolean;
    damage: number;
    turnPlayed: number; // Turn number when this card entered play
    meta: Record<string, any>; // For counters, modifiers, etc.
    cardsUnder?: CardInstance[]; // Cards underneath this card (e.g., Boost)
    damageShields?: DamageShield[]; // Active damage prevention effects

    // Base stats (for recalculation)
    baseStrength?: number;
    baseWillpower?: number;
    baseLore?: number;
    baseCost?: number;

    // Keyword tracking
    keywords?: string[];  // Current active keywords (e.g., ['Evasive', 'Ward', 'Rush'])
    baseKeywords?: string[];  // Permanent keywords from card text

    // Additional tracking properties
    classifications?: string[];  // Card classifications (e.g., ['Hero', 'Villain', 'Ally'])
    damageDealtThisTurn?: number;  // Damage dealt by this card this turn (for tracking effects)
    locationId?: string; // If this is a character, instanceId of location it is at
}

export interface DamageShield {
    amount: number | 'all';
    duration: 'until_source_next_start' | 'until_end_of_turn';
    usage: 'next_time' | 'always';
    sourceId: string; // instanceId of the source card (e.g., Rapunzel)
    sourcePlayerId: string; // ID of the player controlling the source
}

export interface Player {
    id: string;
    name: string;
    lore: number;
    deck: CardInstance[];
    hand: CardInstance[];
    play: CardInstance[];
    discard: CardInstance[];
    inkwell: CardInstance[];
    costReductions?: CostReduction[]; // Active cost reductions
    restrictions?: ContinuousEffect[]; // Active restrictions (e.g. can't play actions)
    inkedThisTurn: boolean;
}

export interface CostReduction {
    amount: number;
    filter: string; // e.g., 'character', 'action', 'all'
    duration: 'one_use' | 'until_end_of_turn';
    sourceId: string;
}

export interface CardModification {
    strength?: number;
    willpower?: number;
    lore?: number;
    cost?: number;
    challenger?: number; // Challenger bonus (only applies when attacking)
    keywords?: string[]; // Keywords to add (e.g. "Support", "Evasive")
}

export interface ContinuousEffect {
    id: string;  // Unique identifier for this effect
    type: 'restriction' | 'modification' | 'keyword_grant';
    restrictionType?: 'cant_play_songs' | 'cant_challenge' | 'cant_quest' | 'cant_play_actions' | 'cant_be_challenged' | 'cant_be_challenged_by';
    target: 'opponent' | 'self' | 'all' | 'custom';
    sourceCardId: string; // instanceId
    sourcePlayerId?: string; // For duration tracking
    duration: 'while_active' | 'until_next_turn' | 'until_next_turn_start' | 'until_source_next_start' | 'until_end_of_turn' | 'while_condition' | 'next_turn_start';

    // For modifications
    targetPlayerIds?: string[]; // Specific players affected
    targetCardIds?: string[];  // Specific cards affected
    targetFilter?: {  // Filter for affected cards
        subtype?: string;
        ownerId?: string;
    };

    // What the effect does
    modification?: CardModification;
    modificationType?: string; // e.g., 'grant_keyword', 'conditional_lore_bonus'
    params?: any; // Extra parameters for the modification

    // Conditional application
    condition?: string;  // e.g., 'self_exerted', 'during_owner_turn'
    conditionParams?: any;
}

// Zone change tracking for conditional abilities
export interface ZoneChangeEvent {
    cardId: string;
    fromZone: ZoneType;
    toZone: ZoneType;
    playerId: string;
    turnNumber: number;
}

export interface TurnHistory {
    zoneChanges: ZoneChangeEvent[];
    cardsPlacedUnder?: Array<{
        characterId: string;
        cardId: string;
        playerId: string;
        turnNumber: number;
    }>;
}

export interface GameState {
    turnPlayerId: string;
    phase: string; // Ready, Set, Draw, Main, End
    players: Record<string, Player>;
    bag: any[]; // Pending triggers
    turnCount: number;
    activeEffects: ContinuousEffect[]; // Global active effects
    winnerId?: string;
    turnHistory?: TurnHistory; // Track zone changes and events this turn
}

// =============================================================================
// CHOICE SYSTEM - For Interactive Targeting and Player Decisions
// =============================================================================

/**
 * Types of choices players can make during ability resolution
 */
export enum ChoiceType {
    // Targeting Choices
    TARGET_CHARACTER = 'target_character',
    TARGET_OPPOSING_CHARACTER = 'target_opposing_character',
    TARGET_ITEM = 'target_item',
    TARGET_LOCATION = 'target_location',
    TARGET_CARD = 'target_card',
    TARGET_CARD_IN_HAND = 'target_card_in_hand',
    TARGET_CARD_IN_DISCARD = 'target_card_in_discard',

    // Legacy / Generic / Other
    DISCARD_FROM_HAND = 'discard_from_hand',
    SELECT_TARGET = 'select_target', // Generic target

    // Modal & Effects
    MODAL_CHOICE = 'modal_choice',
    MODAL_OPTION = 'modal_option', // Alias/Legacy for compatibility

    // Complex Mechanics
    DISTRIBUTE_DAMAGE = 'distribute_damage',
    YES_NO = 'yes_no',
    SCRY = 'scry',
    REARRANGE_HAND = 'rearrange_hand',
    CHOOSE_CARD_FROM_ZONE = 'choose_card_from_zone',
    CHOOSE_EFFECT = 'choose_effect',
    REVEAL_AND_DECIDE = 'reveal_and_decide',
    ORDER_CARDS = 'order_cards'
}

/**
 * A single option in a choice request
 */
export interface ChoiceOption {
    /** Unique identifier (usually card instanceId or option index) */
    id: string;

    /** Human-readable display text */
    display: string;

    /** The card instance (for targeting choices) */
    card?: CardInstance;

    /** Whether this option is currently legal/valid */
    valid: boolean;

    /** Why this option might be invalid (for UI/debugging) */
    invalidReason?: string;
}

/**
 * Request for a player to make a choice during ability execution
 */
export interface ChoiceRequest {
    /** Unique request ID */
    id: string;

    /** Type of choice being requested */
    type: ChoiceType;

    /** Player who must make this choice */
    playerId: string;

    /** Human-readable prompt/description */
    prompt: string;

    /** Available options */
    options: ChoiceOption[];

    /** Source information (what triggered this choice) */
    source: {
        /** Card that triggered the choice requirement (may be undefined for system choices) */
        card?: CardInstance;

        /** Ability name (if available) */
        abilityName?: string;

        /** Full ability text (for display in UI) */
        abilityText?: string;

        /** Player who owns the triggering card */
        player: Player;
    };

    /** Additional filter criteria (for validation) */
    filter?: any;

    /** Whether this choice can be declined (optional targeting) */
    optional?: boolean;

    /** Minimum number of selections (default 1) */
    min?: number;

    /** Maximum number of selections (default 1) */
    max?: number;

    /** Timestamp when request was created */
    timestamp: number;

    /** Additional context data (optional) */
    context?: any;
}

/**
 * Player's response to a choice request
 */
export interface ChoiceResponse {
    /** ID of the request being responded to */
    requestId: string;

    /** ID of the player making the choice */
    playerId: string;

    /** Selected option ID(s) */
    selectedIds: string[];

    /** Whether player declined an optional choice */
    declined?: boolean;

    /** Timestamp of response */
    timestamp: number;

    /** Additional response data (e.g. Scry top/bottom lists) */
    payload?: any;
}

// =============================================================================
// UNIFIED PLAYER CONTROLLER INTERFACE (Phase 1 Refactor)
// =============================================================================

/**
 * Unified interface for all player controllers (bot or human).
 * Engine never knows or cares if player is bot/human - just sends ChoiceRequests.
 */
export interface PlayerController {
    id: string;
    name: string;

    /**
     * Respond to a choice request from the game engine.
     * SYNCHRONOUS - must return immediately with decision.
     * 
     * @param request - The choice to make
     * @returns Response with selected options or declined flag
     */
    respondToChoiceRequest(request: ChoiceRequest): ChoiceResponse;

    /**
     * Called when game starts with player's assigned ID.
     */
    onGameStart(playerId: string, gameState: GameState): void;

    /**
     * Called at start of each turn.
     */
    onTurnStart(gameState: GameState): void;

    /**
     * Optional: For bots that make autonomous action decisions.
     * Human players don't need this - they use respondToChoiceRequest for actions too.
     */
    decideAction?(gameState: GameState): Promise<GameAction>;
}
