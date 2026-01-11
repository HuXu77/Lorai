/**
 * ConditionEvaluator - Lorcana Game Condition and Expression Evaluation
 * =====================================================================
 * 
 * Extracted from EffectExecutor to improve code organization and reusability.
 * This utility evaluates conditions and expressions used in ability logic.
 * 
 * Conditions determine whether effects should execute (e.g., "if damaged").
 * Expressions calculate numeric values (e.g., "count of characters in play").
 * 
 * @module ConditionEvaluator
 * @since 1.0.0
 */

import type { ConditionAST, Expression } from './effect-ast';
import type { GameContext } from './executor';

export class ConditionEvaluator {
    private turnManager: any = null;
    private checkFilter: (card: any, filter: any, context: GameContext) => boolean;

    constructor(
        turnManager: any,
        checkFilterFn: (card: any, filter: any, context: GameContext) => boolean
    ) {
        this.turnManager = turnManager;
        this.checkFilter = checkFilterFn;
    }

    /**
     * Set TurnManager reference (for dependency injection)
     */
    setTurnManager(turnManager: any): void {
        this.turnManager = turnManager;
    }

    /**
     * Evaluate an expression to a number
     * 
     * Supports:
     * - constant: literal number value
     * - attribute_of_self: get attribute from context.card
     * - variable: lookup in context.variables
     * - count: count cards matching filter in a zone
     */
    evaluateExpression(expr: number | Expression, context: GameContext): number {
        if (typeof expr === 'number') {
            return expr;
        }

        switch (expr.type) {
            case 'constant':
                return expr.value;

            case 'attribute_of_self':
                if (context.card) {
                    return (context.card as any)[expr.attribute] || 0;
                }
                return 0;

            case 'variable':
                // Look up variable in context
                if (context.variables && expr.name in context.variables) {
                    const value = context.variables[expr.name];
                    // If the variable value is itself an expression, evaluate it
                    if (typeof value === 'object' && value.type) {
                        return this.evaluateExpression(value, context);
                    }
                    return value;
                }
                // Variable not found in context
                this.turnManager?.logger.warn(`[ConditionEvaluator] Variable '${expr.name}' not found in context`);
                return 0;

            case 'count':
                if (!this.turnManager) return 0;

                // Handle semantic count types (e.g., "damaged_opponent_characters")
                if (expr.count) {
                    const countType = expr.count;
                    if (countType === 'damaged_opponent_characters') {
                        let count = 0;
                        Object.values(this.turnManager.game.state.players).forEach((p: any) => {
                            if (p.id !== context.player.id) {
                                count += p.play.filter((c: any) =>
                                    c.type === 'Character' && (c.damage || 0) > 0
                                ).length;
                            }
                        });
                        return count;
                    }
                    return 0;
                }

                const targetPlayer = (expr.owner === 'opponent')
                    ? this.turnManager.game.getOpponent(context.player.id)
                    : context.player;

                if (!targetPlayer) {
                    this.turnManager.logger.warn(`[ConditionEvaluator] Count target player not found: ${expr.owner}`);
                    return 0;
                }

                let cards: any[] = [];
                if (expr.source === 'hand') {
                    cards = targetPlayer.hand;
                } else if (expr.source === 'play') {
                    cards = targetPlayer.play;
                } else if (expr.source === 'discard') {
                    cards = targetPlayer.discard;
                }

                this.turnManager.logger.debug(`[ConditionEvaluator] Count: Source=${expr.source} Owner=${expr.owner} Cards=${cards?.length} Filter=${JSON.stringify(expr.filter)}`);

                if (expr.filter) {
                    const filtered = cards.filter(card => {
                        // Filter by type (character, item, etc)
                        if (expr.filter.type && expr.filter.type !== 'card') {
                            if (!card.type || card.type.toLowerCase() !== expr.filter.type.toLowerCase()) return false;
                        }

                        // Filter by name
                        if (expr.filter.name) {
                            if (card.name !== expr.filter.name) return false;
                        }

                        // Filter by subtype
                        if (expr.filter.subtype) {
                            if (!card.subtypes || !card.subtypes.includes(expr.filter.subtype)) return false;
                        }

                        return true;
                    });

                    this.turnManager.logger.debug(`[ConditionEvaluator] Count Result: ${filtered.length}`);
                    return filtered.length;
                }

                return cards.length;

            default:
                return 0;
        }
    }

    /**
     * Evaluate a condition AST node
     * 
     * Tests whether a game state condition is true. Supports many condition types:
     * - Card state (is_damaged, status, has_subtype)
     * - Player state (my_turn, empty_hand, min_ink)
     * - Context state (in_challenge, played_song_this_turn)
     * - Presence checks (presence, unless_presence, while_here)
     * 
     * @param condition - The condition AST node to evaluate
     * @param context - Game context providing state to check against
     * @returns True if the condition is satisfied, false otherwise
     */
    evaluateCondition(condition: ConditionAST, context: GameContext): boolean {
        switch (condition.type) {
            case 'is_self':
                return context.eventContext.card === condition.card;

            case 'has_card_under':
                if (context.card) {
                    const cardsUnder = context.card.meta?.cardsUnder || context.card.cardsUnder;
                    return !!(cardsUnder && cardsUnder.length > 0);
                }
                return false;

            case 'has_subtype':
                if (context.card && context.card.subtypes) {
                    return context.card.subtypes.some((s: string) => s.toLowerCase() === condition.subtype.toLowerCase());
                }
                return false;

            case 'cost_less_than':
                if (context.card && typeof context.card.cost === 'number') {
                    return context.card.cost < condition.amount;
                }
                return false;

            case 'min_ink':
                if (context.player && context.player.inkwell) {
                    return context.player.inkwell.length >= condition.amount;
                }
                return false;

            case 'empty_hand':
                if (context.player && context.player.hand) {
                    return context.player.hand.length === 0;
                }
                return false;

            case 'is_damaged':
                if (condition.target === 'self' && context.card) {
                    const damage = context.card.damage || 0;
                    return damage > 0;
                }
                return false;

            case 'has_no_damage':
                if (condition.target === 'self' && context.card) {
                    const damage = context.card.damage || 0;
                    console.log(`[ConditionEvaluator] has_no_damage check on ${context.card.name}: damage=${damage}`);
                    return damage === 0;
                }
                console.log(`[ConditionEvaluator] has_no_damage check failed: target=${condition.target}, card=${context.card?.name}`);
                return false;

            case 'check_revealed_card':
                // Check if revealed card matches filter
                const revealedCard = (context.eventContext as any).revealedCard;
                if (!revealedCard) return false;

                const filter = condition.filter;
                if (filter.type) {
                    if (revealedCard.type !== filter.type && !revealedCard.keywords?.includes(filter.type)) {
                        return false;
                    }
                }
                return true;

            case 'status':
                if (condition.status === 'exerted' && condition.target === 'self' && context.card) {
                    return context.card.ready === false;
                }
                if (condition.status === 'ready' && condition.target === 'self' && context.card) {
                    return context.card.ready === true;
                }
                return false;

            case 'my_turn':
                if (context.player && this.turnManager) {
                    return this.turnManager.game.state.activePlayerId === context.player.id;
                }
                return false;

            case 'in_challenge':
                return context.eventContext.inChallenge === true;

            case 'has_cards_in_hand':
                const handSize = context.player.hand?.length || 0;
                const requiredCards = (condition as any).amount || 1;
                return handSize >= requiredCards;

            case 'self_exerted':
                if (context.card) {
                    return context.card.ready === false;
                }
                return false;

            case 'played_song_this_turn':
                if (context.gameState && context.gameState.songsPlayedThisTurn) {
                    return context.gameState.songsPlayedThisTurn > 0;
                }
                return false;

            case 'target_has_subtype':
                const targetCard = context.eventContext.targetCard;
                if (targetCard && targetCard.subtypes) {
                    return targetCard.subtypes.some((s: string) =>
                        s.toLowerCase() === condition.subtype.toLowerCase()
                    );
                }
                return false;

            case 'during_your_turn':
                if (context.player && this.turnManager) {
                    return this.turnManager.game.state.activePlayerId === context.player.id;
                }
                return false;

            case 'unless_presence':
                if (context.player && condition.filter) {
                    const hasMatch = context.player.play.some((card: any) => this.checkFilter(card, condition.filter, context));
                    return !hasMatch;
                }
                return true;

            case 'unless_location':
                if (context.card) {
                    return !context.card.atLocation;
                }
                return true;

            case 'while_here':
                if (context.card) {
                    return context.card.atLocation === true;
                }
                return false;

            case 'presence':
                if (context.player && condition.filter) {
                    return context.player.play.some((card: any) => this.checkFilter(card, condition.filter, context));
                }
                return false;

            case 'while_here_exerted':
                if (context.card && context.player) {
                    const locationId = condition.location || context.card.instanceId;
                    return context.player.play.some((card: any) =>
                        card.atLocation === locationId && card.ready === false
                    );
                }
                return false;

            case 'event_occurred':
                if (context.gameState && context.gameState.eventHistory) {
                    const currentTurn = context.gameState.turnCount;
                    return context.gameState.eventHistory.some((e: any) =>
                        e.event === condition.event &&
                        (condition.turn === 'this_turn' ? e.turn === currentTurn : true)
                    );
                }
                return false;

            case 'ink_count':
            case 'ink_available':
                if (context.player && context.player.inkwell) {
                    const inkCount = context.player.inkwell.length;
                    const amount = condition.amount;
                    const comparison = (condition as any).comparison || 'gte';

                    switch (comparison) {
                        case 'less_or_equal':
                        case 'lte':
                            return inkCount <= amount;
                        case 'greater_or_equal':
                        case 'gte':
                            return inkCount >= amount;
                        case 'less_than':
                            return inkCount < amount;
                        case 'greater_than':
                            return inkCount > amount;
                        case 'equal':
                        case 'eq':
                            return inkCount === amount;
                        default:
                            return inkCount >= amount;
                    }
                }
                return false;

            case 'count_check':
                if (context.player) {
                    const matchingCards = context.player.play.filter((card: any) => this.checkFilter(card, condition.filter, context));
                    const count = matchingCards.length;
                    const targetAmount = condition.amount;
                    const operator = condition.operator || 'gte';

                    switch (operator) {
                        case 'gte': return count >= targetAmount;
                        case 'lte': return count <= targetAmount;
                        case 'gt': return count > targetAmount;
                        case 'lt': return count < targetAmount;
                        case 'eq': return count === targetAmount;
                        default: return count >= targetAmount;
                    }
                }
                return false;

            case 'min_other_characters':
                if (context.player) {
                    const otherCharacters = context.player.play.filter((c: any) =>
                        c.type === 'Character' && c.instanceId !== context.card?.instanceId
                    );
                    const required = condition.amount || 2;
                    const actual = otherCharacters.length;
                    this.turnManager?.logger.debug(`   [Condition] min_other_characters: need ${required}, have ${actual}`);
                    return actual >= required;
                }
                return false;

            case 'opponent_lore_check':
                if (this.turnManager) {
                    const currentPlayerId = context.player?.id;
                    const opponentId = Object.keys(context.gameState.state.players).find(id => id !== currentPlayerId);
                    const opponent = opponentId ? context.gameState.state.players[opponentId] : null;

                    if (opponent) {
                        const opLore = opponent.lore;
                        const req = condition.amount;
                        if (condition.operator === 'gte') return opLore >= req;
                        if (condition.operator === 'lte') return opLore <= req;
                        if (condition.operator === 'eq') return opLore === req;
                        return opLore >= req;
                    }
                }
                return false;

            case 'self_stat_check':
                if (context.card) {
                    const val = (condition.stat === 'strength') ? (context.card.strength || 0) : (context.card.willpower || 0);
                    const req = condition.value;
                    if (condition.operator === 'gte') return val >= req;
                    if (condition.operator === 'lte') return val <= req;
                    if (condition.operator === 'eq') return val === req;
                    return val >= req;
                }
                return false;

            case 'control_character':
            case 'has_character_in_play':
                if (context.player) {
                    const condAny = condition as any;
                    const name = condAny.name || condAny.subtype;
                    if (!name) return false;

                    return context.player.play.some((c: any) =>
                        c.name === name ||
                        (c.subtypes && c.subtypes.includes(name))
                    );
                }
                return false;

            case 'at_location':
            case 'at_any_location':
                if (context.card) {
                    return !!context.card.atLocation;
                }
                return false;

            case 'has_damaged_character_at_location':
                if (context.player) {
                    return context.player.play.some((c: any) => c.damage > 0 && c.atLocation);
                }
                return false;

            case 'deck_building':
                return true;

            default:
                return false;
        }
    }
}
