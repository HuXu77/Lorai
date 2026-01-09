/**
 * Ability System Manager
 * 
 * Connects the new parser to the executor and event bus.
 * Registers abilities when cards enter play, executes them when triggered.
 */

import { EventBus } from './event-bus';
import { EffectExecutor, GameContext } from './executor';
import { parseToAbilityDefinition } from '../ability-parser';
import { GameEvent, EventContext } from './events';
import { AbilityDefinition, TriggeredAbility, QueuedAbility, StaticAbility } from './types';
import { EffectAST } from './effect-ast';
import { getCurrentStrength, getCurrentWillpower, getCurrentLore, ActiveEffect } from '../stat-calculator';
import { ZoneType } from '../models';

export class AbilitySystemManager {
    private eventBus: EventBus;
    public executor: EffectExecutor;  // Public for legacy TurnManager access
    private turnManager: any; // TurnManager reference

    // Track which cards have registered abilities
    private registeredCards: Set<any> = new Set();

    // Ability queue for turn-order resolution (The Bag)
    private abilityQueue: Map<any, QueuedAbility[]> = new Map();
    private useQueue: boolean = false;  // Feature flag: false = immediate execution, true = queue for later

    // Static abilities for continuous effect evaluation
    private staticAbilities: Map<any, StaticAbility[]> = new Map(); // card -> static abilities
    private staticAbilityModifiers: Map<string, any> = new Map(); // Cached modifiers for performance

    constructor(turnManager: any) {
        this.turnManager = turnManager;
        this.eventBus = new EventBus();
        this.executor = new EffectExecutor(turnManager);

        // Subscribe to execute triggered abilities
        this.setupExecutionHandler();
    }

    /**
     * Register all abilities for a card
     */
    registerCard(card: any): void {
        // Avoid double-registration
        if (this.registeredCards.has(card)) {
            return;
        }

        // Parse abilities from card (or use existing)
        let abilities: AbilityDefinition[];
        if (card.parsedEffects && card.parsedEffects.length > 0) {
            abilities = card.parsedEffects;
        } else {
            abilities = parseToAbilityDefinition(card);
        }

        // CRITICAL FIX: Store parsed abilities on card instance
        // This is required for keyword detection (e.g., hasAbilityKeyword checks parsedEffects)
        // and for UI to display activated abilities like Boost
        if (!card.parsedEffects || card.parsedEffects.length === 0) {
            card.parsedEffects = abilities as any[];
        }

        // Separate static abilities for continuous evaluation
        const staticAbilities: StaticAbility[] = [];

        // Register each ability by type
        this.turnManager.logger.debug(`[AbilitySystem] registerCard ${card.name}: ${abilities.length} abilities`);
        abilities.forEach((ability, idx) => {
            this.turnManager.logger.debug(`[AbilitySystem] Ability ${idx}: type=${ability.type}, keyword=${(ability as any).keyword}`);
            if (ability.type === 'triggered') {
                this.eventBus.register(ability, card);
            } else if (ability.type === 'static') {
                // Static abilities are tracked separately for continuous evaluation
                staticAbilities.push(ability as StaticAbility);

                // Apply persistent meta properties from keywords (legacy static format)
                const staticAbility = ability as any;
                if (staticAbility.keyword === 'resist' && staticAbility.value) {
                    if (!card.meta) card.meta = {};
                    card.meta.resist = staticAbility.value;
                    this.turnManager.logger.debug(`[AbilitySystem] Applied Resist ${staticAbility.value} to ${card.name} (static)`);
                }

                // Check for nested effects (e.g. grant_keyword in static ability)
                if ((ability as any).effects) {
                    (ability as any).effects.forEach((eff: any) => {
                        if (eff.type === 'grant_keyword' && eff.keyword) {
                            const kw = eff.keyword.toLowerCase();
                            if (kw === 'resist' && eff.amount) {
                                if (!card.meta) card.meta = {};
                                card.meta.resist = eff.amount;
                                this.turnManager.logger.debug(`[AbilitySystem] Applied Resist ${eff.amount} to ${card.name} (nested static)`);
                            } else if (kw === 'singer' && eff.amount) {
                                if (!card.meta) card.meta = {};
                                card.meta.singer = eff.amount;
                            }
                        }
                    });
                }
            } else if (ability.type === 'keyword') {
                // Handle keywords with values (Resist, Singer)
                const kwAbility = ability as any;
                if (kwAbility.keyword && kwAbility.value) {
                    // Normalize keyword
                    const kw = kwAbility.keyword.toLowerCase();
                    if (kw === 'resist') {
                        if (!card.meta) card.meta = {};
                        card.meta.resist = kwAbility.value;
                        this.turnManager.logger.debug(`[AbilitySystem] Applied Resist ${kwAbility.value} to ${card.name} (keyword)`);
                    } else if (kw === 'singer') {
                        if (!card.meta) card.meta = {};
                        card.meta.singer = kwAbility.value;
                    }
                }
            }
            // Activated abilities don't need registration, handled on use
        });

        // Store static abilities if any exist
        if (staticAbilities.length > 0) {
            this.staticAbilities.set(card, staticAbilities);
            this.turnManager.logger.debug(`[AbilitySystem] Registered ${staticAbilities.length} static ability(ies) for ${card.name}`);
        }

        this.registeredCards.add(card);

        this.turnManager.logger.debug(`[AbilitySystem] Registered ${abilities.length} abilities for ${card.fullName || card.name}`);
    }

    /**
     * Register a single ability for a card
     */
    registerAbility(card: any, ability: AbilityDefinition): void {
        if (ability.type === 'triggered' && (ability as TriggeredAbility).event) {
            const triggeredAbility = ability as TriggeredAbility;

            this.eventBus.register(ability, card);
            this.registeredCards.add(card); // Ensure card is marked as having registered abilities

            this.turnManager.logger.debug(`[AbilitySystem] Registered ${ability.type} ability for ${card.name}: ${(ability as TriggeredAbility).event}`);
        }
    }

    /**
     * Unregister a card's abilities (when it leaves play)
     */
    unregisterCard(card: any): void {
        if (!this.registeredCards.has(card)) {
            return;
        }

        // Remove from event bus
        const abilities = parseToAbilityDefinition(card);
        abilities.forEach(ability => {
            if (ability.type === 'triggered') {
                // EventBus.unregister only  takes the card, not individual abilities
                // It removes all listeners for that card
            }
        });
        // Unregister all abilities for this card at once
        this.eventBus.unregister(card);

        // Remove static abilities
        if (this.staticAbilities.has(card)) {
            this.staticAbilities.delete(card);
            this.turnManager.logger.debug(`[AbilitySystem] Unregistered static abilities for ${card.name}`);
        }

        this.registeredCards.delete(card);

        this.turnManager.logger.debug(`[AbilitySystem] Unregistered abilities for ${card.fullName || card.name}`);
    }

    /**
     * Emit an event to trigger abilities
     * Supports two modes:
     * - Immediate (useQueue=false): Execute abilities right away
     * - Queued (useQueue=true): Add to queue for turn-order resolution
     */
    async emitEvent(event: GameEvent, context: any): Promise<void> {
        const triggered = this.eventBus.emit(event, context);

        if (triggered.length > 0) {
            this.turnManager.logger.info(`🎭 [Triggered] ${triggered.length} ability(ies) triggered by ${event}`);

            const filteredTriggers = triggered;

            if (this.useQueue) {
                // QUEUED MODE: Add to queue for later resolution
                for (const listener of filteredTriggers) {
                    this.addToQueue(listener.ability, listener.card, context);
                }
            } else {
                // IMMEDIATE MODE: Execute right away (current behavior)
                for (const listener of filteredTriggers) {
                    this.turnManager.logger.info(`   ↳ Executing: ${listener.card.name}'s "${listener.ability.abilityName || 'ability'}"`);
                    await this.executeAbility(listener.ability, listener.card, context);
                }
            }
        }
    }

    /**
     * Execute a triggered ability
     */
    private async executeAbility(ability: AbilityDefinition, card: any, eventContext: Partial<EventContext>): Promise<void> {
        const triggeredAbility = ability as TriggeredAbility;

        // ===== CHECK EVENT CONDITIONS =====
        // Event conditions filter when an ability can trigger (e.g., "during your turn")
        if (triggeredAbility.eventConditions && triggeredAbility.eventConditions.length > 0) {
            for (const condition of triggeredAbility.eventConditions) {
                const conditionMet = this.evaluateEventCondition(condition, card, eventContext);
                if (!conditionMet) {
                    this.turnManager.logger.debug(`   [EventCondition] Not met for ${card.name}'s ability: ${condition.type}`);
                    return;
                }
            }
        }

        // ===== CRITICAL FIX: Check ability condition before executing =====
        // Bug #6: "if you have 2 or more other characters" conditions were ignored
        if (triggeredAbility.condition) {
            const conditionMet = this.evaluateAbilityCondition(triggeredAbility.condition, card, eventContext);
            if (!conditionMet) {
                // Condition not met, don't execute
                this.turnManager.logger.debug(`   [Condition] Not met for ${card.name}'s ability`);
                return;
            }
        }

        // CRITICAL FIX: The player in gameContext should be the CARD OWNER (controller)
        // not eventContext.player (which is who triggered the event).
        // This ensures that optional prompts (like Bobby's "may draw") go to the card's owner.
        const cardOwner = this.turnManager.game.getPlayer(card.ownerId);

        // ===== OPTIONAL COST CHECK =====
        // If ability has a cost and is optional, skip if player can't pay
        // Example: "You may pay 2 ⬡ to..." - if only 1 ⬡, don't ask
        if (triggeredAbility.cost && triggeredAbility.optional) {
            const player = cardOwner || eventContext.player;

            if (triggeredAbility.cost.ink) {
                const readyInk = player.inkwell.filter((c: any) => !c.exerted).length;
                if (readyInk < triggeredAbility.cost.ink) {
                    this.turnManager.logger.info(`   [Cost] Skipping optional ability for ${card.name}: Insufficient ink (${readyInk}/${triggeredAbility.cost.ink})`);
                    return;
                }
            }
            // Add other cost checks (exert, discard) here if needed
        }

        // Convert AbilityDefinition format to EffectAST format for executor
        const effects = this.convertToEffectAST(triggeredAbility.effects || []);

        // Build game context
        const gameContext: GameContext = {
            player: cardOwner || eventContext.player,  // Use card owner, fallback to event player
            card: card,
            gameState: this.turnManager.game,
            eventContext: eventContext as EventContext,
            abilityName: ability.abilityName,
            abilityText: ability.rawText
        };

        // DEBUG: Log context for triggered abilities
        if (card.name.includes('Cursed Merfolk') || card.name.includes('Belle')) {
            this.turnManager.logger.info(`   [DEBUG] Event Context:`);
            this.turnManager.logger.info(`      Card Owner: ${eventContext.player?.name || 'Unknown'}`);
            this.turnManager.logger.info(`      Triggered Card: ${card.name}`);
            if (eventContext.challenger) {
                this.turnManager.logger.info(`      Challenger: ${eventContext.challenger.name} (Owner: ${this.turnManager.game.getPlayer(eventContext.challenger.ownerId).name})`);
            }
            if (eventContext.targetCard) {
                this.turnManager.logger.info(`      Target: ${eventContext.targetCard.name}`);
            }
        }

        // Execute each effect
        // If an optional effect is declined, stop executing remaining effects
        for (const effect of effects) {
            try {
                const shouldContinue = await this.executor.execute(effect, gameContext);

                // If execute returns false, it means an optional effect was declined
                // Stop executing remaining effects (implements "may X, then Y" logic)
                if (shouldContinue === false) {
                    this.turnManager.logger.info(`   ⏸️  Optional effect declined, skipping remaining effects`);
                    break;
                }
            } catch (error) {
                this.turnManager.logger.error(`[AbilitySystem] Error executing effect:`, error);
            }
        }
    }

    /**
     * Convert AbilityDefinition effect format to EffectAST format
     * Parser already outputs the correct format - no conversion needed!
     */
    private convertToEffectAST(effects: any[]): any[] {
        return effects.map(effect => ({ ...effect }));
    }

    /**
     * Setup handler to execute triggered abilities
     */
    private setupExecutionHandler(): void {
        // The event bus pattern handles this automatically
        // When emitEvent is called, it triggers and executes abilities
    }

    // ========================================================================
    // QUEUE MANAGEMENT (The Bag)
    // ========================================================================

    /**
     * Add a triggered ability to the queue
     */
    private addToQueue(ability: AbilityDefinition, card: any, context: EventContext): void {
        // Determine controller (player who controls the card)
        const controller = context.player;

        if (!this.abilityQueue.has(controller)) {
            this.abilityQueue.set(controller, []);
        }

        this.abilityQueue.get(controller)!.push({
            ability,
            card,
            context,
            controller,
            timestamp: Date.now()
        });

        this.turnManager.logger.debug(`[AbilitySystem] Queued ability for ${card.name} (controller: ${controller.name})`);
    }

    /**
     * Check if a player has queued abilities
     */
    hasQueuedAbilities(player: any): boolean {
        const abilities = this.abilityQueue.get(player);
        return abilities !== undefined && abilities.length > 0;
    }

    /**
     * Get all queued abilities for a player
     */
    getPlayerQueue(player: any): QueuedAbility[] {
        return this.abilityQueue.get(player) || [];
    }

    /**
     * Check if the queue is empty
     */
    isQueueEmpty(): boolean {
        for (const abilities of this.abilityQueue.values()) {
            if (abilities.length > 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Clear all queued abilities
     */
    clearQueue(): void {
        this.abilityQueue.clear();
    }

    /**
     * Enable queue mode (The Bag)
     */
    enableQueue(): void {
        this.useQueue = true;
    }

    /**
     * Disable queue mode (immediate execution)
     */
    disableQueue(): void {
        this.useQueue = false;
    }

    /**
     * Resolve all queued abilities following Lorcana turn-order rules
     * 
     * @param playerChoice - Callback for player to choose which ability to resolve
     */
    async resolveQueuedAbilities(
        playerChoice: (player: any, abilities: QueuedAbility[]) => Promise<QueuedAbility>
    ): Promise<void> {
        // Get turn order starting with active player
        const players = this.turnManager.game.getTurnOrder();

        for (const player of players) {
            // Each player resolves all their abilities (Rule 8.7.5 & 8.7.6)
            while (this.hasQueuedAbilities(player)) {
                const abilities = this.getPlayerQueue(player);

                // Player chooses which ability to resolve (Rule 8.7.4)
                const chosen = await playerChoice(player, abilities);

                // Remove from queue
                this.removeFromQueue(chosen);

                // Resolve the ability
                await this.resolveQueuedAbility(chosen);

                // Note: New triggers added during resolution will be
                // resolved by the current player before moving on (Rule 8.7.6)
            }
        }
    }

    /**
     * Remove a specific ability from the queue
     */
    private removeFromQueue(entry: QueuedAbility): void {
        const playerAbilities = this.abilityQueue.get(entry.controller);
        if (playerAbilities) {
            const index = playerAbilities.indexOf(entry);
            if (index > -1) {
                playerAbilities.splice(index, 1);
            }
        }
    }

    /**
     * Resolve a single queued ability
     */
    private async resolveQueuedAbility(entry: QueuedAbility): Promise<void> {
        this.turnManager.logger.debug(`[AbilitySystem] Resolving queued ability for ${entry.card.name}`);
        await this.executeAbility(entry.ability, entry.card, entry.context);
    }

    // ========================================================================
    // STATIC ABILITIES (Continuous Effects)
    // ========================================================================

    /**
     * Get all static abilities currently active in the game
     */
    getAllStaticAbilities(): Array<{ card: any; ability: StaticAbility }> {
        const result: Array<{ card: any; ability: StaticAbility }> = [];

        for (const [card, abilities] of this.staticAbilities.entries()) {
            for (const ability of abilities) {
                result.push({ card, ability });
            }
        }

        return result;
    }

    /**
     * Get static abilities from a specific card
     */
    getStaticAbilitiesForCard(card: any): StaticAbility[] {
        return this.staticAbilities.get(card) || [];
    }

    /**
     * Evaluate cost modifications from static abilities
     * Used when calculating actual cost to play a card
     */
    getModifiedCost(card: any, player: any): number {
        // PRIORITIZE baseCost if available (SSoT), fallback to cost (legacy/uninitialized)
        let baseCost = (card.baseCost !== undefined) ? card.baseCost : (card.cost || 0);
        let modification = 0;

        // Check all static abilities for cost reduction effects
        for (const [sourceCard, abilities] of this.staticAbilities.entries()) {
            // Only apply abilities from cards the player controls
            if (sourceCard.ownerId !== player.id) continue;

            for (const ability of abilities) {
                // Iterate through effects to find cost modifications
                for (const effect of ability.effects) {
                    // Handle cost_reduction effect type
                    if (effect.type === 'cost_reduction') {
                        // CRITICAL FIX: Check effect condition (e.g., presence of named character)
                        if (effect.condition && !this.evaluatePresenceConditionForCost(effect.condition, player)) {
                            this.turnManager.logger.debug(`[AbilitySystem] Cost reduction condition not met for ${sourceCard.name}`);
                            continue; // Skip if condition not met
                        }
                        // Check if this reduction applies to this card
                        if (this.cardMatchesFilter(card, effect.filter)) {
                            const amount = effect.amount || 1;
                            modification -= amount;
                            this.turnManager.logger.debug(`[AbilitySystem] Cost reduction: -${amount} from ${sourceCard.name}`);
                        }
                    }

                    // Handle modify_stats with cost field (legacy format)
                    if (effect.type === 'modify_stats' && (effect as any).cost !== undefined) {
                        // CRITICAL FIX: Check effect condition
                        if (effect.condition && !this.evaluatePresenceConditionForCost(effect.condition, player)) {
                            continue;
                        }
                        if (this.cardMatchesFilter(card, (effect as any).filter)) {
                            const amount = (effect as any).cost || 1;
                            modification -= amount;
                            this.turnManager.logger.debug(`[AbilitySystem] Cost modification: -${amount} from ${sourceCard.name}`);
                        }
                    }
                }
            }
        }

        // Also check the card being played for self-referencing static abilities
        // (like Tramp's "If you have a character named Lady in play..." or "For each character you have in play...")

        if (card.parsedEffects) {
            for (const ability of card.parsedEffects) {
                if (ability.type !== 'static') continue;

                for (const effect of ability.effects || []) {
                    // Handle cost_reduction with presence condition (Tramp - Enterprising Dog)
                    // "If you have a character named Lady in play, you pay 1 ⬡ less to play this character."
                    if (effect.type === 'cost_reduction') {
                        // Check condition (presence of named character)
                        if (effect.condition && !this.evaluatePresenceConditionForCost(effect.condition, player)) {
                            this.turnManager.logger.debug(`[AbilitySystem] Self cost reduction condition not met for ${card.name}`);
                            continue;
                        }
                        const amount = effect.amount || 1;
                        modification -= amount;
                        this.turnManager.logger.debug(`[AbilitySystem] Self cost reduction: -${amount} for ${card.name} (condition met)`);
                    }

                    if (effect.type === 'cost_reduction_per_character' && effect.appliesTo === 'self') {
                        const reductionPerCard = effect.reductionPerCharacter || 1;
                        const filter = effect.filter || {};

                        // Count matching cards in play
                        let count = 0;
                        for (const playCard of player.play) {
                            const classification = filter.classification?.toLowerCase();

                            if (classification === 'character' || !classification) {
                                // Match all characters
                                if (playCard.type === 'Character') {
                                    count++;
                                }
                            } else if (classification === 'item') {
                                if (playCard.type === 'Item') {
                                    count++;
                                }
                            } else {
                                // Check for subtype match (e.g., "Sorcerer")
                                const subtypes = playCard.subtypes || playCard.classifications || [];
                                if (subtypes.some((s: string) => s.toLowerCase() === classification)) {
                                    count++;
                                }
                            }
                        }

                        const totalReduction = count * reductionPerCard;
                        modification -= totalReduction;
                        this.turnManager.logger.debug(`[AbilitySystem] Cost reduction per character: -${totalReduction} (${count} cards x ${reductionPerCard}) for ${card.name}`);
                    }

                    // Handle cost_reduction_per_card (e.g. Kristoff - Reindeer Keeper: "For each song card in your discard")
                    if (effect.type === 'cost_reduction_per_card' && effect.appliesTo === 'self') {
                        const reductionPerCard = effect.reductionPerCard || 1;
                        const filter = effect.filter || {};
                        const location = effect.location || 'play'; // Default to play if not specified, though 'per_character' covers play usually

                        let count = 0;
                        let cardsToCheck: any[] = [];

                        if (location === 'discard') {
                            cardsToCheck = player.discard;
                        } else if (location === 'hand') {
                            cardsToCheck = player.hand;
                        }
                        // Add more locations if needed

                        const classification = filter.classification?.toLowerCase();

                        // Helper to match classification/subtype
                        // "song" is a subtype for Actions.
                        for (const checkCard of cardsToCheck) {
                            if (classification) {
                                // Subtypes/Classifications check
                                const subtypes = checkCard.subtypes || checkCard.classifications || [];
                                // Also check exact type match if classification is 'item' etc. (handled loosely here)
                                if (subtypes.some((s: string) => s.toLowerCase() === classification)) {
                                    count++;
                                }
                            }
                        }

                        const totalReduction = count * reductionPerCard;
                        modification -= totalReduction;
                        this.turnManager.logger.debug(`[AbilitySystem] Cost reduction per card (${location}): -${totalReduction} (${count} cards x ${reductionPerCard}) for ${card.name}`);
                    }
                }
            }
        }

        // Apply Temporary/Global Cost Reductions (e.g. Lantern, "Your characters cost 1 less")
        if (player.costReductions && player.costReductions.length > 0) {
            const applicableReductions = player.costReductions.filter((r: any) => {
                const filter = r.filter?.toLowerCase();
                if (filter === 'all') return true;
                if (filter === 'character' && card.type === 'Character') return true;
                if (filter === 'action' && card.type === 'Action') return true;
                if (filter === 'item' && card.type === 'Item') return true;
                return false;
            });

            const totalReduction = applicableReductions.reduce((sum: number, r: any) => sum + r.amount, 0);
            modification -= totalReduction;

            if (totalReduction > 0) {
                this.turnManager.logger.debug(`[AbilitySystem] Global cost reduction: -${totalReduction} for ${card.name}`);
            }
        }

        return Math.max(0, baseCost + modification);
    }

    /**
     * Evaluate shift cost modifications from static abilities
     * Used when calculating actual cost to shift a card
     */
    getModifiedShiftCost(card: any, player: any, baseShiftCost: number): number {
        let modification = 0;

        // Check all static abilities for shift cost reduction effects
        for (const [sourceCard, abilities] of this.staticAbilities.entries()) {
            // Only apply abilities from cards the player controls
            if (sourceCard.ownerId !== player.id) continue;

            for (const ability of abilities) {
                for (const effect of ability.effects) {
                    // Handle shift_cost_reduction effect type (cast to any for dynamic checking)
                    const effectAny = effect as any;
                    if (effectAny.type === 'shift_cost_reduction') {
                        if (effectAny.condition && !this.evaluatePresenceConditionForCost(effectAny.condition, player)) {
                            continue;
                        }
                        if (this.cardMatchesFilter(card, effectAny.filter)) {
                            const amount = effectAny.amount || 1;
                            modification -= amount;
                            this.turnManager.logger.debug(`[AbilitySystem] Shift cost reduction: -${amount} from ${sourceCard.name}`);
                        }
                    }
                }
            }
        }

        // Check the card's own abilities for self-referencing shift cost reductions
        if (card.parsedEffects) {
            for (const ability of card.parsedEffects) {
                if (ability.type !== 'static') continue;

                for (const effect of ability.effects || []) {
                    if (effect.type === 'shift_cost_reduction') {
                        if (effect.condition && !this.evaluatePresenceConditionForCost(effect.condition, player)) {
                            continue;
                        }
                        const amount = effect.amount || 1;
                        modification -= amount;
                        this.turnManager.logger.debug(`[AbilitySystem] Self shift cost reduction: -${amount} for ${card.name}`);
                    }
                }
            }
        }

        return Math.max(0, baseShiftCost + modification);
    }

    /**
     * Calculate modified move cost for a character moving to a location
     */
    getModifiedMoveCost(character: any, location: any): number {
        const baseMoveCost = location.moveCost || 0;
        let modification = 0;

        const player = this.turnManager.game.getPlayer(character.ownerId);

        // 1. Check Active Effects (Global)
        // e.g. "Your characters move for free"
        if (this.turnManager.game.state.activeEffects) {
            this.turnManager.game.state.activeEffects.forEach((effect: any) => {
                if (effect.move_cost_reduction) {
                    // Check target filter
                    if (this.cardMatchesFilter(character, effect.target)) {
                        modification -= effect.move_cost_reduction;
                    }
                }
                // Handle new 'move_cost_modifier' type
                if (effect.type === 'move_cost_modifier' || effect.type === 'move_cost_reduction') {
                    // TODO: Robust target checking (is it modifying THIS character?)
                    // For now assuming simplistic global or character-specific match
                }
            });
        }

        // 2. Check Static Abilities on the Location itself
        // e.g. "Characters move here for free" (The Queen's Castle)
        if (this.staticAbilities.has(location)) {
            const abilities = this.staticAbilities.get(location) || [];
            abilities.forEach(ability => {
                if (ability.type === 'static' && ability.effects) {
                    (ability.effects as any[]).forEach(effect => {
                        if (effect.type === 'move_cost_reduction' || effect.type === 'move_cost_modifier') {
                            // Check if it applies to the moving character
                            // Usually "Characters move to this location for free" implies NO target filter on the character, just the location context
                            const amount = (effect as any).amount;
                            if (amount === 'free' || amount === 99) {
                                modification = -999; // Make it free
                            } else if (typeof amount === 'number') {
                                modification -= amount;
                            }
                        }
                    });
                }
            });
        }

        // 3. Check Static Abilities on the Character
        // e.g. "This character moves for 1 less"
        if (this.staticAbilities.has(character)) {
            const abilities = this.staticAbilities.get(character) || [];
            abilities.forEach(ability => {
                if (ability.type === 'static' && ability.effects) {
                    ability.effects.forEach(effect => {
                        if (effect.type === 'move_cost_reduction' && (effect as any).target === 'self') {
                            const amount = (effect as any).amount;
                            if (typeof amount === 'number') {
                                modification -= amount;
                            }
                        }
                    });
                }
            });
        }

        return Math.max(0, baseMoveCost + modification);
    }

    /**
     * Evaluate stat modifications from static abilities
     * Used when calculating current strength/willpower
     */
    getModifiedStat(card: any, stat: 'strength' | 'willpower' | 'lore'): number {
        // Use the centralized stat calculator which correctly handles base stats and active effects
        // This prevents double-counting of static abilities that are already registered as active effects
        let val = 0;

        switch (stat) {
            case 'strength':
                val = getCurrentStrength(card, this.turnManager.game.state);
                break;
            case 'willpower':
                val = getCurrentWillpower(card, this.turnManager.game.state);
                break;
            case 'lore':
                val = getCurrentLore(card, this.turnManager.game.state);
                break;
        }

        // Apply Static Abilities (Continuous Effects)
        // These are stored in this.staticAbilities and not always in activeEffects
        for (const [sourceCard, abilities] of this.staticAbilities.entries()) {
            // Check if source card is in play (or acts from other zones if specified)
            if (sourceCard.zone !== ZoneType.Play) continue;

            for (const ability of abilities) {
                for (const effect of ability.effects) {
                    // Check if effect modifies the requested stat
                    if (effect.type === 'modify_stats') {
                        const amount = this.getStatModificationAmount(effect, stat);
                        if (amount === 0) continue;


                        // Check conditions
                        if ((ability as any).condition) {
                            const cond = (ability as any).condition;
                            const result = this.evaluateEffectCondition(cond, this.turnManager.game.getPlayer(sourceCard.ownerId), sourceCard);
                            if (!result) continue;
                        }

                        if (effect.condition) {
                            const result = this.evaluateEffectCondition(effect.condition, this.turnManager.game.getPlayer(sourceCard.ownerId), sourceCard);
                            if (!result) continue;
                        }

                        // Determine if this card is the target

                        let isTarget = false;
                        const targetType = (effect as any).target;


                        // Handle both string 'self' and object { type: 'self' }
                        const isSelfTarget = !targetType || targetType === 'self' || targetType.type === 'self';
                        const isAllCharacters = targetType === 'all_characters' || targetType?.type === 'all_characters';

                        if (sourceCard.instanceId === card.instanceId && isSelfTarget) {
                            isTarget = true;
                        } else if (isAllCharacters) {
                            isTarget = true;
                        }




                        // Add other target types if needed (e.g. 'all_opposing_characters')

                        // If target, apply amount
                        if (isTarget) {
                            val += amount;
                            this.turnManager.logger.debug(`[AbilitySystem] Static Stat Mod: ${amount >= 0 ? '+' : ''}${amount} ${stat} for ${card.name} from ${sourceCard.name}`);
                        }
                    }
                }
            }
        }

        // Check for specific triggered/conditional bonuses on the card itself (e.g. "When X, this gets +1 Lore")
        // This handles "during_your_turn_conditional" used in actions.ts:calculateConditionalLore
        // These are typically legacy or specific triggers not yet fully migrated to activeEffects
        if (stat === 'lore' && card.parsedEffects) {
            let conditionalModification = 0;
            card.parsedEffects.forEach((ability: any) => {
                if (ability.trigger === 'during_your_turn_conditional' &&
                    ability.action === 'conditional_lore_buff') {

                    // Check condition
                    const params = ability.params?.condition;
                    if (params?.type === 'cards_left_discard') {
                        const threshold = params.threshold || 1;

                        // Access turn history from game state
                        const turnHistory = this.turnManager.game.state.turnHistory;
                        const turnCount = this.turnManager.game.state.turnCount;

                        // Count cards that left discard this turn using ZoneType string literals
                        const cardsLeftDiscard = turnHistory?.zoneChanges?.filter(
                            (zc: any) => zc.fromZone === 'Discard' && zc.turnNumber === turnCount
                        ).length || 0;

                        if (cardsLeftDiscard >= threshold) {
                            const loreBonus = typeof ability.amount === 'number' ? ability.amount : 0;
                            conditionalModification += loreBonus;
                            this.turnManager.logger.debug(`[AbilitySystem] Conditional Lore: +${loreBonus} for ${card.name} (${cardsLeftDiscard} cards left discard).`);
                        }
                    }
                }
            });
            val += conditionalModification;
        }

        return Math.max(0, val);
    }

    /**
     * Get the effective keywords for a card, including those granted by static abilities
     * e.g. "During your turn, this character has Ward"
     */


    /**
     * Get the modified Resist value for a card
     * Aggregates Resist from base stats, static abilities, and active effects
     */
    getModifiedResist(card: any, player: any): number {
        let resist = 0;

        // 0. Check meta.resist (set by recalculateEffects or tests, fallback for manual setup)
        if (card.meta?.resist && typeof card.meta.resist === 'number') {
            resist += card.meta.resist;
        }

        // 1. Card's own native Resist (from parsedEffects - e.g., Troubadour "Resist +1")
        // Only check if meta.resist wasn't set (avoid double-counting when recalculate already ran)
        if (!card.meta?.resist && card.parsedEffects) {
            for (const effect of card.parsedEffects) {
                if (effect.type === 'static' && effect.keyword === 'resist' && effect.value) {
                    resist += effect.value;
                }
                // Also check for keyword_resist format
                if (effect.action === 'keyword_resist' && effect.amount) {
                    resist += effect.amount;
                }
            }
        }

        // 2. Card's keywords array (may include Resist from base card data)
        // Only check if meta.resist wasn't set
        if (!card.meta?.resist && card.keywords) {
            for (const kw of card.keywords) {
                if (typeof kw === 'string' && kw.toLowerCase().startsWith('resist')) {
                    const match = kw.match(/resist\s*\+?(\d+)/i);
                    if (match) {
                        resist += parseInt(match[1]);
                    }
                }
            }
        }

        // 3. Static Abilities (Continuous) - other cards granting Resist to this card
        for (const [sourceCard, abilities] of this.staticAbilities.entries()) {
            // Check if source card is in play
            if (sourceCard.zone !== ZoneType.Play) continue;

            for (const ability of abilities) {
                // Check ability-level conditions
                if (ability.condition && !this.evaluateEffectCondition(ability.condition, this.turnManager.game.getPlayer(sourceCard.ownerId), sourceCard)) {
                    continue;
                }

                for (const effect of ability.effects) {
                    // Check effect-level conditions
                    if ('condition' in effect && effect.condition && !this.evaluateEffectCondition(effect.condition, this.turnManager.game.getPlayer(sourceCard.ownerId), sourceCard)) {
                        continue;
                    }

                    // Check if ability grants Resist
                    let amount = 0;
                    if (effect.type === 'grant_keyword' && effect.keyword?.toLowerCase() === 'resist') {
                        amount = effect.amount || 0;
                    } else if (effect.type === 'keyword' && effect.keyword?.toLowerCase() === 'resist') {
                        amount = effect.keywordValueNumber || 0;
                    }

                    if (amount > 0) {
                        // Check targeting
                        let isTarget = false;

                        // Determine target - check if 'target' exists on the effect type
                        const target = 'target' in effect ? effect.target : undefined;

                        if (sourceCard.instanceId === card.instanceId && (!target || target.type === 'self')) {
                            isTarget = true;
                        } else if (target) {
                            if (target.type === 'your_characters' && sourceCard.ownerId === card.ownerId && card.type === 'Character') {
                                isTarget = this.cardMatchesFilter(card, target.filter);
                            } else if (target.type === 'all_characters' && card.type === 'Character') {
                                isTarget = this.cardMatchesFilter(card, target.filter);
                            }
                            // Add other target types as needed
                        }

                        if (isTarget) {
                            resist += amount;
                        }
                    }
                }
            }
        }

        // 3. Active Effects (Temporary/Turn-based)
        if (this.turnManager.game && this.turnManager.game.state.activeEffects) {
            for (const e of this.turnManager.game.state.activeEffects) {
                // Cast to ActiveEffect to access properties like keyword, value, targetCardId
                // The state defines it as ContinuousEffect, but runtime usage implies ActiveEffect structure
                const effect = e as unknown as ActiveEffect;

                // Check targeting
                const isTarget = effect.targetCardId === card.instanceId ||
                    (effect.targetCardId && effect.targetCardId.includes(card.instanceId)) || // handle targetCardIds? activeEffect def has targetCardId string. Code assumed array.
                    (effect.sourceCardId === card.instanceId && (effect as any).target === 'self');

                if (!isTarget) continue;

                // Check condition
                if (effect.condition && !this.evaluateEffectCondition({ type: effect.condition }, player, card)) {
                    continue;
                }

                // Check for 'grant_keyword' (Modern) OR 'modification' with 'grant_keyword' (Legacy/Actions)
                let kw = '';
                let val = 0;

                if (effect.type === 'grant_keyword' && effect.keyword) {
                    kw = effect.keyword.toLowerCase();
                    val = effect.value || 0;
                } else if ((effect as any).type === 'modification' && (effect as any).modificationType === 'grant_keyword') {
                    // Start of legacy support
                    const params = (effect as any).params;
                    if (params && params.keyword) {
                        kw = params.keyword.toLowerCase();
                        // Legacy often puts the value in the string "Resist +1"
                    }
                }

                if (kw && kw.startsWith('resist')) {
                    // Parse amount from string like "Resist +2" or just "Resist" (default 1?)
                    // Usually stored as "Resist +N"
                    if (kw.includes('+')) {
                        const match = kw.match(/\+(\d+)/);
                        if (match) {
                            resist += parseInt(match[1]);
                        }
                    } else if (kw === 'resist') {
                        // If just "Resist" without number, assume 1? Or look for effect.value?
                        // effect.value implies amount.
                        if (val > 0) {
                            resist += val;
                        } else {
                            // Fallback if no value found but keyword is just 'resist'
                            // This might be risky if it's "Resist +0" ?
                            // But usually Resist means at least 1.
                            // Let's assume if it matched "resist" exact string it might need a value.
                            // But the regex above handles "+N".
                        }
                    }
                }
            }
        }

        return resist;
    }

    /**
     * Get the effective keywords for a card, including those granted by static abilities AND active effects
     * e.g. "During your turn, this character has Ward"
     */
    getModifiedKeywords(card: any, player: any): string[] {
        // Start with base keywords (SSoT)
        // Use a Set to avoid duplicates
        const keywords = new Set<string>(card.baseKeywords || []);

        // Helper to add keywords from effects
        const processEffects = (abilities: any[], sourceCard: any) => {
            for (const ability of abilities) {
                // Check ability-level conditions
                if (ability.condition && !this.evaluateEffectCondition(ability.condition, this.turnManager.game.getPlayer(sourceCard.ownerId), sourceCard)) {
                    continue;
                }

                for (const effect of ability.effects) {
                    // Check effect-level conditions
                    if ('condition' in effect && effect.condition && !this.evaluateEffectCondition(effect.condition, this.turnManager.game.getPlayer(sourceCard.ownerId), sourceCard)) {
                        continue;
                    }

                    // Handle 'grant_keyword' and simple 'keyword' type
                    if (effect.type === 'grant_keyword' || effect.type === 'keyword') {
                        // Check target/filter
                        let isTarget = false;

                        const target = 'target' in effect ? effect.target : undefined;

                        // Self targeting (implied or explicit)
                        if (sourceCard.instanceId === card.instanceId && (!target || target.type === 'self')) {
                            isTarget = true;
                        }
                        // Area targeting
                        else if (target) {
                            if (target.type === 'your_characters' && sourceCard.ownerId === card.ownerId && card.type === 'Character') {
                                isTarget = this.cardMatchesFilter(card, target.filter);
                            } else if (target.type === 'all_characters' && card.type === 'Character') {
                                isTarget = this.cardMatchesFilter(card, target.filter);
                            }
                            // Add more target types as needed
                        }

                        if (isTarget) {
                            if ('keyword' in effect && effect.keyword) keywords.add(effect.keyword);
                            // this.turnManager.logger.debug(`[AbilitySystem] Granting keyword ${effect.keyword} to ${card.name} from ${sourceCard.name}`);
                        }
                    }
                }
            }
        };

        // 1. Check global static abilities (registered from other cards)
        for (const [sourceCard, abilities] of this.staticAbilities.entries()) {
            if (sourceCard.zone !== ZoneType.Play && sourceCard.zone !== ZoneType.Inkwell) continue; // Inkwell items might have static abilities? usually just Play
            // Only active cards
            if (sourceCard.zone !== ZoneType.Play) continue;

            processEffects(abilities, sourceCard);
        }

        // 2. Check Active Effects
        if (this.turnManager.game && this.turnManager.game.state.activeEffects) {
            for (const e of this.turnManager.game.state.activeEffects) {
                const effect = e as unknown as ActiveEffect;

                // Check targeting
                const isTarget = effect.targetCardId === card.instanceId ||
                    ((effect as any).targetCardIds && (effect as any).targetCardIds.includes(card.instanceId)) ||
                    (effect.sourceCardId === card.instanceId && (effect as any).target === 'self');

                if (!isTarget) continue;

                // Check condition
                if (effect.condition && !this.evaluateEffectCondition({ type: effect.condition }, player, card)) {
                    continue;
                }

                if (effect.type === 'grant_keyword' && effect.keyword) {
                    keywords.add(effect.keyword);
                }
            }
        }

        return Array.from(keywords);
    }

    /**
     * Evaluate a condition attached to a specific effect
     * This mirrors checkConditionForLore in actions.ts
     */
    private evaluateEffectCondition(condition: any, player: any, card: any): boolean {
        if (!condition) return true;

        switch (condition.type) {
            case 'presence':
                return this.evaluatePresenceConditionForCost(condition, player);
            case 'self_exerted':
                return !card.ready;
            case 'at_location':
                // Not implemented fully yet, placeholder
                return false;
            case 'control_card':
                // Check if player controls a specific card
                // Logic implementation pending depending on condition structure
                // For now reusing presence helper if structure matches
                return this.evaluatePresenceConditionForCost(condition, player);
            case 'during_your_turn':
                return this.turnManager.game.state.turnPlayerId === player.id;
            case 'has_card_under':
                return card.meta && card.meta.cardsUnder && card.meta.cardsUnder.length > 0;
            default:
                return false;
        }
    }



    /**
     * Evaluate presence condition for cost calculations
     * Used to check conditions like "If you have a character named Lady in play"
     */
    private evaluatePresenceConditionForCost(condition: any, player: any): boolean {
        if (!condition) return true;

        switch (condition.type) {
            case 'presence':
                // Check if player has a card matching the filter in play
                if (!condition.filter) return true;
                return player.play.some((card: any) => {
                    const nameMatch = (card.name === condition.filter.name) || (card.fullName === condition.filter.name);

                    if (condition.filter.name && !nameMatch) return false;

                    if (condition.filter.subtype) {
                        const subtypes = card.subtypes || card.classifications || [];
                        if (!subtypes.some((s: string) => s.toLowerCase() === condition.filter.subtype.toLowerCase())) {
                            return false;
                        }
                    }

                    return true;
                });

            default:
                // Unknown condition type - pass by default (fail open)
                this.turnManager.logger.debug(`[AbilitySystem] Unknown cost condition type: ${condition.type}`);
                return true;
        }
    }

    /**
     * Check if a card matches a filter
     */
    private cardMatchesFilter(card: any, filter: any): boolean {
        if (!filter) return true;

        // Check card type
        if (filter.cardType && card.type !== filter.cardType) {
            return false;
        }

        // Check cost
        if (filter.maxCost !== undefined && (card.cost || 0) > filter.maxCost) {
            return false;
        }

        if (filter.minCost !== undefined && (card.cost || 0) < filter.minCost) {
            return false;
        }

        // Check subtypes/classifications
        if (filter.subtype) {
            let targetSubtype = filter.subtype;
            const lowerSubtype = targetSubtype.toLowerCase();

            // Handle "exerted" prefix
            if (lowerSubtype.startsWith('exerted ')) {
                if (card.ready) return false;
                targetSubtype = targetSubtype.substring(8);
            }

            // Handle "ready" prefix
            else if (lowerSubtype.startsWith('ready ')) {
                if (!card.ready) return false;
                targetSubtype = targetSubtype.substring(6);
            }

            // Check if card has the subtype (case-sensitive check as per existing logic, or loose?)
            // Existing logic used .includes(filter.subtype).
            // We'll stick to that but use the stripped subtype.
            if (!card.classifications || !card.classifications.some((c: string) => c === targetSubtype || c.toLowerCase() === targetSubtype.toLowerCase())) {
                return false;
            }
        }

        return true;
    }

    /**
     * Evaluate ability conditions
     */
    private evaluateConditions(ability: any, targetCard: any, sourceCard: any): boolean {
        // If no conditions, always applies
        if (!ability.eventConditions || ability.eventConditions.length === 0) {
            return true;
        }

        // Evaluate each condition
        for (const condition of ability.eventConditions) {
            if (condition.type === 'while_here') {
                // Check if target card is at the same location as source
                if (targetCard.meta?.location !== sourceCard.instanceId) {
                    return false;
                }
            }
            // Add more condition types as needed
        }

        return true;
    }

    /**
     * Evaluate event condition (e.g., "during your turn")
     * These conditions filter when an ability can trigger
     */
    private evaluateEventCondition(condition: any, card: any, eventContext: Partial<EventContext>): boolean {
        if (!condition) return true;

        switch (condition.type) {
            case 'during_your_turn':
                // Check if it's the card owner's turn
                const currentTurnPlayer = this.turnManager.game.state.turnPlayerId;
                const cardOwner = card.ownerId;
                const isYourTurn = currentTurnPlayer === cardOwner;

                this.turnManager.logger.debug(`   [EventCondition] during_your_turn: current=${currentTurnPlayer}, owner=${cardOwner}, result=${isYourTurn}`);
                return isYourTurn;

            case 'opponents_turn':
                // Check if it's NOT the card owner's turn (i.e., opponent's turn)
                const currentPlayer = this.turnManager.game.state.turnPlayerId;
                const owner = card.ownerId;
                const isOpponentsTurn = currentPlayer !== owner;

                this.turnManager.logger.debug(`   [EventCondition] opponents_turn: current=${currentPlayer}, owner=${owner}, result=${isOpponentsTurn}`);
                return isOpponentsTurn;

            case 'while_here':
                // Check if target card is at the same location as source
                if (eventContext.card && eventContext.card.meta?.location === card.instanceId) {
                    return true;
                }
                return false;

            // Add more event condition types as needed
            default:
                this.turnManager.logger.debug(`   [EventCondition] Unknown condition type: ${condition.type}`);
                return true; // Default to true for unknown types (fail open)
        }
    }

    /**
     * Evaluate root-level ability condition (e.g. "if you have 2 or more other characters")
     * This is different from eventConditions which are for filtering events
     */
    private evaluateAbilityCondition(condition: any, card: any, eventContext: Partial<EventContext>): boolean {
        if (!condition) return true;

        switch (condition.type) {
            case 'min_other_characters':
                // "if you have X or more other characters in play"
                const player = this.turnManager.game.getPlayer(card.ownerId);
                if (!player) return false;

                const otherCharacters = player.play.filter((c: any) =>
                    c.type === 'Character' && c.instanceId !== card.instanceId
                );

                const required = condition.amount || 2;
                const actual = otherCharacters.length;

                this.turnManager.logger.debug(`   [Condition] min_other_characters: need ${required}, have ${actual}`);
                return actual >= required;

            case 'presence':
                // "if you have a character named X in play"
                const owner = this.turnManager.game.getPlayer(card.ownerId);
                if (!owner || !condition.filter) return false;

                const hasCard = owner.play.some((c: any) =>
                    condition.filter.name ? c.name === condition.filter.name : true
                );

                return hasCard;

            case 'has_character_in_play':
                // "if you have a [subtype] character in play"
                const sourceOwner = this.turnManager.game.getPlayer(card.ownerId);
                if (!sourceOwner) return false;

                const hasSubtype = sourceOwner.play.some((c: any) =>
                    c.type === 'Character' &&
                    c.classifications &&
                    c.classifications.includes(condition.subtype)
                );

                return hasSubtype;

            case 'in_discard':
                // "if this card is in your discard"
                return card.zone === ZoneType.Discard;

            case 'has_character':
                // "if you have a [filter] character in play"
                const hasCharacterOwner = this.turnManager.game.getPlayer(card.ownerId);
                if (!hasCharacterOwner || !condition.filter) return false;

                return hasCharacterOwner.play.some((c: any) => {
                    const filter = condition.filter;
                    if (filter.name && c.name !== filter.name && c.fullName !== filter.name) return false;

                    if (filter.classifications && Array.isArray(filter.classifications)) {
                        const subtypes = c.subtypes || c.classifications || [];
                        const hasClassification = filter.classifications.some((cls: string) =>
                            subtypes.some((s: string) => s.toLowerCase() === cls.toLowerCase())
                        );
                        if (!hasClassification) return false;
                    }

                    if (filter.subtype) {
                        const subtypes = c.subtypes || c.classifications || [];
                        if (!subtypes.some((s: string) => s.toLowerCase() === filter.subtype.toLowerCase())) {
                            return false;
                        }
                    }

                    return true;
                });

            // Add more condition types as needed
            default:
                this.turnManager.logger.debug(`   [Condition] Unknown condition type: ${condition.type}`);
                return true; // Default to true for unknown types (fail open)
        }
    }


    /**
     * Check if an effect applies to a specific card
     */
    private effectAppliesToCard(effect: any, targetCard: any, sourceCard: any): boolean {
        // If no target specified, affects self
        if (!effect.target) {
            return targetCard.instanceId === sourceCard.instanceId;
        }

        // Check target type
        const target = effect.target;

        if (target.type === 'self') {
            return targetCard.instanceId === sourceCard.instanceId;
        }

        if (target.type === 'all_characters' || target.type === 'all_friendly_characters') {
            // Affects all characters (or all friendly characters)
            if (targetCard.type !== 'Character') return false;

            // Check if target is friendly (same owner)
            if (target.type === 'all_friendly_characters') {
                return targetCard.ownerId === sourceCard.ownerId;
            }

            return true;
        }

        // For other target types, assume it doesn't apply (needs more implementation)
        return false;
    }

    /**
     * Get stat modification amount from effect
     */
    private getStatModificationAmount(effect: any, stat: string): number {
        // Check if effect has modifiers map
        if (effect.modifiers && effect.modifiers[stat] !== undefined) {
            return effect.modifiers[stat];
        }

        // Check if effect specifies this stat
        if (effect.stat === stat && effect.amount !== undefined) {
            return effect.amount;
        }

        // No modification for this stat
        return 0;
    }

    /**
     * Clear cached modifiers (call when game state changes)
     */
    clearModifierCache(): void {
        this.staticAbilityModifiers.clear();
    }

    /**
     * Get event bus (for direct access if needed)
     */
    getEventBus(): EventBus {
        return this.eventBus;
    }

    /**
     * Get executor (for direct access if needed)
     */
    getExecutor(): EffectExecutor {
        return this.executor;
    }
    /**
     * Execute abilities for an Action card immediately
     */
    async executeActionCard(card: any, player: any, targetCard?: any, payload?: any): Promise<void> {
        // Parse abilities (use cached if available)
        const abilities = (card.parsedEffects && card.parsedEffects.length > 0)
            ? card.parsedEffects
            : parseToAbilityDefinition(card);

        for (const ability of abilities) {
            const gameContext: GameContext = {
                player,
                card,
                gameState: this.turnManager.game,
                eventContext: {
                    player,
                    sourceCard: card,
                    targetCard,
                    event: GameEvent.CARD_PLAYED, // Treat as card played event
                    timestamp: Date.now()
                },
                abilityName: ability.abilityName || card.name,
                abilityText: ability.rawText,
                modalChoice: payload?.modalChoice
            };

            // If type is 'modal', we treat it as an effect to execute directly.
            if ((ability as any).type === 'modal') {
                const effect = ability as any;
                await this.executor.execute(effect, gameContext);
            }

            // If type is 'triggered' or 'activated' or 'resolution' (for Action cards), execute its effects
            else if ((ability as any).type === 'triggered' || (ability as any).type === 'activated' || (ability as any).type === 'resolution') {
                const triggeredAbility = ability as TriggeredAbility; // or ActivatedAbility (compatible structure for effects)
                const effects = triggeredAbility.effects || [];
                for (const effect of effects) {
                    try {
                        this.turnManager.logger.debug(`[AbilitySystem] Executing action effect: ${effect.type}`);
                        // Propagate duration from ability to effect if not present
                        const effectWithDuration = {
                            ...effect,
                            duration: (effect as any).duration || ability.duration
                        };
                        await this.executor.execute(effectWithDuration, gameContext);
                    } catch (error) {
                        this.turnManager.logger.error(`[AbilitySystem] Error executing action effect:`, error);
                    }
                }
            }
            // If type is 'static' or 'activated' (Action card effects), execute its effect(s)
            else if ((ability as any).type === 'static' || (ability as any).type === 'activated') {
                const staticAbility = ability as any;
                // Handle single effect (legacy static)
                if (staticAbility.effect) {
                    try {
                        await this.executor.execute(staticAbility.effect, gameContext);
                    } catch (error) {
                        this.turnManager.logger.error(`[AbilitySystem] Error executing static/activated action effect:`, error);
                    }
                }
                // Handle effects array (activated/new static)
                if (staticAbility.effects && Array.isArray(staticAbility.effects)) {
                    for (const effect of staticAbility.effects) {
                        // Skip metadata-only effects that aren't executable
                        // sing_cost is metadata about WHO can sing the song, not an executable effect
                        if (effect.type === 'sing_cost') {
                            this.turnManager.logger.debug(`[AbilitySystem] Skipping metadata effect: sing_cost (minCost: ${effect.minCost})`);
                            continue;
                        }

                        try {
                            await this.executor.execute(effect, gameContext);
                        } catch (error) {
                            this.turnManager.logger.error(`[AbilitySystem] Error executing static/activated action effect from list:`, error);
                        }
                    }
                }
            }
        }
    }

    /**
     * Cleanup temporary abilities at end of turn
     * Removes abilities marked as 'until_end_of_turn'
     */
    cleanupTurnBasedAbilities(): void {
        this.turnManager.logger.debug('[AbilitySystem] Cleaning up turn-based abilities...');

        // Parse each card once and cache the results
        const cardAbilities: Map<any, any[]> = new Map();
        this.registeredCards.forEach(card => {
            const abilities = parseToAbilityDefinition(card);
            cardAbilities.set(card, abilities);
        });

        // Find cards with temporary abilities
        const cardsToReparse: any[] = [];
        cardAbilities.forEach((abilities, card) => {
            const hasTemporary = abilities.some(a => a.duration === 'until_end_of_turn');
            if (hasTemporary) {
                cardsToReparse.push(card);
            }
        });


        // Unregister and re-register cards that had temporary abilities
        // This removes the temporary listeners from the event bus
        let listenersRemoved = 0;
        cardsToReparse.forEach(card => {
            this.eventBus.unregister(card);
            listenersRemoved++;

            // Re-register only permanent abilities (use cached parse result)
            const abilities = cardAbilities.get(card)!;
            abilities.forEach(ability => {
                if (ability.type === 'triggered' && ability.duration !== 'until_end_of_turn') {
                    this.eventBus.register(ability, card);
                }
            });
        });

        // Log cleanup summary
        if (listenersRemoved > 0) {
            if (listenersRemoved > 0) {
            }
        }

        this.turnManager.logger.debug('[AbilitySystem] Cleaned up temporary abilities from ' + cardsToReparse.length + ' card(s)');
    }
}
