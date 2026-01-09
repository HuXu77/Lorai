import { GameStateManager, PlayerState } from './state';
import { CardInstance, ZoneType, CardType, ContinuousEffect, ActionType, GameAction, ActivationCost, ChoiceRequest, ChoiceType } from './models';
import { EventBus, AbilityBag, EffectExecutor, GameEvent, EventContext } from './abilities';
import { AbilitySystemManager } from './abilities/ability-system';
import type { ILogger } from './logger';
import { executeReadyPhase, executeSetPhase, executeDrawPhase, drawCards as drawCardsHelper } from './phases';
import { executeRecalculateEffects, evaluateCondition, executeResolveEffect } from './effects';
import { executeInkCard, executeQuest, executePlayCard, executeUseAbility, executeSingSong, getSingingValue as getSingingValueHelper, canCharacterSingSong as canCharacterSingSongHelper } from './game-actions';
import { getValidActions as getValidActionsHelper } from './ai/valid-actions';
import { executeChallenge, canChallenge as canChallengeHelper, checkBanishment as checkBanishmentHelper, banishCard as banishCardHelper, triggerBanishEffects as triggerBanishEffectsHelper } from './combat';

// Conditional import for Node.js environment only
let GameLogger: any, LogLevel: any, LogColor: any;
try {
    if (typeof window === 'undefined') {
        const logger = require('./logger');
        GameLogger = logger.GameLogger;
        LogLevel = logger.LogLevel;
        LogColor = logger.LogColor;
    } else {
        throw new Error('Browser environment');
    }
} catch (e) {
    // Browser/JSDOM/Test fallback - implements ILogger interface
    LogLevel = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, ACTION: 4, EFFECT: 5 };
    LogColor = {};
    GameLogger = class implements ILogger {
        log(level: any, message: string, data?: unknown) { console.log(message, data); }
        debug(message: string, data?: unknown) { console.debug(message, data); }
        info(message: string, data?: unknown) { console.info(message, data); }
        warn(message: string, data?: unknown) { console.warn(message, data); }
        error(message: string, data?: unknown) { console.error(message, data); }
        action(player: string, action: string, details?: string) { console.log('[ACTION]', `${player} ${action}${details ? ': ' + details : ''}`); }
        effect(source: string, effect: string, target?: string) { console.log('[EFFECT]', `${source} -> ${effect}${target ? ' on ' + target : ''}`); }
    };
}

import { GameContext } from './abilities/executor';

// Re-export ActionType for test compatibility
export { ActionType } from './models';

export enum Phase {
    Beginning = 'Beginning', // Ready, Set, Draw
    Main = 'Main',
    End = 'End'
}

/**
 * TurnManager - Core Game Flow Controller
 * 
 * Manages the game loop, turn sequence, and validates/executes all player actions.
 * Acts as the bridge between player input and game state mutations.
 * 
 * **Responsibilities**:
 * - Turn management (Ready → Set → Draw → Main phases)
 * - Action validation and execution (play, quest, challenge, etc.)
 * - Effect resolution and game rules enforcement
 * - Integration with AbilitySystemManager for triggered abilities
 * 
 * **Key Methods**:
 * - `startGame()` - Initialize game
 * - `startTurn()` - Begin player turn
 * - `resolveAction()` - Execute player actions
 * - `playCard()`, `quest()`, `challenge()` - Core game mechanics
 * - `useAbility()` - Activate card abilities
 * - `passTurn()` - End turn and advance to next player
 */
export class TurnManager {
    game: GameStateManager;
    logger: ILogger;

    // NEW: Integrated ability system (replaces old eventBus, abilityBag, executor)
    abilitySystem: AbilitySystemManager;

    // PHASE 2: Unified player controller registry
    // Maps playerId → PlayerController (bot or human)
    // Executor requests choices through this, doesn't need to know if bot/human
    private playerControllers: Map<string, import('./models').PlayerController> = new Map();

    // Choice handling (legacy - uses ChoiceRequest/ChoiceResponse now)
    private choiceHandlers: Map<string, (choice: ChoiceRequest) => Promise<import('./models').ChoiceResponse>> = new Map();

    constructor(game: GameStateManager, logger?: ILogger) {
        this.game = game;
        this.logger = logger || new GameLogger();
        this.abilitySystem = new AbilitySystemManager(this);
    }

    private logGameState(activePlayerId: string) {
        this.logger.info('=== GAME STATE DUMP ===');
        Object.values(this.game.state.players).forEach(player => {
            const isTurnPlayer = player.id === activePlayerId;
            this.logger.info(`Player: ${player.name} [${player.id}] ${isTurnPlayer ? '(TURN PLAYER)' : ''} `);
            this.logger.info(`  Lore: ${player.lore}/20`);
            this.logger.info(`  Inkwell: ${player.inkwell.length} cards`);
            const handStr = player.hand.map((c, index) => {
                const cardStr = `${c.name} (ID:${c.instanceId})`;
                // Highlight the last card (newest)
                if (index === player.hand.length - 1) {
                    return `${LogColor.FgCyan}${cardStr}${LogColor.Reset}`;
                }
                return cardStr;
            }).join(', ');
            this.logger.info(`  Hand (${player.hand.length}): ${handStr}`);
            this.logger.info(`  Play (${player.play.length}):`);
            player.play.forEach(c => {
                this.logger.info(`    - ${c.name} (ID:${c.instanceId}) [${c.ready ? 'READY' : 'EXERTED'}] Strength:${c.strength} Willpower:${c.willpower} Damage:${c.damage}`);
            });
            if (player.discard.length > 0) {
                const topDiscard = player.discard[player.discard.length - 1];
                this.logger.info(`  Discard Top: ${topDiscard.name}`);
            } else {
                this.logger.info(`  Discard: Empty`);
            }
        });
        this.logger.info('=======================');
    }

    setLogger(logger: ILogger) {
        this.logger = logger;
    }

    // =========================================================================
    // CALLBACK-BASED CHOICE SYSTEM (Simplified)
    // =========================================================================

    /**
     * Register a choice handler callback for a player.
     * Engine doesn't know if it's a bot or human - just calls this callback.
     *  
     * @param playerId - The player ID
     * @param handler - Callback function that handles choice requests
     */
    /**
     * Register a choice handler callback for a player.
     * Engine doesn't know if it's a bot or human - just calls this callback.
     *  
     * @param playerId - The player ID
     * @param handler - Callback function that handles choice requests
     */
    registerChoiceHandler(playerId: string, handler: (request: import('./models').ChoiceRequest) => import('./models').ChoiceResponse | Promise<import('./models').ChoiceResponse>) {
        this.playerControllers.set(playerId, handler as any);
        this.logger.debug(`[TurnManager] Registered choice handler for ${playerId}`);
    }

    /**
     * Request a choice from a player by calling their registered callback.
     * Engine doesn't care if it's bot or human - just invokes the callback.
     * 
     * @param request - The choice request
     * @returns Player's response
     * @throws Error if no handler registered for player
     */
    async requestChoice(request: import('./models').ChoiceRequest): Promise<import('./models').ChoiceResponse> {
        const handler = this.playerControllers.get(request.playerId) as any;

        if (!handler) {
            throw new Error(`[TurnManager] No choice handler registered for player ${request.playerId}`);
        }

        this.logger.debug(`[TurnManager] Routing choice request: ${request.prompt}`);
        return await handler(request);
    }

    // =========================================================================

    /**
     * Draw initial 7 cards for a player
     */
    drawStartingHand(player: PlayerState) {
        this.logger.info(`[Setup] ${player.name} drawing starting hand (7 cards)...`);
        for (let i = 0; i < 7; i++) {
            if (player.deck.length > 0) {
                const card = player.deck.pop();
                if (card) {
                    // Move card to hand (don't create a new instance!)
                    card.zone = ZoneType.Hand;
                    player.hand.push(card);
                }
            }
        }
    }

    /**
     * Perform mulligan (alter hand)
     * @param player The player performing the mulligan
     * @param cardInstanceIds IDs of cards to put on bottom of deck
     */
    mulligan(player: PlayerState, cardInstanceIds: string[]) {
        if (cardInstanceIds.length === 0) {
            this.logger.info(`[Setup] ${player.name} kept their hand.`);
            return;
        }

        this.logger.info(`[Setup] ${player.name} is mulliganing ${cardInstanceIds.length} cards.`);

        // 1. Put selected cards on bottom of deck
        const cardsToMulligan: CardInstance[] = [];

        // Filter hand to remove mulliganed cards and collect them
        player.hand = player.hand.filter(card => {
            if (cardInstanceIds.includes(card.instanceId)) {
                cardsToMulligan.push(card);
                return false; // Remove from hand
            }
            return true; // Keep in hand
        });

        // Put them on bottom of deck (order doesn't strictly matter as we shuffle after, 
        // but rules say put on bottom then draw then shuffle)
        cardsToMulligan.forEach(card => {
            card.zone = ZoneType.Deck;
            // Add to beginning of array (bottom of deck stack)
            player.deck.unshift(card);
        });

        // 2. Draw back up to 7
        const cardsToDraw = 7 - player.hand.length;
        for (let i = 0; i < cardsToDraw; i++) {
            if (player.deck.length > 0) {
                const card = player.deck.pop();
                if (card) {
                    // Move card to hand (don't create a new instance!)
                    card.zone = ZoneType.Hand;
                    player.hand.push(card);
                }
            }
        }

        // 3. Shuffle deck
        this.shuffleDeck(player);

        this.logger.info(`[Setup] ${player.name} completed mulligan. Hand size: ${player.hand.length}`);
    }

    private shuffleDeck(player: PlayerState) {
        player.deck.sort(() => Math.random() - 0.5);
        this.logger.debug(`[Setup] ${player.name} shuffled their deck.`);
    }

    /**
     * Emit a choice request and wait for response
     */
    async emitChoiceRequest(choice: ChoiceRequest): Promise<import('./models').ChoiceResponse> {
        const handler = this.choiceHandlers.get(choice.playerId);
        if (!handler) {
            // Fallback: random selection for testing
            this.logger.warn(`[ChoiceSystem] No handler for player ${choice.playerId}, using random selection`);
            return this.makeRandomChoice(choice);
        }

        this.logger.debug(`[ChoiceSystem] Requesting choice from player ${choice.playerId}: ${choice.prompt}`);
        return await handler(choice);
    }

    /**
     * Make a random choice (fallback when no handler registered)
     */
    private makeRandomChoice(choice: ChoiceRequest): import('./models').ChoiceResponse {
        const count = Math.min(choice.max || 1, choice.options.length);
        const selected = choice.options
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
            .map((opt: any) => opt.id);

        this.logger.debug(`[ChoiceSystem] Random choice made: ${selected.join(', ')}`);

        return {
            requestId: choice.id,
            playerId: choice.playerId,
            selectedIds: selected,
            timestamp: Date.now()
        };
    }

    /**
     * Player chooses which queued ability to resolve (The Bag - Rule 8.7.4)
     * For now, defaults to random choice. Can be enhanced with UI later.
     */
    private async chooseQueuedAbility(player: any, abilities: any[]): Promise<any> {
        // For testing/AI: choose randomly
        // In a real game: present UI to player
        const randomIndex = Math.floor(Math.random() * abilities.length);
        const chosen = abilities[randomIndex];

        this.logger.debug(`[AbilityQueue] ${player.name} choosing ability: ${chosen.card.name}`);
        return chosen;
    }

    /**
     * Initialize and start a new game
     * 
     * Registers all cards currently in play with the ability system and begins
     * the first turn for the starting player.
     * 
     * @param startingPlayerId - ID of the player who goes first
     */
    startGame(startingPlayerId: string) {
        this.game.state.turnPlayerId = startingPlayerId;
        this.game.state.turnCount = 1;
        this.logger.info(`Game Started. Starting Player: ${startingPlayerId}`);

        // Register all cards already in play with the ability system
        Object.values(this.game.state.players).forEach(player => {
            player.play.forEach(card => {
                if (this.abilitySystem) {
                    this.abilitySystem.registerCard(card);
                }
            });
        });

        this.startTurn(startingPlayerId);
    }

    /**
     * Begin a new turn for the specified player
     * 
     * Executes the turn sequence: Ready Phase → Set Phase → Draw Phase → Main Phase.
     * Resets turn-specific flags, clears turn history, and expires temporary effects.
     * 
     * @param playerId - ID of the player whose turn is starting
     */
    startTurn(playerId: string) {
        this.game.state.turnPlayerId = playerId;
        this.game.state.phase = Phase.Beginning;
        this.logger.info(`Turn ${this.game.state.turnCount}: Player ${playerId}`);
        this.logGameState(playerId);

        const player = this.game.getPlayer(playerId);

        // Initialize turn history for tracking zone changes
        if (!this.game.state.turnHistory) {
            this.game.state.turnHistory = {
                zoneChanges: [],
                cardsPlacedUnder: []
            };
        } else {
            this.game.state.turnHistory.zoneChanges = [];
            this.game.state.turnHistory.cardsPlacedUnder = [];
        }

        // Reset turn flags
        player.inkedThisTurn = false;

        // Cleanup expired effects (until_source_next_start AND aliases)
        this.game.state.activeEffects = this.game.state.activeEffects.filter(e => {
            const isNextTurnEffect = e.duration === 'until_source_next_start' ||
                e.duration === 'next_turn_start' ||
                e.duration === 'until_next_turn' ||
                e.duration === 'until_next_turn_start';

            if (isNextTurnEffect && e.sourcePlayerId === playerId) {
                return false; // Expire
            }
            return true;
        });

        // Cleanup expired Damage Shields (until_source_next_start)
        Object.values(this.game.state.players).forEach(p => {
            p.play.forEach(card => {
                if (card.damageShields) {
                    card.damageShields = card.damageShields.filter(shield => {
                        if (shield.duration === 'until_source_next_start') {
                            // If source owner is current player, expire
                            if (shield.sourcePlayerId === playerId) return false;
                        }
                        return true;
                    });
                }
            });
        });

        this.recalculateEffects();

        // 1. Ready
        this.readyPhase(player);

        // 2. Set (Start of Turn effects)
        this.setPhase(player);

        // 3. Draw
        this.drawPhase(player);

        // 4. Main Phase
        this.game.state.phase = Phase.Main;
    }

    private readyPhase(player: PlayerState) {
        executeReadyPhase(this, player);
    }

    private setPhase(player: PlayerState) {
        executeSetPhase(this, player);
    }

    private drawPhase(player: PlayerState) {
        executeDrawPhase(this, player);
    }

    /**
     * Draw specific number of cards for a player
     * Generic helper for effects (like "Draw 2 cards")
     */
    public drawCards(playerId: string, amount: number) {
        drawCardsHelper(this, playerId, amount);
    }

    /**
     * Execute a player action during their Main Phase
     * 
     * Routes the action to the appropriate handler based on action type.
     * Validates that the action is taken during the Main Phase and by the active player.
     * Recalculates game effects after successful actions.
     * 
     * @param action - The game action to execute
     * @returns True if the action was successfully executed, false otherwise
     */
    /**
     * Helper to safely add an active effect and immediately recalculate state.
     * Use this instead of modifying activeEffects directly to prevent sync bugs.
     */
    public addActiveEffect(effect: ContinuousEffect) {
        this.game.state.activeEffects.push(effect);
        this.recalculateEffects();
    }

    public async resolveAction(action: GameAction): Promise<boolean> {
        if (this.game.state.phase !== Phase.Main) {
            this.logger.debug('Actions can only be taken during Main Phase');
            return false;
        }

        if (action.playerId !== this.game.state.turnPlayerId) {
            this.logger.debug('Not your turn!');
            return false;
        }

        const player = this.game.getPlayer(action.playerId);

        let result = false;
        switch (action.type) {
            case ActionType.PlayCard:
                // Ensure targetId is in payload if provided in action
                if (action.targetId && (!action.payload || !action.payload.targetId)) {
                    action.payload = action.payload || {};
                    action.payload.targetId = action.targetId;
                }
                // Ensure modalChoice is in payload if provided in action
                if (action.modalChoice !== undefined) {
                    action.payload = action.payload || {};
                    action.payload.modalChoice = action.modalChoice;
                }

                result = await this.playCard(player, action.cardId!, action.singerId, action.shiftTargetId, action.targetId, action.payload, action.singerIds);
                break;

            case ActionType.InkCard:
                result = this.inkCard(player, action.cardId!);
                break;

            case ActionType.Quest:
                result = await this.quest(player, action.cardId!, action.payload);
                break;

            case ActionType.Challenge:
                result = await this.challenge(player, action.cardId!, action.targetId!, action.payload);
                break;

            case ActionType.UseAbility:
                // Ensure targetId is in payload if provided in action
                if (action.targetId && (!action.payload || !action.payload.targetId)) {
                    action.payload = action.payload || {};
                    action.payload.targetId = action.targetId;
                }
                result = await this.useAbility(player, action.cardId!, action.abilityIndex!, action.payload);
                break;

            case ActionType.SingSong:
                result = await this.singSong(player, action.cardId!, action.singerId!, action.payload);
                break;

            case ActionType.Concede:
                result = this.concede(player);
                break;

            case ActionType.PassTurn:
                result = this.passTurn(player.id, action.payload);
                break;
            default:
                this.logger.debug('Action not implemented yet:', action.type);
                return false;
        }

        if (result) {
            this.recalculateEffects();
        }
        return result;
    }

    /**
     * Move a card from hand to inkwell
     * 
     * Players may ink one card per turn to increase their available resources.
     * The card must be inkable (have the inkwell symbol) or be a non-character card.
     * 
     * @param player - The player inking the card
     * @param cardId - Instance ID of the card to ink
     * @returns True if successfully inked, false if already inked this turn or card not found
     */
    public inkCard(player: PlayerState, cardId: string): boolean {
        return executeInkCard(this, player, cardId);
    }

    /**
     * Play a card from hand onto the field
     * 
     * Handles characters, items, actions, and locations. Validates costs (ink, exert, singers),
     * processes shift mechanics, handles targeted abilities on play, and registers the card
     * with the ability system.
     * 
     * @param player - The player playing the card
     * @param cardId - Instance ID of the card to play
     * @param singerId - Optional: ID of character singing this card (for songs)
     * @param shiftTargetId - Optional: ID of character to shift onto
     * @param targetId - Optional: ID of target for on-play abilities
     * @param payload - Optional: Additional data (modal choices, discards, etc.)
     * @param singerIds - Optional: Array of singer IDs for multi-singer songs
     * @param options - Optional: Configuration (e.g., free play)
     * @returns True if card was successfully played, false otherwise
     */
    public async playCard(player: PlayerState, cardId: string, singerId?: string, shiftTargetId?: string, targetId?: string, payload?: any, singerIds?: string[], options?: { free?: boolean }): Promise<boolean> {
        return executePlayCard(this, player, cardId, singerId, shiftTargetId, targetId, payload, singerIds, options);
    }

    public async quest(player: PlayerState, cardId: string, payload?: any): Promise<boolean> {
        return executeQuest(this, player, cardId, payload);
    }

    /**
     * Checks if a player has met the victory condition (>= 20 Lore)
     */
    public checkWinCondition(player: PlayerState): boolean {
        if (player.lore >= 20) {
            this.logger.info(`[${player.name}] WINS THE GAME!`);
            this.game.state.winnerId = player.id;
            return true;
        }
        return false;
    }

    /**
     * Challenge an opponent's character in combat
     * 
     * Validates challenge rules: attacker must be ready and dry (unless Rush), target must be exerted
     * (unless attacker can challenge ready), handles Bodyguard and Evasive keywords. Deals simultaneous
     * damage and applies Challenger bonus.
     * 
     * @param player - The player initiating the challenge
     * @param attackerId - Instance ID of the attacking character
     * @param targetId - Instance ID of the target character
     * @param payload - Optional: Additional data for challenge effects
     * @returns True if challenge was successful, false if invalid
     */
    public async challenge(player: PlayerState, attackerId: string, targetId: string, payload?: any): Promise<boolean> {
        return executeChallenge(this, player, attackerId, targetId, payload);
    }

    public async checkBanishment(player: PlayerState, card: CardInstance, banisher?: CardInstance) {
        await checkBanishmentHelper(this, player, card, banisher);
    }

    private async banishCard(player: PlayerState, card: CardInstance, banisher?: CardInstance) {
        await banishCardHelper(this, player, card, banisher);
    }

    private async triggerBanishEffects(card: CardInstance, banisher?: CardInstance) {
        await triggerBanishEffectsHelper(this, card, banisher);
    }

    /**
     * Activate a card's ability during the player's turn
     * 
     * Validates ability type (activated or start-of-turn), checks if already used this turn (infinite loop
     * protection), validates and pays costs (exert, ink, discard, banish), then executes the ability effect.
     * 
     * **IMPORTANT**: This method includes critical infinite loop protection added to fix the Elsa bug.
     * It checks both `effect.trigger` AND `effect.type` for 'activated' since abilities can be represented
     * either way depending on the parser.
     * 
     * @param player - The player using the ability
     * @param cardId - Instance ID of the card with the ability
     * @param abilityIndex - Index of the ability in the card's parsedEffects array
     * @param payload - Optional: Additional data (discard choices, targets, etc.)
     * @returns True if ability was successfully activated, false if invalid or costs couldn't be paid
     */
    public async useAbility(player: PlayerState, cardId: string, abilityIndex: number, payload?: any): Promise<boolean> {
        return await executeUseAbility(this, player, cardId, abilityIndex, payload);
    }
    /*
        const card = player.play.find(c => c.instanceId === cardId);
        if (!card) return false;

        if (!card.parsedEffects || !card.parsedEffects[abilityIndex]) {
            this.logger.debug(`[${player.name}] Invalid ability index ${abilityIndex} on ${card.name}.`);
            return false;
        }
        const effect = card.parsedEffects[abilityIndex];

        // Allow 'activated' AND 'on_start_turn' (for optional triggers handled manually)
        // CRITICAL FIX: Check both 'trigger' and 'type' fields since abilities can be represented either way
        // Also check for Boost keyword which is an activated ability
        const effectAny = effect as any;
        const isActivated = effectAny.trigger === 'activated' ||
            effectAny.type === 'activated' ||
            (effectAny.keyword === 'boost' && effectAny.costs);
        const isStartTurn = effectAny.trigger === 'on_start_turn';

        if (!isActivated && !isStartTurn) {
            this.logger.debug(`[${player.name}] Not an activated or start-of-turn ability (Trigger: ${effectAny.trigger}, Type: ${effectAny.type}, Keyword: ${effectAny.keyword})`);
            return false;
        }

        // INFINITE LOOP PROTECTION: Check if ability already used this turn
        if (!card.meta) card.meta = {};
        if (!card.meta.usedAbilities) card.meta.usedAbilities = {};

        // For Boost, use the shared 'boost' key to match executor
        let abilityKey = `ability_${abilityIndex}`;
        if (effectAny.keyword?.toLowerCase() === 'boost') {
            abilityKey = 'boost';
        }
        const currentTurn = this.game.state.turnCount;

        if (card.meta.usedAbilities[abilityKey] === currentTurn) {
            this.logger.debug(`[${player.name}] ${card.name}'s ability ${abilityIndex} already used this turn.`);
            return false;
        }

        // Validate Costs
        const cost: ActivationCost = effect.cost || {};

        // 1. Exert Cost
        if (cost.exert) {
            if (!card.ready) {
                this.logger.debug(`[${player.name}] ${card.name} is exerted and cannot use this ability.`);
                return false;
            }
            // Check drying (activated abilities requiring exert usually require drying)
            if (card.turnPlayed === this.game.state.turnCount) {
                // Exception: Rush (if ability is an attack? No, Rush is for challenging)
                // Exception: "This character can use abilities the turn they are played" (not implemented yet)
                this.logger.debug(`[${player.name}] ${card.name} is drying and cannot use exert ability.`);
                return false;
            }
        }

        // 2. Ink Cost
        if (cost.ink) {
            const readyInk = player.inkwell.filter(i => i.ready).length;
            if (readyInk < cost.ink) {
                this.logger.debug(`[${player.name}] Not enough ink (Need ${cost.ink}, Have ${readyInk}).`);
                return false;
            }
        }

        // 3. Discard Cost
        if (cost.discard) {
            if (player.hand.length < cost.discard) {
                this.logger.debug(`[${player.name}] Not enough cards to discard (Need ${cost.discard}, Have ${player.hand.length}).`);
                return false;
            }
        }

        // Pay Costs
        if (cost.exert) {
            card.ready = false;
        }

        if (cost.ink) {
            let paid = 0;
            for (const inkCard of player.inkwell) {
                if (inkCard.ready && paid < cost.ink) {
                    inkCard.ready = false;
                    paid++;
                }
            }
        }
        if (cost.discard) {
            // Handle discard payment
            if (payload?.discardCardId) {
                const cardToDiscard = player.hand.find(c => c.instanceId === payload.discardCardId);
                if (cardToDiscard) {
                    player.hand = player.hand.filter(c => c.instanceId !== cardToDiscard.instanceId);
                    cardToDiscard.zone = ZoneType.Discard;
                    player.discard.push(cardToDiscard);
                    this.trackZoneChange(cardToDiscard, ZoneType.Hand, ZoneType.Discard);
                    this.logger.action(player.name, `Paid discard cost: ${cardToDiscard.name}`);
                }
            } else if (cost.discard > 0) {
                this.logger.debug(`[${player.name}] Discard cost paid but no card specified in payload.`);
            }
        }

        if (cost.banish) {
            // Banish self
            player.play = player.play.filter(c => c.instanceId !== card.instanceId);
            card.zone = ZoneType.Discard;
            player.discard.push(card);
            this.trackZoneChange(card, ZoneType.Play, ZoneType.Discard);
            this.logger.action(player.name, `Banished ${card.name} to pay cost`);
        }

        // Extract ability name for logging
        let abilityDisplayName = effect.abilityName;
        if (!abilityDisplayName && effect.rawText) {
            // Try to extract ability name from rawText (format: "NAME Effect text")
            const nameMatch = effect.rawText.match(/^([A-Z][A-Z\s'-]+?)\s+(?:[⟳]|When|Whenever|While|Shift|Singer|Support|Evasive|Ward|Challenger|Reckless|Bodyguard|Rush)/);
            if (nameMatch) {
                abilityDisplayName = nameMatch[1].trim();
            } else {
                // Fallback to first 30 characters of rawText
                abilityDisplayName = effect.rawText.substring(0, 30) + (effect.rawText.length > 30 ? '...' : '');
            }
        }

        this.logger.action(player.name, `Activated ${card.name}'s ability: ${abilityDisplayName || 'Unnamed Ability'}`);

        // Mark ability as used this turn
        card.meta.usedAbilities[abilityKey] = currentTurn;

        // Resolve Target (if any)
        let targetCard: CardInstance | undefined;
        if (payload?.targetId) {
            // Check Play (All Players)
            const allPlayers = Object.values(this.game.state.players);
            for (const p of allPlayers) {
                const found = p.play.find(c => c.instanceId === payload.targetId);
                if (found) {
                    targetCard = found;
                    break;
                }
            }
        }

        // Execute Effect
        // If we have a pre-parsed chained effect, use it
        if (effect.params?.chainedEffect) {
            this.resolveEffect(player, effect.params.chainedEffect, card, targetCard, payload);
        } else {
            // Fallback to executing the main effect (legacy support)
            this.resolveEffect(player, effect, card, targetCard, payload);
        }

        return true;
    */
    // }

    public concede(player: PlayerState): boolean {
        this.logger.info(player.name, `Conceded the game`);
        const opponentId = Object.keys(this.game.state.players).find(id => id !== player.id);
        if (opponentId) {
            const opponent = this.game.getPlayer(opponentId);
            this.logger.info(opponent.name, `WINS THE GAME!`);
            this.game.state.winnerId = opponentId;
        }
        return true;
    }

    /**
     * Sing a song using a character
     */
    public async singSong(player: PlayerState, songId: string, singerId: string, payload?: any): Promise<boolean> {
        return await executeSingSong(this, player, songId, singerId, payload);
    }
    /*
        // Find the song card in hand
        const songIndex = player.hand.findIndex(c => c.instanceId === songId);
        if (songIndex === -1) {
            this.logger.debug(`[${player.name}] Song not found in hand.`);
            return false;
        }
        const songCard = player.hand[songIndex];

        // Find the singer character in play
        const singer = player.play.find(c => c.instanceId === singerId);
        if (!singer) {
            this.logger.debug(`[${player.name}] Singer character not found in play.`);
            return false;
        }

        // Verify singer is ready (not exerted)
        if (!singer.ready) {
            this.logger.debug(`[${player.name}] Singer must be ready to sing.`);
            return false;
        }

        // Get song cost requirement (default is 3 per Lorcana rules)
        const songCostEffect = songCard.parsedEffects?.find(e => e.action === 'song_cost_requirement');
        const requiredCost = songCostEffect ? (songCostEffect.amount as number) : 3;

        // Check if singer meets requirements
        const singerCanSing = this.canCharacterSingSong(singer, requiredCost);
        if (!singerCanSing) {
            this.logger.debug(`[${player.name}] Singer does not meet cost requirement (need ${requiredCost}, singer has cost ${singer.cost}).`);
            return false;
        }

        // Exert the singer
        singer.ready = false;
        this.logger.action(player.name, `${singer.name} sings "${songCard.name}"`);

        // Remove from hand
        player.hand.splice(songIndex, 1);

        // Resolve song effects
        const songEffects = songCard.parsedEffects?.filter(e => e.action !== 'song_cost_requirement');
        if (songEffects) {
            for (const effect of songEffects) {
                this.resolveEffect(player, effect, undefined, payload);
            }
        }

        // Move song to discard
        songCard.zone = ZoneType.Discard;
        player.discard.push(songCard);
        this.logger.debug(`[${player.name}] "${songCard.name}" goes to discard.`);
        this.logger.debug(`[${player.name}] "${songCard.name}" goes to discard.`);

        return true;
    */
    // }

    /**
     * Check validity of challenge
     */
    public canChallenge(attacker: CardInstance, target: CardInstance): boolean {
        // Evasive Check
        if (target.keywords?.includes('Evasive') && !attacker.keywords?.includes('Evasive')) {
            return false;
        }

        // Restrictions
        const restrictions = this.game.state.activeEffects.filter(e =>
            e.type === 'restriction' &&
            e.targetCardIds?.includes(target.instanceId)
        );

        for (const r of restrictions) {
            if (r.restrictionType === 'cant_be_challenged') return false;

            if (r.restrictionType === 'cant_be_challenged_by' && r.params) {
                const { minStat, stat } = r.params;
                if (stat && minStat !== undefined) {
                    const attackerStat = (attacker as any)[stat] || 0;
                    if (attackerStat >= minStat) return false;
                }
            }
        }

        // Bodyguard Check
        const opponentId = target.ownerId;
        const opponent = this.game.getPlayer(opponentId);

        if (opponent) {
            // Check for any exerted Bodyguard characters
            const hasExertedBodyguard = opponent.play.some(c => {
                if (c.ready) return false;

                // Check if card has Bodyguard keyword (parsed or explicit)
                return (c.keywords || []).includes('Bodyguard') ||
                    c.parsedEffects?.some((e: any) =>
                        e.action === 'keyword_bodyguard' ||
                        e.keyword === 'bodyguard' ||
                        (e.type === 'static' && e.effects?.some((ef: any) => ef.type === 'bodyguard'))
                    );
            });

            if (hasExertedBodyguard) {
                // If opponent has exerted bodyguard(s), target MUST be a bodyguard
                const isBodyguard = (target.keywords || []).includes('Bodyguard') ||
                    target.parsedEffects?.some((e: any) =>
                        e.action === 'keyword_bodyguard' ||
                        e.keyword === 'bodyguard' ||
                        (e.type === 'static' && e.effects?.some((ef: any) => ef.type === 'bodyguard'))
                    );

                if (!isBodyguard) return false;
            }
        }

        return true;
    }

    /**
     * Get the effective singing value of a character (Cost or Singer value).
     * Handles both 'keyword' type effects (parsed by keyword parser) and 'static' type effects
     * (parsed by ability parser for specific abilities like "Singer 6").
     * @param character The character instance to check.
     * @returns The singing value (max of cost or Singer value).
     */
    public getSingingValue(character: CardInstance): number {
        return getSingingValueHelper(character);
    }
    /*
        // 1. Check parsedEffects for Singer ability
        const singerEffect = character.parsedEffects?.find(e =>
            e.action === 'keyword_singer' ||
            e.action === 'singer' ||
            ((e as any).type === 'keyword' && (e as any).keyword === 'Singer') ||
            ((e as any).type === 'static' && ((e as any).keyword === 'singer' || (e as any).keyword === 'Singer'))
        );
        if (singerEffect) {
            // Check for value in different places (amount, value, params.value, keywordValue)
            let singerValue: number = 0;

            if ((singerEffect as any).keywordValue) {
                singerValue = parseInt((singerEffect as any).keywordValue);
            } else if ((singerEffect as any).keywordValueNumber) {
                singerValue = (singerEffect as any).keywordValueNumber;
            } else {
                singerValue = (singerEffect.amount || (singerEffect as any).value || (singerEffect.params as any)?.value) as number;
            }

            if (singerValue) {
                // Use the higher of cost or Singer value (beneficial interpretation)
                return Math.max(character.cost || 0, singerValue);
            }
        }

        // 2. Check keywordAbilities array (e.g. ["Singer"])
        if ((character as any).keywordAbilities?.includes('Singer')) {
            // Parse Singer value from fullText (e.g. "Singer 3 (This character counts as cost 3 to sing songs.)")
            const fullText = (character as any).fullText || '';
            const singerMatch = fullText.match(/Singer\s+(\d+)/i);
            if (singerMatch) {
                const singerValue = parseInt(singerMatch[1]);
                return Math.max(character.cost || 0, singerValue);
            }
            // If Singer with no number found, default to character cost
            return character.cost || 0;
        }

        // 3. Fallback: Parse Singer from abilities array text
        const abilities = (character as any).abilities || [];
        for (const ability of abilities) {
            const abilityText = ability.fullText || ability.effect || '';
            const singerMatch = abilityText.match(/Singer\s+(\d+)/i);
            if (singerMatch) {
                const singerValue = parseInt(singerMatch[1]);
                return Math.max(character.cost || 0, singerValue);
            }
        }

        return character.cost || 0;
    */
    // }

    /**
     * Check if a character can sing a song with the given cost requirement
     */
    private canCharacterSingSong(character: CardInstance, requiredCost: number): boolean {
        return canCharacterSingSongHelper(character, requiredCost);
    }


    public trackZoneChange(card: CardInstance, fromZone: ZoneType, toZone: ZoneType) {
        if (!this.game.state.turnHistory) {
            this.game.state.turnHistory = { zoneChanges: [] };
        }

        this.game.state.turnHistory.zoneChanges.push({
            cardId: card.instanceId,
            fromZone,
            toZone,
            playerId: card.ownerId,
            turnNumber: this.game.state.turnCount
        });

        this.logger.debug(`[Zone Change Tracked] ${card.name}: ${fromZone} → ${toZone}`);

        // Batch 12: Emit Zone Change Events
        if (fromZone === ZoneType.Play && toZone !== ZoneType.Play) {
            const context: EventContext = {
                event: GameEvent.CARD_LEAVES_PLAY,
                timestamp: Date.now(),
                card: card,
                player: this.game.state.players[card.ownerId] || { id: card.ownerId } as any,
                source: 'zone_change',
                fromZone,
                toZone
            };

            // Fire and forget event emission to avoid refactoring generic trackZoneChange to async everywhere
            // ideally this should be awaited, but for now we trust the event loop or refactor later
            this.abilitySystem.emitEvent(GameEvent.CARD_LEAVES_PLAY, context).catch(err => {
                this.logger.error(`[TurnManager] Error emitting CARD_LEAVES_PLAY: ${err}`);
            });
        }
    }



    private hasSubtypeInPlay(player: PlayerState, subtype: string): boolean {
        return player.play.some(card =>
            card.subtypes && card.subtypes.includes(subtype)
        );
    }

    /**
     * Validate if a target can be chosen by the source player (checks Ward)
     */
    private validateTarget(target: CardInstance, sourcePlayerId: string): boolean {
        // Ward: Opponents can't choose this character except to challenge
        // Note: We only check Ward if the target is an opponent's character
        if (target.meta?.hasWard && target.ownerId !== sourcePlayerId) {
            this.logger.debug(`[Ward] Cannot target ${target.name} because it has Ward.`);
            return false;
        }
        return true;
    }

    /**
     * Execute an ability effect on the game state
     * 
     * Central dispatcher for all game effects. Routes to the new AST-based executor when available,
     * otherwise handles legacy effect format. Supports AoE effects, conditional effects, and complex
     * multi-step abilities.
     * 
     * **Implementation Note**: This is a large ~2700 line method that handles many effect types.
     * Consider refactoring into smaller, specialized handlers in future iterations.
     * 
     * @param player - The player executing the effect (usually the card owner)
     * @param effect - The effect to execute (EffectAST or legacy format)
     * @param sourceCard - Optional: The card that is the source of this effect
     * @param targetCard - Optional: The target card for targeted effects
     * @param payload - Optional: Additional context (modal choices, selected cards, etc.)
     */
    public async resolveEffect(player: PlayerState, effect: any, sourceCard?: CardInstance, targetCard?: CardInstance, payload?: any) {
        return executeResolveEffect(this, player, effect, sourceCard, targetCard, payload);
    }
    /*
        // Handle AbilityDefinition (container of effects)
        if (effect.effects && Array.isArray(effect.effects)) {
            for (const subEffect of effect.effects) {
                await this.resolveEffect(player, subEffect, sourceCard, targetCard, payload);
            }
            return;
        }

        // NEW: Handle AST Effects via Executor
        // If effect has 'type' (AST) instead of 'action' (Legacy),        // Use new ability system executor if available
        if (effect.type && !effect.action && this.abilitySystem?.executor) {
            this.logger.debug(`[resolveEffect] Using new ability system executor for effect type: ${effect.type}`);
            const context: GameContext = {
                player,
                card: sourceCard, // Assuming 'card' should be 'sourceCard' based on original context
                gameState: this.game,
                eventContext: {
                    event: GameEvent.CARD_PLAYED,
                    timestamp: Date.now(),
                    player,
                    sourceCard,
                    targetCard
                },
                abilityName: effect.abilityName || sourceCard?.name,
                modalChoice: payload?.modalChoice // Pass modal choice
            };

            return this.abilitySystem.executor.execute(effect, context).catch((err: any) => {
                this.logger.error(`[resolveEffect] Executor failed for ${effect.type}: ${err.message}`);
                throw err;
            });
        }

        // Check Conditions
        if (effect.params?.condition === 'my_turn') {
            if (this.game.state.turnPlayerId !== player.id) {
                this.logger.debug(`[Effect] Skipped effect because it's not player's turn.`);
                return;
            }
        }



        // Handle AoE Targets
        if (effect.target === 'all_opposing_characters' || effect.target === 'all_characters') {
            let targets: CardInstance[] = [];
            if (effect.target === 'all_opposing_characters') {
                const opponents = Object.values(this.game.state.players).filter(p => p.id !== player.id);
                targets = opponents.flatMap(p => p.play);
            } else {
                targets = Object.values(this.game.state.players).flatMap(p => p.play);
            }

            this.logger.debug(`[Effect] AoE targeting ${targets.length} characters.`);
            targets.forEach(target => {
                // Create a single-target version of the effect
                // We change target to 'resolved_target' to prevent infinite recursion
                // and pass the specific targetCard
                const singleTargetEffect = { ...effect, target: 'resolved_target' };
                this.resolveEffect(player, singleTargetEffect, sourceCard, target, payload);
            });
            return;
        }

        // Draw
        if (effect.action === 'draw') {
            const amount = effect.amount || 1;
            for (let i = 0; i < amount; i++) {
                if (player.deck.length > 0) {
                    const drawn = player.deck.pop()!;
                    player.addCardToZone(drawn, ZoneType.Hand);
                }
            }
            this.logger.effect(player.name, `Drew ${amount} card(s)`);
        }

        // Optional Draw (You May Draw)
        else if (effect.action === 'optional_draw') {
            const amount = effect.amount || 1;
            // For now, auto-accept the optional draw (bot heuristic: usually beneficial)
            for (let i = 0; i < amount; i++) {
                if (player.deck.length > 0) {
                    const drawn = player.deck.pop()!;
                    player.addCardToZone(drawn, ZoneType.Hand);
                }
            }
            this.logger.effect(player.name, `Optionally drew ${amount} card(s)`);
        }

        // Draw Then Discard (e.g., The Bayou)
        else if (effect.action === 'draw_then_discard') {
            const drawAmount = effect.params?.drawAmount || 1;
            const discardAmount = effect.params?.discardAmount || 1;

            // Draw cards
            for (let i = 0; i < drawAmount; i++) {
                if (player.deck.length > 0) {
                    const drawn = player.deck.pop()!;
                    player.addCardToZone(drawn, ZoneType.Hand);
                }
            }

            // Discard cards (bot heuristic: discard lowest cost)
            for (let i = 0; i < discardAmount && player.hand.length > 0; i++) {
                const sortedHand = [...player.hand].sort((a, b) => a.cost - b.cost);
                const cardToDiscard = sortedHand[0];
                player.hand = player.hand.filter(c => c.instanceId !== cardToDiscard.instanceId);
                cardToDiscard.zone = ZoneType.Discard;
                player.discard.push(cardToDiscard);
            }

            this.logger.effect(player.name, `Drew ${drawAmount} and discarded ${discardAmount} card(s)`);
        }

        // Gain Lore
        else if (effect.action === 'gain_lore') {
            const amount = effect.amount || 1;
            player.lore += amount;
            this.logger.effect(player.name, `Gained ${amount} lore`);
        }

        // Ready Character
        else if (effect.action === 'ready') {
            // Target is usually 'self' or 'chosen_character'
            // If self, use sourceCard
            let target = targetCard;
            if (effect.target === 'self') {
                target = sourceCard;
            }

            if (target) {
                target.ready = true;
                this.logger.effect(player.name, `Readied ${target.name}`);
            }
        }

        // Move Damage Counters
        else if (effect.action === 'move_damage') {
            const amount = effect.amount || 1;

            // Get source and target characters from payload
            const sourceId = payload?.sourceId;
            const targetId = payload?.targetId;

            if (sourceId && targetId) {
                const allCards = Object.values(this.game.state.players).flatMap(p => p.play);
                const sourceChar = allCards.find(c => c.instanceId === sourceId);
                const targetChar = allCards.find(c => c.instanceId === targetId);

                if (sourceChar && targetChar) {
                    // Move up to 'amount' damage from source to target
                    const damageToMove = Math.min(sourceChar.damage, amount);

                    if (damageToMove > 0) {
                        sourceChar.damage -= damageToMove;
                        this.applyDamage(this.game.getPlayer(targetChar.ownerId), targetChar, damageToMove, sourceCard?.instanceId);

                        this.logger.effect(player.name, `Moved ${damageToMove} damage from ${sourceChar.name} to ${targetChar.name}`);

                        // Check if target needs to be banished
                        this.checkBanishment(this.game.getPlayer(targetChar.ownerId), targetChar, sourceCard);
                    }
                }
            }
        }

        // Optional Return from Discard (You May Return)
        else if (effect.action === 'optional_return_from_discard') {
            const cardType = effect.params?.cardType;
            const cardName = effect.params?.cardName;

            // Bot heuristic: always accept optional returns (usually beneficial)
            const validCards = player.discard.filter(c => {
                if (cardName && !c.name.toLowerCase().includes(cardName.toLowerCase())) return false;
                if (cardType.toLowerCase().includes('action') && c.type !== 'Action') return false;
                if (cardType.toLowerCase().includes('character') && c.type !== 'Character') return false;
                if (cardType.toLowerCase().includes('item') && c.type !== 'Item') return false;
                return true;
            });

            if (validCards.length > 0) {
                // Pick the highest cost card (heuristic: more valuable)
                const card = validCards.sort((a, b) => b.cost - a.cost)[0];
                player.discard = player.discard.filter(c => c.instanceId !== card.instanceId);
                card.zone = ZoneType.Hand;
                player.hand.push(card);
                this.logger.effect(player.name, `Returned ${card.name} from discard to hand`);
            }
        }

        // Return from Discard (Non-optional)
        else if (effect.action === 'return_from_discard') {
            const cardType = effect.params?.cardType;

            const validCards = player.discard.filter(c => {
                if (cardType.toLowerCase().includes('action') && c.type !== 'Action') return false;
                if (cardType.toLowerCase().includes('character') && c.type !== 'Character') return false;
                if (cardType.toLowerCase().includes('item') && c.type !== 'Item') return false;
                return true;
            });

            if (validCards.length > 0) {
                // Pick the highest cost card (heuristic: more valuable)
                const card = validCards.sort((a, b) => b.cost - a.cost)[0];
                player.discard = player.discard.filter(c => c.instanceId !== card.instanceId);
                card.zone = ZoneType.Hand;
                player.hand.push(card);
                this.logger.effect(player.name, `Returned ${card.name} from discard to hand (mandatory)`);
            }
        }

        // Deal Damage (Generic)
        else if (effect.action === 'deal_damage') {
            let target = targetCard;
            if (!target && payload?.targetId) {
                const allCards = Object.values(this.game.state.players).flatMap(p => p.play);
                target = allCards.find(c => c.instanceId === payload.targetId);

                if (target && !this.validateTarget(target, player.id)) {
                    target = undefined;
                }
            }

            if (target) {
                let damage = effect.amount || 0;

                // Handle dynamic amount
                if (effect.params?.amountSource === 'stat') {
                    const stat = effect.params.stat;
                    if (sourceCard) {
                        if (stat === 'strength') damage = sourceCard.strength || 0;
                        else if (stat === 'willpower') damage = sourceCard.willpower || 0;
                        else if (stat === 'lore') damage = sourceCard.lore || 0;
                    }
                } else if (effect.params?.amountSource === 'count') {
                    const countSource = effect.params.countSource;
                    const filter = effect.params.filter;

                    if (countSource === 'play') {
                        // Count cards in play matching filter
                        const cards = player.play.filter(c => {
                            if (filter.subtype && (!c.subtypes || !c.subtypes.includes(filter.subtype))) return false;
                            if (filter.type && c.type !== filter.type) return false;
                            return true;
                        });
                        damage = cards.length;
                    }
                }

                this.logger.effect(player.name, `Dealing ${damage} damage to ${target.name}`);
                this.applyDamage(this.game.getPlayer(target.ownerId), target, damage, sourceCard?.instanceId);
                await this.checkBanishment(this.game.getPlayer(target.ownerId), target, sourceCard);
            }
        }

        // Deal Damage AOE (All/Each characters)
        else if (effect.action === 'deal_damage_aoe') {
            const damage = effect.amount || 0;
            let targets: CardInstance[] = [];

            if (effect.target === 'all_opposing_characters') {
                const opponents = Object.values(this.game.state.players).filter(p => p.id !== player.id);
                targets = opponents.flatMap(p => p.play);
            } else if (effect.target === 'all_characters') {
                targets = Object.values(this.game.state.players).flatMap(p => p.play);
            }

            this.logger.effect(player.name, `Dealing ${damage} AOE damage to ${targets.length} character(s)`);
            for (const target of targets) {
                this.applyDamage(this.game.getPlayer(target.ownerId), target, damage, sourceCard?.instanceId);
                await this.checkBanishment(this.game.getPlayer(target.ownerId), target, sourceCard);
            }
        }

        // Heal (Generic)
        else if (effect.action === 'heal') {
            let target = targetCard;
            if (!target && payload?.targetId) {
                const allCards = Object.values(this.game.state.players).flatMap(p => p.play);
                target = allCards.find(c => c.instanceId === payload.targetId);

                if (target && !this.validateTarget(target, player.id)) {
                    target = undefined;
                }
            }

            if (target) {
                const amount = effect.amount || 0;
                const actualHeal = Math.min(target.damage, amount);
                target.damage -= actualHeal;
                this.logger.effect(player.name, `Healed ${target.name} for ${actualHeal}`);
            } else {
                this.logger.debug(`[${player.name}] No target for heal effect.`);
            }
        }

        // Exert (Generic)
        else if (effect.action === 'exert') {
            if (targetCard) {
                if (targetCard.ready) {
                    targetCard.ready = false;
                    this.logger.effect(player.name, `Exerted ${targetCard.name}`);
                }
            }
        }

        // Lore Loss (Ursula)
        else if (effect.action === 'lore_loss') {
            const amount = effect.amount || 1;
            if (effect.target === 'opponent') {
                const opponentId = Object.keys(this.game.state.players).find(id => id !== player.id);
                if (opponentId) {
                    const opponent = this.game.getPlayer(opponentId);
                    const lost = Math.min(opponent.lore, amount);
                    opponent.lore -= lost;
                    this.logger.effect(opponent.name, `Lost ${lost} lore`);
                }
            }
        }

        // Cant Play Actions (Pete)
        else if (effect.action === 'cant_play_actions') {
            if (sourceCard && effect.duration) {
                this.addActiveEffect({
                    id: `${sourceCard.instanceId}_cant_play_actions`,
                    type: 'restriction',
                    restrictionType: 'cant_play_actions',
                    target: effect.target,
                    sourceCardId: sourceCard.instanceId,
                    sourcePlayerId: player.id,
                    duration: effect.duration
                });
                this.logger.effect(player.name, `Applied restriction: Opponents can't play actions`);
            }
        }

        // Grant Keyword Temporary (Activated Ability)
        else if (effect.action === 'grant_keyword_temporary') {
            let target = targetCard;
            if (!target && payload?.targetId) {
                const allCards = Object.values(this.game.state.players).flatMap(p => p.play);
                target = allCards.find(c => c.instanceId === payload.targetId);

                if (target && !this.validateTarget(target, player.id)) {
                    target = undefined;
                }
            }

            if (target && effect.params?.keyword) {
                const keyword = effect.params.keyword;
                this.addActiveEffect({
                    id: `${sourceCard?.instanceId || 'effect'}_grant_${keyword}_${Date.now()}`,
                    type: 'modification',
                    modificationType: 'grant_keyword',
                    target: 'custom',
                    targetCardIds: [target.instanceId],
                    sourceCardId: sourceCard?.instanceId || '',
                    sourcePlayerId: player.id,
                    duration: effect.params.duration || 'until_end_of_turn',
                    params: { keyword: keyword }
                });
                this.logger.effect(player.name, `Granted ${keyword} to ${target.name}`);
            }
        }

        // Temporary Stat Buff (Chosen Gets)
        else if (effect.action === 'temp_stat_buff') {
            let target = targetCard;
            if (effect.target === 'self') {
                target = sourceCard;
            }
            if (!target && payload?.targetId) {
                const allCards = Object.values(this.game.state.players).flatMap(p => p.play);
                target = allCards.find(c => c.instanceId === payload.targetId);

                if (target && !this.validateTarget(target, player.id)) {
                    target = undefined;
                }
            }

            if (target && effect.params?.stat && effect.params?.amount !== undefined) {
                const { stat, amount } = effect.params;

                this.game.state.activeEffects.push({
                    id: `${sourceCard?.instanceId || 'effect'}_stat_buff_${Date.now()}`,
                    type: 'modification',
                    modificationType: 'stat_buff',
                    target: 'custom',
                    targetCardIds: [target.instanceId],
                    sourceCardId: sourceCard?.instanceId || '',
                    sourcePlayerId: player.id,
                    duration: effect.duration || 'until_end_of_turn',
                    modification: {
                        [stat]: amount
                    },
                    params: { stat, amount }
                });

                const sign = amount >= 0 ? '+' : '';
                this.logger.effect(player.name, `${target.name} gets ${sign}${amount} ${stat} this turn`);
                this.recalculateEffects();
            }
        }

        // Dynamic Stat Buff (Count Based)
        else if (effect.action === 'dynamic_stat_buff') {
            let target = targetCard;
            if (!target && payload?.targetId) {
                const allCards = Object.values(this.game.state.players).flatMap(p => p.play);
                target = allCards.find(c => c.instanceId === payload.targetId);

                if (target && !this.validateTarget(target, player.id)) {
                    target = undefined;
                }
            }

            if (target && effect.params) {
                const { stat, amountPerItem, countSource, filter } = effect.params;

                // Calculate count
                let count = 0;
                let sourceList: any[] = [];

                if (countSource === 'play') {
                    sourceList = player.play;
                } else if (countSource === 'hand') {
                    sourceList = player.hand;
                } else if (countSource === 'discard') {
                    sourceList = player.discard;
                }

                count = sourceList.filter(c => {
                    if (filter.subtype && (!c.subtypes || !c.subtypes.includes(filter.subtype))) return false;
                    if (filter.type && c.type !== filter.type) return false;
                    return true;
                }).length;

                // Handle "other" exclusion (simple heuristic)
                if (effect.rawText.toLowerCase().includes('other') && countSource === 'play') {
                    // If sourceCard is in the list (and matches filter), subtract 1
                    // We assume sourceCard matches filter if we are counting "other [filter]"
                    const isSourceInList = sourceList.some(c => c.instanceId === sourceCard?.instanceId);
                    if (isSourceInList) count = Math.max(0, count - 1);
                }

                const totalAmount = count * amountPerItem;

                if (totalAmount !== 0) {
                    this.game.state.activeEffects.push({
                        id: `${sourceCard?.instanceId || 'effect'}_dynamic_buff_${Date.now()}`,
                        type: 'modification',
                        modificationType: 'stat_buff',
                        target: 'custom',
                        targetCardIds: [target.instanceId],
                        sourceCardId: sourceCard?.instanceId || '',
                        sourcePlayerId: player.id,
                        duration: effect.duration || 'until_end_of_turn',
                        modification: {
                            [stat]: totalAmount
                        },
                        params: { stat, amount: totalAmount }
                    });

                    const sign = totalAmount >= 0 ? '+' : '';
                    this.logger.effect(player.name, `${target.name} gets ${sign}${totalAmount} ${stat} (Count: ${count})`);

                    this.recalculateEffects();
                }
            }
        }

        // Restriction: Can't Quest
        else if (effect.action === 'cant_quest') {
            let target = targetCard;
            if (!target && payload?.targetId) {
                const allCards = Object.values(this.game.state.players).flatMap(p => p.play);
                target = allCards.find(c => c.instanceId === payload.targetId);

                if (target && !this.validateTarget(target, player.id)) {
                    target = undefined;
                }
            }

            if (target) {
                this.game.state.activeEffects.push({
                    id: `${sourceCard?.instanceId || 'effect'}_cant_quest_${Date.now()}`,
                    type: 'restriction',
                    restrictionType: 'cant_quest',
                    target: 'custom',
                    targetCardIds: [target.instanceId],
                    sourceCardId: sourceCard?.instanceId || '',
                    sourcePlayerId: player.id,
                    duration: effect.duration || 'until_end_of_turn'
                });
                this.logger.effect(player.name, `${target.name} can't quest ${effect.duration === 'until_next_turn' ? 'until next turn' : 'this turn'}`);
            }
        }

        // Conditional Effect (If you have...)
        else if (effect.action === 'conditional_effect') {
            const condition = effect.params?.condition;
            const chainedEffect = effect.params?.chainedEffect;

            if (condition && chainedEffect) {
                const conditionMet = evaluateCondition(player, condition, sourceCard);
                if (conditionMet) {
                    this.logger.debug(`[${player.name}] Condition met. Triggering chained effect.`);
                    this.resolveEffect(player, chainedEffect, sourceCard, targetCard, payload);
                } else {
                    this.logger.debug(`[${player.name}] Condition NOT met.`);
                }
            }
        }

        // Trigger Effect (Chained)
        else if (effect.action === 'trigger_effect') {
            const chainedEffect = effect.params?.chainedEffect;
            if (chainedEffect) {
                this.resolveEffect(player, chainedEffect, sourceCard, targetCard, payload);
            }
        }

        // Heal and Draw (Rapunzel)
        else if (effect.action === 'heal_and_draw') {
            // For now, we auto-select the first damaged character of the player.
            // In a real game, this would be a user choice.
            const damagedChar = player.play.find(c => c.damage > 0);

            if (damagedChar) {
                const maxHeal = effect.amount || 0;
                const actualHeal = Math.min(damagedChar.damage, maxHeal);
                damagedChar.damage -= actualHeal;
                this.logger.effect(player.name, `Healed ${damagedChar.name} for ${actualHeal}.`);

                // Draw cards equal to healed amount
                for (let i = 0; i < actualHeal; i++) {
                    if (player.deck.length > 0) {
                        const drawn = player.deck.pop()!;
                        player.addCardToZone(drawn, ZoneType.Hand);
                    }
                }
                this.logger.effect(player.name, `Drew ${actualHeal} card(s).`);
            } else {
                this.logger.debug(`[${player.name}] No damaged characters to heal.`);
            }
        }
        // Banish (Generic)
        else if (effect.action === 'banish') {
            let target = targetCard;
            // If target is 'chosen_opponent_character', we need payload or selection
            if (!target && payload?.targetId) {
                const allCards = Object.values(this.game.state.players).flatMap(p => p.play);
                target = allCards.find(c => c.instanceId === payload.targetId);

                if (target && !this.validateTarget(target, player.id)) {
                    target = undefined;
                }
            }

            // Handle 'self' target
            if (effect.target === 'self') {
                target = sourceCard;
            }

            if (target) {
                // Check Cost Limit
                if (effect.params?.costLimit !== undefined) {
                    if (target.cost > effect.params.costLimit) {
                        this.logger.debug(`[${player.name}] Cannot banish ${target.name} (Cost ${target.cost} > ${effect.params.costLimit}).`);
                        return;
                    }
                }

                this.logger.effect(player.name, `Banished ${target.name}`);
                this.banishCard(this.game.getPlayer(target.ownerId), target, sourceCard);
            }
        }
        // Exert and Draw (Stitch - Rock Star)
        else if (effect.action === 'exert_and_draw') {
            if (targetCard) {
                // Exert
                targetCard.ready = false;
                this.logger.action(player.name, `Exerted ${targetCard.name} for ability.`);

                // Draw
                if (player.deck.length > 0) {
                    const drawn = player.deck.pop()!;
                    player.addCardToZone(drawn, ZoneType.Hand);
                    this.logger.action(player.name, `Drew a card.`);
                }
            }
        }
        // Boost
        else if (effect.action === 'boost') {
            if (sourceCard) {
                if (player.deck.length > 0) {
                    const card = player.deck.pop()!;
                    if (!sourceCard.cardsUnder) sourceCard.cardsUnder = [];
                    sourceCard.cardsUnder.push(card);

                    // Track in turn history for conditional abilities
                    if (!this.game.state.turnHistory) {
                        this.game.state.turnHistory = { zoneChanges: [], cardsPlacedUnder: [] };
                    }
                    if (!this.game.state.turnHistory.cardsPlacedUnder) {
                        this.game.state.turnHistory.cardsPlacedUnder = [];
                    }

                    this.game.state.turnHistory.cardsPlacedUnder.push({
                        characterId: sourceCard.instanceId,
                        cardId: card.instanceId,
                        playerId: player.id,
                        turnNumber: this.game.state.turnCount
                    });

                    this.logger.effect(player.name, `Boosted ${sourceCard.name} (Card under: ${card.name})`);

                    // Trigger "on_card_under_self" effects (Cheshire Cat)
                    if (sourceCard.parsedEffects) {
                        sourceCard.parsedEffects.forEach(e => {
                            if (e.trigger === 'on_card_under_self') {
                                this.logger.debug(`[${player.name}] Triggering ${e.trigger} for ${sourceCard.name}`);
                                this.resolveEffect(player, e, sourceCard, undefined, payload); // Pass payload to allow choices if needed
                            }
                        });
                    }
                } else {
                    this.logger.debug(`[${player.name}] Deck is empty, cannot Boost.`);
                }
            }
        }
        // Ramp (Mickey Mouse - Detective)
        else if (effect.action === 'ramp') {
            if (player.deck.length > 0) {
                const card = player.deck.pop()!;
                const facedown = effect.params?.facedown || false;
                const exerted = effect.params?.exerted || false;

                card.zone = ZoneType.Inkwell;
                card.ready = !exerted;
                card.meta = { ...card.meta, facedown: facedown };

                player.inkwell.push(card);
                this.logger.effect(player.name, `Ramped ${card.name} into inkwell.`);
            } else {
                this.logger.debug(`[${player.name}] Deck is empty, cannot Ramp.`);
            }
        }
        // Opponent Discard (Daisy Duck - Musketeer Spy, Cursed Merfolk)
        else if (effect.action === 'opponent_discard' || effect.action === 'all_opponents_discard') {
            // Get all opponents
            const opponents = Object.values(this.game.state.players).filter(p => p.id !== player.id);

            opponents.forEach(opponent => {
                if (opponent.hand.length > 0) {
                    // In a real game, opponent would choose which card to discard
                    // For now, randomly discard a card
                    const randomIndex = Math.floor(Math.random() * opponent.hand.length);
                    const discardedCard = opponent.hand[randomIndex];

                    opponent.hand = opponent.hand.filter((_, i) => i !== randomIndex);
                    discardedCard.zone = ZoneType.Discard;
                    opponent.discard.push(discardedCard);
                    this.trackZoneChange(discardedCard, ZoneType.Hand, ZoneType.Discard);

                    this.logger.effect(opponent.name, `Discarded ${discardedCard.name} (forced by ${sourceCard?.name}).`);
                } else {
                    this.logger.debug(`[${opponent.name}] No cards in hand to discard.`);
                }
            });
        }
        // Prevent Damage (Rapunzel)
        else if (effect.action === 'prevent_damage') {
            if (targetCard) {
                if (!targetCard.damageShields) targetCard.damageShields = [];
                targetCard.damageShields.push({
                    amount: effect.amount,
                    duration: effect.duration,
                    usage: effect.usage,
                    sourceId: sourceCard?.instanceId || '',
                    sourcePlayerId: player.id
                });
                this.logger.effect(player.name, `Applied Damage Shield to ${targetCard.name}.`);
            }
        }
        // Reveal and Guess (Bruno Madrigal)
        else if (effect.action === 'reveal_and_guess') {
            const guessType = effect.params?.guessType;
            const matchAction = effect.params?.matchAction;
            const matchLore = effect.params?.matchLore;
            const missAction = effect.params?.missAction;

            if (guessType === 'name') {
                const namedCard = payload?.namedCard;
                if (!namedCard) {
                    this.logger.debug(`[${player.name}] No card named for ability.`);
                    return;
                }
                this.logger.action(player.name, `Named: "${namedCard}"`);

                if (player.deck.length > 0) {
                    // Reveal top card
                    const revealedCard = player.deck.pop()!;
                    this.logger.info(`[${player.name}] Revealed: ${revealedCard.fullName}`);

                    if (revealedCard.fullName === namedCard || revealedCard.name === namedCard) {
                        this.logger.info(`[${player.name}] Correct Guess!`);
                        if (matchAction === 'hand_and_lore') {
                            // Put in hand
                            player.addCardToZone(revealedCard, ZoneType.Hand);
                            // Gain Lore
                            if (matchLore) {
                                player.lore += matchLore;
                                this.logger.effect(player.name, `Gained ${matchLore} lore.`);
                            }
                        }
                    } else {
                        this.logger.info(`[${player.name}] Incorrect Guess.`);
                        if (missAction === 'top_of_deck') {
                            // Put back on top
                            player.deck.push(revealedCard);
                            this.logger.info(`[${player.name}] Returned ${revealedCard.name} to top of deck.`);
                        }
                    }
                } else {
                    this.logger.debug(`[${player.name}] Deck is empty, cannot reveal.`);
                }
            }
        }
        // Discard to Return (The Queen - Conceited Ruler)
        else if (effect.action === 'discard_to_return_from_discard') {
            const discardFilter = effect.params?.discardFilter;
            const returnFilter = effect.params?.returnFilter;
            const discardCardId = payload?.discardCardId;
            const returnCardId = payload?.returnCardId;

            if (!discardCardId || !returnCardId) {
                this.logger.debug(`[${player.name}] Missing discard or return card selection.`);
                return;
            }

            // 1. Validate Discard
            const cardToDiscard = player.hand.find(c => c.instanceId === discardCardId);
            if (!cardToDiscard) {
                this.logger.debug(`[${player.name}] Card to discard not found in hand.`);
                return;
            }

            // Check filter (Princess or Queen)
            if (discardFilter && discardFilter.subtypes) {
                const hasSubtype = discardFilter.subtypes.some((s: string) => cardToDiscard.subtypes.includes(s));
                if (!hasSubtype) {
                    this.logger.debug(`[${player.name}] Selected card ${cardToDiscard.name} does not match discard filter (Expected: ${discardFilter.subtypes.join(' or ')}).`);
                    return;
                }
            }

            // 2. Validate Return
            const cardToReturn = player.discard.find(c => c.instanceId === returnCardId);
            if (!cardToReturn) {
                this.logger.debug(`[${player.name}] Card to return not found in discard.`);
                return;
            }

            // Check filter (Character)
            if (returnFilter && returnFilter.type) {
                if (cardToReturn.type !== returnFilter.type) {
                    this.logger.debug(`[${player.name}] Selected card ${cardToReturn.name} does not match return filter (Expected: ${returnFilter.type}).`);
                    return;
                }
            }

            // Execute
            // Discard
            player.hand = player.hand.filter(c => c.instanceId !== discardCardId);
            cardToDiscard.zone = ZoneType.Discard;
            player.discard.push(cardToDiscard);
            this.logger.action(player.name, `Discarded ${cardToDiscard.name}.`);

            // Return
            player.discard = player.discard.filter(c => c.instanceId !== returnCardId);
            cardToReturn.zone = ZoneType.Hand;
            player.hand.push(cardToReturn);
            this.trackZoneChange(cardToReturn, ZoneType.Discard, ZoneType.Hand); // Track zone change
            this.logger.action(player.name, `Returned ${cardToReturn.name} from discard to hand.`);
        }
        // Return from Discard to Top of Deck (Gazelle)
        else if (effect.action === 'return_from_discard_to_top_deck') {
            if (targetCard) {
                // Validate target is in discard
                const cardInDiscard = player.discard.find(c => c.instanceId === targetCard.instanceId);
                if (!cardInDiscard) {
                    this.logger.debug(`[${player.name}] Target card ${targetCard.name} is not in discard.`);
                    return;
                }

                // Validate filter (e.g. Song)
                if (effect.params?.filter?.subtype) {
                    if (!cardInDiscard.subtypes.includes(effect.params.filter.subtype)) {
                        this.logger.debug(`[${player.name}] Target card ${targetCard.name} is not a ${effect.params.filter.subtype}.`);
                        return;
                    }
                }

                // Move to top of deck
                player.discard = player.discard.filter(c => c.instanceId !== targetCard.instanceId);
                cardInDiscard.zone = ZoneType.Deck;
                player.deck.push(cardInDiscard);
                this.trackZoneChange(cardInDiscard, ZoneType.Discard, ZoneType.Deck); // Track zone change
                this.logger.action(player.name, `Returned ${cardInDiscard.name} from discard to top of deck.`);
            } else {
                // If optional and no target, just log
                if (effect.params?.optional) {
                } else {
                    this.logger.debug(`[${player.name}] No target for return_from_discard_to_top_deck.`);
                }
            }
        }
        // Conditional Return from Discard (Pluto - Clever Cluefinder)
        else if (effect.action === 'conditional_return_from_discard') {
            // Check condition
            const condition = effect.params?.condition;
            const hasSubtype = condition?.type === 'has_subtype_in_play'
                ? this.hasSubtypeInPlay(player, condition.subtype)
                : false;

            this.logger.debug(`[Conditional Check] Has ${condition?.subtype} in play: ${hasSubtype}`);

            // Get target card from payload
            const targetCardId = payload?.targetCardId;
            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No target card selected for conditional return.`);
                return;
            }

            // Validate card is in discard
            const cardInDiscard = player.discard.find(c => c.instanceId === targetCardId);
            if (!cardInDiscard) {
                this.logger.debug(`[${player.name}] Card not found in discard.`);
                return;
            }

            // Validate card matches filter (Item)
            const filter = effect.params?.trueEffect?.filter;
            if (filter?.type && cardInDiscard.type !== filter.type) {
                this.logger.debug(`[${player.name}] Selected card ${cardInDiscard.name} is not a ${filter.type}.`);
                return;
            }

            // Remove from discard
            player.discard = player.discard.filter(c => c.instanceId !== targetCardId);

            // Execute appropriate branch
            if (hasSubtype) {
                // True branch: Return to hand
                cardInDiscard.zone = ZoneType.Hand;
                player.hand.push(cardInDiscard);
                this.trackZoneChange(cardInDiscard, ZoneType.Discard, ZoneType.Hand);
                this.logger.action(player.name, `Returned ${cardInDiscard.name} to hand (${condition?.subtype} in play)`);
            } else {
                // False branch: Return to top of deck
                cardInDiscard.zone = ZoneType.Deck;
                player.deck.push(cardInDiscard);
                this.trackZoneChange(cardInDiscard, ZoneType.Discard, ZoneType.Deck);
                this.logger.action(player.name, `Put ${cardInDiscard.name} on top of deck (no ${condition?.subtype})`);
            }
        }

        // Conditional play from discard (Lady Tremaine)
        else if (effect.action === 'conditional_play_from_discard') {
            // Get selected action card from payload
            const targetCardId = payload?.targetCardId;
            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No action selected to play from discard.`);
                return;
            }

            // Find card in discard
            const actionCard = player.discard.find(c => c.instanceId === targetCardId);
            if (!actionCard) {
                this.logger.debug(`[${player.name}] Card not found in discard.`);
                return;
            }

            // Validate filter (Action, cost 5 or less)
            const filter = effect.params?.filter;
            if (filter?.type && actionCard.type !== filter.type) {
                this.logger.debug(`[${player.name}] Selected card ${actionCard.name} is not a ${filter.type}.`);
                return;
            }
            if (filter?.maxCost !== undefined && actionCard.cost > filter.maxCost) {
                this.logger.debug(`[${player.name}] Selected card ${actionCard.name} costs ${actionCard.cost}, max is ${filter.maxCost}.`);
                return;
            }

            // Remove from discard
            player.discard = player.discard.filter(c => c.instanceId !== targetCardId);

            this.logger.action(player.name, `Playing ${actionCard.name} from discard for free`);

            // Resolve action effects
            if (actionCard.parsedEffects) {
                actionCard.parsedEffects.forEach(eff => {
                    this.resolveEffect(player, eff, actionCard);
                });
            }

            // Send to alternate destination (bottom of deck instead of discard)
            const destination = effect.params?.destination;
            if (destination === 'bottom_of_deck') {
                actionCard.zone = ZoneType.Deck;
                player.deck.unshift(actionCard); // unshift = add to beginning (bottom)
                this.logger.action(player.name, `Placed ${actionCard.name} on bottom of deck`);
            } else {
                // Default: return to discard
                actionCard.zone = ZoneType.Discard;
                player.discard.push(actionCard);
            }
        }
        // Draw then Discard (Hudson)
        else if (effect.action === 'draw_then_discard') {
            // 1. Draw
            if (player.deck.length > 0) {
                const drawn = player.deck.pop()!;
                player.addCardToZone(drawn, ZoneType.Hand);
                this.logger.action(player.name, `Drew a card`);
            }

            // 2. Discard
            // If payload has a choice, use it. Otherwise, random (for now/AI).
            // In a real game, we'd need to prompt if no payload.
            if (player.hand.length > 0) {
                let cardToDiscard: CardInstance | undefined;

                if (payload?.discardCardId) {
                    cardToDiscard = player.hand.find(c => c.instanceId === payload.discardCardId);
                }

                if (!cardToDiscard) {
                    // Fallback: Random discard (or first card)
                    // Ideally we error if interactive, but for AI/Test we might default
                    // Let's default to random to ensure effect completes
                    const randomIndex = Math.floor(Math.random() * player.hand.length);
                    cardToDiscard = player.hand[randomIndex];
                }

                if (cardToDiscard) {
                    player.hand = player.hand.filter(c => c.instanceId !== cardToDiscard!.instanceId);
                    cardToDiscard.zone = ZoneType.Discard;
                    player.discard.push(cardToDiscard);
                    this.trackZoneChange(cardToDiscard, ZoneType.Hand, ZoneType.Discard);
                    this.logger.action(player.name, `Discarded ${cardToDiscard.name}`);
                }
            }
        }
        // Discard to Deal Damage (David Xanatos)
        else if (effect.action === 'discard_to_deal_damage') {
            // Check if optional and no selection made
            const discardCardId = payload?.discardCardId;
            const targetCardId = payload?.targetCardId;

            if (effect.params?.optional && !discardCardId) {
                this.logger.debug(`[${player.name}] Skipped optional ability: ${effect.rawText}`);
                return;
            }

            if (!discardCardId || !targetCardId) {
                this.logger.debug(`[${player.name}] Missing discard or target selection for ability.`);
                return;
            }

            // 1. Validate Discard
            const cardToDiscard = player.hand.find(c => c.instanceId === discardCardId);
            if (!cardToDiscard) {
                this.logger.debug(`[${player.name}] Card to discard not found in hand.`);
                return;
            }

            // 2. Validate Target
            // Find target in any player's play area
            let targetChar: CardInstance | undefined;
            const opponents = Object.values(this.game.state.players).filter(p => p.id !== player.id);
            // Check opponents first (usual case)
            for (const opp of opponents) {
                targetChar = opp.play.find(c => c.instanceId === targetCardId);
                if (targetChar) break;
            }
            // Check self if not found (can target own?)
            if (!targetChar) {
                targetChar = player.play.find(c => c.instanceId === targetCardId);
            }

            if (!targetChar) {
                this.logger.debug(`[${player.name}] Target character not found.`);
                return;
            }

            // Execute
            // Discard
            player.hand = player.hand.filter(c => c.instanceId !== discardCardId);
            cardToDiscard.zone = ZoneType.Discard;
            player.discard.push(cardToDiscard);
            this.trackZoneChange(cardToDiscard, ZoneType.Hand, ZoneType.Discard);
            this.logger.action(player.name, `Discarded ${cardToDiscard.name}`);

            // Deal Damage
            const damage = effect.amount || 0;
            this.applyDamage(player, targetChar, damage, sourceCard?.instanceId);
        }
        // Balance Hand (Goliath)
        else if (effect.action === 'balance_hand') {
            // Target is the active player (passed in payload)
            const activePlayerId = payload?.activePlayerId;
            const targetPlayer = activePlayerId ? this.game.getPlayer(activePlayerId) : player;

            if (!targetPlayer) return;

            const targetAmount = effect.amount || 2;
            const handSize = targetPlayer.hand.length;

            if (handSize > targetAmount) {
                // Discard down to targetAmount
                const toDiscardCount = handSize - targetAmount;
                this.logger.info(targetPlayer.name, `Hand size ${handSize} > ${targetAmount}. Discarding ${toDiscardCount} cards.`);

                // For now, random discard (since we can't easily prompt in end phase yet)
                // In future, we'd need a way to queue decision requests.
                for (let i = 0; i < toDiscardCount; i++) {
                    if (targetPlayer.hand.length > 0) {
                        const randomIndex = Math.floor(Math.random() * targetPlayer.hand.length);
                        const card = targetPlayer.hand[randomIndex];
                        targetPlayer.hand.splice(randomIndex, 1);
                        card.zone = ZoneType.Discard;
                        targetPlayer.discard.push(card);
                        this.trackZoneChange(card, ZoneType.Hand, ZoneType.Discard);
                        this.logger.action(targetPlayer.name, `Discarded ${card.name} (Balance Hand)`);
                    }
                }
            } else if (handSize < targetAmount) {
                // Draw up to targetAmount
                const toDrawCount = targetAmount - handSize;
                this.logger.info(targetPlayer.name, `Hand size ${handSize} < ${targetAmount}. Drawing ${toDrawCount} cards.`);

                for (let i = 0; i < toDrawCount; i++) {
                    if (targetPlayer.deck.length > 0) {
                        const card = targetPlayer.deck.pop()!;
                        // Move card to hand (don't create duplicate!)
                        card.zone = ZoneType.Hand;
                        targetPlayer.hand.push(card);
                        this.logger.action(targetPlayer.name, `Drew a card (Balance Hand)`);
                    }
                }
            }
        }
        // Play from Discard to Bottom of Deck (Max Goof)
        else if (effect.action === 'play_from_discard_bottom_deck') {
            const targetCardId = payload?.targetCardId;
            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No song selected to play from discard.`);
                return;
            }

            const cardToPlay = player.discard.find(c => c.instanceId === targetCardId);
            if (!cardToPlay) {
                this.logger.debug(`[${player.name}] Selected card not found in discard.`);
                return;
            }

            // Validate Cost
            const costLimit = effect.params?.costLimit || 0;
            if (cardToPlay.cost > costLimit) {
                this.logger.debug(`[${player.name}] Selected card cost ${cardToPlay.cost} exceeds limit ${costLimit}.`);
                return;
            }

            // Validate Filter (Song)
            const filter = effect.params?.filter;
            if (filter && filter.subtype === 'Song') {
                if (!cardToPlay.subtypes.includes('Song')) {
                    this.logger.debug(`[${player.name}] Selected card is not a Song.`);
                    return;
                }
            }

            // Play the card
            this.logger.action(player.name, `Playing ${cardToPlay.name} from discard (Free)`);

            // Remove from discard temporarily to play it
            player.discard = player.discard.filter(c => c.instanceId !== cardToPlay.instanceId);

            // Execute play logic (simplified)
            // In a real engine, we'd call playCard, but we need to handle the "bottom of deck" replacement.
            // If we call playCard, it might go to discard after resolution.
            // We need to intercept where it goes.
            // For Actions/Songs, playCard puts them in discard.
            // We can manually resolve the action effects and then put it on bottom of deck.

            // 1. Resolve effects of the played song
            if (cardToPlay.parsedEffects) {
                cardToPlay.parsedEffects.forEach(songEffect => {
                    // Assuming immediate resolution for now
                    this.resolveEffect(player, songEffect, cardToPlay);
                });
            }

            // 2. Put on bottom of deck
            cardToPlay.zone = ZoneType.Deck;
            player.deck.unshift(cardToPlay); // unshift adds to start (bottom of stack?)
            // Usually push adds to top (end). pop takes from top.
            // So unshift adds to bottom (index 0).
            this.trackZoneChange(cardToPlay, ZoneType.Discard, ZoneType.Deck);
            this.logger.action(player.name, `Put ${cardToPlay.name} on bottom of deck`);
        }
        // Pay Ink to Return from Discard (Max Goof - Rebellious Teen)
        else if (effect.action === 'pay_ink_to_return_from_discard') {
            const targetCardId = payload?.targetCardId;

            // Optional check
            if (effect.params?.optional && !targetCardId) {
                this.logger.debug(`[${player.name}] Skipped optional ability (Pay Ink to Return).`);
                return;
            }

            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No card selected to return from discard.`);
                return;
            }

            const cardToReturn = player.discard.find(c => c.instanceId === targetCardId);
            if (!cardToReturn) {
                this.logger.debug(`[${player.name}] Selected card not found in discard.`);
                return;
            }

            // Validate Ink Cost
            const inkCost = effect.params?.inkCost || 0;
            const readyInk = player.inkwell.filter(c => c.ready).length;
            if (readyInk < inkCost) {
                this.logger.debug(`[${player.name}] Not enough ink to pay cost ${inkCost}.`);
                return;
            }

            // Validate Filter (Song, Cost)
            const filter = effect.params?.filter;
            if (filter) {
                if (filter.subtype === 'Song' && !cardToReturn.subtypes.includes('Song')) {
                    this.logger.debug(`[${player.name}] Selected card is not a Song.`);
                    return;
                }
                if (filter.maxCost !== undefined && cardToReturn.cost > filter.maxCost) {
                    this.logger.debug(`[${player.name}] Selected card cost ${cardToReturn.cost} exceeds limit ${filter.maxCost}.`);
                    return;
                }
            }

            // Pay Ink
            let paid = 0;
            for (const ink of player.inkwell) {
                if (ink.ready && paid < inkCost) {
                    ink.ready = false;
                    paid++;
                }
            }
            this.logger.action(player.name, `Paid ${inkCost} ink`);

            // Return to Hand
            player.discard = player.discard.filter(c => c.instanceId !== cardToReturn.instanceId);
            player.addCardToZone(cardToReturn, ZoneType.Hand);
            this.logger.action(player.name, `Returned ${cardToReturn.name} from discard to hand`);
        }
        // Opponent Reveal and Discard (Ursula - Deceiver)
        else if (effect.action === 'opponent_reveal_and_discard') {
            let targetPlayerId = payload?.targetPlayerId;
            const targetCardId = payload?.targetCardId;

            // Auto-select opponent if only one exists
            const opponents = Object.values(this.game.state.players).filter(p => p.id !== player.id);
            if (!targetPlayerId) {
                if (opponents.length === 1) {
                    targetPlayerId = opponents[0].id;
                    this.logger.debug(`[${player.name}] Auto-selected single opponent: ${opponents[0].name}`);
                } else {
                    this.logger.debug(`[${player.name}] No opponent selected (Multiple opponents available).`);
                    return;
                }
            }

            const opponent = this.game.getPlayer(targetPlayerId);
            if (!opponent) {
                this.logger.debug(`[${player.name}] Opponent not found.`);
                return;
            }

            // Log reveal (hand is already visible in this implementation, but we'll log it)
            this.logger.info(player.name, `Opponent ${opponent.name} reveals their hand (${opponent.hand.length} cards)`);

            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No card selected to discard.`);
                return;
            }

            const cardToDiscard = opponent.hand.find(c => c.instanceId === targetCardId);
            if (!cardToDiscard) {
                this.logger.debug(`[${player.name}] Selected card not found in opponent's hand.`);
                return;
            }

            // Validate Filter (Song)
            const filter = effect.params?.filter;
            if (filter && filter.subtype === 'Song') {
                if (!cardToDiscard.subtypes.includes('Song')) {
                    this.logger.debug(`[${player.name}] Selected card is not a Song.`);
                    return;
                }
            }

            // Discard from opponent's hand
            opponent.hand = opponent.hand.filter(c => c.instanceId !== cardToDiscard.instanceId);
            opponent.addCardToZone(cardToDiscard, ZoneType.Discard);
            this.logger.action(player.name, `Forced ${opponent.name} to discard ${cardToDiscard.name}`);
        }
        // All Opponents Discard (Daisy Duck)
        else if (effect.action === 'all_opponents_discard') {
            const discards = payload?.discards || {};

            // Get all opponent player IDs
            const allPlayerIds = Object.keys(this.game.state.players);
            const opponentIds = allPlayerIds.filter(id => id !== player.id);

            opponentIds.forEach(opponentId => {
                const opponent = this.game.getPlayer(opponentId);
                if (!opponent) return;

                const targetCardId = discards[opponentId];

                // If opponent has no cards or no card selected, skip
                if (opponent.hand.length === 0) {
                    this.logger.debug(`[${opponent.name}] has no cards to discard.`);
                    return;
                }

                if (!targetCardId) {
                    // Random discard if no choice provided
                    if (opponent.hand.length > 0) {
                        const randomCard = opponent.hand[Math.floor(Math.random() * opponent.hand.length)];
                        randomCard.zone = ZoneType.Discard;
                        opponent.discard.push(randomCard);
                        this.logger.action(opponent.name, `discarded ${randomCard.name} (random)`);
                    }
                    return;
                }

                const cardToDiscard = opponent.hand.find(c => c.instanceId === targetCardId);
                if (!cardToDiscard) {
                    this.logger.debug(`[${opponent.name}] Selected card not found in hand.`);
                    return;
                }

                // Discard the chosen card
                opponent.hand = opponent.hand.filter(c => c.instanceId !== cardToDiscard.instanceId);
                opponent.addCardToZone(cardToDiscard, ZoneType.Discard);
                this.logger.action(opponent.name, `discarded ${cardToDiscard.name}`);
            });
        }
        // Conditional Draw/Discard/Banish (Scar)
        else if (effect.action === 'conditional_draw_discard_banish') {
            // Check condition: is Scar (the card with this effect) exerted?
            if (effect.params?.condition === 'self_exerted' && sourceCard && sourceCard.ready) {
                // Scar is not exerted, skip
                this.logger.debug(`[${player.name}] Scar is ready, end-of-turn effect skipped.`);
                return;
            }

            const targetCardId = payload?.targetCardId;
            const discardCardIds = payload?.discardCardIds || [];

            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No Ally chosen for Scar's ability.`);
                return;
            }

            const allyTarget = player.play.find(c => c.instanceId === targetCardId);
            if (!allyTarget) {
                this.logger.debug(`[${player.name}] Chosen Ally not found in play.`);
                return;
            }

            // Validate it's an Ally
            if (!allyTarget.subtypes.includes('Ally')) {
                this.logger.debug(`[${player.name}] Chosen character is not an Ally.`);
                return;
            }

            // Draw cards equal to Ally's willpower
            const drawAmount = allyTarget.willpower || 0;
            this.logger.effect(player.name, `Drawing ${drawAmount} cards (Ally willpower)`);
            for (let i = 0; i < drawAmount; i++) {
                if (player.deck.length > 0) {
                    const card = player.deck.pop()!;
                    // Move card to hand (don't create duplicate!)
                    card.zone = ZoneType.Hand;
                    player.hand.push(card);
                }
            }

            // Discard specified cards
            const discardAmount = effect.params?.discardAmount || 2;
            if (discardCardIds.length < discardAmount) {
                this.logger.debug(`[${player.name}] Not enough cards selected for discard (need ${discardAmount}).`);
                return;
            }

            for (let i = 0; i < discardAmount; i++) {
                const cardId = discardCardIds[i];
                const cardToDiscard = player.hand.find(c => c.instanceId === cardId);
                if (cardToDiscard) {
                    player.hand = player.hand.filter(c => c.instanceId !== cardId);
                    player.addCardToZone(cardToDiscard, ZoneType.Discard);
                    this.logger.action(player.name, `Discarded ${cardToDiscard.name}`);
                } else {
                    this.logger.debug(`[${player.name}] Card ${cardId} not found in hand for discard.`);
                }
            }

            // Banish the Ally
            if (effect.params?.banishTarget) {
                player.play = player.play.filter(c => c.instanceId !== allyTarget.instanceId);
                // Banished cards typically go out of the game, not to discard
                this.logger.effect(player.name, `Banished ${allyTarget.name}`);
            }
        }
        // Discard to Buff Challenger (Jasmine)
        else if (effect.action === 'discard_to_buff_challenger') {
            const discardCardId = payload?.discardCardId;

            if (!discardCardId) {
                this.logger.debug(`[${player.name}] No card selected for discard.`);
                return;
            }

            const cardToDiscard = player.hand.find(c => c.instanceId === discardCardId);
            if (!cardToDiscard) {
                this.logger.debug(`[${player.name}] Selected card not found in hand.`);
                return;
            }

            // Discard the card
            player.hand = player.hand.filter(c => c.instanceId !== discardCardId);
            player.addCardToZone(cardToDiscard, ZoneType.Discard);
            this.logger.action(player.name, `Discarded ${cardToDiscard.name} to activate ability`);

            // Add Challenger +3 buff until end of turn
            if (!sourceCard) return;

            const amount = effect.params?.amount || 3;
            sourceCard.strength = (sourceCard.strength || 0) + amount;

            this.logger.effect(player.name, `${sourceCard.name} gains Challenger +${amount} this turn`);
        }
        // Draw then Discard (Tinker Bell, similar to Hudson but activated)
        else if (effect.action === 'draw_then_discard') {
            // Draw a card
            if (player.deck.length > 0) {
                const drawn = player.deck.pop()!;
                player.addCardToZone(drawn, ZoneType.Hand);
                this.logger.action(player.name, `Drew a card`);
            } else {
                this.logger.debug(`[${player.name}] Deck is empty, cannot draw.`);
                return;
            }

            // Discard a card (from payload)
            const discardCardId = payload?.discardCardId;
            if (!discardCardId) {
                this.logger.debug(`[${player.name}] No card selected for discard.`);
                return;
            }

            const cardToDiscard = player.hand.find(c => c.instanceId === discardCardId);
            if (!cardToDiscard) {
                this.logger.debug(`[${player.name}] Selected card not found in hand.`);
                return;
            }

            player.hand = player.hand.filter(c => c.instanceId !== discardCardId);
            player.addCardToZone(cardToDiscard, ZoneType.Discard);
            this.logger.action(player.name, `Discarded ${cardToDiscard.name}`);
        }
        // Return Named Card from Discard (Captain Hook)
        else if (effect.action === 'return_named_card_from_discard') {
            const targetName = effect.params?.cardName || 'Fire the Cannons!';
            const targetType = effect.params?.cardType;

            // Find the card in discard
            const targetCard = player.discard.find(c => {
                const nameMatches = c.name === targetName || c.fullName === targetName;
                const typeMatches = !targetType || c.type === targetType;
                return nameMatches && typeMatches;
            });

            if (targetCard) {
                player.discard = player.discard.filter(c => c.instanceId !== targetCard.instanceId);
                player.addCardToZone(targetCard, ZoneType.Hand);
                this.logger.action(player.name, `Returned ${targetCard.name} from discard to hand`);
            } else {
                this.logger.debug(`[${player.name}] ${targetName} not found in discard.`);
            }
        }
        // Return Item from Discard (Merlin's Carpetbag)
        else if (effect.action === 'return_item_from_discard') {
            const targetCardId = payload?.targetCardId;

            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No item selected from discard.`);
                return;
            }

            // Find the card in discard
            const targetCard = player.discard.find(c => c.instanceId === targetCardId);

            if (!targetCard) {
                this.logger.debug(`[${player.name}] Card not found in discard.`);
                return;
            }

            // Verify it's an item
            if (targetCard.type !== 'Item') {
                this.logger.debug(`[${player.name}] Selected card is not an item.`);
                return;
            }

            // Return to hand
            player.discard = player.discard.filter(c => c.instanceId !== targetCardId);
            player.addCardToZone(targetCard, ZoneType.Hand);
            this.logger.action(player.name, `Returned ${targetCard.name} from discard to hand`);
        // Reduce Cost of Next Card (Lantern)
        else if (effect.action === 'reduce_cost_next_card') {
            const amount = effect.amount || 1;
            const filter = effect.params?.filter || 'character'; // Default to character if not specified (Lantern is character)

            if (!player.costReductions) player.costReductions = [];

            // Check if reduction is restricted to specific cards
            // Lantern: "The next character you play this turn costs 1 less."
            player.costReductions.push({
                amount: amount,
                duration: 'one_use', // Next card only
                filter: filter,
                sourceId: sourceCard?.instanceId || ''
            });

            this.logger.effect(player.name, `Next ${filter} played costs ${amount} less.`);
        }
        // Play Card for Free (Just in Time)
        else if (effect.action === 'play_free_card') {
            let targetCardId = payload?.targetCardId;
            
            // If no target selected yet, prompt user
            if (!targetCardId) {
                // Filter valid cards in hand
                const filter = effect.params?.filter; // 'action', 'character', etc.
                const maxCost = effect.params?.costLimit || 99; // Default high if no limit
                
                const validCards = player.hand.filter(c => {
                   if (c.cost > maxCost) return false;
                   if (filter && c.type.toLowerCase() !== filter.toLowerCase()) return false;
                   // Add more filters if needed (e.g. subtypes)
                   return true;
                });
                
                if (validCards.length === 0) {
                    this.logger.debug(`[${player.name}] No valid cards to play for free.`);
                    return;
                }
                
                if (this.requestChoice) {
                     const choice: ChoiceRequest = {
                        id: `play_free_${Date.now()}`,
                        type: ChoiceType.TARGET_CARD,
                        playerId: player.id,
                        prompt: "Choose a card to play for free",
                        options: validCards.map(c => ({
                            id: c.instanceId,
                            display: c.name,
                            card: c,
                            valid: true
                        })),
                        min: 1, // Usually optional? "You may play..."
                        // If optional, we should add a "Pass" option or allow min: 0
                        // But for now assuming triggered implies "may" handled by "Pass" button in UI or choice
                        // For API, optional means min can be 0? 
                        // Let's assume min 0 and checking length.
                        max: 1,
                        source: {
                            card: sourceCard,
                            effect: effect,
                            player: player
                        }
                    };
                    
                    try {
                        const response = await this.requestChoice(choice);
                        if (response.selectedIds && response.selectedIds.length > 0) {
                            targetCardId = response.selectedIds[0];
                        }
                    } catch (e) {
                        this.logger.debug(`[${player.name}] Choice request failed.`);
                        return;
                    }
                }
            }

            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No card selected to play for free.`);
                return;
            }

            // Find in hand (usually) or discard/deck if specified? Default hand.
            const cardToPlay = player.hand.find(c => c.instanceId === targetCardId);

            if (!cardToPlay) {
                 this.logger.debug(`[${player.name}] Selected card not found in hand.`);
                 return;
            }

            // Validate constraints (e.g. cost limit)
            const maxCost = effect.params?.costLimit || 5;
             if (cardToPlay.cost > maxCost) {
                this.logger.debug(`[${player.name}] Selected card cost ${cardToPlay.cost} exceeds limit ${maxCost}.`);
                return;
            }

            // Play it!
            this.logger.action(player.name, `Playing ${cardToPlay.name} for free via effect.`);
            // We need to call executePlayCard, but since resolveEffect is in TurnManager,
            // and playCard is on TurnManager, we can call it.
            this.playCard(player.id, cardToPlay.instanceId, undefined, undefined, undefined, payload, undefined, { free: true });
        }
        // Return to Inkwell (Ludwig Von Drake - on banished)
        else if (effect.action === 'return_to_inkwell') {
             // Target is usually 'self' for on_banished triggers
             let target = targetCard;
             if (effect.target === 'self') {
                 target = sourceCard;
             }

             if (!target) {
                 this.logger.debug(`[${player.name}] No target for return_to_inkwell.`);
                 return;
             }

             // Check if it's currently in Discard (since it was just banished)
             // or if we intercept it before it hits discard?
             // Usually on_banished triggers AFTER it hits discard.
             const inDiscard = player.discard.find(c => c.instanceId === target!.instanceId);

             if (inDiscard) {
                 // Move from Discard to Inkwell
                 player.discard = player.discard.filter(c => c.instanceId !== target!.instanceId);
                 
                 inDiscard.zone = ZoneType.Inkwell;
                 inDiscard.ready = false; // "exerted"
                 player.inkwell.push(inDiscard);
                 this.trackZoneChange(inDiscard, ZoneType.Discard, ZoneType.Inkwell);
                 
                 this.logger.effect(player.name, `Put ${inDiscard.name} into Inkwell (exerted).`);
             } else {
                 this.logger.debug(`[${player.name}] Card ${target.name} not found in discard for return_to_inkwell.`);
             }
        }
        // Opponent Reveal and Discard Non-Character (Mowgli - Man Cub)
        else if (effect.action === 'opponent_reveal_discard_non_character') {
            let opponentId = payload?.opponentId;

            // Auto-select opponent if only one exists
            const opponents = Object.values(this.game.state.players).filter(p => p.id !== player.id);
            if (!opponentId) {
                if (opponents.length === 1) {
                    opponentId = opponents[0].id;
                    this.logger.debug(`[${player.name}] Auto-selected single opponent: ${opponents[0].name}`);
                } else {
                    this.logger.debug(`[${player.name}] No opponent specified.`);
                    return;
                }
            }

            const opponent = this.game.getPlayer(opponentId);
            this.logger.info(player.name, `${opponent.name} reveals their hand: ${opponent.hand.map(c => c.name).join(', ')}`);

            // Find non-character cards in opponent's hand
            const nonCharacterCards = opponent.hand.filter(c => c.type !== 'Character');

            // Step 1: Show revealed hand to the ability owner (player) with info about what can be discarded
            if (this.requestChoice) {
                const revealRequest = {
                    id: 'reveal_hand_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    type: 'reveal_hand' as any,
                    playerId: player.id, // Ability owner sees the revealed hand
                    prompt: nonCharacterCards.length > 0
                        ? `${opponent.name}'s hand revealed. They must discard a non-character card.`
                        : `${opponent.name}'s hand revealed. No non-character cards to discard!`,
                    options: [{ id: 'acknowledge', display: 'OK', valid: true }],
                    source: {
                        card: sourceCard,
                        abilityName: effect.name || 'Reveal Hand',
                        player: opponent
                    },
                    context: {
                        revealedCards: opponent.hand,
                        validTargets: nonCharacterCards,
                        noValidTargets: nonCharacterCards.length === 0
                    },
                    min: 1,
                    max: 1,
                    timestamp: Date.now()
                };

                try {
                    await this.requestChoice(revealRequest);
                } catch (e) {
                    // Ignore if handler doesn't acknowledge
                }
            }

            // Step 2: If no non-character cards, nothing to discard - the reveal was informational
            if (nonCharacterCards.length === 0) {
                this.logger.info(player.name, `${opponent.name} has no non-character cards to discard.`);
                return;
            }

            // Step 3: Opponent chooses a non-character card to discard
            if (this.requestChoice) {
                const discardOptions = nonCharacterCards.map(card => ({
                    id: card.instanceId,
                    display: `${card.name} (${card.type})`,
                    card: card,
                    valid: true
                }));

                const discardRequest = {
                    id: 'discard_choice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    type: 'target_card' as any,
                    playerId: opponent.id, // Opponent makes this choice
                    prompt: `Choose a non-character card to discard:`,
                    options: discardOptions,
                    source: {
                        card: sourceCard,
                        abilityName: effect.name || 'Discard Non-Character',
                        player: player
                    },
                    min: 1,
                    max: 1,
                    timestamp: Date.now()
                };

                const response = await this.requestChoice(discardRequest);
                const discardCardId = response.selectedIds[0];

                if (discardCardId) {
                    const cardToDiscard = opponent.hand.find(c => c.instanceId === discardCardId);
                    if (cardToDiscard && cardToDiscard.type !== 'Character') {
                        opponent.hand = opponent.hand.filter(c => c.instanceId !== discardCardId);
                        opponent.addCardToZone(cardToDiscard, ZoneType.Discard);
                        this.logger.action(player.name, `${opponent.name} discarded ${cardToDiscard.name}`);
                    }
                }
            } else {
                // Fallback for bot/test: discard first non-character card
                const cardToDiscard = nonCharacterCards[0];
                opponent.hand = opponent.hand.filter(c => c.instanceId !== cardToDiscard.instanceId);
                opponent.addCardToZone(cardToDiscard, ZoneType.Discard);
                this.logger.action(player.name, `${opponent.name} discarded ${cardToDiscard.name}`);
            }
        }
        // Conditional Gain Lore if Character Damaged (Devil's Eye Diamond)
        // TODO: This effect requires tracking damageDealtThisTurn on CardInstance
        // Currently commented out until the tracking is implemented
        else if (effect.action === 'conditional_gain_lore_if_damaged') {
            const loreAmount = effect.params?.loreAmount || 1;

            // Check if any of player's characters dealt damage this turn
            // TODO: Implement proper turn-based damage tracking (damageDealtThisTurn property)
            // const hasDamagedCharacter = player.play.some(c =>
            //     c.type === CardType.Character && (c.damageDealtThisTurn || 0) > 0
            // );

            // Temporary: Always fail the condition until tracking is implemented
            const hasDamagedCharacter = false;

            if (hasDamagedCharacter) {
                player.lore += loreAmount;
                this.logger.effect(player.name, `Gained ${loreAmount} lore (condition met: character dealt damage this turn). Total lore: ${player.lore}`);
            } else {
                this.logger.debug(`[${player.name}] No damage tracking implemented yet, cannot gain lore.`);
            }
        }
        // Grant Rush Temporary (Mushu's Rocket)
        else if (effect.action === 'grant_rush_temporary') {
            const targetCardId = payload?.targetCardId;

            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No character selected to grant Rush.`);
                return;
            }

            // Find target character in any player's play zone
            let targetCard: CardInstance | undefined;
            let targetOwner: PlayerState | undefined;

            for (const pId of Object.keys(this.game.state.players)) {
                const p = this.game.getPlayer(pId);
                targetCard = p.play.find(c => c.instanceId === targetCardId);
                if (targetCard) {
                    targetOwner = p;
                    break;
                }
            }

            if (!targetCard || !targetOwner) {
                this.logger.debug(`[${player.name}] Target character not found in play.`);
                return;
            }

            // Add Rush keyword temporarily using continuous effect
            const continuousEffect: ContinuousEffect = {
                id: `rush_${Date.now()}_${Math.random()}`,
                type: 'modification',
                target: 'custom',
                targetCardIds: [targetCardId],
                duration: 'until_end_of_turn',
                sourcePlayerId: player.id,
                sourceCardId: sourceCard?.instanceId || '',
                modification: {
                    keywords: ['Rush']
                }
            };

            this.addActiveEffect(continuousEffect);
            this.logger.effect(player.name, `${targetCard.name} gains Rush this turn`);
        }
        // Modify Stats (AoE or Single Target)
        else if (effect.action === 'modify_stats') {
            let target = targetCard;
            if (!target && payload?.targetId) {
                const allCards = Object.values(this.game.state.players).flatMap(p => p.play);
                target = allCards.find(c => c.instanceId === payload.targetId);

                if (target && !this.validateTarget(target, player.id)) {
                    target = undefined;
                }
            }

            if (target && effect.params?.stat && effect.amount) {
                const stat = effect.params.stat; // strength, willpower, lore
                const amount = effect.amount;

                this.addActiveEffect({
                    id: `${sourceCard?.instanceId || 'effect'}_mod_${stat}_${Date.now()}_${Math.random()}`,
                    type: 'modification',
                    modificationType: 'stat_change',
                    target: 'custom',
                    targetCardIds: [target.instanceId],
                    sourceCardId: sourceCard?.instanceId || '',
                    sourcePlayerId: player.id,
                    duration: effect.params.duration || 'until_end_of_turn',
                    params: {
                        stat: stat,
                        amount: amount
                    }
                });
                this.logger.effect(player.name, `Modified ${target.name}'s ${stat} by ${amount}`);
                this.recalculateEffects();
            }
        }
        // Look at Top Deck (Ariel - Spectacular Singer)
        else if (effect.action === 'look_top_deck') {
            const amount = effect.amount || 1;
            const filter = effect.params?.filter; // e.g., 'song'
            const destination = effect.params?.destination || 'hand';

            if (player.deck.length === 0) {
                this.logger.debug(`[${player.name}] Deck is empty, cannot look at top cards.`);
                return;
            }

            // 1. View Top N Cards
            const topCards = player.deck.splice(-amount); // Take from end (top)
            this.logger.info(player.name, `Looking at top ${topCards.length} cards: ${topCards.map(c => c.name).join(', ')}`);

            // 2. Select Card (Simulated: First valid match)
            let selectedIndex = -1;

            if (filter) {
                // Find first card matching filter
                selectedIndex = topCards.findIndex(c => {
                    if (filter === 'song') return c.type === 'Action' && (c.subtypes?.includes('Song') || c.abilities?.some(a => a.fullText.includes('Sing Together'))); // Simplified Song check
                    // Add other filters as needed
                    return c.type.toLowerCase() === filter || c.subtypes?.some(s => s.toLowerCase() === filter);
                });
            } else {
                // No filter, pick first (if allowed? usually "reveal a card")
                // If it's "look at top card and put in hand", pick it.
                selectedIndex = 0;
            }

            // 3. Move Selected to Destination
            if (selectedIndex !== -1) {
                const selectedCard = topCards.splice(selectedIndex, 1)[0];
                this.logger.action(player.name, `Revealed and chose: ${selectedCard.name}`);

                if (destination === 'hand') {
                    player.addCardToZone(selectedCard, ZoneType.Hand);
                }
                // Add other destinations if needed
            } else {
                this.logger.debug(`[${player.name}] No matching card found to reveal.`);
            }

            // 4. Put Rest on Bottom of Deck
            if (topCards.length > 0) {
                // "Put the rest on the bottom of your deck in any order"
                // We'll just put them back at the beginning of the array (bottom)
                // Note: player.deck is a stack, end is top. So unshift puts at bottom.
                topCards.forEach(c => player.deck.unshift(c));
                this.logger.action(player.name, `Put ${topCards.length} cards on the bottom of the deck`);
            }
        }
        // Return from Discard (Hades)
        else if (effect.action === 'recover_from_discard') {
            const filter = effect.params?.filter; // e.g., 'character'

            if (player.discard.length === 0) {
                this.logger.debug(`[${player.name}] Discard is empty.`);
                return;
            }

            // Find valid targets
            const validTargets = player.discard.filter(c => {
                if (!filter || filter === 'card') return true;
                return c.type.toLowerCase() === filter || c.subtypes?.some(s => s.toLowerCase() === filter);
            });

            if (validTargets.length > 0) {
                // Simulate choice: Pick the most recently discarded valid card (last in list)
                const target = validTargets[validTargets.length - 1];

                // Remove from discard
                player.discard = player.discard.filter(c => c.instanceId !== target.instanceId);

                // Move to hand
                target.zone = ZoneType.Hand;
                player.hand.push(target);

                this.logger.action(player.name, `Recovered ${target.name} from discard to hand`);
            } else {
                this.logger.debug(`[${player.name}] No valid targets in discard matching filter: ${filter}.`);
            }
        }
        // Return card from discard to top of deck (Gazelle - Ballad Singer)
        else if (effect.action === 'return_from_discard_to_deck') {
            const filter = effect.params?.filter; // e.g., 'song'
            const targetId = payload?.targetId;

            if (!targetId) {
                this.logger.debug(`[${player.name}] No target selected for return_from_discard_to_deck`);
                return;
            }

            // Find the target card in discard
            const cardInDiscard = player.discard.find(c => c.instanceId === targetId);
            if (!cardInDiscard) {
                this.logger.debug(`[${player.name}] Card ${targetId} not found in discard.`);
                return;
            }

            // Verify it matches the filter (if provided)
            if (filter) {
                const matchesFilter =
                    filter === 'song' ? cardInDiscard.subtypes?.includes('Song') :
                        cardInDiscard.type.toLowerCase() === filter.toLowerCase();

                if (!matchesFilter) {
                    this.logger.debug(`[${player.name}] Selected card ${cardInDiscard.name} is not a ${filter}.`);
                    return;
                }
            }

            // Remove from discard
            player.discard = player.discard.filter(c => c.instanceId !== targetId);

            // Place on TOP of the deck (deck.push adds to end, deck.pop removes from end)
            cardInDiscard.zone = ZoneType.Deck;
            player.deck.push(cardInDiscard);

            this.logger.action(player.name, `Put ${cardInDiscard.name} from discard on top of deck`);
        }

        // Reduce Cost Next Card (Lantern)
        else if (effect.action === 'reduce_cost_next_card') {
            const amount = effect.amount || 1;
            const filter = effect.params?.filter || 'all';

            if (!player.costReductions) player.costReductions = [];

            player.costReductions.push({
                amount: amount,
                filter: filter,
                duration: 'one_use', // Usually "next card" implies one use
                sourceId: sourceCard?.instanceId || 'effect'
            });

            this.logger.effect(player.name, `Next ${filter} card costs ${amount} less`);
        }
        // Play Free Card (Lady Tremaine / Nigel)
        else if (effect.action === 'play_free_card') {
            const maxCost = effect.amount || 99;
            const filter = effect.params?.filter || 'card';

            // Find valid cards in hand
            const validCards = player.hand.filter(c => {
                const typeMatch = filter === 'card' || c.type.toLowerCase() === filter;
                return typeMatch && c.cost <= maxCost;
            });

            if (validCards.length > 0) {
                // Simulate choice: Pick highest cost valid card
                validCards.sort((a, b) => b.cost - a.cost);
                const cardToPlay = validCards[0];

                this.logger.action(player.name, `Playing ${cardToPlay.name} for free`);

                // Add a temporary cost reduction equal to the card's cost to make it free
                // This ensures playCard logic handles it correctly without special flags
                if (!player.costReductions) player.costReductions = [];
                player.costReductions.push({
                    amount: cardToPlay.cost,
                    filter: 'all',
                    duration: 'one_use',
                    sourceId: 'free_play_effect'
                });

                this.playCard(player, cardToPlay.instanceId);
            } else {
                this.logger.debug(`[${player.name}] No valid cards to play for free.`);
            }
        }
        // Return to Inkwell (Ludwig Von Drake on banishment)
        else if (effect.action === 'return_to_inkwell') {
            if (!sourceCard) return;

            // Usually "this character", so sourceCard
            // Check if it's in play or discard (if triggered on banish)
            // If on banish, it might be in discard already.

            // Implementation depends on trigger context.
            // For now, assume it handles moving sourceCard to inkwell.
            if (sourceCard.zone !== ZoneType.Inkwell) {
                // Remove from current zone
                const currentZone = player.getZone(sourceCard.zone);
                const index = currentZone.findIndex(c => c.instanceId === sourceCard.instanceId);
                if (index !== -1) currentZone.splice(index, 1);

                // Add to inkwell
                sourceCard.zone = ZoneType.Inkwell;
                sourceCard.ready = false; // Usually enters exerted? Or ready? Rules say "facedown exerted" usually for ramp effects.
                player.inkwell.push(sourceCard);
                this.logger.action(player.name, `Returned ${sourceCard.name} to inkwell`);
            }
        }
        // Opponent Choice: Discard (Flynn Rider)
        else if (effect.action === 'opponent_choice_discard') {
            const opponents = Object.values(this.game.state.players).filter(p => p.id !== player.id);

            opponents.forEach(opp => {
                if (opp.hand.length > 0) {
                    // Heuristic: Discard lowest cost card
                    // In a real game, this would request user input
                    const sortedHand = [...opp.hand].sort((a, b) => a.cost - b.cost);
                    const cardToDiscard = sortedHand[0];

                    // Discard it
                    opp.hand = opp.hand.filter(c => c.instanceId !== cardToDiscard.instanceId);
                    cardToDiscard.zone = ZoneType.Discard;
                    opp.discard.push(cardToDiscard);

                    this.logger.action(opp.name, `Chose to discard ${cardToDiscard.name} (Effect from ${player.name})`);
                } else {
                    this.logger.debug(`[${opp.name}] Hand is empty, cannot discard.`);
                }
            });
        }
        // Opponent Reveal Top Deck Conditional (Daisy Duck - Donald's Date)
        else if (effect.action === 'opponent_reveal_top_deck_conditional') {
            const opponents = Object.values(this.game.state.players).filter(p => p.id !== player.id);

            for (const opp of opponents) {
                if (opp.deck.length === 0) {
                    this.logger.debug(`[${opp.name}] Deck is empty, cannot reveal.`);
                    continue;
                }

                // Top of deck is at the END of the array (pop() takes from end)
                const topCard = opp.deck[opp.deck.length - 1];
                this.logger.info(opp.name, `Reveals top card: ${topCard.name} (Type: ${topCard.type})`);

                // Check condition (e.g. Type: Character)
                const conditionType = effect.params?.condition?.type;
                let conditionMet = false;
                if (conditionType === 'Character' && topCard.type === CardType.Character) {
                    conditionMet = true;
                }

                // First: Send informational reveal to the ability owner (so they see the opponent's card)
                if (this.requestChoice) {
                    const infoRequest = {
                        id: 'reveal_info_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        type: 'reveal_and_decide' as any,
                        playerId: player.id, // Ability owner sees this
                        prompt: `${opp.name} reveals ${topCard.name}`,
                        options: [{ id: 'acknowledge', display: 'OK', valid: true }],
                        source: {
                            card: sourceCard,
                            abilityName: 'BIG PRIZE',
                            player: opp // The revealer
                        },
                        context: {
                            revealedCard: topCard
                        },
                        min: 1,
                        max: 1,
                        timestamp: Date.now()
                    };

                    try {
                        await this.requestChoice(infoRequest);
                    } catch (e) {
                        // Ignore if player doesn't have a handler or timeouts
                    }
                }

                // Build choice options for the opponent
                const options = [];
                if (conditionMet) {
                    options.push({ id: 'hand', display: 'Put into Hand', valid: true });
                    options.push({ id: 'bottom', display: 'Bottom of Deck', valid: true });
                } else {
                    options.push({ id: 'bottom', display: 'Bottom of Deck (Not a Character)', valid: true });
                }

                // Create choice request for the opponent
                const choiceRequest = {
                    id: 'choice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    type: 'reveal_and_decide' as any,
                    playerId: opp.id, // The opponent makes this choice
                    prompt: `Reveal: ${topCard.name}. ${conditionMet ? 'Put into hand?' : 'Must go to bottom.'}`,
                    options: options,
                    source: {
                        card: sourceCard,
                        abilityName: 'BIG PRIZE',
                        player: player
                    },
                    context: {
                        revealedCard: topCard
                    },
                    min: 1,
                    max: 1,
                    timestamp: Date.now()
                };

                let decision = 'bottom'; // Default

                if (this.requestChoice) {
                    const response = await this.requestChoice(choiceRequest);
                    decision = response.selectedIds[0] || 'bottom';
                }

                // Remove the top card from deck (pop takes from end = top)
                opp.deck.pop();

                // Execute decision
                if (decision === 'hand') {
                    topCard.zone = ZoneType.Hand;
                    (opp as PlayerState).hand.push(topCard);
                    this.logger.action(opp.name, `Put ${topCard.name} into hand`);
                } else {
                    // Put at bottom (start of array)
                    opp.deck.unshift(topCard);
                    this.logger.action(opp.name, `Put ${topCard.name} on bottom of deck`);
                }
            }
        }
        // Opponent Choice: Banish (Lady Tremaine)
        else if (effect.action === 'opponent_choice_banish') {
            const filter = effect.params?.filter || 'character';
            const opponents = Object.values(this.game.state.players).filter(p => p.id !== player.id);

            opponents.forEach(opp => {
                // Find valid targets (e.g. characters)
                // Note: Should respect Ward? Yes, "chooses and banishes" usually bypasses Ward if the PLAYER chooses their own character.
                // Ward prevents "opponents choosing". Here the opponent chooses their own.
                const validTargets = opp.play.filter(c => {
                    if (filter === 'character' && c.type !== CardType.Character) return false;
                    return true;
                });

                if (validTargets.length > 0) {
                    // Heuristic: Banish lowest strength (weakest) character
                    const sortedTargets = [...validTargets].sort((a, b) => (a.strength || 0) - (b.strength || 0));
                    const target = sortedTargets[0];

                    // Banish it
                    this.banishCard(opp as PlayerState, target);
                    this.logger.action(opp.name, `Chose to banish ${target.name} (Effect from ${player.name})`);
                } else {
                    this.logger.debug(`[${opp.name}] No valid targets to banish.`);
                }
            });
        }


        // Return Character to Hand (Basil on play)
        else if (effect.action === 'return_character_to_hand') {
            const targetCardId = payload?.targetCardId;
            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No target selected for bounce.`);
                return;
            }

            // Find target character in any player's play zone
            let targetCard: CardInstance | undefined;
            let targetOwner: PlayerState | undefined;

            for (const pId of Object.keys(this.game.state.players)) {
                const p = this.game.getPlayer(pId) as PlayerState;
                targetCard = p.play.find(c => c.instanceId === targetCardId);
                if (targetCard) {
                    targetOwner = p;
                    break;
                }
            }

            if (!targetCard || !targetOwner) {
                this.logger.debug(`[${player.name}] Target character not found in play.`);
                return;
            }

            // Return to owner's hand
            targetOwner.play = targetOwner.play.filter(c => c.instanceId !== targetCardId);
            targetCard.zone = ZoneType.Hand;
            targetOwner.hand.push(targetCard);

            this.logger.action(player.name, `Returned ${targetCard.name} to ${targetOwner.name}'s hand`);
        }
        // Opponent Discard Random (Basil on quest)
        else if (effect.action === 'opponent_discard_random') {
            const opponentId = payload?.opponentId;
            if (!opponentId) {
                this.logger.debug(`[${player.name}] No opponent specified.`);
                return;
            }

            const opponent = this.game.getPlayer(opponentId);
            if (opponent.hand.length === 0) {
                this.logger.debug(`[${player.name}] ${opponent.name} has no cards to discard.`);
                return;
            }

            // Pick random card
            const randomIndex = Math.floor(Math.random() * opponent.hand.length);
            const randomCard = opponent.hand[randomIndex];

            opponent.hand.splice(randomIndex, 1);
            opponent.addCardToZone(randomCard, ZoneType.Discard);

            this.logger.action(player.name, `${opponent.name} discarded ${randomCard.name} at random`);
        }
        // Challenger May Discard or Opponent Gains Lore (Flynn Rider)
        else if (effect.action === 'challenger_may_discard_or_opponent_gains_lore') {
            const discardCardId = payload?.discardCardId;
            const loreAmount = effect.params?.loreAmount || 2;

            if (discardCardId) {
                // Challenger chose to discard - find the challenging player
                // The target card is the one being challenged, so we need to find who's challenging
                // The payload should come from the challenge action which has the challenger's player ID
                // We can infer the challenger is NOT the owner of the challenged card
                const challengerId = Object.keys(this.game.state.players).find(id => id !== player.id);
                if (!challengerId) return;

                const challenger = this.game.getPlayer(challengerId);
                const cardToDiscard = challenger.hand.find(c => c.instanceId === discardCardId);

                if (!cardToDiscard) {
                    this.logger.debug(`[${player.name}] Challenger chose not to discard (card not found).`);
                    player.lore += loreAmount;
                    this.logger.effect(player.name, `Gained ${loreAmount} lore. Total: ${player.lore}`);
                    return;
                }

                challenger.hand = challenger.hand.filter(c => c.instanceId !== discardCardId);
                challenger.addCardToZone(cardToDiscard, ZoneType.Discard);
                this.logger.action(challenger.name, `discarded ${cardToDiscard.name} to avoid giving lore`);
            } else {
                // Challenger chose not to discard
                player.lore += loreAmount;
                this.logger.effect(player.name, `Gained ${loreAmount} lore. Total: ${player.lore}`);
            }
        }
        // Conditional Item to Inkwell (Judy Hopps)
        else if (effect.action === 'conditional_item_to_inkwell') {
            const requiredSubtype = effect.params?.requiredSubtype || 'Detective';

            // Check if player has another character with required subtype (excluding source card)
            const hasRequiredSubtype = player.play.some(c =>
                c.instanceId !== sourceCard?.instanceId &&
                c.subtypes?.includes(requiredSubtype)
            );

            if (!hasRequiredSubtype) {
                this.logger.debug(`[${player.name}] Condition not met: No other ${requiredSubtype} character in play.`);
                return;
            }

            const targetCardId = payload?.targetCardId;
            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No item selected.`);
                return;
            }

            // Find target item in any zone, any player
            let targetCard: CardInstance | undefined;
            let targetOwner: PlayerState | undefined;

            for (const pId of Object.keys(this.game.state.players)) {
                const p = this.game.getPlayer(pId);

                // Check play zone
                targetCard = p.play.find(c => c.instanceId === targetCardId);
                if (targetCard) {
                    targetOwner = p;
                    break;
                }

                // Check hand
                targetCard = p.hand.find(c => c.instanceId === targetCardId);
                if (targetCard) {
                    targetOwner = p;
                    break;
                }

                // Check discard
                targetCard = p.discard.find(c => c.instanceId === targetCardId);
                if (targetCard) {
                    targetOwner = p;
                    break;
                }
            }

            if (!targetCard || !targetOwner) {
                this.logger.debug(`[${player.name}] Target item not found.`);
                return;
            }

            // Verify it's an item
            if (targetCard.type !== 'Item') {
                this.logger.debug(`[${player.name}] Target is not an item.`);
                return;
            }

            // Remove from current zone
            if (targetCard.zone === ZoneType.Play) {
                targetOwner.play = targetOwner.play.filter(c => c.instanceId !== targetCardId);
            } else if (targetCard.zone === ZoneType.Hand) {
                targetOwner.hand = targetOwner.hand.filter(c => c.instanceId !== targetCardId);
            } else if (targetCard.zone === ZoneType.Discard) {
                targetOwner.discard = targetOwner.discard.filter(c => c.instanceId !== targetCardId);
            }
            // Add to owner's inkwell
            targetCard.zone = ZoneType.Inkwell;
            targetCard.ready = false;  // Exerted
            targetOwner.inkwell.push(targetCard);

            this.logger.effect(player.name, `Put ${targetCard.name} into ${targetOwner.name}'s inkwell facedown and exerted`);
        }
        // Optional Pay Ink to Draw (Webby's Diary)
        else if (effect.action === 'optional_pay_ink_to_draw') {
            const inkCost = effect.params?.inkCost || 1;
            const payInk = payload?.payInk;

            if (!payInk) {
                this.logger.debug(`[${player.name}] Chose not to pay ink.`);
                return;
            }

            // Check if player has enough ready ink
            const readyInk = player.inkwell.filter(c => c.ready).length;
            if (readyInk < inkCost) {
                this.logger.debug(`[${player.name}] Not enough ink. Need ${inkCost}, have ${readyInk}`);
                return;
            }

            // Pay ink cost
            let paid = 0;
            for (const ink of player.inkwell) {
                if (ink.ready && paid < inkCost) {
                    ink.ready = false;
                    paid++;
                }
            }

            // Draw card
            if (player.deck.length > 0) {
                const drawn = player.deck.pop()!;
                player.addCardToZone(drawn, ZoneType.Hand);
                this.logger.action(player.name, `Paid ${inkCost} ink and drew a card`);
            } else {
                this.logger.debug(`[${player.name}] Deck is empty, cannot draw.`);
            }
        }
        // Heal Character (Munchings and Crunchings)
        else if (effect.action === 'heal_character') {
            const healAmount = effect.params?.healAmount || 2;
            const targetCardId = payload?.targetCardId;

            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No target selected for healing.`);
                return;
            }

            // Find target character in any player's play zone
            let targetCard: CardInstance | undefined;
            let targetOwner: PlayerState | undefined;

            for (const pId of Object.keys(this.game.state.players)) {
                const p = this.game.getPlayer(pId);
                targetCard = p.play.find(c => c.instanceId === targetCardId);
                if (targetCard) {
                    targetOwner = p;
                    break;
                }
            }

            if (!targetCard || !targetOwner) {
                this.logger.debug(`[${player.name}] Target character not found.`);
                return;
            }

            // Remove damage (up to healAmount, can't go below 0)
            const damageBefore = targetCard.damage || 0;
            const actualHeal = Math.min(healAmount, damageBefore);
            targetCard.damage = damageBefore - actualHeal;

            this.logger.effect(player.name, `Removed ${actualHeal} damage from ${targetCard.name}. Damage: ${damageBefore} -> ${targetCard.damage}`);
        }
        // Conditional Heal on Quest (Winter Camp)
        else if (effect.action === 'conditional_heal_on_quest') {
            const questingCharacterId = payload?.questingCharacterId;

            if (!questingCharacterId) {
                this.logger.debug(`[${player.name}] No questing character specified.`);
                return;
            }

            // Find the questing character
            const questingChar = player.play.find(c => c.instanceId === questingCharacterId);

            if (!questingChar) {
                this.logger.debug(`[${player.name}] Questing character not found.`);
                return;
            }

            // Determine heal amount based on Hero subtype
            const isHero = questingChar.subtypes?.includes('Hero') || false;
            const healAmount = isHero ? (effect.params?.heroHealAmount || 4) : (effect.params?.baseHealAmount || 2);

            // Remove damage (up to specified amount)
            const currentDamage = questingChar.damage || 0;
            const amountHealed = Math.min(currentDamage, healAmount);
            questingChar.damage = Math.max(0, currentDamage - healAmount);

            this.logger.effect(player.name, `${questingChar.name}${isHero ? ' (Hero)' : ''} healed ${amountHealed} damage (${currentDamage} -> ${questingChar.damage})`);
        }
        // Temporary Lore Reduction (Inscrutable Map)
        else if (effect.action === 'temporary_lore_reduction') {
            const loreReduction = effect.params?.loreReduction || 1;
            const targetCardId = payload?.targetCardId;

            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No target selected.`);
                return;
            }

            // Find target character (should be opposing)
            let targetCard: CardInstance | undefined;
            let targetOwner: PlayerState | undefined;

            for (const pId of Object.keys(this.game.state.players)) {
                const p = this.game.getPlayer(pId);
                if (pId !== player.id) {  // Opposing player
                    targetCard = p.play.find(c => c.instanceId === targetCardId);
                    if (targetCard) {
                        targetOwner = p;
                        break;
                    }
                }
            }

            if (!targetCard || !targetOwner) {
                this.logger.debug(`[${player.name}] Target character not found in opponent's play.`);
                return;
            }

            // Create continuous effect for lore reduction
            const continuousEffect: ContinuousEffect = {
                id: `lore_reduction_${Date.now()}_${Math.random()}`,
                type: 'modification',
                target: 'custom',
                targetCardIds: [targetCardId],
                duration: 'until_source_next_start',
                sourcePlayerId: player.id,
                sourceCardId: sourceCard?.instanceId || '',
                modification: {
                    lore: -loreReduction
                }
            };

            this.addActiveEffect(continuousEffect);
            this.logger.effect(player.name, `Reduced ${targetCard.name}'s lore by ${loreReduction} until start of ${player.name}'s next turn`);
        }

        // Draw per character then discard (Tramp)
        else if (effect.action === 'draw_per_character_then_discard') {
            // Count other characters in play (not including the source card)
            const effectSourceCardId = effect.sourceCardId || sourceCard?.instanceId;
            const otherCharacters = player.play.filter(c =>
                c.type === CardType.Character && c.instanceId !== effectSourceCardId
            );
            const count = otherCharacters.length;

            if (count === 0) {
                this.logger.debug(`[${player.name}] No other characters in play, no cards to draw.`);
                return;
            }

            this.logger.info(player.name, `Drawing ${count} cards for ${count} other characters...`);

            // Draw cards
            for (let i = 0; i < count; i++) {
                if (player.deck.length > 0) {
                    const card = player.deck.shift()!;
                    card.zone = ZoneType.Hand;
                    player.hand.push(card);
                } else {
                    this.logger.debug(`[${player.name}] Deck is empty, cannot draw more cards.`);
                    break;
                }
            }

            // Now need to discard the same number of cards
            // This would require payload with card selections
            const discardCardIds = payload?.discardCardIds || [];

            if (discardCardIds.length !== count) {
                this.logger.debug(`[${player.name}] Must select exactly ${count} cards to discard.`);
                return;
            }

            // Discard selected cards
            discardCardIds.forEach((cardId: string) => {
                const cardIndex = player.hand.findIndex(c => c.instanceId === cardId);
                if (cardIndex !== -1) {
                    const card = player.hand.splice(cardIndex, 1)[0];
                    // Move card to discard (don't create duplicate!)
                    card.zone = ZoneType.Discard;
                    player.discard.push(card);
                    this.logger.action(player.name, `Discarded ${card.name}`);
                }
            });
        }
        // Conditional Draw on Move (The Bitterwood)
        else if (effect.action === 'conditional_draw_on_move') {
            const strengthRequired = effect.params?.strengthRequired || 5;
            const characterStrength = payload?.characterStrength || targetCard?.strength || 0;

            // Check strength requirement
            if (characterStrength < strengthRequired) {
                this.logger.debug(`[${player.name}] Character strength ${characterStrength} < ${strengthRequired}, no draw.`);
                return;
            }

            // Check once per turn restriction
            if (effect.params?.oncePerTurn) {
                // Track if this location has triggered this turn
                if (!sourceCard?.meta) sourceCard!.meta = {};
                if (!sourceCard?.meta.triggeredThisTurn) sourceCard!.meta.triggeredThisTurn = {};

                const currentTurn = this.game.state.turnCount;
                if (sourceCard?.meta.triggeredThisTurn[currentTurn]) {
                    this.logger.debug(`[${player.name}] ${sourceCard.name} already triggered this turn.`);
                    return;
                }

                sourceCard!.meta.triggeredThisTurn[currentTurn] = true;
            }

            // Draw card
            if (player.deck.length > 0) {
                const drawn = player.deck.pop()!;
                player.addCardToZone(drawn, ZoneType.Hand);
                this.logger.action(player.name, `Drew a card from moving character to location`);
            } else {
                this.logger.debug(`[${player.name}] Deck is empty, cannot draw.`);
            }
        }
        // Gain Temporary Strength (Lady)
        else if (effect.action === 'gain_temporary_strength') {
            const strengthBonus = effect.params?.strengthBonus || 1;
            const duration = effect.params?.duration || 'until_end_of_turn';

            if (!sourceCard) {
                this.logger.debug(`[${player.name}] No source card for temporary strength.`);
                return;
            }

            // Create continuous effect for temporary strength boost
            const continuousEffect: ContinuousEffect = {
                id: `temp_strength_${Date.now()}_${Math.random()}`,
                type: 'modification',
                target: 'custom',
                targetCardIds: [sourceCard.instanceId],
                duration: duration as any,
                sourcePlayerId: player.id,
                sourceCardId: sourceCard.instanceId,
                modification: {
                    strength: strengthBonus
                }
            };

            this.addActiveEffect(continuousEffect);
            this.logger.effect(player.name, `${sourceCard.name} gets +${strengthBonus} strength until end of turn`);
        }

        // Grant Challenger (Mickey Mouse - Standard Bearer)
        else if (effect.action === 'grant_challenger') {
            const targetCardId = payload?.targetCardId || payload?.targetId;

            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No target selected for granting Challenger.`);
                return;
            }

            // Find target
            const allCards = Object.values(this.game.state.players).flatMap(p => p.play);
            const targetCard = allCards.find(c => c.instanceId === targetCardId);

            if (!targetCard) {
                this.logger.debug(`[${player.name}] Target card not found for granting Challenger.`);
                return;
            }

            if (targetCard && !this.validateTarget(targetCard, player.id)) {
                return;
            }

            const amount = effect.amount || 0;

            // Create continuous effect
            const continuousEffect: ContinuousEffect = {
                id: `grant_challenger_${Date.now()}_${Math.random()}`,
                type: 'modification',
                target: 'custom',
                targetCardIds: [targetCardId],
                duration: 'until_end_of_turn',
                sourcePlayerId: player.id,
                sourceCardId: sourceCard?.instanceId || '',
                modification: {
                    challenger: amount
                }
            };

            this.addActiveEffect(continuousEffect);
            this.logger.debug('Active effects count after push: ' + this.game.state.activeEffects.length);
            this.logger.effect(player.name, `Granted Challenger +${amount} to target until end of turn`);
        }

        // Move Damage (Cheshire Cat)
        else if (effect.action === 'move_damage') {
            const sourceCardId = payload?.sourceCardId;
            const destCardId = payload?.destCardId;
            const amountToMove = payload?.amount || effect.amount || 0;

            if (!sourceCardId || !destCardId) {
                this.logger.debug(`[${player.name}] Source or destination for move_damage missing.`);
                return;
            }

            // Find cards
            let sourceChar: CardInstance | undefined;
            let destChar: CardInstance | undefined;
            let sourceOwner: PlayerState | undefined;
            let destOwner: PlayerState | undefined;

            for (const pId of Object.keys(this.game.state.players)) {
                const p = this.game.getPlayer(pId);
                const s = p.play.find(c => c.instanceId === sourceCardId);
                if (s) { sourceChar = s; sourceOwner = p; }
                const d = p.play.find(c => c.instanceId === destCardId);
                if (d) { destChar = d; destOwner = p; }
            }

            if (!sourceChar || !destChar || !sourceOwner || !destOwner) {
                this.logger.debug(`[${player.name}] Character(s) not found for move_damage.`);
                return;
            }

            // Validate amount
            const currentDamage = sourceChar.damage || 0;
            const actualMove = Math.min(amountToMove, currentDamage);

            if (actualMove <= 0) {
                this.logger.debug(`[${player.name}] No damage to move from ${sourceChar.name}.`);
                return;
            }

            // Move damage
            sourceChar.damage = (sourceChar.damage || 0) - actualMove;
            this.logger.effect(player.name, `Moved ${actualMove} damage from ${sourceChar.name} to ${destChar.name}`);

            // Apply damage to destination using applyDamage to handle shields/banishment
            this.applyDamage(destOwner, destChar, actualMove, sourceCard?.instanceId);
        }

        // ========== NEWLY ADDED HANDLERS (Missing from validator) ==========

        // Keyword: Ward - Prevents opponents from choosing this character except to challenge
        else if (effect.action === 'keyword_ward') {
            if (sourceCard) {
                if (!sourceCard.meta) sourceCard.meta = {};
                sourceCard.meta.hasWard = true;
                this.logger.info(player.name, `[WARD] ${sourceCard.name} has Ward (opponents can't choose except to challenge)`);
            }
        }

        // Keyword: Resist - Reduces damage dealt to this character
        else if (effect.action === 'keyword_resist' ||
            (effect as any).keyword === 'resist' ||
            ((effect as any).type === 'resist')) {
            if (sourceCard) {
                if (!sourceCard.meta) sourceCard.meta = {};
                const resistValue = (effect as any).amount || (effect as any).value || 0;
                sourceCard.meta.resist = resistValue;
                this.logger.info(player.name, `[RESIST] ${sourceCard.name} has Resist +${resistValue} (damage reduced by ${resistValue})`);
            }
        }

        // Keyword: Reckless - Can't quest, must challenge if able
        else if (effect.action === 'keyword_reckless') {
            if (sourceCard) {
                if (!sourceCard.meta) sourceCard.meta = {};
                sourceCard.meta.hasReckless = true;
                this.logger.info(player.name, `[RECKLESS] ${sourceCard.name} is Reckless (can't quest, must challenge if able)`);
            }
        }

        // Activated Ability: Exert to activate
        else if (effect.action === 'exert_ability') {
            // Exerting is handled by useAbility() before calling this
            // Just execute the nested/chained effect
            if (effect.params?.chainedEffect) {
                this.resolveEffect(player, effect.params.chainedEffect, sourceCard, targetCard, payload);
            } else {
                this.logger.info(player.name, `[EXERT_ABILITY] ${sourceCard?.name || 'Card'} activated exert ability`);
            }
        }

        // Activated Ability: Exert + Ink cost to activate
        else if (effect.action === 'exert_ink_ability') {
            // Costs are handled by useAbility() before calling this
            // Execute the nested/chained effect
            if (effect.params?.chainedEffect) {
                this.resolveEffect(player, effect.params.chainedEffect, sourceCard, targetCard, payload);
            } else {
                this.logger.info(player.name, `[EXERT_INK_ABILITY] ${sourceCard?.name || 'Card'} activated exert+ink ability`);
            }
        }

        // Enters Play Exerted
        else if (effect.action === 'enters_play_exerted') {
            // This is handled in playCard() - adding stub for validator detection
            this.logger.info(player.name, `[ENTERS_PLAY_EXERTED] ${sourceCard?.name || 'Card'} enters play exerted (handled in playCard)`);
        }

        // Can Challenge Ready Characters
        else if (effect.action === 'can_challenge_ready_characters') {
            if (sourceCard) {
                if (!sourceCard.meta) sourceCard.meta = {};
                sourceCard.meta.canChallengeReady = true;
                this.logger.info(player.name, `[CAN_CHALLENGE_READY] ${sourceCard.name} can challenge ready characters`);
            }
        }

        // Can't Exert to Sing
        else if (effect.action === 'cant_exert_to_sing') {
            if (sourceCard) {
                if (!sourceCard.meta) sourceCard.meta = {};
                sourceCard.meta.cantExertToSing = true;
                this.logger.info(player.name, `[CANT_EXERT_TO_SING] ${sourceCard.name} can't exert to sing songs`);
            }
        }

        // Quest (stub - likely false positive, quest is an action not an effect)
        else if (effect.action === 'quest') {
            this.logger.debug(`[QUEST] Quest action detected in resolveEffect - may be parser issue.`);
            // Quest is typically handled by the quest() method, not as an effect
        }

        // Song Cost Requirement (stub - handled in playCard/singSong)
        else if (effect.action === 'song_cost_requirement') {
            this.logger.debug(`[SONG_COST] Song cost requirement (handled in playCard/singSong).`);
            // This is checked during singing, not resolved as an effect
        }

        // ========== END NEWLY ADDED HANDLERS ==========

        // Opponent Lose Lore, Self Gain Lore (Gloyd Orangeboar)
        else if (effect.action === 'opponent_lose_lore_self_gain_lore') {
            const loseAmount = effect.params?.loseAmount || 1;
            const gainAmount = effect.params?.gainAmount || 1;

            // Opponents lose lore
            const opponents = Object.values(this.game.state.players).filter(p => p.id !== player.id);
            opponents.forEach(opp => {
                const actualLoss = Math.min(opp.lore, loseAmount);
                opp.lore -= actualLoss;
                this.logger.effect(opp.name, `Lost ${actualLoss} lore`);
            });

            // Self gains lore
            player.lore += gainAmount;
            this.logger.effect(player.name, `Gained ${gainAmount} lore`);
        }

        // Discard to Return Character to Hand (Nana)
        else if (effect.action === 'discard_to_return_character_to_hand') {
            const discardCardId = payload?.discardCardId;
            const targetCardId = payload?.targetCardId;
            const costLimit = effect.params?.costLimit || 0;

            // Optional check
            if (effect.params?.optional && !discardCardId) {
                this.logger.debug(`[${player.name}] Skipped optional ability (Discard to Bounce).`);
                return;
            }

            if (!discardCardId) {
                this.logger.debug(`[${player.name}] No card selected for discard.`);
                return;
            }

            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No target character selected.`);
                return;
            }

            // Find discard card
            const cardToDiscard = player.hand.find(c => c.instanceId === discardCardId);
            if (!cardToDiscard) {
                this.logger.debug(`[${player.name}] Selected discard card not found in hand.`);
                return;
            }

            // Find target character (any player)
            let targetCard: CardInstance | undefined;
            let targetOwner: PlayerState | undefined;

            for (const pId of Object.keys(this.game.state.players)) {
                const p = this.game.getPlayer(pId);
                targetCard = p.play.find(c => c.instanceId === targetCardId);
                if (targetCard) {
                    targetOwner = p;
                    break;
                }
            }

            if (!targetCard || !targetOwner) {
                this.logger.debug(`[${player.name}] Target character not found in play.`);
                return;
            }

            // Validate cost
            if (targetCard.cost > costLimit) {
                this.logger.debug(`[${player.name}] Target cost ${targetCard.cost} exceeds limit ${costLimit}.`);
                return;
            }

            // Execute Discard
            player.hand = player.hand.filter(c => c.instanceId !== discardCardId);
            player.addCardToZone(cardToDiscard, ZoneType.Discard);
            this.logger.action(player.name, `Discarded ${cardToDiscard.name}`);

            // Execute Bounce
            targetOwner.play = targetOwner.play.filter(c => c.instanceId !== targetCardId);
            targetCard.zone = ZoneType.Hand;
            targetOwner.hand.push(targetCard);
            this.logger.action(player.name, `Returned ${targetCard.name} to ${targetOwner.name}'s hand`);
        }
        // Heal (Generic - same as heal_character for now)
        else if (effect.action === 'heal') {
            const healAmount = effect.amount || 0;
            const targetCardId = payload?.targetCardId || payload?.targetId;

            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No target selected for healing.`);
                return;
            }

            // Find target character in any player's play zone
            let targetCard: CardInstance | undefined;
            let targetOwner: PlayerState | undefined;

            for (const pId of Object.keys(this.game.state.players)) {
                const p = this.game.getPlayer(pId);
                targetCard = p.play.find(c => c.instanceId === targetCardId);
                if (targetCard) {
                    targetOwner = p;
                    break;
                }
            }

            if (!targetCard || !targetOwner) {
                this.logger.debug(`[${player.name}] Target character not found.`);
                return;
            }

            // Remove damage (up to healAmount, can't go below 0)
            const damageBefore = targetCard.damage || 0;
            const actualHeal = Math.min(healAmount, damageBefore);
            targetCard.damage = damageBefore - actualHeal;

            this.logger.effect(player.name, `Removed ${actualHeal} damage from ${targetCard.name}. Damage: ${damageBefore} -> ${targetCard.damage}`);
        }
        // Modify Strength (Megara)
        else if (effect.action === 'modify_strength') {
            const strengthAmount = effect.amount || 0;
            const targetCardId = payload?.targetCardId || payload?.targetId;
            const duration = effect.duration || 'until_end_of_turn';

            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No target selected for strength modification.`);
                return;
            }

            // Find target character
            let targetCard: CardInstance | undefined;
            for (const pId of Object.keys(this.game.state.players)) {
                const p = this.game.getPlayer(pId);
                targetCard = p.play.find(c => c.instanceId === targetCardId);
                if (targetCard) break;
            }

            if (!targetCard) {
                this.logger.debug(`[${player.name}] Target character not found.`);
                return;
            }

            // Create continuous effect
            const continuousEffect: ContinuousEffect = {
                id: `modify_strength_${Date.now()}_${Math.random()}`,
                type: 'modification',
                target: 'custom',
                targetCardIds: [targetCardId],
                duration: duration as any,
                sourcePlayerId: player.id,
                sourceCardId: sourceCard?.instanceId || '',
                modification: {
                    strength: strengthAmount
                }
            };

            this.addActiveEffect(continuousEffect);
            this.logger.effect(player.name, `Modified ${targetCard.name}'s strength by ${strengthAmount} until ${duration}`);
        }
        // Recover from Discard (Hades)
        else if (effect.action === 'recover_from_discard') {
            const targetCardId = payload?.targetCardId || payload?.targetId;

            if (!targetCardId) {
                this.logger.debug(`[${player.name}] No target selected for recover_from_discard.`);
                return;
            }

            // Find card in discard
            const cardIndex = player.discard.findIndex(c => c.instanceId === targetCardId);
            if (cardIndex === -1) {
                this.logger.debug(`[${player.name}] Target card not found in discard.`);
                return;
            }

            const card = player.discard[cardIndex];

            // Move to hand (don't create duplicate!)
            player.discard.splice(cardIndex, 1);
            card.zone = ZoneType.Hand;
            player.hand.push(card);

            this.logger.action(player.name, `Returned ${card.name} from discard to hand`);
        }

        // Look at Top Deck (Ariel)
        else if (effect.action === 'look_top_deck') {
            const amount = effect.amount || 0;
            const filter = effect.params?.filter; // e.g., 'song'

            if (player.deck.length === 0) {
                this.logger.debug(`[${player.name}] Deck is empty, cannot look at top cards.`);
                return;
            }

            // Look at top X cards
            const cards = player.deck.splice(-amount); // Take from end (top)
            this.logger.info(player.name, `Looking at top ${cards.length} cards`);

            // In a real UI, we would ask the user to choose.
            // For now, we'll auto-pick the first valid card if any.
            let chosenCardIndex = -1;

            if (filter) {
                chosenCardIndex = cards.findIndex(c =>
                    c.subtypes && c.subtypes.map(s => s.toLowerCase()).includes(filter)
                );
            } else {
                chosenCardIndex = 0; // Pick first if no filter
            }

            if (chosenCardIndex !== -1) {
                const chosenCard = cards[chosenCardIndex];
                // Move to hand
                player.addCardToZone(chosenCard, ZoneType.Hand);
                this.logger.action(player.name, `Revealed and put ${chosenCard.name} into hand`);

                // Remove from temp list
                cards.splice(chosenCardIndex, 1);
            } else {
                this.logger.debug(`[${player.name}] No matching card found to reveal.`);
            }

            // Put rest on bottom of deck
            // "Put the rest on the bottom of your deck in any order."
            // We'll just put them back at the beginning of the array (bottom)
            player.deck.unshift(...cards);
            this.logger.action(player.name, `Put ${cards.length} cards on bottom of deck`);
        }
    }


    */
    public applyDamage(player: PlayerState, card: CardInstance, amount: number, sourceId?: string) {
        if (amount <= 0) return;

        let finalAmount = amount;

        // Check Resist - use getModifiedResist to include dynamically granted Resist (e.g., from "I'm Still Here")
        const resistAmount = this.abilitySystem.getModifiedResist(card, player);
        if (resistAmount > 0) {
            finalAmount = Math.max(0, finalAmount - resistAmount);
            this.logger.effect(player.name, 'Resist', `Reduces damage by ${resistAmount}`, {
                type: 'resist',
                card: card,
                originalAmount: amount,
                reducedAmount: finalAmount,
                resistAmount: resistAmount
            });
        }

        // Check Damage Shields
        if (card.damageShields && card.damageShields.length > 0) {
            // Process shields
            // Currently only Rapunzel's "prevent all damage" exists
            const shieldIndex = card.damageShields.findIndex(s => s.amount === 'all');
            if (shieldIndex !== -1) {
                const shield = card.damageShields[shieldIndex];
                this.logger.info(player.name, `Damage prevented by shield on ${card.name}`);
                finalAmount = 0;

                // Consume shield if usage is 'next_time'
                if (shield.usage === 'next_time') {
                    card.damageShields.splice(shieldIndex, 1);
                }
            }
        }

        if (finalAmount > 0) {
            card.damage += finalAmount;
            this.logger.effect(player.name, 'Damage', `${card.name} took ${finalAmount} damage`, {
                type: 'damage_application',
                card: card,
                amount: finalAmount,
                sourceId: sourceId
            });
        }
    }

    /**
     * Recalculate all active continuous effects on cards
     * 
     * Resets all cards to their base stats, then reapplies static abilities and continuous effects.
     * Called after any action that might change the board state. Runs in two passes:
     * - Pass 1: Reset all stats and keywords to base values
     * - Pass 2: Apply all active effects and static abilities
     * 
     * **Performance Note**: This method iterates over all cards in play multiple times.
     * For large board states, consider caching or incremental updates.
     */
    public recalculateEffects() {
        executeRecalculateEffects(this);
    }

    /**
     * End the current player's turn and begin the next player's turn
     * 
     * Triggers end-of-turn effects, cleans up temporary effects and abilities,
     * increments turn counter, and starts the next player's turn sequence.
     * 
     * @param playerId - ID of the player passing their turn
     * @param payload - Optional: Additional data for end-of-turn effects
     * @returns True if turn was successfully passed, false otherwise
     */
    public passTurn(playerId: string, payload?: any): boolean {
        const player = this.game.getPlayer(playerId);
        if (!player) return false;

        // Emit TURN_END event for triggered abilities (fire-and-forget to preserve sync behavior)
        this.abilitySystem.emitEvent(GameEvent.TURN_END, {
            event: GameEvent.TURN_END,
            player: player,
            timestamp: Date.now()
        }).catch(e => this.logger.error('Error emitting TURN_END', e));

        // Resolve "End of Turn" effects (legacy format)
        // Check all cards in play for on_end_turn triggers
        // Note: Goliath says "At the end of EACH player's turn".
        // So we check ALL cards in play (both players) for on_end_turn triggers.
        // However, the effect target usually implies who is affected.
        // For Goliath: "if THEY have more than...". "They" refers to the active player (whose turn is ending).

        const allPlayerIds = Object.keys(this.game.state.players);
        allPlayerIds.forEach(pId => {
            const p = this.game.getPlayer(pId);
            p.play.forEach(card => {
                if (card.parsedEffects) {
                    card.parsedEffects.forEach(effect => {
                        const effectAny = effect as any;
                        if (effectAny.trigger === 'on_end_turn' || (effectAny.type === 'triggered' && effectAny.event === 'on_end_turn')) {
                            // Resolve effect for the ACTIVE player (player ending turn)
                            // The effect source is the card owner, but the target might be 'player' (active player).
                            // We need to pass the active player as the context for "they".
                            // resolveEffect(player, effect, card) -> player is the one executing the effect?
                            // Usually resolveEffect takes the player who OWNS the effect source.
                            // But here the effect acts on the active player.
                            // OR we pass the active player if the effect is global?
                            // Let's stick to passing the card owner, and handle target logic inside resolveEffect.

                            // Actually, for Goliath, the card owner controls the effect, but it affects the active player.
                            // "If THEY have...".
                            // So P1's Goliath triggers when P2's turn ends. P1 is the controller.
                            // The effect says "if THEY (P2) have...".
                            // So P1 resolves the effect, but it affects P2.

                            // Let's pass the card owner as the executor.
                            // And we'll pass the active player as a target or payload?
                            // resolveEffect(player, effect, card, targetCard, payload)
                            // We can pass the active player ID in payload.

                            this.resolveEffect(p, effect, card, undefined, { activePlayerId: playerId, ...payload });
                        }
                    });
                }
            });
        });

        this.logger.info('System', 'Turn ended');
        this.game.state.phase = Phase.End;

        // Cleanup end of turn effects
        this.game.state.activeEffects = this.game.state.activeEffects.filter(e =>
            e.duration !== 'until_end_of_turn' &&
            (e.duration as string) !== 'turn' &&
            (e.duration as string) !== 'this_turn'
        );
        this.recalculateEffects();

        // Cleanup turn-based abilities (remove temporary ability listeners)
        if (this.abilitySystem) {
            this.abilitySystem.cleanupTurnBasedAbilities();
        }

        // Switch turn
        const playerIds = Object.keys(this.game.state.players);
        const currentIndex = playerIds.indexOf(this.game.state.turnPlayerId);
        const nextIndex = (currentIndex + 1) % playerIds.length;
        const nextPlayerId = playerIds[nextIndex];

        this.game.state.turnCount++;
        this.startTurn(nextPlayerId);
        return true;
    }
    /**
     * Get all valid actions available to a player
     * 
     * Generates the list of legal actions the player can take based on current game state.
     * Used by AI bots to determine available moves. Validates costs, restrictions, and game rules.
     * 
     * @param playerId - ID of the player to get actions for
     * @returns Array of valid GameActions
     */
    getValidActions(playerId: string): GameAction[] {
        return getValidActionsHelper(this, playerId);
    }
    /*
        // CRITICAL: If game is already over, no actions are valid
        if (this.game.state.winnerId) {
            return [];
        }

        if (this.game.state.activeEffects.length > 0) {
            // this.game.state.activeEffects.forEach(e => console.log(` - ${e.type} ${e.restrictionType}`));
        }

        const actions: GameAction[] = [];
        const player = this.game.getPlayer(playerId);
        const opponentId = Object.keys(this.game.state.players).find(id => id !== playerId);
        const opponent = opponentId ? this.game.getPlayer(opponentId) : null;

        // 0. Pass Turn and Concede (Always Valid)
        actions.push({ type: ActionType.PassTurn, playerId });
        actions.push({ type: ActionType.Concede, playerId });

        // 1. Ink Card
        if (!player.inkedThisTurn) {
            player.hand.forEach(card => {
                if (card.inkwell) {
                    actions.push({ type: ActionType.InkCard, playerId, cardId: card.instanceId });
                }
            });
        }

        // 2. Play Card
        const readyInk = player.inkwell.filter(c => c.ready).length;

        // Check for Play Restrictions
        const cantPlaySongs = this.game.state.activeEffects.some(e =>
            e.restrictionType === 'cant_play_songs' &&
            (e.target === 'all' || (e.target === 'opponent' && e.sourceCardId && this.game.getPlayer(opponentId || '').play.some(c => c.instanceId === e.sourceCardId)))
        );
        // Note: The target check above is simplified. Ideally, we check if the effect source is controlled by an opponent.
        // Correct logic:
        // If effect target is 'opponent', does the current player match 'opponent' relative to the source?
        // Since activeEffects are global, we need to know who controls the source.
        // Let's refine:
        // We iterate activeEffects.
        // If effect.target === 'opponent', we check if source is NOT controlled by current player.

        const restrictedSongs = this.game.state.activeEffects.some(e => {
            if (e.restrictionType !== 'cant_play_songs') return false;
            const sourceOwnerId = Object.keys(this.game.state.players).find(pid =>
                this.game.state.players[pid].play.some(c => c.instanceId === e.sourceCardId)
            );
            if (!sourceOwnerId) return false; // Source gone

            if (e.target === 'all') return true;
            if (e.target === 'self' && sourceOwnerId === playerId) return true;
            if (e.target === 'opponent' && sourceOwnerId !== playerId) return true;
            return false;
        });

        const restrictedActions = this.game.state.activeEffects.some(e => {
            if (e.restrictionType !== 'cant_play_actions') return false;

            // Check explicit player targets
            if (e.targetPlayerIds && e.targetPlayerIds.includes(playerId)) return true;

            // Legacy target check
            const sourceOwnerId = e.sourcePlayerId;
            if (!sourceOwnerId) return false;

            if (e.target === 'all') return true;
            if (e.target === 'opponent' && sourceOwnerId !== playerId) return true;
            return false;
        });

        player.hand.forEach(card => {
            const cost = this.abilitySystem ? this.abilitySystem.getModifiedCost(card, player) : card.cost;
            if (cost <= readyInk) {
                if (restrictedSongs && card.subtypes.includes('Song')) {
                    return; // Skip
                }
                if (restrictedActions && card.type === CardType.Action) {
                    return; // Skip
                }
                actions.push({ type: ActionType.PlayCard, playerId, cardId: card.instanceId });
            }

            // 2b. Shift - play card onto same-name character for reduced cost
            const shiftEffect = card.parsedEffects?.find((e: any) =>
                e.action === 'keyword_shift' ||
                (e.type === 'static' && e.keyword === 'shift') ||
                (e.type === 'static' && e.keyword === 'universal_shift')
            ) as any;

            if (shiftEffect) {
                const isUniversalShift = (shiftEffect.keyword === 'universal_shift' || shiftEffect.type === 'universal_shift');
                const baseShiftCost = (shiftEffect.amount !== undefined) ? shiftEffect.amount : (shiftEffect.value || 0);
                const shiftCost = this.abilitySystem ? this.abilitySystem.getModifiedShiftCost(card, player, baseShiftCost) : baseShiftCost;

                if (shiftCost <= readyInk) {
                    // Find valid shift targets (characters with same name in play)
                    const shiftTargets = player.play.filter(c => {
                        if (isUniversalShift) {
                            // Universal Shift can target any character
                            return c.type === 'Character';
                        }
                        return c.name === card.name;
                    });

                    shiftTargets.forEach(target => {
                        actions.push({
                            type: ActionType.PlayCard,
                            playerId,
                            cardId: card.instanceId,
                            shiftTargetId: target.instanceId
                        });
                    });
                }
            }
        });

        // 3. Quest
        // Check if opponent has any exerted characters (for Reckless check)
        const opponentHasExertedTargets = opponent && opponent.play.some(c => !c.ready && c.type === 'Character');

        player.play.forEach(card => {
            // Must be ready and dry
            const isDry = card.turnPlayed < this.game.state.turnCount;
            if (!card.ready || !isDry) return;

            // Reckless keyword: Cannot quest if there's a valid challenge target
            const hasReckless = card.meta?.hasReckless ||
                card.keywords?.includes('Reckless') ||
                card.parsedEffects?.some((e: any) => e.keyword === 'reckless' || e.type === 'reckless');

            if (hasReckless && opponentHasExertedTargets) {
                // Reckless characters must challenge if able, skip quest action
                return;
            }

            actions.push({ type: ActionType.Quest, playerId, cardId: card.instanceId });
        });

        // 4. Challenge
        const restrictedChallenge = this.game.state.activeEffects.some(e => {
            if (e.restrictionType !== 'cant_challenge') return false;
            const sourceOwnerId = Object.keys(this.game.state.players).find(pid =>
                this.game.state.players[pid].play.some(c => c.instanceId === e.sourceCardId)
            );
            if (!sourceOwnerId) return false;

            if (e.target === 'all') return true;
            if (e.target === 'self' && sourceOwnerId === playerId) return true;
            if (e.target === 'opponent' && sourceOwnerId !== playerId) return true;
            return false;
        });

        if (opponent && !restrictedChallenge) {
            // Rush keyword allows challenging on the turn played (bypasses dry-ink rule)
            const readyAttackers = player.play.filter(c => {
                if (!c.ready) return false;
                const isDry = c.turnPlayed < this.game.state.turnCount;
                const hasRush = c.keywords?.includes('Rush') ||
                    c.parsedEffects?.some((e: any) => e.keyword === 'rush' || e.type === 'rush');
                return isDry || hasRush;
            });
            // CRITICAL: Only characters can be challenged, not items or locations
            const exertedTargets = opponent.play.filter(c => !c.ready && c.type === 'Character');

            readyAttackers.forEach(attacker => {
                exertedTargets.forEach(target => {
                    if (!this.canChallenge(attacker, target)) return;

                    actions.push({
                        type: ActionType.Challenge,
                        playerId,
                        cardId: attacker.instanceId,
                        targetId: target.instanceId
                    });
                });
            });
        }

        // 5. Sing Song
        // Characters with cost >= 3 (or Singer N keyword) can exert to sing songs from hand
        const songCards = player.hand.filter(card => card.subtypes?.includes('Song'));
        if (songCards.length > 0) {
            // Find eligible singers: ready, dry characters that can sing
            const eligibleSingers = player.play.filter(character => {
                if (!character.ready) return false;
                if (character.turnPlayed >= this.game.state.turnCount) return false; // Not dry
                return true;
            });

            songCards.forEach(song => {
                // Default song requirement is the song's cost
                // Songs say "(A character with cost X or more can ⟳ to sing this song for free.)"
                const songRequirement = song.cost || 0;

                // Single singer actions
                eligibleSingers.forEach(singer => {
                    const singingValue = this.getSingingValue(singer);
                    if (singingValue >= songRequirement) {
                        actions.push({
                            type: ActionType.SingSong,
                            playerId,
                            cardId: song.instanceId, // The song being sung
                            singerId: singer.instanceId // The character singing
                        });
                    }
                });

                // Check for Sing Together songs - allows multiple singers
                const singTogetherEffect = song.parsedEffects?.find((e: any) =>
                    e.action === 'keyword_sing_together' ||
                    e.keyword === 'sing_together' ||
                    (e.type === 'static' && e.effects?.some((ef: any) => ef.type === 'sing_together'))
                ) as any;

                if (singTogetherEffect && eligibleSingers.length >= 2) {
                    // Sing Together: sum of singer values must meet requirement
                    const singTogetherReq = singTogetherEffect.amount || singTogetherEffect.value || 7;

                    // For bots: Generate some reasonable two-singer combinations
                    // For UI: A special action will trigger multi-select modal
                    // Generate pairs of singers that can meet the requirement
                    for (let i = 0; i < eligibleSingers.length; i++) {
                        for (let j = i + 1; j < eligibleSingers.length; j++) {
                            const singer1 = eligibleSingers[i];
                            const singer2 = eligibleSingers[j];
                            const combinedValue = this.getSingingValue(singer1) + this.getSingingValue(singer2);

                            if (combinedValue >= singTogetherReq) {
                                actions.push({
                                    type: ActionType.SingSong,
                                    playerId,
                                    cardId: song.instanceId,
                                    singerIds: [singer1.instanceId, singer2.instanceId] as any
                                });
                            }
                        }
                    }
                }
            });
        }

        // 6. Use Ability
        player.play.forEach(card => {
            if (card.parsedEffects) {
                card.parsedEffects.forEach((effect, index) => {
                    const effectAny = effect as any;
                    // CRITICAL FIX: Check both trigger and type for activated abilities
                    // Also check for Boost keyword which is an activated ability
                    const isActivated = effectAny.trigger === 'activated' ||
                        effectAny.type === 'activated' ||
                        (effectAny.keyword === 'boost' && effectAny.costs);
                    if (isActivated) {
                        // INFINITE LOOP PROTECTION: Check if ability already used this turn
                        const abilityKey = `ability_${index}`;
                        const currentTurn = this.game.state.turnCount;
                        if (card.meta?.usedAbilities?.[abilityKey] === currentTurn) {
                            return; // Skip - already used this turn
                        }

                        // Check Costs
                        let canPay = true;
                        const cost: ActivationCost = effect.cost || {};

                        if (cost.exert) {
                            if (!card.ready || card.turnPlayed === this.game.state.turnCount) {
                                canPay = false;
                            }
                        }

                        if (cost.ink) {
                            const readyInk = player.inkwell.filter(i => i.ready).length;
                            if (readyInk < cost.ink) {
                                canPay = false;
                            }
                        }

                        if (cost.discard) {
                            if (player.hand.length < cost.discard) {
                                canPay = false;
                            }
                        }

                        if (canPay) {
                            actions.push({
                                type: ActionType.UseAbility,
                                playerId,
                                cardId: card.instanceId,
                                abilityIndex: index
                            });
                        }
                    }
                });
            }
        });

        return actions;
    */
    // }

    /**
     * @deprecated Use abilitySystem.resolveQueuedAbilities() instead
     * Resolve The Bag (triggered abilities)
     * Follows Lorcana rules: active player chooses resolution order
     * 
     * This method is kept for backward compatibility but is no longer used.
     * The new AbilitySystemManager handles all triggered ability resolution.
     */
    private async resolveBag(activePlayer: PlayerState) {
        // This method is deprecated and no longer called
        // All ability resolution now happens through AbilitySystemManager
        this.logger.warn('[DEPRECATED] resolveBag called - use abilitySystem.resolveQueuedAbilities instead');
    }
}
