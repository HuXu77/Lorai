/**
 * EffectExecutor - Lorcana Card Ability Execution Engine
 * ======================================================
 * 
 * This is the core executor that interprets parsed card abilities (EffectAST nodes)
 * and executes them against the game state. It handles 100+ different effect types,
 * targeting patterns, and conditional logic.
 * 
 * ARCHITECTURE:
 * - Main executor with 98 effect handler methods
 * - Family handlers for related effects (cost, damage, ready/exert, deck manipulation)
 * - Targeting resolution system
 * - Condition evaluation system
 * - Choice/modal effect handling
 * 
 * SUPPORTED FEATURES:
 * - Core Effects: damage, heal, draw, discard, banish, etc.
 * - Stat Modifications: strength, willpower, lore
 * - Keywords: grant abilities like Evasive, Challenger, etc.
 * - Restrictions: can't quest, can't challenge, etc.
 * - Deck Manipulation: search, reveal, shuffle, look
 * - Zone Changes: hand, play, discard, deck, inkwell
 * - Opponent Interactions: opponent choice, reveal hand, discard
 * - Conditional Logic: if/then, while conditions, count checks
 * - Complex Mechanics: for_each loops, modal choices, sequences
 * 
 * USAGE:
 * ```typescript
 * const executor = new EffectExecutor(turnManager);
 * await executor.execute(effectAST, context);
 * ```
 * 
 * ORGANIZATION:
 * - Lines 1-200: Initialization, helpers, targeting
 * - Lines 200-600: Main execute switch statement
 * - Lines 600-1800: Core effect handlers
 * - Lines 1800-2700: Advanced effect handlers
 * - Lines 2700-3500: Complex mechanics handlers
 * - Lines 3500-4100: Targeting and condition evaluation
 * 
 * TESTING:
 * See: src/tests/abilities/tdd-batch*.test.ts for comprehensive test coverage
 * 
 * @module EffectExecutor
 * @since 1.0.0
 */

import type { EffectAST, TargetAST, ConditionAST, Expression } from './effect-ast';
import { GameEvent } from './events';
import { Card, CardInstance, Player, ChoiceType, ChoiceRequest, ChoiceResponse, ChoiceOption, ZoneType } from '../models';
import { EventContext } from './events';
import { BaseFamilyHandler } from './families/base-family-handler';
import { CostFamilyHandler } from './families/cost-family';
import { DamageFamilyHandler } from './families/damage-family';
import { ReadyExertFamilyHandler } from './families/ready-exert-family';
import { DeckManipulationFamilyHandler } from './families/deck-manipulation-family';
import { OpponentInteractionFamilyHandler } from './families/opponent-interaction-family';
import { LocationFamilyHandler } from './families/location-family';
import { ChallengeFamilyHandler } from './families/challenge-family';
import { DrawLoreFamilyHandler } from './families/draw-lore-family';
import { hasAbilityKeyword } from '../../utils/ability-helpers';
import { StaticEffectFamilyHandler } from './families/static-effect-family';
import { PreventionFamilyHandler } from './families/prevention-family';
import { ChoiceFamilyHandler } from './families/choice-family';
import { matchesCardFilter } from './filters';
import { UtilityFamilyHandler } from './families/utility-family';
import { SpecializedEffectsFamilyHandler } from './families/specialized-effects-family';
import { ConditionEvaluator } from './condition-evaluator';
import { StatFamilyHandler } from './families/stat-family';
import { ZoneFamilyHandler } from './families/zone-family';

/**
 * Game execution context passed to all effect handlers
 * 
 * Provides complete information about the current game state, the card executing
 * the ability, the player who owns it, and any event-specific context.
 * 
 * @property player - The player executing the effect (usually card owner)
 * @property card - The card instance executing this effect
 * @property gameState - Reference to the game state manager
 * @property eventContext - Event-specific information (triggers, targets, etc.)
 * @property abilityName - Optional: Name of the ability being executed
 * @property modalChoice - Optional: Player's choice for "Choose One" abilities
 * @property payload - Optional: Additional execution data
 * @property variables - Optional: Runtime variables (e.g., loop counters)
 */
export interface GameContext {
    player: any; // Player executing the effect
    card: any; // Card generating the effect
    gameState: any; // Current game state
    eventContext: EventContext; // Event that triggered this
    abilityName?: string; // Name of the ability triggering this effect
    abilityText?: string; // Full text of the ability (for UI display)
    modalChoice?: number; // Selected option for modal effects
    payload?: any; // Action payload (choices, targets, etc.);
    targets?: any[]; // Resolved targets available for current effect chain
    variables?: Record<string, any>; // Local variables for loops and complex effects
}

export class EffectExecutor {
    private turnManager: any = null; // TurnManager reference for game methods
    private familyHandlers: Map<string, any> = new Map();
    public conditionEvaluator: ConditionEvaluator | null = null;

    // Choice handling
    private pendingChoice: ChoiceRequest | null = null;
    private choiceResolver: ((result: ChoiceResponse) => void) | null = null;

    constructor(turnManager?: any) {
        this.turnManager = turnManager;

        // Initialize family handlers
        if (turnManager) {
            this.familyHandlers.set('cost', new CostFamilyHandler(this));
            this.familyHandlers.set('damage', new DamageFamilyHandler(this));
            this.familyHandlers.set('zone', new ZoneFamilyHandler(this));
            this.familyHandlers.set('prevention', new PreventionFamilyHandler(this));
            this.familyHandlers.set('choice', new ChoiceFamilyHandler(this));

            this.familyHandlers.set('ready_exert', new ReadyExertFamilyHandler(this));
            this.familyHandlers.set('deck_manipulation', new DeckManipulationFamilyHandler(this));
            this.familyHandlers.set('opponent_interaction', new OpponentInteractionFamilyHandler(this));
            // Batch 8: Location 
            this.familyHandlers.set('location', new LocationFamilyHandler(this));
            // Batch 9: Challenge
            this.familyHandlers.set('challenge', new ChallengeFamilyHandler(this));
            // Batch 10: Draw/Lore
            this.familyHandlers.set('draw_lore', new DrawLoreFamilyHandler(this));
            // Batch 12: Static Effects
            this.familyHandlers.set('static_effect', new StaticEffectFamilyHandler(this));
            // Batch 14: Prevention
            // this.familyHandlers.set('prevention', new PreventionFamilyHandler(this)); // Moved up
            // Batch 16: Utility
            this.familyHandlers.set('utility', new UtilityFamilyHandler(this));
            // Batch 17: Specialized Effects (100% Coverage)
            this.familyHandlers.set('specialized', new SpecializedEffectsFamilyHandler(this));
            // Phase 1 Refactor: Stat modification family
            this.familyHandlers.set('stat', new StatFamilyHandler(this));
            // Phase 2 Refactor: Zone transfer family
            // this.familyHandlers.set('zone', new ZoneFamilyHandler(this)); // Moved up

            // Ensure all handlers have turn manager
            this.familyHandlers.forEach(handler => handler.setTurnManager(turnManager));
        }

        // Initialize condition evaluator with bound checkFilter
        this.conditionEvaluator = new ConditionEvaluator(
            turnManager || null,
            this.checkFilter.bind(this)
        );
    }

    /**
     * Set TurnManager reference (for dependency injection)
     */
    setTurnManager(turnManager: any) {
        this.turnManager = turnManager;
        if (this.conditionEvaluator) {
            this.conditionEvaluator.setTurnManager(turnManager);
        }
        // Also update family handlers?
        this.familyHandlers.forEach(handler => handler.setTurnManager(turnManager));
    }




    /**
     * Evaluate a condition using the ConditionEvaluator
     * Wrapper for test compatibility and convenient access
     */
    evaluateCondition(condition: any, context: GameContext): boolean {
        return this.conditionEvaluator?.evaluateCondition(condition, context) || false;
    }

    /**
     * Execute an effect AST node
     * 
     * Central dispatcher that routes effect types to their specialized handlers.
     * Supports 100+ effect types organized into families (draw, damage, buffs, etc.).
     * 
     * This is the main entry point for all ability execution. Effects are validated,
     * targets resolved, and routed to family-specific handlers for execution.
     * 
     * @param effect - The effect AST node to execute
     * @param context - Game context including player, card, game state, and event info
     * @throws Error if effect execution fails or if effect type is unhandled
     * 
     * @example
     * ```typescript
     * const effect: EffectAST = { type: 'draw', amount: 2 };
     * await executor.execute(effect, context);
     * ```
     * @returns false if effect was optional and declined (abort remaining effects), true/undefined otherwise
     */
    async execute(effect: EffectAST, context: GameContext): Promise<boolean | void> {
        // Check optional
        // Skip check for effect types that handle optionality internally with specific prompts
        const typesWithInternalCheck = ['draw', 'damage', 'banish', 'exert', 'ready', 'look_and_move', 'play_for_free'];
        if ((effect as any).optional && !typesWithInternalCheck.includes(effect.type) && !(await this.checkOptional(effect, context))) {
            return false;
        }
        switch (effect.type) {
            // Handle ability definitions that wrap effects
            case 'activated':
            case 'triggered':
            case 'static':
            case 'resolution':
                // Unwrap nested effects if present
                if ((effect as any).effects && (effect as any).effects.length > 0) {
                    for (const innerEffect of (effect as any).effects) {
                        await this.execute(innerEffect, context);
                    }
                }
                return;
            case 'draw':
                return await this.executeDraw(effect, context);
            case 'draw_until':
                await this.executeDrawUntil(effect, context);
                break;
            case 'damage':
                return await this.executeDamage(effect, context);
            case 'remove_damage':
            case 'heal':
                await this.executeHeal(effect, context);
                break;
            case 'heal_and_draw':
                {
                    const handler = this.familyHandlers.get('damage');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        // Fallback if handler missing (should not happen)
                        await this.executeHeal(effect, context);
                    }
                }
                break;
            // === ZONE FAMILY === (Routing to zone-family.ts)
            case 'banish':
            case 'return_self':
            case 'return_to_hand':
            case 'return_from_discard':
            case 'bounce_all':
            case 'exile':
            case 'return_from_exile':
            case 'return_multiple_with_cost_filter':
                // Note: put_into_inkwell is handled by deck_manipulation family
                {
                    const handler = this.familyHandlers.get('zone');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Zone family handler not initialized`);
                    }
                }
                break;

            case 'discard':
                await this.executeDiscard(effect, context);
                break;
            // === STAT FAMILY === (Routing to stat-family.ts)
            case 'modify_stats':
            case 'grant_keyword':
            case 'grant_ability':
            case 'permanent_buff':
            case 'temporary_buff':
            case 'copy_stats':
            case 'set_cost':
            case 'double_lore':
            case 'lose_all_abilities':
            case 'transform':
                {
                    const handler = this.familyHandlers.get('stat');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Stat family handler not initialized`);
                    }
                }
                break;
            case 'gain_lore':
                await this.executeGainLore(effect, context);
                break;
            case 'lose_lore':
                await this.executeLoseLore(effect, context);
                break;
            case 'sequence':
                await this.executeSequence(effect, context);
                break;
            case 'conditional':
                await this.executeConditional(effect, context);
                break;
            case 'conditional_action':
                await this.executeConditionalAction(effect as any, context);
                break;
            case 'additional_ink':
                await this.executeAdditionalInk(effect as any, context);
                break;
            case 'for_each':
                await this.executeForEach(effect, context);
                break;
            case 'lore_loss':
                await this.executeLoreLoss(effect as any, context);
                break;
            case 'enters_with_damage':
                await this.executeEntersWithDamage(effect as any, context);
                break;

            case 'keyword':
                await this.executeKeyword(effect as any, context);
                break;

            case 'opponent_choice':
                // This is a generic opponent choice, not necessarily a discard choice.
                // It should be routed to the opponent_interaction family.
                {
                    const handler = this.familyHandlers.get('opponent_interaction');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Opponent Interaction family handler not initialized`);
                    }
                }
                break;
            case 'look_at_top_deck':
                {
                    const handler = this.familyHandlers.get('deck_manipulation');
                    if (handler) {
                        // Adapt legacy alias to standard type
                        await handler.execute({ ...effect, type: 'look_and_move', destination: (effect as any).destination || 'top' } as any, context);
                    }
                }
                break;

            case 'reveal_and_draw':
                await this.executeRevealAndDraw(effect as any, context);
                break;
            case 'modify_stats_by_count':
                await this.executeModifyStatsByCount(effect as any, context);
                break;

            case 'each_player_chooses_action':
                await this.executeEachPlayerChoosesAction(effect as any, context);
                break;
            case 'move_damage':
                await this.executeMoveDamage(effect, context);
                break;


            // ====== TIER 1 CRITICAL EFFECTS ======
            case 'exert_self':
                await this.executeExertSelf(effect, context);
                break;
            case 'ready_self':
                await this.executeReadySelf(effect, context);
                break;
            case 'boost':
                await this.executeBoost(effect as any, context);
                break;
            case 'put_card_under':
                await this.executePutCardUnder(effect, context);
                break;

            case 'exert':
                await this.executeExert(effect as any, context);
                break;
            case 'put_on_top':
                await this.executePutOnTop(effect, context);
                break;
            case 'put_on_bottom':
                await this.executePutOnBottom(effect, context);
                break;
            case 'create_token':
                await this.executeCreateToken(effect, context);
                break;

            case 'set_strength':
                await this.executeSetStrength(effect, context);
                break;
            case 'set_willpower':
                await this.executeSetWillpower(effect, context);
                break;
            case 'add_counter':
                await this.executeAddCounter(effect, context);
                break;

            // ====== METADATA EFFECTS (No execution needed) ======
            case 'alternate_sing_cost':
            case 'sing_cost':
                // Sing cost is metadata that affects HOW a card can be played
                // It's not an executable effect, so we silently skip it
                break;

            // ====== FAMILY HANDLERS ======

            case 'area_effect':
                await this.executeAreaEffect(effect, context);
                break;

            case 'put_top_card_under':
                await this.executePutTopCardUnder(effect, context);
                break;
            case 'play_for_free':
                await this.executePlayForFree(effect, context);
                break;

            case 'mill':
                await this.executeMill(effect, context);
                break;
            case 'look_and_move_to_top_or_bottom':
                await this.executeLookAndMoveToTopOrBottom(effect, context);
                break;
            case 'play_revealed_card_for_free':
                await this.executePlayRevealedCardForFree(effect, context);
                break;
            case 'modal':
                await this.executeModal(effect as any, context);
                break;
            case 'modal_choice':
                await this.executeModalChoice(effect as any, context);
                break;
            case 'reveal_hand':
                await this.executeRevealHand(effect as any, context);
                break;
            case 'discard_chosen':
                await this.executeDiscardChosen(effect as any, context);
                break;
            case 'choose_and_discard':
                // This is a choice, route to choice family
                {
                    const handler = this.familyHandlers.get('choice');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Choice family handler not initialized`);
                    }
                }
                break;
            case 'ink_from_hand':
                await this.executeInkFromHand(effect as any, context);
                break;
            case 'mill_to_inkwell':
            case 'one_to_hand_rest_bottom':
                {
                    const handler = this.familyHandlers.get('specialized');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Specialized family handler not initialized for ${effect.type}`);
                    }
                }
                break;

            // ====== TIER 2: SIMPLE STATE EFFECTS ======
            case 'prevent_next_damage':
                await this.executePreventNextDamage(effect as any, context);
                break;
            case 'cant_ready':
                await this.executeCantReady(effect as any, context);
                break;
            case 'cost_reduction':
                if (this.familyHandlers.has('cost')) {
                    await this.familyHandlers.get('cost').execute(effect, context);
                } else {
                    if (this.turnManager) this.turnManager.logger.warn(`[EffectExecutor] No cost handler for ${effect.type}`);
                }
                break;
            // case 'move_damage': // Already handled above
            //     await this.executeMoveDamage(effect as any, context);
            //     break;
            case 'prevent_damage':
                // case 'prevent_next_damage': // Already handled above
                if (this.familyHandlers.has('prevention')) {
                    await this.familyHandlers.get('prevention').execute(effect, context);
                }
                break;

            case 'opponent_choose_and_discard':
            case 'choose_card_from_discard':
            case 'choose_to_play_for_free':
            case 'look_and_choose':
            case 'reveal_and_choose':
            case 'choose_target_effect':
            case 'distribute_damage_choice':
            case 'choose_keyword_to_grant':
            case 'optional_trigger':
            case 'choose_zone_target':
            case 'opponent_discard_choice':
            case 'opponent_reveal_and_discard':
                // case 'choose_and_discard': // Already handled above
                if (this.familyHandlers.has('choice')) {
                    await this.familyHandlers.get('choice').execute(effect, context);
                }
                break;
            // ====== PREVENTION & RESTRICTION FAMILY ======
            case 'restriction':
            case 'cant_quest':
            case 'cant_challenge':
            case 'must_challenge':
            case 'force_quest':
            case 'unexertable':
            case 'hexproof':
            case 'prevent_damage_from_source':
                if (this.familyHandlers.has('prevention')) {
                    await this.familyHandlers.get('prevention').execute(effect, context);
                }
                break;
            // case 'for_each': // Already handled above
            //     await this.executeForEach(effect as any, context);
            //     break;
            // ====== TIER 3: COMPLEX MECHANICS ======
            case 'create_copy':
                await this.executeCreateCopy(effect as any, context);
                break;
            case 'counter_ability':
                await this.executeCounterAbility(effect as any, context);
                break;
            case 'cascade':
                await this.executeCascade(effect as any, context);
                break;

            case 'flashback':
                await this.executeFlashback(effect as any, context);
                break;
            case 'gain_control':
                await this.executeGainControl(effect as any, context);
                break;
            case 'look_at_top':
                await this.executeLookAtTop(effect as any, context);
                break;
            case 'mill_until':
                await this.executeMillUntil(effect as any, context);
                break;
            case 'play_additional_card':
                await this.executePlayAdditionalCard(effect as any, context);
                break;
            case 'sacrifice':
                await this.executeSacrifice(effect as any, context);
                break;
            case 'tutor_specific':
                await this.executeTutorSpecific(effect as any, context);
                break;
            case 'ready':
            case 'ready_card':
                return await this.executeReadyCard(effect as any, context);
            case 'ward':
                await this.executeWard(effect as any, context);
                break;

            // ====== CHOICE-BASED EFFECTS ======
            // These are now routed to ChoiceFamilyHandler
            // case 'choose_card_from_discard':
            //     await this.executeChooseCardFromDiscard(effect as any, context);
            //     break;
            // case 'choose_to_play_for_free':
            //     await this.executeChooseToPlayForFree(effect as any, context);
            //     break;
            // case 'opponent_choose_and_discard':
            //     await this.executeOpponentChooseAndDiscard(effect as any, context);
            //     break;
            // case 'look_and_choose':
            //     await this.executeLookAndChoose(effect as any, context);
            //     break;
            // case 'reveal_and_choose':
            //     await this.executeRevealAndChoose(effect as any, context);
            //     break;
            // case 'choose_target_effect':
            //     await this.executeChooseTargetEffect(effect as any, context);
            //     break;
            // case 'distribute_damage_choice':
            //     await this.executeDistributeDamageChoice(effect as any, context);
            //     break;
            // case 'choose_keyword_to_grant':
            //     await this.executeChooseKeywordToGrant(effect as any, context);
            //     break;
            // case 'optional_trigger':
            //     await this.executeOptionalTrigger(effect as any, context);
            //     break;
            // case 'choose_zone_target':
            //     await this.executeChooseZoneTarget(effect as any, context);
            //     break;
            // case 'opponent_reveal_and_discard':
            //     await this.executeOpponentRevealAndDiscard(effect as any, context);
            //     break;
            // case 'opponent_discard_choice':
            //     await this.executeOpponentDiscardChoice(effect as any, context);
            //     break;

            case 'vanish':
                await this.executeVanish(effect as any, context);
                break;


            // === COST FAMILY === (7 types) - routed to family handler
            case 'cost_reduction':
            case 'ability_cost_reduction':
            case 'singing_cost_modifier':
            case 'shift_cost_reduction_subtype':
            case 'reduce_shift_cost_subtype':
            case 'move_cost_reduction':
            case 'increase_play_cost':
                {
                    const handler = this.familyHandlers.get('cost');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Cost family handler not initialized`);
                    }
                }
                break;
            case 'discard_to_hand_size':
                // Force player to discard down to maximum hand size
                const handSizeLimit = (effect as any).limit || 7; // Default Lorcana hand size
                const player = context.player;

                if (!player || !player.hand) {
                    return;
                }

                // Check if hand size exceeds limit
                const excessCards = player.hand.length - handSizeLimit;

                if (excessCards > 0) {
                    this.turnManager.logger.info(`[Executor] Player has ${player.hand.length} cards, limit is ${handSizeLimit}. Discarding ${excessCards} cards.`);

                    // Player must choose cards to discard
                    // For AI/test: discard first N cards
                    // In real game: would present choice to player
                    const toDiscard = player.hand.splice(0, excessCards);
                    toDiscard.forEach((card: any) => {
                        player.discard.push(card);
                        card.zone = ZoneType.Discard;
                    });

                    this.turnManager.logger.info(`[Executor] Discarded ${excessCards} cards to meet hand size limit`);
                } else {
                    this.turnManager.logger.debug(`[Executor] Hand size (${player.hand.length}) within limit (${handSizeLimit})`);
                }
                break;

            // === DAMAGE FAMILY === (13 types) - routed to family handler
            case 'damage_equal_to_count':
            case 'remove_all_damage':
            case 'damage_reflection':
            case 'redirect_damage':
            case 'prevent_damage':
            case 'prevent_damage_removal':
            case 'prevent_damage_high_strength':
            case 'multi_target_damage':
            case 'damage_on_any_play':
            case 'damage_on_character_play':
            case 'deal_damage_each_exerted':
            case 'play_trigger_damage_self':
            case 'location_damage_all_characters':
            case 'damage_from_trigger':
                {
                    const handler = this.familyHandlers.get('damage');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Damage family handler not initialized`);
                    }
                }
                break;

            // === READY/EXERT FAMILY === (13 types) - routed to family handler
            case 'ready':
            case 'prevent_ready':
            case 'ready_after_challenge':
            case 'exert_characters':
            case 'exert_all':
            case 'exert_banish_damaged':
            case 'exert_banish_chosen_damaged':
            case 'exert_to_deal_damage':
            case 'exert_ally_for_damage':
            case 'exert_and_damage_to_move':
            case 'can_challenge_ready':
            case 'challenge_ready_damaged':
            case 'ready_inkwell':
            case 'exert_inkwell':
                {
                    const handler = this.familyHandlers.get('ready_exert');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Ready / Exert family handler not initialized`);
                    }
                }
                break;

            // === DECK MANIPULATION FAMILY ===

            case 'search_deck':
            case 'reveal_top_card':
            case 'reveal_top_deck':
            // case 'look_and_choose': // Now routed to choice family
            case 'look_at_cards':
            // case 'tutor_specific': // Now handled by its own method
            case 'look_at_top_of_deck':

            // Merged cases from Block 1
            case 'discard_hand_draw':
            case 'shuffle_into_deck':
            case 'discard_hand':
            case 'play_from_inkwell':
            case 'shuffle_from_discard':
            case 'move_hand_to_bottom_deck':
            case 'balance_hand':
            case 'move_to_top_or_bottom':
            case 'headless_horseman_combo':

            case 'look_and_move':
            case 'look_at_top_and_choose_placement':
            // case 'return_from_discard': // Now routed to zone family
            case 'put_from_discard':
            case 'play_from_discard':
            case 'play_action_from_discard_then_bottom_deck':
            // Batch 11: Advanced Card Manipulation
            case 'look_and_distribute':
            case 'look_and_rearrange':
            case 'play_with_top_card_revealed':
            case 'reveal_hand_opponent_choice_discard':
            case 'play_reveal_opponent_hand_choice_discard':
            // Batch 13: Inkwell & Naming Mechanics
            case 'all_inkwell':
            case 'hand_to_inkwell_all':
            case 'inkwell_trigger_debuff':
            case 'put_into_inkwell': // Migrated from legacy
            case 'grant_inkable':
            case 'add_name':
            case 'add_name_for_shift':
            case 'name_and_reveal':
                {
                    const handler = this.familyHandlers.get('deck_manipulation');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Deck Manipulation family handler not initialized`);
                    }
                }
                break;

            // === OPPONENT INTERACTION FAMILY === (13 types) - routed to family handler
            case 'opponent_discard':
            // case 'opponent_choice_discard': // Now routed to choice family
            case 'opponent_play_reveal_and_discard':
            case 'opponent_choice_banish':
            case 'opponent_discard_from_hand':
            case 'opponent_loses_lore':
            case 'opponent_banish_character':
            case 'pay_lore_to_prevent_banish':
            case 'opponent_reveals_hand_you_choose_discard':
            case 'opponent_pays_ink_or_discard':
            case 'prevent_opponent_lore_gain':
            case 'steal_lore_from_opponent':
            case 'force_opponent_to_choose':
            case 'opponent_return_to_hand':
            case 'opponent_choice_action':
            // Batch 15: Advanced Opponent Interactions
            case 'opponent_choice_damage':
            case 'opponent_choice_return_to_hand':
            case 'opponent_discard_excess_hand':
            case 'opponent_pay_to_banish_self':
            case 'opponent_play_return_self':
            case 'opponent_together_choice_banish':
            case 'opponent_reveal_conditional_hand_bottom':
            case 'opponent_reveal_top':
                {
                    const handler = this.familyHandlers.get('opponent_interaction');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Opponent Interaction family handler not initialized`);
                    }
                }
                break;

            // === LOCATION FAMILY ===
            case 'move_to_location':
            case 'move_characters':
            case 'free_move_to_location':
                {
                    const handler = this.familyHandlers.get('location');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Location family handler not initialized`);
                    }
                }
                break;

            // === CHALLENGE FAMILY ===
            case 'challenge_banish_both':
            case 'challenge_banish_both_characters':
            case 'challenge_damage_all_damaged':
            case 'damage_on_being_challenged':
            case 'return_character_banished_in_challenge':
            case 'while_challenging_debuff_challenger':
                {
                    const handler = this.familyHandlers.get('challenge');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Challenge family handler not initialized`);
                    }
                }
                break;

            // === DRAW / LORE FAMILY ===
            case 'gain_lore_when_damaged':
            case 'draw_when_damaged':
            case 'draw_on_sing':
            case 'prevent_lore_loss':
            case 'draw_equal_to_count':
            case 'gain_lore_equal_to_cost':
            case 'double_lore_gain':
            case 'lore_cost_to_activate':
            case 'quest_debuff_chosen':
            case 'quest_gain_equal_cost_ink':
            case 'quest_gain_ink_equal_cost':
            case 'quest_play_ally_free':
            case 'quest_play_item_free':
                {
                    const handler = this.familyHandlers.get('draw_lore');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Draw/Lore family handler not initialized`);
                    }
                }
                break;

            // === STATIC EFFECT FAMILY === (Batch 12)
            case 'conditional_buff_subtype_in_play':
            case 'conditional_multi_buff_subtype_count':
            case 'conditional_stat_buff_while_item_in_discard':
            case 'conditional_gain_keyword_while_damaged':
            case 'conditional_resist_no_damage':
            case 'stat_buff_per_damage':
            case 'while_exerted_buff_others':
            case 'singing_power_buff':
                {
                    const handler = this.familyHandlers.get('static_effect');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Static Effect family handler not initialized`);
                    }
                }
                break;

            // === PREVENTION FAMILY === (Batch 14)
            case 'prevent_ability_use':
            case 'prevent_discard':
            case 'prevent_discard_effects':
            case 'prevent_lore_at_location':
            case 'prevent_play':
            case 'prevent_selection':
            case 'play_trigger_draw_opponent':
            case 'play_trigger_opponent_draws':
            case 'play_action_trigger_buff':
                {
                    const handler = this.familyHandlers.get('prevention');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Prevention family handler not initialized`);
                    }
                }
                break;

            // === UTILITY FAMILY === (Batch 16)
            case 'cards_in_hand':
            case 'cards_in_opponent_hand':
            case 'attribute_of_target':
            case 'deck_copy_limit':
            case 'deck_limit_increase':
            case 'deck_limit_override':
            case 'ink':
            case 'lore':
            case 'self_status':
            case 'grant_activated_ability':
            case 'choice':
            case 'event_target':
                {
                    const handler = this.familyHandlers.get('utility');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Utility family handler not initialized`);
                    }
                }
                break;

            // === SPECIALIZED EFFECTS FAMILY === (Batch 17 - Final 100% Coverage)
            case 'return_damaged_character_to_hand':
            case 'return_multiple_items':
            case 'return_to_hand_on_banish':
            case 'return_triggered_card_from_discard':
            case 'activated_return_subtype_from_discard':
            case 'item_banish_return_item':
            case 'one_to_hand_rest_bottom':
            case 'reveal_and_conditional':
            case 'reveal_and_put_multiple':
            case 'reveal_top_and_play_if_name':
            case 'reveal_top_multi_name_conditional':
            case 'recursive_reveal_conditional':
            case 'reveal_opponent_hand_on_sing':
            case 'look_at_hand':
            case 'play_from_hand':
            case 'conditional_play_for_free':
            case 'play_named_card_free':
            case 'play_same_name_as_banished':
            case 'pay_to_resolve':
            case 'draw_and_discard_by_count':
            case 'challenge_trigger_buff_others':
            case 'gain_lore_on_character_play':
            case 'lose_lore_equal_to_stat':
            case 'change_win_condition':
            case 'chosen_character_at_self':
            case 'chosen_from_discard':
            case 'opposing_character_lowest_cost':
            case 'self_and_chosen_other':
            case 'self_damage_cost_for_effect':
            case 'card_put_under_this_turn':
            case 'inkwell_enters_exerted':
                {
                    const handler = this.familyHandlers.get('specialized');
                    if (handler) {
                        await handler.execute(effect, context);
                    } else {
                        this.turnManager?.logger.warn(`Specialized Effects family handler not initialized`);
                    }
                }
                break;

            default:
                // For placeholder effect types not yet in EffectAST
                if (typeof (effect as any).type === 'string') {
                    const effectType = (effect as any).type as string;

                    // Route draw/lore effects
                    if (effectType.includes('draw') || effectType.includes('lore')) {
                        const handler = this.familyHandlers.get('draw_lore');
                        if (handler) {
                            await handler.execute(effect, context);
                            break;
                        }
                    }

                    // Route opponent interaction effects
                    if (effectType.includes('opponent')) {
                        const handler = this.familyHandlers.get('opponent_interaction');
                        if (handler) {
                            await handler.execute(effect, context);
                            break;
                        }
                    }

                    // Route deck manipulation effects
                    if (effectType.includes('discard') || effectType.includes('deck') || effectType.includes('look')) {
                        const handler = this.familyHandlers.get('deck_manipulation');
                        if (handler) {
                            await handler.execute(effect, context);
                            break;
                        }
                    }
                }

                if (this.turnManager) {
                    this.turnManager.logger.warn(`Unknown effect type: `, effect);
                }
        }
    }


    /**
     * Execute specific modal choice (Prompts player to choose one effect)
     * Used for cards like Madam Mim
     */
    private async executeModalChoice(effect: { type: 'modal_choice', choices: EffectAST[] }, context: GameContext): Promise<void> {
        if (!this.turnManager) return;

        // Generate user-friendly options
        const options = effect.choices.map((choice, index) => {
            let label = 'Unknown Effect';

            // Basic mapping for common modal choices
            switch (choice.type) {
                case 'banish':
                    if ((choice as any).target?.type === 'self') label = 'Banish this character';
                    else label = 'Banish a character';
                    break;
                case 'return_to_hand':
                    if ((choice as any).target?.type === 'self') label = 'Return this character to hand';
                    else label = 'Return another character to hand';
                    break;
                case 'draw':
                    label = `Draw ${(choice as any).amount || 1} card(s)`;
                    break;
                case 'gain_lore':
                    label = `Gain ${(choice as any).amount || 1} lore`;
                    break;
                case 'heal':
                    label = `Heal damage`;
                    break;
                case 'move_damage':
                    label = `Move damage`;
                    break;
            }

            return {
                id: index.toString(),
                label: label,
                display: label,
                value: index.toString(),
                valid: true
            };
        });

        // Request choice
        const response = await this.turnManager.requestChoice({
            id: 'modal-choice-' + Date.now(),
            type: 'modal', // Use generic modal type for UI
            playerId: context.player.id,
            prompt: `Choose an effect for ${context.abilityName || context.card?.name || 'Ability'}:`,
            options,
            min: 1,
            max: 1,
            optional: false, // Usually mandatory unless specified
            source: {
                card: context.card,
                abilityName: context.abilityName,
                player: context.player
            },
            timestamp: Date.now()
        });

        if (response.declined || response.selectedIds.length === 0) {
            this.turnManager.logger.info(`${context.player.name} declined modal choice.`);
            return;
        }

        const selectedIndex = parseInt(response.selectedIds[0]);
        const selectedEffect = effect.choices[selectedIndex];

        if (selectedEffect) {
            this.turnManager.logger.info(`${context.player.name} chose: ${options[selectedIndex].label}`);
            await this.execute(selectedEffect, context);
        }
    }

    /**
     * Execute modal effect (Choose one) (Pre-determined choice)
     */
    private async executeModal(effect: { type: 'modal', options: { effects: EffectAST[] }[] }, context: GameContext): Promise<void> {
        const choice = context.modalChoice ?? 0; // Default to first option if not specified

        if (choice < 0 || choice >= effect.options.length) {
            if (this.turnManager) {
                this.turnManager.logger.warn(`[EffectExecutor] Invalid modal choice ${choice}. Max options: ${effect.options.length} `);
            }
            throw new Error(`Invalid modal choice ${choice} `);
        }

        const selectedOption = effect.options[choice];
        if (this.turnManager) {
            this.turnManager.logger.info(`[EffectExecutor] Executing modal option ${choice + 1} `);
        }

        // Execute all effects in the selected option
        for (const subEffect of selectedOption.effects) {
            await this.execute(subEffect, context);
        }
    }

    /**
     * Check if an effect is optional and prompt player if so.
     * UNIFIED IMPLEMENTATION (Phase 3) - Uses turnManager.requestChoice()
     * No bot detection - just routes to TurnManager who handles players uniformly.
     * 
     * @returns true if effect should execute, false if player declined
     */
    private async checkOptional(effect: any, context: GameContext, promptMessage?: string): Promise<boolean> {
        if (!effect.optional || !this.turnManager) {
            return true; // Not optional or no turn manager, always execute
        }

        // 1. Cost Validation: Check if player can pay the cost (if defined)
        if (effect.cost && effect.cost.ink) {
            const player = context.player;
            const readyInk = player.inkwell.filter((c: any) => !c.exerted).length;
            if (readyInk < effect.cost.ink) {
                this.turnManager.logger.info(`[EffectExecutor] Auto-declining optional ability for ${context.card.name}: Insufficient ink (${readyInk}/${effect.cost.ink})`);
                return false;
            }
        }

        // 2. Prompt Construction
        // Use provided prompt, or ability text, or generic fallback to avoid "undefined"
        let displayPrompt = promptMessage;

        if (!displayPrompt) {
            // If no specific prompt provided, try to construct one from ability text
            if (context.abilityText) {
                displayPrompt = context.abilityText;
            } else {
                displayPrompt = "Do you want to use this ability?";
            }
        } else if (context.abilityText) {
            // If both provided, combine them (legacy behavior, but cleaner)
            displayPrompt = `${displayPrompt}\n\n${context.abilityText}`;
        }

        const request: import('../models').ChoiceRequest = {
            id: `optional-${Date.now()}`,
            type: 'yes_no' as any,
            playerId: context.player.id,
            prompt: displayPrompt,
            options: [
                { id: 'yes', display: 'Yes', valid: true },
                { id: 'no', display: 'No', valid: true }
            ],
            source: {
                card: context.card,
                abilityName: context.abilityName,
                player: context.player
            },
            timestamp: Date.now()
        };

        // UNIFIED: Just ask TurnManager, it routes to correct player controller
        const response = await this.turnManager.requestChoice(request);
        const shouldExecute = response.selectedIds[0] === 'yes' && !response.declined;

        if (!shouldExecute) {
            this.turnManager.logger.info(`⏸️  Player declined optional effect`, {
                player: context.player.name,
                effect: effect.type
            });
        }

        return shouldExecute;
    }

    /**
     * Draw cards until hand reaches threshold
     */
    private async executeDrawUntil(effect: any, context: GameContext): Promise<void> {
        const threshold = effect.threshold || 3;
        const targetPlayers = await this.resolvePlayerTargets(effect.target, context);

        for (const player of targetPlayers) {
            const currentHand = player.hand.length;
            if (currentHand < threshold) {
                const amount = threshold - currentHand;

                // Use standard drawCards helper
                const drawn = this.drawCards(player, amount);

                // Use standard logger action for UI visibility
                this.turnManager?.logger.action(
                    player.name,
                    `Drew ${drawn} card(s)`,
                    context.card?.name,
                    { amount: drawn, deckRemaining: player.deck.length }
                );
            }
        }
    }

    /**
     * Draw cards
     * @returns false if optional and declined, true/undefined otherwise
     */
    private async executeDraw(effect: Extract<EffectAST, { type: 'draw' }>, context: GameContext): Promise<boolean | void> {
        const amount = this.conditionEvaluator!.evaluateExpression(effect.amount, context);
        if (!this.turnManager) return;

        // Resolve targets (players)
        // This handles 'self', 'opponent', 'all_players', 'all_opponents' unified
        const targetPlayers = await this.resolvePlayerTargets(effect.target, context);

        let anyDrawDeclined = false;

        for (const player of targetPlayers) {
            // For optional effects, each player decides individually
            // But we only want to return 'false' (abort) if the *primary* player declines?
            // Or if ANY player declines? 
            // "may draw" usually implies independent choices.
            // If it's "You may draw", we return false if declined to stop sequence.
            // If it's "Each player may draw", one player declining shouldn't stop others or the ability sequence for others.
            // However, the current execute() contract returns false to abort sequence.
            // We should probably only abort if context.player declines?

            let shouldDraw = true;

            if ((effect as any).optional) {
                // Only prompt for human player - bot auto-accepts drawing
                const isBot = (player as any).isBot === true;

                if (!isBot && this.turnManager) {
                    // Prompt this player
                    const choice = await this.turnManager.requestChoice({
                        type: 'confirm',
                        playerId: (player as any).id,
                        prompt: `Do you want to draw ${amount} card(s)?`,
                        options: [
                            { id: 'yes', display: 'Yes', valid: true },
                            { id: 'no', display: 'No', valid: true }
                        ]
                    });

                    if (choice?.selectedIds[0] === 'no' || choice?.declined) {
                        this.turnManager.logger.effect(
                            (player as any).name,
                            `Declined to draw`,
                            context.card?.name
                        );
                        shouldDraw = false;

                        // If the main player declined, potentially signal abort for sequence
                        if (player.id === context.player.id) {
                            anyDrawDeclined = true;
                        }
                    }
                }
            }

            if (shouldDraw) {
                // Draw for this player
                const drawn = this.drawCards(player as any, amount);

                this.turnManager.logger.effect(
                    (player as any).name,
                    `Drew ${drawn} card(s)`,
                    context.card?.name,
                    { amount: drawn, deckRemaining: (player as any).deck.length }
                );
            }
        }

        if (anyDrawDeclined) return false;
        return true;
    }

    /**
     * Deal damage
     */
    private async executeDamage(effect: Extract<EffectAST, { type: 'damage' }>, context: GameContext): Promise<boolean | void> {
        const targets = await this.resolveTargets(effect.target, context);
        const amount = this.conditionEvaluator!.evaluateExpression(effect.amount, context);

        if (!this.turnManager) return;

        // Check if optional
        const shouldExecute = await this.checkOptional(effect, context, `Do you want to deal ${amount} damage?`);
        if (!shouldExecute) return false;

        // Apply damage to each target
        targets.forEach((target: any) => {
            const targetOwner = this.turnManager.game.getPlayer(target.ownerId);
            this.turnManager.applyDamage(targetOwner, target, amount, context.card?.instanceId);

            // Check for banishment (since applyDamage doesn't do it automatically)
            if (this.turnManager.checkBanishment) {
                this.turnManager.checkBanishment(targetOwner, target, context.card);
            }
        });

        const targetNames = targets.map((t: any) => t.name).join(', ');
        this.turnManager.logger.info(`💥 Dealt ${amount} damage to ${targetNames}`, {
            amount,
            targets: targets.map((t: any) => t.name)
        });

        return true;
    }

    /**
     * Heal (remove damage)
     */
    private async executeHeal(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);
        const amount = this.conditionEvaluator!.evaluateExpression(effect.amount, context);

        targets.forEach((target: any) => {
            target.damage = Math.max(0, (target.damage || 0) - amount);
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`🏥 Healed ${amount} damage from ${targets.length} target(s)`, {
                amount,
                targets: targets.map((t: any) => t.name)
            });
        }
    }

    /**
     * Vanish - Character banishes itself when targeted by opponent's action
     */
    private async executeVanish(effect: Extract<EffectAST, { type: 'vanish' }>, context: GameContext): Promise<void> {
        // Vanish only triggers when opponent targets this character
        // The context.card is the card with Vanish
        const card = context.card;

        if (!this.turnManager || !card) {
            return;
        }

        const owner = this.turnManager.game.getPlayer(card.ownerId);

        // Banish this character (move to discard)
        this.turnManager.banishCard(owner, card);

        const source = context.abilityName ? ` (Source: ${context.abilityName})` : '';
        this.turnManager.logger.info(`[EffectExecutor] ${card.name} vanished (banished itself)${source}`);
    }



    /**
     * Banish card
     */
    private async executeBanish(effect: Extract<EffectAST, { type: 'banish' }>, context: GameContext): Promise<boolean | void> {
        const targets = await this.resolveTargets(effect.target, context);

        if (!this.turnManager) return;

        // Check if optional
        const shouldExecute = await this.checkOptional(effect, context, `Do you want to banish ${targets.length > 1 ? targets.length + ' cards' : 'card'}?`);
        if (!shouldExecute) return false;

        targets.forEach((target: any) => {
            const targetPlayer = this.turnManager.game.getPlayer(target.ownerId);
            this.turnManager.banishCard(targetPlayer, target);
        });

        const targetNames = targets.map((t: any) => t.name).join(', ');
        this.turnManager.logger.info(`🗑️  Banished ${targetNames}`, {
            targets: targets.map((t: any) => t.name)
        });

        return true;
    }

    /**
     * Return to hand
     */
    private async executeReturnToHand(effect: any, context: GameContext, isSelfTarget: boolean = false): Promise<void> {
        let targets: any[] = [];
        if (isSelfTarget) {
            targets = [context.card];
        } else {
            targets = await this.resolveTargets(effect.target, context);
        }

        // Return cards to owner's hand
        targets.forEach(target => {
            const owner = this.turnManager.game.getPlayer(target.ownerId);

            // Remove from all possible zones (safer than checking current zone)
            owner.play = owner.play.filter((c: any) => c.instanceId !== target.instanceId);
            owner.discard = owner.discard.filter((c: any) => c.instanceId !== target.instanceId);
            owner.hand = owner.hand.filter((c: any) => c.instanceId !== target.instanceId);
            owner.deck = owner.deck.filter((c: any) => c.instanceId !== target.instanceId);

            // Add to hand
            target.zone = ZoneType.Hand;
            owner.hand.push(target);
        });

        if (this.turnManager) {
            const targetNames = targets.map((t: any) => t.name).join(', ');
            const source = context.abilityName ? ` (Source: ${context.abilityName})` : '';
            this.turnManager.logger.info(`↩️ Returned ${targetNames} to hand${source}`);
        }
    }

    /**
     * Discard cards
     */
    private async executeDiscard(effect: Extract<EffectAST, { type: 'discard' }>, context: GameContext): Promise<void> {
        if (!this.turnManager) return;

        const amount = effect.amount;
        // Resolve targets (players)
        const targets = await this.resolvePlayerTargets(effect.target, context);

        targets.forEach(player => {
            // Discard from hand to discard pile
            // TODO: Implement 'choose card to discard' logic using ChoiceHandler
            // Currently defaulting to 'pop' (last card) as placeholder behavior
            for (let i = 0; i < amount && player.hand.length > 0; i++) {
                const card = player.hand.pop();
                if (card) {
                    card.zone = 'discard';
                    player.discard.push(card);
                    if (this.turnManager) {
                        this.turnManager.trackZoneChange(card, 'hand', 'discard');
                    }
                }
            }

            if (this.turnManager) {
                const source = context.abilityName ? ` (Source: ${context.abilityName})` : '';
                this.turnManager.logger.info(`[EffectExecutor] ${player.name} discarded ${amount} card(s)${source}`);
                this.turnManager.logger.effect(
                    player.name,
                    `Discarded ${amount} card(s)`,
                    context.card?.name,
                    { amount: amount, handRemaining: player.hand.length }
                );
            }
        });
    }

    /**
     * Modify stats
     */
    private async executeModifyStats(effect: Extract<EffectAST, { type: 'modify_stats' }>, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        // Create active effects AND directly update card stats for immediate UI display
        targets.forEach(target => {
            if (!this.turnManager?.game?.state?.activeEffects) {
                if (!this.turnManager?.game?.state) return;
                this.turnManager.game.state.activeEffects = [];
            }

            let effectType: 'modify_strength' | 'modify_willpower' | 'modify_lore' | 'modify_damage';
            if (effect.stat === 'strength') {
                effectType = 'modify_strength';
                // DIRECTLY update card strength for immediate UI display
                target.strength = (target.strength || 0) + (effect.amount || 0);
            } else if (effect.stat === 'willpower') {
                effectType = 'modify_willpower';
                // DIRECTLY update card willpower
                target.willpower = (target.willpower || 0) + (effect.amount || 0);
            } else if (effect.stat === 'lore') {
                effectType = 'modify_lore';
                // DIRECTLY update card lore
                target.lore = (target.lore || 0) + (effect.amount || 0);
            } else if (effect.stat === 'damage') {
                effectType = 'modify_damage';
                // DIRECTLY update card damage
                target.damage = (target.damage || 0) + (effect.amount || 0);
            } else {
                return; // Unknown stat type
            }

            // Create effect for tracking/cleanup
            const activeEffect = {
                id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                sourceCardId: context.card?.instanceId || 'unknown',
                targetCardId: target.instanceId,
                type: effectType,
                value: effect.amount,
                duration: effect.duration || 'until_end_of_turn',
                timestamp: Date.now()
            };

            this.turnManager.addActiveEffect(activeEffect);

            // Log effect creation
            const durationStr = effect.duration === 'until_end_of_turn' ? 'this_turn' : effect.duration;
            const amount = effect.amount || 0;
            console.log(`→ Effect: ${target.name} ${amount > 0 ? '+' : ''}${amount} ${effect.stat} (${durationStr})`);
        });

        if (this.turnManager) {
            const source = context.abilityName ? ` (Source: ${context.abilityName})` : '';
            this.turnManager.logger.info(`[EffectExecutor] Modified ${effect.stat} by ${effect.amount} for ${targets.length} target(s)${source}`);
        }
    }

    /**
     * Grant keyword
     */
    private async executeGrantKeyword(effect: Extract<EffectAST, { type: 'grant_keyword' }>, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        // Determine final keyword string (e.g. "Resist +2")
        let finalKeyword = effect.keyword;
        // Check if amount is present (e.g. for Resist)
        // Note: EffectAST type for grant_keyword might need 'amount' if not present?
        // But parser output showed 'amount: 2'. So it's there on runtime object.
        const effectAny = effect as any;
        if (effectAny.amount !== undefined && (effect.keyword === 'Resist' || effect.keyword === 'Challenger')) {
            finalKeyword = `${effect.keyword} +${effectAny.amount}`;
        }

        // Grant keyword abilities via Continuous Effects
        targets.forEach(target => {
            if (!this.turnManager?.game?.state?.activeEffects) {
                if (!this.turnManager?.game?.state) return;
                this.turnManager.game.state.activeEffects = [];
            }

            // CRITICAL: Also add to target.meta.grantedKeywords for direct access
            // This is what tests expect and allows simpler keyword checking
            if (!target.meta) target.meta = {};
            if (!target.meta.grantedKeywords) target.meta.grantedKeywords = [];
            if (!target.meta.grantedKeywords.includes(finalKeyword)) {
                target.meta.grantedKeywords.push(finalKeyword);
            }

            // Create effect for tracking/cleanup
            const activeEffect = {
                id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                sourceCardId: context.card?.instanceId || 'unknown',
                targetCardIds: [target.instanceId], // Expects array for grant_keyword?
                // modify_stats above used targetCardId (singular).
                // Let's check ContinuousEffect definition.
                // Assuming singular targetCardId is valid or it supports array?
                // Legacy system used targetCardIds (array).
                // New system seems to use targetCardId?
                // Wait. modify_stats used targetCardId.
                // But actions.ts `calculateContinuousEffects` iterates...
                // Let's check actions.ts usage of grant_keyword.
                // It checks `effect.targetCardIds?.includes(card.instanceId)`.
                // So for grant_keyword it expects ARRAY `targetCardIds`.
                // Whereas modify_stats likely uses `targetCardId` or `targetCardIds`.
                // I will use targetCardIds: [target.instanceId].

                type: 'modification', // Must match actions.ts check
                modificationType: 'grant_keyword',
                params: { keyword: finalKeyword },
                duration: effect.duration || 'until_end_of_turn',
                targetPlayerIds: [target.ownerId], // Required for duration cleanup?
                sourcePlayerId: context.card?.ownerId || target.ownerId, // Correctly track source for expiration
                timestamp: Date.now()
            };

            // @ts-ignore
            this.turnManager.addActiveEffect(activeEffect);
        });

        if (this.turnManager) {
            const source = context.abilityName ? ` (Source: ${context.abilityName})` : '';
            this.turnManager.logger.info(`[EffectExecutor] Granted ${finalKeyword} to ${targets.length} target(s)${source}`);
        }
    }

    /**
     * Grant special ability (like can_challenge_ready)
     */
    private async executeGrantAbility(effect: { type: 'grant_ability', target: TargetAST, ability: string, duration?: string }, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);
        const duration = effect.duration || 'turn';

        if (!this.turnManager) return;

        targets.forEach(target => {
            // Add ability grant to activeEffects
            this.turnManager.addActiveEffect({
                type: 'ability_grant',
                ability: effect.ability,
                targetCardIds: [target.instanceId],
                duration,
                sourceCardId: context.card?.instanceId
            });
        });

        this.turnManager.logger.info(`[EffectExecutor] Granted ability "${effect.ability}" to ${targets.length} card(s)`);
    }

    /**
     * Gain lore
     */
    private async executeGainLore(effect: Extract<EffectAST, { type: 'gain_lore' }>, context: GameContext): Promise<void> {
        const amount = this.conditionEvaluator!.evaluateExpression(effect.amount, context);
        const player = context.player;

        // Add lore to player
        player.lore += amount;

        if (this.turnManager) {
            const source = context.abilityName ? ` (Source: ${context.abilityName})` : '';
            this.turnManager.logger.info(`[EffectExecutor] ${player.name} gained ${amount} lore (Total: ${player.lore})${source}`);
            this.turnManager.checkWinCondition(player);
        }
    }

    /**
     * Lose lore
     */
    private async executeLoseLore(effect: Extract<EffectAST, { type: 'lose_lore' }>, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        // Remove lore from target players
        targets.forEach(target => {
            if (target.lore !== undefined) {
                target.lore = Math.max(0, target.lore - effect.amount);
            }
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`[EffectExecutor] ${targets.length} player(s) lost ${effect.amount} lore`);
        }
    }

    /**
     * Execute sequence of effects
     */
    private async executeSequence(effect: Extract<EffectAST, { type: 'sequence' }>, context: GameContext): Promise<void> {
        for (const subEffect of effect.effects) {
            await this.execute(subEffect, context);
        }
    }



    /**
     * Execute conditional effect
     */
    private async executeConditional(effect: Extract<EffectAST, { type: 'conditional' }>, context: GameContext): Promise<void> {
        const condition = this.conditionEvaluator!.evaluateCondition(effect.condition, context);

        if (condition) {
            await this.execute(effect.effect, context);
        } else if (effect.else) {
            await this.execute(effect.else, context);
        }
    }

    /**
     * Execute conditional action - execute different actions based on condition
     */
    private async executeConditionalAction(
        effect: { type: 'conditional_action', base_action: EffectAST, condition: ConditionAST, replacement_action: EffectAST },
        context: GameContext
    ): Promise<void> {
        const conditionMet = this.conditionEvaluator!.evaluateCondition(effect.condition, context);

        if (conditionMet) {
            // Execute replacement action if condition is met
            await this.execute(effect.replacement_action, context);
        } else {
            // Execute base action if condition is not met
            await this.execute(effect.base_action, context);
        }
    }

    /**
     * Grant additional ink ability
     */
    private async executeAdditionalInk(effect: { type: 'additional_ink' }, context: GameContext): Promise<void> {
        const player = context.player;

        // Grant ability to ink an additional card this turn
        player.canInkAdditional = true;

        if (this.turnManager) {
            this.turnManager.logger.info(`[EffectExecutor] ${player.name} can ink an additional card this turn`);
        }
    }

    /**
     * Lore loss effect - subtract lore from target players
     */
    private async executeLoreLoss(effect: { type: 'lore_loss', amount: number, target: TargetAST }, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);
        const amount = effect.amount;

        targets.forEach((target: any) => {
            // Target should be a player
            if (target.lore !== undefined) {
                target.lore = Math.max(0, target.lore - amount);

                if (this.turnManager) {
                    this.turnManager.logger.info(`[EffectExecutor] ${target.name} lost ${amount} lore (Total: ${target.lore})`);
                }
            }
        });
    }

    /**
     * Enters with damage - apply damage when card enters play
     */
    private async executeEntersWithDamage(effect: { type: 'enters_with_damage', amount: number }, context: GameContext): Promise<void> {
        const card = context.card;
        const amount = effect.amount;

        if (card) {
            card.damage = (card.damage || 0) + amount;

            if (this.turnManager) {
                this.turnManager.logger.info(`[EffectExecutor] ${card.name} enters play with ${amount} damage`);
            }
        }
    }






    /**
     * Reveal hand
     */
    private async executeRevealHand(effect: { type: 'reveal_hand', target: TargetAST }, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach(target => {
            // Emitting event so UI can react (show hand)
            if (this.turnManager && this.turnManager.abilitySystem) {
                const handNames = target.hand.map((c: any) => c.name).join(', ');
                const source = context.abilityName ? ` (Source: ${context.abilityName})` : '';

                this.turnManager.logger.info(`[EffectExecutor] ${target.name} reveals hand: ${handNames}${source}`);

                // Emit event for UI handling
                this.turnManager.abilitySystem.emitEvent(GameEvent.HAND_REVEALED, {
                    player: target, // The player whose hand is revealed
                    source: context.card,
                    sourcePlayer: context.player
                });
            }
        });
    }

    /**
     * Discard chosen card
     */
    private async executeDiscardChosen(effect: { type: 'discard_chosen', target: TargetAST, filter: any, chooser: 'self' | 'opponent' }, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);
        const chooser = effect.chooser;
        const filter = effect.filter;

        const choiceId = context.payload?.discardChoiceId;

        // Use for-of loop to allow await
        for (const targetPlayer of targets) {
            let eligibleCards = targetPlayer.hand;

            // Apply filter
            if (filter) {
                eligibleCards = eligibleCards.filter((c: any) => this.checkFilter(c, filter, context));
            }

            if (eligibleCards.length === 0) {
                if (this.turnManager) {
                    this.turnManager.logger.info(`[EffectExecutor] ${targetPlayer.name} has no valid cards to discard.`);
                }
                continue;
            }

            let cardToDiscard: any;
            const chooserPlayer = (chooser === 'opponent') ? targetPlayer : context.player;

            if (choiceId) {
                cardToDiscard = eligibleCards.find((c: any) => c.instanceId === choiceId);
            }

            // If no choice provided (interactive mode), request it
            if (!cardToDiscard) {
                // Construct choice request
                const choice: import('../models').ChoiceRequest = {
                    id: `discard_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    playerId: chooserPlayer.id,
                    type: 'general_select' as any, // using general_select for hand selection
                    min: 1,
                    max: 1,
                    options: eligibleCards.map((c: any) => ({
                        id: c.instanceId,
                        value: c.instanceId,
                        label: c.name,
                        valid: true
                    })),
                    prompt: chooser === 'opponent'
                        ? `Choose a card to discard from your hand`
                        : `Choose a card from ${targetPlayer.name}'s hand to discard`,
                    source: {
                        card: context.card,
                        player: context.player,
                        abilityName: context.abilityName
                    },
                    timestamp: Date.now()
                };

                // Request choice (waits for UI/Bot response)
                const response = await this.requestChoice(choice);

                if (response.selectedIds && response.selectedIds.length > 0) {
                    cardToDiscard = eligibleCards.find((c: any) => c.instanceId === response.selectedIds[0]);
                }
            }

            // Fallback if still no choice (e.g. timed out or error)
            if (!cardToDiscard) {
                if (chooser === 'opponent') {
                    // Opponent chooses (Bot logic: discard least valuable)
                    // Sort by cost ascending
                    eligibleCards.sort((a: any, b: any) => a.cost - b.cost);
                    cardToDiscard = eligibleCards[0];
                } else {
                    // Player chooses (Bot logic: discard most valuable from opponent)
                    // Sort by cost descending
                    eligibleCards.sort((a: any, b: any) => b.cost - a.cost);
                    cardToDiscard = eligibleCards[0];
                }
            }

            if (cardToDiscard) {
                // Execute discard
                targetPlayer.hand = targetPlayer.hand.filter((c: any) => c.instanceId !== cardToDiscard.instanceId);
                cardToDiscard.zone = 'discard';
                targetPlayer.discard.push(cardToDiscard);

                // Log and emit event
                if (this.turnManager) {
                    const chooserName = chooserPlayer.name;
                    this.turnManager.logger.action(targetPlayer.name, `Discarded ${cardToDiscard.name} (chosen by ${chooserName})`);
                    this.turnManager.eventBus.emit(GameEvent.CARD_DISCARDED, {
                        card: cardToDiscard,
                        player: targetPlayer,
                        source: context.card,
                        sourcePlayer: context.player,
                        chooser: chooserPlayer
                    });
                    this.turnManager.trackZoneChange(cardToDiscard, 'hand', 'discard');
                }
            }
        }
    }

    private checkFilter(card: any, filter: any, context: GameContext): boolean {
        if (!filter) return true;

        // Recursive filters (not, and, or)
        if (filter.type === 'not' && filter.filter) {
            return !this.checkFilter(card, filter.filter, context);
        }
        if (filter.type === 'and' && filter.filters && Array.isArray(filter.filters)) {
            return filter.filters.every((f: any) => this.checkFilter(card, f, context));
        }
        if (filter.type === 'or' && filter.filters && Array.isArray(filter.filters)) {
            return filter.filters.some((f: any) => this.checkFilter(card, f, context));
        }

        // Check cardType (from EffectAST)
        if (filter.cardType) {
            const lowerType = filter.cardType.toLowerCase();
            if (lowerType === 'song') {
                // Songs are Action cards with Song subtype
                const isSong = card.type === 'Action' && card.subtypes?.some((s: string) => s.toLowerCase() === 'song');
                if (!isSong) return false;
            } else if ((card.type || '').toLowerCase() !== lowerType) {
                return false;
            }
        }

        // Check type
        if (filter.type && filter.type !== 'card') {
            if (Array.isArray(filter.type)) {
                const cardType = (card.type || '').toLowerCase();
                const allowedTypes = filter.type.map((t: string) => t.toLowerCase());
                if (!allowedTypes.includes(cardType)) {
                    return false;
                }
            } else if ((card.type || '').toLowerCase() !== filter.type.toLowerCase()) {
                if (this.turnManager) this.turnManager.logger.debug(`[DEBUG] checkFilter failed: singular type check. Expected: ${filter.type.toLowerCase()}, Got: ${card.type}`);
                return false;
            }
        }

        // Check owner (opposing/mine/owner property)
        if (filter.opposing || filter.owner === 'opponent' || filter.opponent) {
            if (card.ownerId === context.player.id) {
                return false;
            }
        }
        if (filter.mine || filter.owner === 'self') {
            if (card.ownerId !== context.player.id) {
                return false;
            }
        }

        // Check other (exclude self)
        if (filter.other || filter.excludeSelf) {
            if (context.card && card.instanceId === context.card.instanceId) {
                return false;
            }
        }

        // Check explicit ID exclusions
        if (filter.excludeIds && Array.isArray(filter.excludeIds)) {
            if (filter.excludeIds.includes(card.instanceId)) {
                return false;
            }
        }
        // ... (skipping some)

        // Check keyword
        if (filter.keyword || filter.hasKeyword) {
            const filterKeyword = (filter.keyword || filter.hasKeyword).toLowerCase();
            const cardKeywords = (card.keywords || []).map((k: string) => k.toLowerCase());
            if (!cardKeywords.includes(filterKeyword)) {
                return false;
            }
        }

        // Check subtypes (array - card must have at least one of the subtypes)
        if (filter.subtypes && Array.isArray(filter.subtypes)) {
            const cardSubtypes = (card.subtypes || []).map((s: string) => s.toLowerCase());
            const hasMatch = filter.subtypes.some((subtype: string) =>
                cardSubtypes.includes(subtype.toLowerCase())
            );
            if (!hasMatch) {
                return false;
            }
        }

        // Check subtype (singular - complex parsing e.g. "exerted Princess")
        if (filter.subtype) {
            let targetSubtype = filter.subtype.toLowerCase();
            let checkReady = false;

            // Handle "exerted X" pattern
            if (targetSubtype.startsWith('exerted ')) {
                if (card.ready) return false;
                targetSubtype = targetSubtype.substring(8);
            }
            // Handle "ready X" pattern
            else if (targetSubtype.startsWith('ready ')) {
                if (!card.ready) return false;
                targetSubtype = targetSubtype.substring(6);
            }

            // Check if card has this subtype
            // Check if card has this subtype
            const matches = card.subtypes && card.subtypes.some((c: string) => c.toLowerCase() === targetSubtype);

            if (!matches) {
                return false;
            }
        }

        // Check stats
        if (filter.stats) {
            const statName = filter.stats.stat;
            const operator = filter.stats.operator;
            const value = filter.stats.value;

            const cardValue = (card as any)[statName] || 0;

            let matches = false;
            switch (operator) {
                case '>=': matches = cardValue >= value; break;
                case '<=': matches = cardValue <= value; break;
                case '>': matches = cardValue > value; break;
                case '<': matches = cardValue < value; break;
                case '=': matches = cardValue === value; break;
                case '!=': matches = cardValue !== value; break;
                default: matches = false;
            }

            if (!matches) return false;
        }

        return true;
    }

    // ============================================================================
    // TIER 1 CRITICAL EFFECTS (Essential for gameplay)
    // ============================================================================

    /**
     * Exert self (ready → exerted)
     */
    private async executeExertSelf(effect: any, context: GameContext): Promise<void> {
        if (context.card && context.card.ready) {
            context.card.ready = false;
            context.card.exerted = true;

            if (this.turnManager) {
                this.turnManager.logger.info(`⤵️ ${context.card.name} exerted`);
            }
        }
    }

    /**
     * Ready self (exerted → ready)
     */
    private async executeReadySelf(effect: any, context: GameContext): Promise<void> {
        if (context.card && !context.card.ready) {
            context.card.ready = true; // FIX: Was incorrectly set to false
            context.card.exerted = false;

            if (this.turnManager) {
                this.turnManager.logger.info(`⤴️ ${context.card.name} readied`);
            }
        }
    }

    /**
     * Execute boost ability - pay ink to place top deck card under character
     * 
     * Boost is a keyword ability that allows paying ink to put the top card of the
     * player's deck facedown under the character. Can only be used once per turn.
     * 
     * @param effect - Boost effect with ink cost
     * @param context - Game context
     */
    private async executeBoost(effect: { type: 'boost', cost: number }, context: GameContext): Promise<void> {
        if (!this.turnManager) return;

        const card = context.card;
        // IMPORTANT: Fetch FRESH player from game state, not context.player which may be stale
        const player = this.turnManager.game.state.players[context.player.id];
        const cost = effect.cost;

        // NOTE: Ink cost and Usage Limits are handled by TurnManager for 'activated' abilities.
        // We do NOT check usage here because TurnManager already marked it as used before calling execute.

        // Place top deck card under character
        if (player.deck.length > 0) {
            const topCard = player.deck.pop()!;

            // Initialize cardsUnder array if needed
            if (!card.meta.cardsUnder) card.meta.cardsUnder = [];

            // Mark card as facedown and track it
            topCard.zone = 'under_character' as any;
            topCard.facedown = true;
            card.meta.cardsUnder.push(topCard);

            this.turnManager.logger.action(player.name, `${card.name} Boost: Placed card facedown under character (${card.meta.cardsUnder.length} total)`);
        } else {
            this.turnManager.logger.debug(`[${player.name}] No cards in deck to Boost.`);
            return;
        }

        // CRITICAL: Recalculate static abilities to apply conditional effects like Flynn Rider's buff
        this.turnManager.recalculateEffects();
    }

    /**
     * Place a card under a character
     * 
     * Moves a card from a specified source to under a target character, typically facedown.
     * Used by various effects including Boost, placement abilities, and "put under" mechanics.
     * 
     * @param effect - Put card under effect
     * @param context - Game context
     */
    private async executePutCardUnder(effect: any, context: GameContext): Promise<void> {
        if (!this.turnManager) return;
        const player = context.player;

        const source = effect.source; // 'top_of_deck', 'chosen', etc.
        const facedown = effect.facedown !== false; // Default to facedown
        const optional = effect.optional || false;

        // Resolve targets using standard mechanism
        const targets = await this.resolveTargets(effect.target, context);

        if (targets.length === 0) {
            if (optional) {
                this.turnManager.logger.debug(`[executePutCardUnder] No valid targets or selection cancelled, skipping optional effect.`);
                return;
            }
            this.turnManager.logger.debug(`[executePutCardUnder] No target found.`);
            return;
        }

        const targetCharacter = targets[0];

        // Resolve source card
        let cardToPlace = null;

        if (source === 'top_of_deck') {
            if (player.deck.length > 0) {
                cardToPlace = player.deck.pop()!;
            } else if (!optional) {
                this.turnManager.logger.debug(`[${player.name}] No cards in deck to place under ${targetCharacter.name}.`);
                return;
            }
        } else {
            this.turnManager.logger.warn(`[executePutCardUnder] Unsupported source: ${source}`);
            return;
        }

        if (cardToPlace) {
            // Initialize cardsUnder array if needed
            if (!targetCharacter.meta) targetCharacter.meta = {};
            if (!targetCharacter.meta.cardsUnder) targetCharacter.meta.cardsUnder = [];

            // Mark card properties
            cardToPlace.zone = 'under_character' as any;
            cardToPlace.facedown = facedown;

            // Add to target character
            targetCharacter.meta.cardsUnder.push(cardToPlace);

            this.turnManager.logger.info(`📥 Placed ${facedown ? 'facedown card' : cardToPlace.name} under ${targetCharacter.name} (${targetCharacter.meta.cardsUnder.length} total)`);

            // Mark Boost as used for this turn (even if card was placed via another ability)
            // This ensures UI hides Boost button since the effect has already happened
            if (!targetCharacter.meta.usedAbilities) targetCharacter.meta.usedAbilities = {};
            targetCharacter.meta.usedAbilities.boost = this.turnManager.game.state.turnCount;

            // CRITICAL: Recalculate static abilities to apply conditional effects like Flynn Rider's buff
            this.turnManager.recalculateEffects();
        }
    }

    /**
     * Execute a keyword effect (e.g. Boost)
     */
    private async executeKeyword(effect: { type: 'keyword', keyword: string, keywordValue?: string, keywordValueNumber?: number }, context: GameContext): Promise<boolean> {
        if (effect.keyword.toLowerCase() === 'boost') {
            const boostCost = effect.keywordValueNumber || parseInt(effect.keywordValue || '0');
            const player = context.player;

            // Check ink manually
            const availableInk = player.inkwell.filter((c: any) => c.ready).length;
            if (availableInk < boostCost) {
                if (this.turnManager) this.turnManager.logger.debug(`[BOOST] Not enough ink to Boost. Need ${boostCost}, have ${availableInk}`);
                return false;
            }

            // Pay cost
            let paid = 0;
            for (const ink of player.inkwell) {
                if (ink.ready && paid < boostCost) {
                    ink.ready = false;
                    paid++;
                }
            }
            if (this.turnManager) this.turnManager.logger.action(player.name, `Paid ${boostCost} ink to Boost`);

            // Execute Put Card Under logic manually for "Top Deck -> Self"
            const targetCharacter = context.card;
            if (!targetCharacter) return false;

            if (player.deck.length === 0) {
                if (this.turnManager) this.turnManager.logger.debug(`[BOOST] No cards in deck.`);
                return false;
            }

            const cardToPlace = player.deck.pop()!;

            // Initialize cardsUnder array if needed
            if (!targetCharacter.meta) targetCharacter.meta = {};
            if (!targetCharacter.meta.cardsUnder) targetCharacter.meta.cardsUnder = [];

            // Mark card properties
            cardToPlace.zone = 'under_character' as any;
            cardToPlace.facedown = true;
            (cardToPlace as any).ready = true;

            // Add to target character
            targetCharacter.meta.cardsUnder.push(cardToPlace);

            if (this.turnManager) this.turnManager.logger.info(`📥 Placed facedown card under ${targetCharacter.name} (${targetCharacter.meta.cardsUnder.length} total)`);
            return true;
        }

        return false;
    }

    /**
     * Shuffle into deck
     */
    private async executeShuffleIntoDeck(effect: Extract<EffectAST, { type: 'shuffle_into_deck' }>, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach(target => {
            const owner = this.turnManager.game.state.players[target.ownerId];
            if (!owner) return;

            // Remove from current zone
            const zones = ['hand', 'play', 'discard'] as const;
            zones.forEach(zone => {
                const index = owner[zone].indexOf(target);
                if (index !== -1) {
                    owner[zone].splice(index, 1);
                }
            });

            // Add to deck
            owner.deck.push(target);
            target.zone = 'deck';

            // Shuffle
            for (let i = owner.deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [owner.deck[i], owner.deck[j]] = [owner.deck[j], owner.deck[i]];
            }
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`🔀 Shuffled ${targets.length} card(s) into deck`);
        }
    }

    /**
     * Put on top of deck
     */
    private async executePutOnTop(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);
        const player = context.player;

        targets.forEach(target => {
            // Remove from current zone
            const zones = ['hand', 'play', 'discard'] as const;
            zones.forEach(zone => {
                const index = player[zone].indexOf(target);
                if (index !== -1) {
                    player[zone].splice(index, 1);
                }
            });

            // Put on top
            player.deck.unshift(target);
            target.zone = 'deck';
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`⬆️ Put ${targets.length} card(s) on top of deck`);
        }
    }

    /**
     * Put on bottom of deck
     */
    private async executePutOnBottom(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);
        const player = context.player;

        targets.forEach(target => {
            // Remove from current zone
            const zones = ['hand', 'play', 'discard'] as const;
            zones.forEach(zone => {
                const index = player[zone].indexOf(target);
                if (index !== -1) {
                    player[zone].splice(index, 1);
                }
            });

            // Put on bottom
            player.deck.push(target);
            target.zone = 'deck';
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`⬇️ Put ${targets.length} card(s) on bottom of deck`);
        }
    }

    /**
     * Create token (basic implementation)
     */
    private async executeCreateToken(effect: any, context: GameContext): Promise<void> {
        const player = context.player;
        const tokenType = effect.tokenType || 'generic';
        const amount = effect.amount || 1;

        for (let i = 0; i < amount; i++) {
            const token = {
                instanceId: `token_${Date.now()}_${i}`,
                name: `${tokenType} Token`,
                ownerId: player.id,
                type: 'Character',
                zone: 'play',
                cost: 0,
                strength: effect.strength || 1,
                willpower: effect.willpower || 1,
                lore: effect.lore || 0,
                damage: 0,
                ready: true,
                isToken: true
            };

            player.play.push(token as any);
        }

        if (this.turnManager) {
            this.turnManager.logger.info(`🎭 Created ${amount} ${tokenType} token(s)`);
        }
    }

    /**
     * Search deck (enhanced implementation)
     */


    /**
     * Set strength (absolute value, not modify)
     */
    private async executeSetStrength(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);
        const value = this.conditionEvaluator!.evaluateExpression(effect.value, context);

        targets.forEach(target => {
            if (target.strength !== undefined) {
                target.strength = value;
            }
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`💪 Set strength to ${value} for ${targets.length} target(s)`);
        }
    }

    /**
     * Set willpower (absolute value, not modify)
     */
    private async executeSetWillpower(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);
        const value = this.conditionEvaluator!.evaluateExpression(effect.value, context);

        targets.forEach(target => {
            if (target.willpower !== undefined) {
                target.willpower = value;
            }
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`🛡️ Set willpower to ${value} for ${targets.length} target(s)`);
        }
    }

    /**
     * Add counter to card
     */
    private async executeAddCounter(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);
        const counterType = effect.counterType || 'generic';
        const amount = effect.amount || 1;

        targets.forEach(target => {
            if (!target.counters) target.counters = {};
            target.counters[counterType] = (target.counters[counterType] || 0) + amount;
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`➕ Added ${amount} ${counterType} counter(s) to ${targets.length} target(s)`);
        }
    }

    /**
     * Play card from discard
     */
    private async executePlayFromDiscard(
        effect: { type: 'play_from_discard', target: TargetAST, free?: boolean },
        context: GameContext
    ): Promise<void> {
        const player = context.player;
        const targets = await this.resolveTargets(effect.target, context);

        if (targets.length > 0) {
            const card = targets[0]; // Play first matching card (player would choose in real game)

            // Remove from discard
            const index = player.discard.indexOf(card);
            if (index !== -1) {
                player.discard.splice(index, 1);
                player.play.push(card);
                card.zone = 'play';

                if (this.turnManager) {
                    this.turnManager.logger.info(`[EffectExecutor] ${player.name} plays ${card.name} from discard${effect.free ? ' for free' : ''}`);
                }
            }
        }
    }

    /**
     * Reveal top cards and draw matching ones
     */
    private async executeRevealAndDraw(
        effect: { type: 'reveal_and_draw', amount: number, filter: any },
        context: GameContext
    ): Promise<void> {
        const player = context.player;
        const amount = effect.amount;
        const filter = effect.filter;

        // Look at top N cards
        const revealedCards = player.deck.slice(0, amount);

        if (this.turnManager) {
            this.turnManager.logger.info(`[EffectExecutor] ${player.name} reveals top ${amount} cards`);
        }

        // Find matching cards
        const matchingCards = revealedCards.filter((card: any) => this.checkFilter(card, filter, context));

        // Move matching cards to hand
        matchingCards.forEach((card: any) => {
            const index = player.deck.indexOf(card);
            if (index !== -1) {
                player.deck.splice(index, 1);
                player.hand.push(card);
                card.zone = 'hand';
            }
        });

        if (this.turnManager && matchingCards.length > 0) {
            this.turnManager.logger.info(`[EffectExecutor] ${player.name} draws ${matchingCards.length} matching card(s)`);
        }

        // Rest go to bottom (simplified - player would order in real game)
    }

    /**
     * Modify stats based on card count
     */
    private async executeModifyStatsByCount(
        effect: { type: 'modify_stats_by_count', stat: string, amountMultiplier: number, countTarget: TargetAST, target: TargetAST, duration?: string },
        context: GameContext
    ): Promise<void> {
        // Count cards matching countTarget
        const countCards = await this.resolveTargets(effect.countTarget, context);
        const count = countCards.length;
        const totalModifier = count * effect.amountMultiplier;

        // Apply to target
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach((target: any) => {
            if (target[effect.stat] !== undefined) {
                target[effect.stat] += totalModifier;
            }
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`[EffectExecutor] Modified ${effect.stat} by ${totalModifier} (count: ${count})`);
        }
    }

    /**
     * Return card from discard to hand/deck
     */
    private async executeReturnFromDiscard(
        effect: { type: 'return_from_discard', target: TargetAST, destination?: string },
        context: GameContext
    ): Promise<void> {
        const player = context.player;
        const targets = await this.resolveTargets(effect.target, context);
        const destination = effect.destination || 'hand';

        if (this.turnManager) {
            this.turnManager.logger.debug(`[executeReturnFromDiscard] Resolved ${targets.length} targets from discard`);
        }

        targets.forEach((card: any) => {
            const index = player.discard.indexOf(card);
            if (index !== -1) {
                player.discard.splice(index, 1);

                if (destination === 'hand') {
                    player.hand.push(card);
                    card.zone = 'Hand'; // Zone enum uses capitalized values
                } else if (destination === 'top_of_deck') {
                    player.deck.unshift(card);
                    card.zone = 'deck';
                }

                if (this.turnManager) {
                    this.turnManager.logger.info(`[EffectExecutor] Returned ${card.name} from discard to ${destination}`);
                }
            } else {
                if (this.turnManager) {
                    this.turnManager.logger.warn(`[executeReturnFromDiscard] Card ${card.name} not found in discard (index ${index})`);
                }
            }
        });
    }

    /**
     * Each player chooses and performs action
     */
    private async executeEachPlayerChoosesAction(
        effect: { type: 'each_player_chooses_action', action: EffectAST },
        context: GameContext
    ): Promise<void> {
        // Execute action for each player
        const allPlayers = Object.values(this.turnManager.game.state.players);

        for (const player of allPlayers) {
            const playerContext = {
                ...context,
                player: player as any
            };

            await this.execute(effect.action, playerContext);
        }

        if (this.turnManager) {
            this.turnManager.logger.info(`[EffectExecutor] Each player performed action`);
        }
    }

    /**
     * Request a choice from a player
     * This method is async and will wait for the choice to be resolved
     */
    async requestChoice(choice: ChoiceRequest): Promise<ChoiceResponse> {
        this.pendingChoice = choice;

        // Return a promise that resolves when choice is made
        return new Promise((resolve) => {
            this.choiceResolver = resolve;

            // Emit choice request to TurnManager
            if (this.turnManager) {
                this.turnManager.emitChoiceRequest(choice).then((result: ChoiceResponse) => {
                    this.resolveChoice(result);
                });
            } else {
                // Fallback: auto-resolve with first option (for testing without TurnManager)
                const autoResult: ChoiceResponse = {
                    requestId: choice.id,
                    playerId: choice.playerId,
                    selectedIds: choice.options.slice(0, choice.min).map(opt => opt.id),
                    timestamp: Date.now()
                };
                this.resolveChoice(autoResult);
            }
        });
    }

    /**
     * Resolve a pending choice with a result
     */
    resolveChoice(result: ChoiceResponse): void {
        if (this.choiceResolver) {
            this.choiceResolver(result);
            this.choiceResolver = null;
            this.pendingChoice = null;
        }
    }

    /**
     * Get the current pending choice (if any)
     */
    getPendingChoice(): ChoiceRequest | null {
        return this.pendingChoice;
    }

    // ====== EFFECT EXECUTION METHODS ======================================================================
    // UTILITY METHODS (Private helpers for common operations)
    // ============================================================================

    /**
     * Draw cards from deck to hand
     */
    private drawCards(player: any, amount: number): number {
        let drawn = 0;
        for (let i = 0; i < amount && player.deck.length > 0; i++) {
            const card = player.deck.pop();
            if (card) {
                card.zone = 'hand';
                player.hand.push(card);
                drawn++;
            }
        }
        return drawn;
    }

    /**
     * Banish a card (move to discard from any zone)
     */
    private banishCard(card: any, owner: any): void {
        // Remove from play
        owner.play = owner.play.filter((c: any) => c.instanceId !== card.instanceId);
        // Remove from hand
        owner.hand = owner.hand.filter((c: any) => c.instanceId !== card.instanceId);
        // Add to discard
        card.zone = 'discard';
        owner.discard.push(card);
    }

    /**
     * Apply stat modifier to a target
     */
    private applyStatModifier(target: any, stat: string, amount: number, duration?: string): void {
        if (!target.modifiers) {
            target.modifiers = [];
        }
        target.modifiers.push({
            stat,
            amount,
            duration: duration || 'permanent',
            type: 'stat_modification'
        });
    }

    /**
     * Grant keyword to target
     */
    private grantKeyword(target: any, keyword: string, duration?: string): void {
        if (!target.grantedKeywords) {
            target.grantedKeywords = [];
        }
        target.grantedKeywords.push({
            keyword,
            duration: duration || 'permanent'
        });
    }

    /**
     * Modify lore for a player
     */
    private modifyLore(player: any, amount: number): void {
        player.lore = Math.max(0, player.lore + amount);
    }

    /**
     * Put card into inkwell
     */
    private putIntoInkwell(card: any, owner: any, exerted: boolean = false): void {
        // Remove from hand
        owner.hand = owner.hand.filter((c: any) => c.instanceId !== card.instanceId);
        // Add to inkwell
        card.zone = 'inkwell';
        card.ready = !exerted;
        owner.inkwell.push(card);
    }

    // =============================================================================
    // CHOICE SYSTEM - Interactive Targeting (SYNCHRONOUS)
    // =============================================================================

    /**
     * Request a target choice from a player (synchronous).
     * UNIFIED IMPLEMENTATION (Phase 3) - Uses turnManager.requestChoice()
     * No bot detection - just routes to TurnManager who handles players uniformly.
     */
    private async requestTargetChoice(request: Partial<any>, context: GameContext): Promise<any[]> {
        if (!this.turnManager) {
            throw new Error('[EffectExecutor] Cannot request choice without Turn Manager');
        }

        // Map target type strings to proper ChoiceType enum values for visual card display
        // const { ChoiceType } = require('../models'); <--- Removed dynamic require
        let choiceType = ChoiceType.TARGET_CHARACTER; // Default to card-based display

        if (request.type) {
            const typeStr = String(request.type).toLowerCase();
            if (typeStr.includes('opposing_character') || typeStr.includes('opposing-character')) {
                choiceType = ChoiceType.TARGET_OPPOSING_CHARACTER;
            } else if (typeStr.includes('character')) {
                choiceType = ChoiceType.TARGET_CHARACTER;
            } else if (typeStr.includes('item')) {
                choiceType = ChoiceType.TARGET_ITEM;
            } else if (typeStr.includes('location')) {
                choiceType = ChoiceType.TARGET_LOCATION;
            } else if (typeStr.includes('hand')) {
                choiceType = ChoiceType.TARGET_CARD_IN_HAND;
            } else if (typeStr.includes('discard')) {
                choiceType = ChoiceType.TARGET_CARD_IN_DISCARD;
            } else if (typeStr.includes('card') || typeStr.includes('target')) {
                choiceType = ChoiceType.TARGET_CARD;
            }
        }

        const fullRequest: import('../models').ChoiceRequest = {
            id: `choice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: choiceType,
            playerId: context.player.id,
            prompt: request.prompt || 'Make a choice',
            options: request.options || [],
            min: request.min,
            max: request.max,
            source: {
                card: context.card,
                abilityName: context.abilityName,
                abilityText: context.abilityText,
                player: context.player
            },
            timestamp: Date.now()
        };

        this.turnManager.logger.debug(`[EffectExecutor] Requesting choice: ${fullRequest.prompt} (${fullRequest.options.length} options)`);

        // UNIFIED: Just ask TurnManager, it routes to correct player controller
        // Fallback for tests without full TurnManager implementation
        let response: import('../models').ChoiceResponse;
        if (typeof this.turnManager.requestChoice === 'function') {
            response = await this.turnManager.requestChoice(fullRequest);
        } else {
            // Fallback: For optional effects ("may"), decline by returning empty selection
            // This respects the "may" wording - the player must actively choose to use it
            this.turnManager.logger.debug(`[EffectExecutor] No requestChoice available, declining optional choice`);
            response = {
                requestId: fullRequest.id,
                playerId: fullRequest.playerId,
                selectedIds: [], // Don't auto-select - let optional effects be declined
                timestamp: Date.now()
            };
        }

        // Convert response IDs back to option objects
        return fullRequest.options.filter((opt: any) => response.selectedIds.includes(opt.id));
    }

    /**
     * Get valid targets for a choice
     */
    private getValidTargets(targetType: string, filter: any, context: GameContext): any[] {
        if (!this.turnManager) return [];

        const options: any[] = [];
        const allPlayers = Object.values(this.turnManager.game.state.players) as any[];
        const isOpposing = targetType.includes('opposing');

        allPlayers.forEach((player: any) => {
            console.log(`[getValidTargets] Checking player ${player.name} (${player.id})`);
            if (isOpposing && player.id === context.player.id) return;
            if (!isOpposing && targetType.includes('your') && player.id !== context.player.id) return;

            player.play.forEach((card: any) => {
                let validParams = false;
                const cardType = (card.type || '').toLowerCase();
                console.log(`[getValidTargets] Checking card ${card.name} (${cardType}) for ${targetType}`);
                if (targetType.includes('character') && cardType === 'character') validParams = true;
                if (targetType.includes('item') && cardType === 'item') validParams = true;
                if (targetType.includes('location') && cardType === 'location') validParams = true;

                // chosen_permanent covers Character, Item, Location
                if (targetType === 'chosen_permanent' &&
                    (cardType === 'character' || cardType === 'item' || cardType === 'location')) {
                    validParams = true;
                }
                // Fallback for generic 'chosen' or 'chosen_card' which implies any type?
                if (targetType === 'chosen' || targetType === 'chosen_card') validParams = true;

                if (!validParams) {
                    console.log(`[getValidTargets] Invalid params`);
                    return;
                }
                if (!this.checkFilter(card, filter, context)) {
                    console.log(`[getValidTargets] Filter mismatch`);
                    return;
                }

                // Ward Check: Opponents cannot choose characters with Ward
                const isOpponent = context.player.id !== player.id;
                // Only apply Ward check for "chosen" targets (abilities), not if we are just listing for other reasons?
                // But getValidTargets is primarily for choices.
                // Exception: "except to challenge". If targetType is for challenge, we might need to skip this.
                // Asking: Is this method used for challenge targeting?
                // Usually challenge targets are validated separately.
                // Safe assumption: getValidTargets is for Ability/Effect choices.
                if (isOpponent && hasAbilityKeyword(card, 'ward')) {
                    console.log(`[getValidTargets] Skipping ${card.name} due to Ward`);
                    return;
                }

                options.push({
                    id: card.instanceId,
                    display: `${card.name} (${player.name})`,
                    card: card,
                    valid: true
                });
            });
        });

        console.log(`[getValidTargets] Found ${options.length} options`);
        return options;
    }

    /**
     * Resolve target specification to actual card instances
     * 
     * Translates abstract target specifications (e.g., "chosen_character", "all_opposing_characters")
     * into concrete arrays of CardInstance objects. Handles:
     * - Self targets
     * - Chosen targets (from player choices or event context)
     * - Filtered targets (by type, subtype, owner, status, etc.)
     * - Mock choices (for testing)
     * 
     * @param target - The target specification from the effect AST
     * @param context - Game context for filtering and validation
     * @returns Array of CardInstance objects that match the target specification
     */
    /**
     * Resolve targets specifically for Player objects
     * Handles: 'self', 'opponent', 'all_players', 'all_opponents', 'target_owner'
     */
    public async resolvePlayerTargets(target: TargetAST | undefined, context: GameContext): Promise<any[]> {
        if (!target) return [context.player]; // Default to self if no target specified

        // Handle explicit player targets
        switch (target.type) {
            case 'self':
                return [context.player];

            case 'opponent':
            case 'chosen_opponent':
                // Find opponent(s)
                const opponents = Object.values(this.turnManager.game.state.players).filter((p: any) => p.id !== context.player.id);
                return opponents;

            case 'all_players':
                return Object.values(this.turnManager.game.state.players);

            case 'all_opponents':
                return Object.values(this.turnManager.game.state.players).filter((p: any) => p.id !== context.player.id);

            case 'owner_of_chosen':
                const chosen = context.targets && context.targets[0];
                if (chosen && chosen.ownerId) {
                    const owner = this.turnManager.game.state.players[chosen.ownerId];
                    if (owner) return [owner];
                }
                return [];
        }

        return [context.player];
    }

    public async resolveTargets(target: TargetAST | undefined, context: GameContext): Promise<any[]> {
        if (!target) return [];

        // Handle same_target
        if (target.type === 'same_target') {
            const lastTargets = (context as any).lastResolvedTargets || [];
            return lastTargets;
        }

        // Resolve new targets
        const targets = await this._resolveTargetsInternal(target, context);

        // Cache them
        (context as any).lastResolvedTargets = targets;

        return targets;
    }

    private async _resolveTargetsInternal(target: TargetAST, context: GameContext): Promise<any[]> {
        if (!target) return [];

        // Handle same_target (UNIMPLEMENTED PREVIOUSLY)
        if (target.type === 'same_target') {
            const lastTargets = (context as any).lastResolvedTargets || [];
            if (this.turnManager) {
                this.turnManager.logger.debug(`[Executor] Resolving same_target. Found ${lastTargets.length} targets.`);
            }
            return lastTargets;
        }

        let resolvedTargets: any[] = [];

        // Wrap the switch to capture result
        switch (target.type) {
            case 'self':
                resolvedTargets = [context.card];
                break;
            case 'card_in_discard':
            case 'chosen_card_in_discard':
                // ... existing logic needs to assign to resolvedTargets instead of return
                // This requires refactoring the whole switch or wrapping it.
                // Wrapping seems safer.

                // Check if target provided in context
                if (context.eventContext.targetCard) {
                    const targetCard = context.eventContext.targetCard;
                    if (this.checkFilter(targetCard, target.filter, context)) {
                        return [targetCard];
                    }
                    if (this.turnManager) {
                        this.turnManager.logger.warn(`[EffectExecutor] Discard target ${targetCard.name} does not match filter.`);
                    }
                    return [];
                }

                // Check usage of mockPendingChoice for discard targets
                if (this.turnManager && (this.turnManager as any).mockPendingChoice) {
                    const choiceIds = (this.turnManager as any).mockPendingChoice;
                    const resolvedCards: any[] = [];
                    const player = context.player;

                    choiceIds.forEach((id: string) => {
                        const card = player.discard.find((c: any) => c.instanceId === id);
                        if (card) {
                            if (this.checkFilter(card, target.filter, context)) {
                                resolvedCards.push(card);
                            } else {
                                if (this.turnManager) this.turnManager.logger.warn(`[resolveTargets] Card ${id} in discard rejected by filter.`);
                            }
                        } else {
                            if (this.turnManager) this.turnManager.logger.warn(`[resolveTargets] Card ${id} not found in discard.`);
                        }
                    });
                    return resolvedCards;
                }
                return [];

            case 'chosen_character':
            case 'chosen_opposing_character':
            case 'chosen_item':
            case 'chosen_opposing_item':
            case 'chosen_location':
            case 'chosen_opposing_location':
            case 'chosen_item_or_location':
            case 'chosen_character_item_or_location':
            case 'chosen_character_or_location':  // ADDED: For Emily Quackfaster's put_card_under effect
            case 'chosen_permanent':
            case 'chosen':
                // Check payload first (UI/Test injection)
                if ((context as any).payload && (context as any).payload.targets) {
                    return (context as any).payload.targets;
                }

                // ===== INTERACTIVE TARGETING (SYNCHRONOUS) =====
                // First check if target already provided (from event or test mock)
                // IMPORTANT: Only use pre-set targetCard if it's NOT the source card itself.
                // For abilities like "When you play this character, chosen character gets +1 strength",
                // the eventContext.targetCard may be the played card itself, but the chosen target
                // should be selected by the player, not auto-resolved.
                const presetTarget = context.eventContext.targetCard;
                const isPresetTargetTheSourceCard = presetTarget && context.card &&
                    presetTarget.instanceId === context.card.instanceId;

                if (presetTarget && !isPresetTargetTheSourceCard) {
                    const targetCard = presetTarget;

                    // Apply implied filters based on target type
                    let effectiveFilter = target.filter || {};
                    if (target.type === 'chosen_opposing_character') {
                        effectiveFilter = { ...effectiveFilter, opposing: true };
                    }

                    if (this.checkFilter(targetCard, effectiveFilter, context)) {
                        return [targetCard];
                    }
                    if (this.turnManager) {
                        this.turnManager.logger.warn(`[EffectExecutor] Target ${targetCard.name} (${targetCard.instanceId}) logic check.`);
                    }
                    return [];
                }

                // Check for mock choice (for testing)
                if (this.turnManager && (this.turnManager as any).mockPendingChoice) {
                    const choiceIds = (this.turnManager as any).mockPendingChoice;
                    const resolvedCards: any[] = [];

                    if (this.turnManager) this.turnManager.logger.debug(`[resolveTargets] Resolving mock choices: ${JSON.stringify(choiceIds)} `);

                    choiceIds.forEach((id: string) => {
                        let found = false;
                        Object.values(this.turnManager.game.state.players).forEach((p: any) => {
                            const card = p.play.find((c: any) => c.instanceId === id);
                            if (card) {
                                let effectiveFilter = target.filter || {};
                                if (target.type === 'chosen_opposing_character') {
                                    effectiveFilter = { ...effectiveFilter, opposing: true };
                                }

                                if (this.checkFilter(card, effectiveFilter, context)) {
                                    resolvedCards.push(card);
                                } else {
                                    if (this.turnManager) this.turnManager.logger.warn(`[resolveTargets] Card ${card.name} (${id}) rejected by filter.`);
                                }
                                found = true;
                            }
                        });
                        if (!found) {
                            this.turnManager.logger.warn(`[EffectExecutor] Mock choice ID ${id} not found in play.`);
                        }
                    });
                    return resolvedCards;
                }

                // ===== NEW: REQUEST CHOICE (SYNCHRONOUS) =====
                // Generate valid target options
                const validOptions = this.getValidTargets(target.type, target.filter, context);

                if (validOptions.length === 0) {
                    if (this.turnManager) {
                        this.turnManager.logger.warn(`[EffectExecutor] No valid targets for ${target.type}`);
                    }
                    return [];
                }

                // Determine counts
                const count = (target as any).count || 1;
                const isUpTo = (target as any).upTo === true;
                const min = isUpTo ? 0 : count;
                const max = count;

                // Better prompts
                let prompt = `Choose a target for ${context.abilityName || 'ability'}`;
                if (target.type.includes('character')) prompt = 'Choose a character';
                if (target.type.includes('item')) prompt = 'Choose an item';
                if (target.type.includes('location')) prompt = 'Choose a location';
                if (target.type === 'chosen_opposing_character') prompt = 'Choose an opposing character';
                if (context.abilityName) prompt += ` (${context.abilityName})`;

                // Request choice SYNCHRONOUSLY -> NOW ASYNC
                const chosenOptions = await this.requestTargetChoice({
                    type: target.type,
                    prompt,
                    options: validOptions,
                    filter: target.filter,
                    min,
                    max
                }, context);

                // Return chosen cards
                return chosenOptions.map((opt: any) => opt.card).filter((c: any) => c);

            case 'chosen_opponent':
                // Target should be in eventContext.targetCard (which can be a player object)
                if (context.eventContext.targetCard) {
                    return [context.eventContext.targetCard];
                }
                // Fallback: if targetId was passed but not resolved to targetCard in eventContext?
                // Usually eventContext.targetCard is populated by TurnManager.
                return [];
            case 'my_items':
                if (this.turnManager) {
                    const player = context.player;
                    if (player && player.play) {
                        return player.play.filter((c: any) =>
                            c.type === 'Item' && this.checkFilter(c, target.filter, context)
                        );
                    }
                }
                return [];
            case 'all_characters':
                if (this.turnManager) {
                    let allChars: any[] = [];
                    Object.values(this.turnManager.game.state.players).forEach((p: any) => {
                        allChars.push(...p.play.filter((c: any) => c.type === 'Character' || c.type === 'character'));
                    });

                    // Apply filters
                    if (target.filter) {
                        // Support both owner='self' and mine=true
                        if (target.filter.owner === 'self' || target.filter.mine === true) {
                            allChars = allChars.filter(c => c.ownerId === context.player.id);
                        } else if (target.filter.owner === 'opponent' || target.filter.opposing === true) {
                            allChars = allChars.filter(c => c.ownerId !== context.player.id);
                        }

                        if (target.filter.excludeSelf) {
                            allChars = allChars.filter(c => c.instanceId !== context.card.instanceId);
                        }

                        if (target.filter.damaged === true) {
                            allChars = allChars.filter(c => c.damage > 0);
                        }

                        // Apply generic filter checks (subtypes, stats, etc.)
                        allChars = allChars.filter(c => this.checkFilter(c, target.filter, context));
                    }
                    return allChars;
                }
                return [];
            case 'count':
                // Handle { type: 'count', what: 'characters', filter: ... }
                // Returns the actual items to iterate over, or an array of length N if items aren't retrievable
                if (this.turnManager && target.what === 'characters') {
                    let items: any[] = [];
                    // This effectively duplicates logic from all_characters but tailored to the 'count' spec
                    Object.values(this.turnManager.game.state.players).forEach((p: any) => {
                        items.push(...p.play.filter((c: any) => c.type === 'Character'));
                    });

                    const filter = target.filter || {};
                    if (filter.controller === 'self' || filter.mine === true) {
                        items = items.filter(c => c.ownerId === context.player.id);
                    }
                    if (filter.zone === 'play') {
                        // already filtered by source p.play
                    }
                    return items;
                }
                return [];

            case 'variable':
                if (target.name && context.variables && context.variables[target.name]) {
                    return [context.variables[target.name]];
                }
                return [];

            case 'all_opposing_characters':
                if (this.turnManager) {
                    const opposingChars: any[] = [];
                    Object.values(this.turnManager.game.state.players).forEach((p: any) => {
                        if (p.id !== context.player.id) {
                            opposingChars.push(...p.play.filter((c: any) => c.type === 'Character'));
                        }
                    });
                    return opposingChars;
                }
                return [];
            case 'player':
                if ((target as any).value === 'opponent') {
                    if (this.turnManager) {
                        return Object.values(this.turnManager.game.state.players).filter((p: any) => p.id !== context.player.id);
                    }
                    return [];
                }
                return [context.player];
            case 'all_opponents':
            case 'each_player':
            case 'all_players':
                // Returns all players (for effects like "Each player discards their hand...")
                if (this.turnManager) {
                    return Object.values(this.turnManager.game.state.players);
                }
                return [];
            case 'variable':
                if (context.variables && context.variables[target.name]) {
                    return [context.variables[target.name]];
                }
                return [];
            case 'each_opposing_character':
                // Same as all_opposing_characters but semantically "each" for clarity
                if (this.turnManager) {
                    const opposingChars: any[] = [];
                    Object.values(this.turnManager.game.state.players).forEach((p: any) => {
                        if (p.id !== context.player.id) {
                            opposingChars.push(...p.play.filter((c: any) => c.type === 'Character'));
                        }
                    });
                    return opposingChars;
                }
                return [];
            case 'all_friendly_characters':
                if (this.turnManager) {
                    return context.player.play.filter((c: any) => c.type === 'Character');
                }
                return [];
            case 'each_opponent':
            case 'opponent':
                // Return all opponents or single opponent
                if (this.turnManager) {
                    const opponents: any[] = [];
                    Object.values(this.turnManager.game.state.players).forEach((p: any) => {
                        if (p.id !== context.player.id) {
                            opponents.push(p);
                        }
                    });
                    return opponents;
                }
                return [];
            case 'top_card_of_deck':
                // Return top card of player's deck
                if (context.player && context.player.deck && context.player.deck.length > 0) {
                    return [context.player.deck[0]];
                }
                return [];
            case 'trigger_card':
                // Return the card that triggered the ability
                if (context.eventContext && context.eventContext.card) {
                    return [context.eventContext.card];
                }
                return [];
            case 'chosen_location':
                // Return chosen location (for now, filter player's locations)
                if (this.turnManager && context.player) {
                    const locations = context.player.play.filter((c: any) => c.type === 'Location');
                    if (target.filter) {
                        return locations.filter((loc: any) => this.checkFilter(loc, target.filter, context));
                    }
                    return locations;
                }
                return [];
            case 'all_opposing_cards':
                // Return all opposing cards with optional filtering
                if (this.turnManager) {
                    let cards: any[] = [];
                    Object.values(this.turnManager.game.state.players).forEach((p: any) => {
                        if (p.id !== context.player.id) {
                            cards = cards.concat(p.play);
                        }
                    });

                    if (target.filter) {
                        cards = cards.filter((card: any) => {
                            // Check cost with comparison
                            if (target.filter.cost !== undefined && target.filter.costComparison) {
                                const cost = card.cost || 0;
                                const targetCost = target.filter.cost;

                                switch (target.filter.costComparison) {
                                    case 'less_or_equal': if (cost > targetCost) return false; break;
                                    case 'greater_or_equal': if (cost < targetCost) return false; break;
                                    case 'equal': if (cost !== targetCost) return false; break;
                                    default: break;
                                }
                            }

                            // Other filters
                            return this.checkFilter(card, target.filter, context);
                        });
                    }

                    return cards;
                }
                return [];
            default:
                return [];
        }

        return resolvedTargets;
    }



    /**
        opponent.discard.push(cardToDiscard);
        this.turnManager.logger.info(`[EffectExecutor] ${player.name} chose to discard ${cardToDiscard.name} from ${opponent.name}'s hand${sourceInfo}`);

        if (this.turnManager) {
            this.turnManager.trackZoneChange(cardToDiscard, 'hand', 'discard');
        }
    }

    /**
     * Execute a for_each loop
     */
    private async executeForEach(effect: Extract<EffectAST, { type: 'for_each' }>, context: GameContext): Promise<void> {
        const variableName = effect.variable;
        const source = effect.in || effect.source; // Use 'in' (parser) or 'source' (legacy)
        const subEffect = effect.effect;

        // Resolve targets to iterate over
        const targets = await this.resolveTargets(source, context);

        if (this.turnManager) {
            this.turnManager.logger.info(`[EffectExecutor] Executing for_each loop over ${targets.length} items.`);
        }

        // Initialize variables if needed
        if (!context.variables) {
            context.variables = {};
        }

        // Iterate and execute
        for (const item of targets) {
            // Set loop variable
            context.variables[variableName] = item;

            // Execute sub-effect
            await this.execute(subEffect, context);
        }

        // Clean up variable?
        delete context.variables[variableName];
    }



    /**
     * Ink from Hand - Put a card from hand into inkwell
     */
    private async executeInkFromHand(effect: { type: 'ink_from_hand', optional?: boolean }, context: GameContext): Promise<void> {
        const player = context.player;

        if (!this.turnManager) return;

        // Check if player has cards in hand
        if (player.hand.length === 0) {
            this.turnManager.logger.debug(`[EffectExecutor] ${player.name} has no cards to ink from hand`);
            return;
        }

        // Bot Logic: Choose lowest cost card to ink
        // Heuristic: Ink least valuable card
        let cardToInk = player.hand[0];
        let minCost = player.hand[0].cost || 0;

        player.hand.forEach((c: any) => {
            const cost = c.cost || 0;
            if (cost < minCost) {
                minCost = cost;
                cardToInk = c;
            }
        });

        // Remove from hand
        const originalZone = cardToInk.zone || 'hand';
        player.hand = player.hand.filter((c: any) => c.instanceId !== cardToInk.instanceId);

        // Add to inkwell via TurnManager
        this.turnManager.game.addCardToZone(player, cardToInk, 'inkwell');
        this.turnManager.logger.info(`🖌️ ${player.name} put ${cardToInk.name} into their inkwell`);
        this.turnManager.trackZoneChange(cardToInk, originalZone, 'inkwell');
    }

    /**
     * Area effect (placeholder implementation)
     */
    private async executeAreaEffect(effect: Extract<EffectAST, { type: 'area_effect' }>, context: GameContext): Promise<void> {
        // The parser seems to map "each/all characters" to this.
        // It usually implies some effect happening to them, but the effect details might be missing in the AST
        // or this is a wrapper.
        // Looking at parser: effects: [{ type: 'area_effect', target: { type: 'all_characters' } }]
        // It doesn't specify WHAT happens. This suggests the parser is incomplete for this pattern.
        // However, to prevent "Unknown effect type" errors, we'll implement a stub that logs.

        const targets = await this.resolveTargets((effect as any).target, context);
        if (this.turnManager) {
            this.turnManager.logger.debug(`[EffectExecutor] Area effect triggered on ${targets.length} targets (Effect details missing in AST)`);
        }
    }
    /**
     * Return multiple cards with cost filter
     */


    /**
     * Put top card of deck under target
     */
    private async executePutTopCardUnder(effect: Extract<EffectAST, { type: 'put_top_card_under' }>, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        if (!this.turnManager) return;

        targets.forEach(target => {
            const owner = this.turnManager.game.getPlayer(target.ownerId);

            if (owner.deck.length > 0) {
                const card = owner.deck.pop();
                if (card) {
                    // "Under" usually means attached, face down? Or just stored in meta?
                    // Lorcana rules: "Boost" puts card face down under character.
                    // We need a way to represent cards under other cards.
                    // Let's assume 'meta.cardsUnder' array.

                    if (!target.meta) target.meta = {};
                    if (!target.meta.cardsUnder) target.meta.cardsUnder = [];

                    card.zone = 'attached'; // New zone concept? Or just 'play' but hidden?
                    target.meta.cardsUnder.push(card);

                    if (this.turnManager) {
                        this.turnManager.logger.info(`[EffectExecutor] Put top card of deck under ${target.name}`);
                    }

                    // Note: We don't track zone change to a standard zone here, maybe just log it.
                }
            } else {
                if (this.turnManager) {
                    this.turnManager.logger.info(`[EffectExecutor] ${owner.name} has no cards in deck to put under ${target.name}`);
                }
            }
        });
    }

    /**
     * Play card for free.
     * Handles the 'play_for_free' effect type, managing the sequence of identifying eligible cards,
     * prompting the user for selection (if multiple or optional), and executing the play action.
     * Supports filtering by card type and max cost.
     * @param effect The play_for_free effect.
     * @param context The game context.
     */
    private async executePlayForFree(effect: Extract<EffectAST, { type: 'play_for_free' }>, context: GameContext): Promise<void> {
        // Log: { type: 'play_for_free', filter: { cardType: 'character', maxCost: 2 }, optional: true }

        if (!this.turnManager) return;
        const player = context.player;
        const filter = effect.filter || {};

        // Log: { type: 'play_for_free', filter: { cardType: 'character', maxCost: 2 }, optional: true }
        if (this.turnManager) {
            this.turnManager.logger.debug(`[PlayForFree] Filter: ${JSON.stringify(filter)}, Hand size: ${player.hand.length}`);
        }

        // Filter eligible cards from hand using shared helper
        const eligibleCards = player.hand.filter((c: any) => {
            // Use shared filter helper for type/subtype matching
            if (!matchesCardFilter(c, filter)) {
                return false;
            }

            // Check max cost if specified
            if (filter.maxCost !== undefined && (c.cost || 0) > filter.maxCost) {
                return false;
            }

            return true;
        });

        if (eligibleCards.length === 0) {
            if (this.turnManager) {
                this.turnManager.logger.info(`[EffectExecutor] No valid cards to play for free (Filter: ${JSON.stringify(filter)})`);
            }
            return;
        }

        // Build choice options
        const options = eligibleCards.map((card: any) => ({
            id: card.instanceId,
            display: `${card.fullName || card.name} (Cost ${card.cost || 0})`,
            card: card,
            valid: true
        }));

        // Build prompt based on filter
        let cardTypeDesc = 'card';
        if (filter.cardType) {
            cardTypeDesc = filter.cardType;
        }
        let costDesc = '';
        if (filter.maxCost !== undefined) {
            costDesc = ` with cost ${filter.maxCost} or less`;
        }
        const prompt = `Choose a ${cardTypeDesc}${costDesc} to play for free`;

        // Request choice from player
        const selectedCards = await this.requestTargetChoice({
            type: 'card_in_hand',
            prompt: prompt,
            options: options,
            min: (effect as any).optional ? 0 : 1,
            max: 1
        }, context);

        if (selectedCards.length === 0) {
            if (this.turnManager) {
                this.turnManager.logger.info(`[EffectExecutor] Player chose not to play a card for free`);
            }
            return;
        }

        const cardToPlay = selectedCards[0].card || eligibleCards.find((c: any) => c.instanceId === selectedCards[0].id);

        // Play the card using TurnManager to ensure triggers and state updates happen correctly.
        if (this.turnManager && cardToPlay) {
            this.turnManager.logger.info(`[EffectExecutor] ${player.name} playing ${cardToPlay.name} for free`);
            await this.turnManager.playCard(player, cardToPlay.instanceId, undefined, undefined, undefined, undefined, undefined, { free: true });
        }
    }
    /**
     * Reveal top card of deck
     */
    private async executeRevealTopCard(effect: Extract<EffectAST, { type: 'reveal_top_card' }>, context: GameContext): Promise<void> {
        if (!this.turnManager) return;
        const player = context.player;

        if (player.deck.length > 0) {
            const card = player.deck[player.deck.length - 1];
            if (this.turnManager) {
                this.turnManager.logger.info(`[EffectExecutor] ${player.name} revealed top card: ${card.name}`);
            }
            // In a real game, this would show the card to all players.
            // For now, logging is sufficient.
            // We might need to store this "revealed" state if subsequent effects depend on it (like check_revealed_card).
            // Let's assume context.eventContext can store it or we attach it to player meta temporarily.
            if (!context.eventContext) context.eventContext = {} as any;
            (context.eventContext as any).revealedCard = card;
        } else {
            if (this.turnManager) {
                this.turnManager.logger.info(`[EffectExecutor] ${player.name} has no cards to reveal.`);
            }
        }
    }

    /**
     * Mill (discard from top of deck)
     */
    private async executeMill(effect: Extract<EffectAST, { type: 'mill' }>, context: GameContext): Promise<void> {
        if (!this.turnManager) return;

        // Use resolvePlayerTargets to correctly handle 'all_opponents', 'opponent', etc.
        const targets = await this.resolvePlayerTargets(effect.target, context);
        const amount = effect.amount;

        targets.forEach(playerToMill => {
            // resolvePlayerTargets returns Player objects

            // Check if it's actually a player object
            if (!playerToMill || !playerToMill.deck) {
                if (this.turnManager) {
                    this.turnManager.logger.warn(`[EffectExecutor] executeMill: Invalid player target found.`);
                }
                return;
            }

            for (let i = 0; i < amount; i++) {
                if (playerToMill.deck.length > 0) {
                    const card = playerToMill.deck.pop();
                    if (card) {
                        card.zone = 'discard';
                        playerToMill.discard.push(card);
                        if (this.turnManager) {
                            this.turnManager.trackZoneChange(card, 'deck', 'discard');
                        }
                    }
                }
            }
            if (this.turnManager) {
                this.turnManager.logger.info(`[EffectExecutor] ${playerToMill.name} milled ${amount} cards`);
                this.turnManager.logger.effect(
                    playerToMill.name,
                    `Milled ${amount} cards`,
                    context.card?.name,
                    { amount: amount, deckRemaining: playerToMill.deck.length }
                );
            }
        });
    }


    /**
     * Look at top cards and move to top or bottom
     */
    private async executeLookAndMoveToTopOrBottom(effect: Extract<EffectAST, { type: 'look_and_move_to_top_or_bottom' }>, context: GameContext): Promise<void> {
        if (!this.turnManager) return;
        const player = context.player;
        const amount = effect.amount;

        // Look at top X cards
        const cardsToLook = [];
        for (let i = 0; i < amount; i++) {
            if (player.deck.length > 0) {
                cardsToLook.push(player.deck.pop());
            }
        }

        if (cardsToLook.length === 0) return;

        if (this.turnManager) {
            this.turnManager.logger.info(`[EffectExecutor] ${player.name} looking at top ${cardsToLook.length} cards`);
        }

        // Bot Logic: Put best cards on top, others on bottom.
        // Simple heuristic: Put all on bottom to cycle deck, or keep high cost on bottom?
        // Let's just put them back on top for now to minimize disruption, or put all on bottom.
        // "Look at top X, put any number on bottom, rest on top in any order."
        // Bot will put ALL on bottom for now (simple logic).

        cardsToLook.forEach(card => {
            player.deck.unshift(card); // Unshift puts at start (bottom of stack if pop is top? No, pop is end.)
            // Array: [bottom, ..., top]
            // pop() takes from end (top).
            // unshift() adds to start (bottom).
            // So this puts them on bottom.
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`[EffectExecutor] ${player.name} put ${cardsToLook.length} cards on bottom of deck`);
        }
    }

    /**
     * Play revealed card for free
     */
    private async executePlayRevealedCardForFree(effect: Extract<EffectAST, { type: 'play_revealed_card_for_free' }>, context: GameContext): Promise<void> {
        if (!this.turnManager) return;
        const player = context.player;
        const revealedCard = (context.eventContext as any).revealedCard;

        if (!revealedCard) {
            if (this.turnManager) {
                this.turnManager.logger.info(`[EffectExecutor] No revealed card to play for free.`);
            }
            return;
        }

        if (this.turnManager) {
            this.turnManager.logger.info(`[EffectExecutor] ${player.name} playing revealed card ${revealedCard.name} for free`);
        }

        // Remove from deck (it was just revealed, so it's still on top or popped? 
        // reveal_top_card just peeked at it (deck[length-1]). It didn't pop it.
        // So we need to pop it from deck.

        // Check if it's still on top of deck
        if (player.deck.length > 0 && player.deck[player.deck.length - 1].instanceId === revealedCard.instanceId) {
            player.deck.pop();
        } else {
            // It might have moved?
            if (this.turnManager) {
                this.turnManager.logger.warn(`[EffectExecutor] Revealed card ${revealedCard.name} is not on top of deck anymore?`);
            }
            // Try to find it in deck and remove it?
            // For now assume it is.
        }

        // Add to play
        revealedCard.zone = 'play';
        revealedCard.ready = false;

        const instance = this.turnManager.game.addCardToZone(player, revealedCard, 'play');
        instance.playedThisTurn = true;

        if (this.turnManager) {
            this.turnManager.trackZoneChange(revealedCard, 'deck', 'play');
            // Trigger on_play effects?
        }
    }

    // ====== TIER 2: SIMPLE STATE EFFECTS ======

    /**
     * Prevent next X damage to target
     */
    private async executePreventNextDamage(effect: { type: 'prevent_next_damage', target: TargetAST, amount: number | 'all' }, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach((target: any) => {
            if (!target.damageShields) {
                target.damageShields = [];
            }

            target.damageShields.push({
                amount: effect.amount,
                duration: 'until_end_of_turn',
                usage: 'next_time',
                sourceId: context.card?.instanceId || 'unknown',
                sourcePlayerId: context.player?.id || 'unknown'
            });

            if (this.turnManager) {
                this.turnManager.logger.info(`${target.name} gains damage shield: ${effect.amount}`);
            }
        });
    }



    /**
     * Move damage from one character to another
     */
    private async executeMoveDamage(effect: { type: 'move_damage', amount: number, from: TargetAST, to: TargetAST }, context: GameContext): Promise<void> {
        const sources = await this.resolveTargets(effect.from, context);
        const destinations = await this.resolveTargets(effect.to, context);

        if (sources.length === 0 || destinations.length === 0) return;

        // Typically move damage involves one source and one destination based on choice
        const source = sources[0];
        const destination = destinations[0];

        const damageToMove = Math.min(effect.amount, source.damage || 0);

        if (damageToMove > 0) {
            // Remove from source
            source.damage -= damageToMove;

            // Add to destination (using damage handler to trigger effects?)
            // Direct modification for "move" usually bypasses "deal damage" triggers unless specified?
            // Rules say "moving damage counts as damage being dealt"? Lorcana rules: "Moving damage is not dealing damage."
            // So we just modify the values directly.

            destination.damage = (destination.damage || 0) + damageToMove;

            // Check for banishment (simple check)
            if (destination.damage >= destination.willpower) {
                // Let the turn manager handle banishment checks phase
            }

            if (this.turnManager) {
                this.turnManager.logger.info(`Moved ${damageToMove} damage from ${source.name} to ${destination.name}`);
            }
        }
    }




    // ====== TIER 3: COMPLEX MECHANICS ======

    /**
     * Create a copy of target card
     */
    private async executeCreateCopy(effect: { type: 'create_copy', target: TargetAST }, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach((target: any) => {
            // Create a copy with new instance ID
            const copy = {
                ...target,
                instanceId: `copy_${Date.now()}_${Math.random()}`,
                zone: target.zone
            };

            // Add to same zone
            const player = context.player;
            if (target.zone === 'play') {
                player.play.push(copy);
            } else if (target.zone === 'hand') {
                player.hand.push(copy);
            }

            if (this.turnManager) {
                this.turnManager.logger.info(`Created a copy of ${target.name}`);
            }
        });
    }



    /**
     * Counter/cancel an ability
     */
    private async executeCounterAbility(effect: { type: 'counter_ability', target: TargetAST }, context: GameContext): Promise<void> {
        // This would need integration with a stack system
        // For now, just log it
        if (this.turnManager) {
            this.turnManager.logger.info('Ability countered!');
        }
    }

    /**
     * Cascade - execute multiple effects sequentially
     */
    private async executeCascade(effect: { type: 'cascade', effects: EffectAST[] }, context: GameContext): Promise<void> {
        for (const cascadeEffect of effect.effects) {
            await this.execute(cascadeEffect, context);
        }
    }



    /**
     * Play card from graveyard (one-time)
     */
    private async executeFlashback(effect: { type: 'flashback', target: TargetAST }, context: GameContext): Promise<void> {
        // Mark card as having flashback used
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach((target: any) => {
            target.flashbackUsed = true;

            if (this.turnManager) {
                this.turnManager.logger.info(`${target.name} played with Flashback`);
            }
        });
    }

    /**
     * Take control of opponent's card
     */
    private async executeGainControl(effect: { type: 'gain_control', target: TargetAST, duration?: string }, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);
        const player = context.player;

        targets.forEach((target: any) => {
            // Find original owner
            const originalOwner = Object.values(this.turnManager?.game?.state?.players || {}).find((p: any) =>
                p.play.includes(target)
            ) as any;

            if (originalOwner && originalOwner.id !== player.id) {
                // Remove from original owner
                originalOwner.play = originalOwner.play.filter((c: any) => c !== target);

                // Add to new controller
                player.play.push(target);
                target.ownerId = player.id;

                if (this.turnManager) {
                    this.turnManager.logger.info(`${player.name} gains control of ${target.name}`);
                }
            }
        });
    }

    /**
     * Look at top X cards (scry-like)
     */
    private async executeLookAtTop(effect: { type: 'look_at_top', amount: number }, context: GameContext): Promise<void> {
        const player = context.player;
        const amount = Math.min(effect.amount, player.deck.length);

        if (amount > 0) {
            const topCards = player.deck.slice(-amount);
            const cardNames = topCards.map((c: any) => c.name).join(', ');

            if (this.turnManager) {
                this.turnManager.logger.info(`${player.name} looks at top ${amount} card(s): ${cardNames}`);
            }
        }
    }

    /**
     * Mill until condition met
     */
    private async executeMillUntil(effect: { type: 'mill_until', condition: any }, context: GameContext): Promise<void> {
        const player = context.player;
        let milled = 0;

        while (player.deck.length > 0) {
            const card = player.deck.pop();
            if (!card) break;

            card.zone = 'discard';
            player.discard.push(card);
            milled++;

            // Check condition
            if (effect.condition.cardType && card.type === effect.condition.cardType) {
                break;
            }
            if (effect.condition.maxCards && milled >= effect.condition.maxCards) {
                break;
            }
        }

        if (this.turnManager) {
            this.turnManager.logger.info(`${player.name} milled ${milled} card(s)`);
        }
    }

    /**
     * Enable playing additional card this turn
     */
    private async executePlayAdditionalCard(effect: { type: 'play_additional_card', cardType?: string }, context: GameContext): Promise<void> {
        const player = context.player;

        if (!player.additionalPlays) {
            player.additionalPlays = {};
        }

        const cardType = effect.cardType || 'any';
        player.additionalPlays[cardType] = (player.additionalPlays[cardType] || 0) + 1;

        if (this.turnManager) {
            this.turnManager.logger.info(`${player.name} may play an additional ${cardType} card this turn`);
        }
    }

    /**
     * Force sacrifice of cards
     */
    private async executeSacrifice(effect: { type: 'sacrifice', target: TargetAST, amount?: number }, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);
        const amount = effect.amount || targets.length;

        const toSacrifice = targets.slice(0, amount);

        toSacrifice.forEach((target: any) => {
            const player = context.player;

            // Remove from play
            player.play = player.play.filter((c: any) => c !== target);

            // Add to discard
            target.zone = 'discard';
            player.discard.push(target);

            if (this.turnManager) {
                this.turnManager.logger.info(`${player.name} sacrifices ${target.name}`);
            }
        });
    }

    /**
     * Search deck for specific card
     */
    private async executeTutorSpecific(effect: { type: 'tutor_specific', filter: any }, context: GameContext): Promise<void> {
        const player = context.player;

        const card = player.deck.find((c: any) => {
            if (effect.filter.name && c.name !== effect.filter.name) return false;
            if (effect.filter.type && c.type !== effect.filter.type) return false;
            if (effect.filter.subtype && !c.subtypes?.includes(effect.filter.subtype)) return false;
            return true;
        });

        if (card) {
            // Remove from deck
            player.deck = player.deck.filter((c: any) => c !== card);

            // Add to hand
            card.zone = 'hand';
            player.hand.push(card);

            if (this.turnManager) {
                this.turnManager.logger.info(`${player.name} tutors ${card.name} to hand`);
            }
        }
    }

    /**
     * Ready/untap an exerted card
     */
    private async executeReadyCard(effect: { type: 'ready_card', target: TargetAST, optional?: boolean }, context: GameContext): Promise<boolean | void> {
        const targets = await this.resolveTargets(effect.target, context);

        // Check if optional
        const shouldExecute = await this.checkOptional(effect, context, `Do you want to ready ${targets.length > 1 ? targets.length + ' cards' : 'card'}?`);
        if (!shouldExecute) return false;

        targets.forEach((target: any) => {
            target.ready = true;

            if (this.turnManager) {
                this.turnManager.logger.info(`${target.name} readies`);
            }
        });

        return true;
    }

    /**
     * Grant Ward protection
     */
    private async executeWard(effect: { type: 'ward', target: TargetAST, amount?: number }, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach((target: any) => {
            if (!target.keywords) {
                target.keywords = [];
            }

            const wardKeyword = effect.amount ? `Ward ${effect.amount}` : 'Ward';
            if (!target.keywords.includes(wardKeyword)) {
                target.keywords.push(wardKeyword);
            }

            if (this.turnManager) {
                this.turnManager.logger.info(`${target.name} gains ${wardKeyword}`);
            }
        });
    }

    // ====== CHOICE-BASED EFFECTS ======




    /**
     * Prevent target from readying
     */
    private async executeCantReady(effect: { type: 'cant_ready', target: TargetAST, duration?: string }, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach((target: any) => {
            if (!target.restrictions) {
                target.restrictions = [];
            }

            target.restrictions.push({
                type: 'cant_ready',
                duration: effect.duration || 'next_turn_start',
                sourceId: context.card?.instanceId
            });

            if (this.turnManager) {
                this.turnManager.logger.info(`${target.name} cannot ready until ${effect.duration || 'next_turn_start'}`);
            }
        });
    }

    /**
     * Return card from discard to hand/deck
     */
    /**
     * Exert target
     */
    private async executeExert(effect: { type: 'exert', target: TargetAST, optional?: boolean }, context: GameContext): Promise<boolean | void> {
        const targets = await this.resolveTargets(effect.target, context);

        // Check if optional
        const shouldExecute = await this.checkOptional(effect, context, `Do you want to exert ${targets.length > 1 ? targets.length + ' cards' : 'card'}?`);
        if (!shouldExecute) return false;

        targets.forEach((target: any) => {
            if (target.ready) {
                target.ready = false;
            }
        });

        if (this.turnManager && targets.length > 0) {
            const targetNames = targets.map((t: any) => t.name).join(', ');
            this.turnManager.logger.info(`⤵️ Exerted ${targetNames}`);
        }

        return true;
    }
}
