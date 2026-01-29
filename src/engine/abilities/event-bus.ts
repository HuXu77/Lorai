/**
 * Event Bus
 * 
 * Central event system for the game engine.
 * Abilities register as listeners for specific events,
 * and the bus notifies them when events occur.
 */

import { GameEvent, EventContext, AbilityListener } from './events';
import { AbilityDefinition, TriggeredAbility } from './types';

export class EventBus {
    private listeners: Map<GameEvent, Set<AbilityListener>> = new Map();

    constructor() {
        // Initialize listener sets for all events
        Object.values(GameEvent).forEach(event => {
            this.listeners.set(event, new Set());
        });
    }

    /**
     * Register an ability to listen for events
     */
    register(ability: AbilityDefinition, card: any): void {
        if (ability.type !== 'triggered') {
            return; // Only triggered abilities listen to events
        }

        const triggeredAbility = ability as TriggeredAbility;

        const listener: AbilityListener = {
            ability,
            card,

            shouldTrigger(context: EventContext): boolean {
                // Check if event matches
                if (context.event !== triggeredAbility.event) {
                    return false;
                }

                // Check trigger filter
                if (triggeredAbility.triggerFilter) {
                    const filter = triggeredAbility.triggerFilter;

                    // Check target filter (e.g., "this character is challenged")
                    if (filter.target === 'self') {
                        if (context.card !== this.card) {
                            return false;
                        }
                    }

                    // Check self filter (e.g., "whenever this character quests")
                    // This checks if the SOURCE card of the event is this ability's card
                    if (filter.self === true) {
                        // The sourceCard could be context.sourceCard or context.card depending on event type
                        const eventSourceCard = context.sourceCard || context.card;
                        if (eventSourceCard !== this.card) {
                            return false;
                        }
                    }

                    // ===== CRITICAL FIX: Check mine/opponent filters =====
                    // "Whenever YOU play" = filter.mine: true
                    // "Whenever an opponent plays" = filter.opponent: true
                    if (filter.mine !== undefined || filter.opponent !== undefined) {
                        // context.player = the player who triggered this event (played the card, etc.)
                        // this.card.ownerId = the player who owns the card with this ability
                        if (context.player && this.card.ownerId) {
                            const isSamePlayer = context.player.id === this.card.ownerId;

                            // filter.mine means "only trigger for my actions"
                            if (filter.mine && !isSamePlayer) {
                                return false;
                            }

                            // filter.opponent means "only trigger for opponent's actions"
                            if (filter.opponent && isSamePlayer) {
                                return false;
                            }
                        }
                    }

                    // Check card type
                    if (filter.type) {
                        const card = context.card;
                        if (!card) return false;
                        // Handle case-insensitive comparison
                        if (card.type.toLowerCase() !== filter.type.toLowerCase()) return false;
                    }

                    // ===== NEW: Check target owner (e.g., "whenever one of your characters is banished") =====
                    if (filter.targetOwner) {
                        // For card events (played, banished), context.card IS the target
                        // For interaction events, context.targetCard might be used
                        const targetCard = context.targetCard || context.card;

                        if (targetCard && this.card.ownerId) {
                            const isMyCard = targetCard.ownerId === this.card.ownerId;

                            if (filter.targetOwner === 'self' && !isMyCard) {
                                return false;
                            }
                            if (filter.targetOwner === 'opponent' && isMyCard) {
                                return false;
                            }
                        }
                    }
                }

                // ===== AUTOMATIC SELF-FILTER FOR COMMON PATTERNS =====
                // Many patterns are missing explicit triggerFilter but their rawText
                // clearly indicates they should only trigger for this specific card.
                // This catches those cases automatically.
                if (!triggeredAbility.triggerFilter || !triggeredAbility.triggerFilter.target) {
                    const rawText = (triggeredAbility.rawText || '').toLowerCase();
                    const eventSourceCard = context.sourceCard || context.card;

                    // "When you play this character" - only trigger when THIS card is played
                    if (triggeredAbility.event === GameEvent.CARD_PLAYED &&
                        rawText.match(/^when you play this (character|card|item|action)/)) {
                        if (eventSourceCard !== this.card) {
                            return false;
                        }
                    }

                    // "Whenever this character quests" - only trigger when THIS card quests
                    if (triggeredAbility.event === GameEvent.CARD_QUESTED &&
                        rawText.match(/whenever (this character|he|she|they) quests?/)) {
                        if (eventSourceCard !== this.card) {
                            return false;
                        }
                    }

                    // "When this character is banished" - only trigger when THIS card is banished
                    if (triggeredAbility.event === GameEvent.CARD_BANISHED &&
                        rawText.match(/when this (character|card|item) is banished/)) {
                        if (eventSourceCard !== this.card) {
                            return false;
                        }
                    }

                    // "When this character is challenged" - only trigger when THIS card is challenged
                    if (triggeredAbility.event === GameEvent.CARD_CHALLENGED &&
                        rawText.match(/when this (character|card) is challenged/)) {
                        if (eventSourceCard !== this.card) {
                            return false;
                        }
                    }

                    // "When this character leaves play" - only trigger when THIS card leaves
                    if (triggeredAbility.event === GameEvent.CARD_LEAVES_PLAY &&
                        rawText.match(/when (this character|he|she|they|it) leaves play/)) {
                        if (eventSourceCard !== this.card) {
                            return false;
                        }
                    }

                    // "When this character deals damage" - only trigger when THIS card deals damage
                    if (triggeredAbility.event === GameEvent.CARD_DEALS_DAMAGE &&
                        rawText.match(/whenever (this character|he|she|they) deals damage/)) {
                        // sourceCard is the dealer
                        if (eventSourceCard !== this.card) {
                            return false;
                        }
                    }

                    // "When this character is dealt damage" - only trigger when THIS card takes damage
                    if ((triggeredAbility.event === GameEvent.CARD_DAMAGED || triggeredAbility.event === GameEvent.CHARACTER_DAMAGED) &&
                        rawText.match(/whenever (this character|he|she|they) is dealt damage/)) {
                        if (eventSourceCard !== this.card) {
                            return false;
                        }
                    }
                }

                // Check conditions
                return this.meetsConditions(context);
            },

            meetsConditions(context: EventContext): boolean {
                // If no conditions, always trigger
                if (!triggeredAbility.eventConditions || triggeredAbility.eventConditions.length === 0) {
                    return true;
                }

                // Check all conditions
                return triggeredAbility.eventConditions.every(condition => {
                    return evaluateCondition(condition, context, this.card);
                });
            }
        };

        if (!this.listeners.has(triggeredAbility.event)) {
            this.listeners.set(triggeredAbility.event, new Set());
        }
        this.listeners.get(triggeredAbility.event)!.add(listener);
    }

    /**
     * Unregister all abilities for a card (when it leaves play)
     */
    unregister(card: any): void {
        this.listeners.forEach(listeners => {
            const toRemove = Array.from(listeners).filter(l => l.card === card);
            toRemove.forEach(l => listeners.delete(l));
        });
    }

    /**
     * Emit an event - triggers all listening abilities
     * Returns abilities that should be added to the stack
     */
    emit(event: GameEvent, context: Partial<EventContext>): AbilityListener[] {
        const listeners = this.listeners.get(event) || new Set();
        console.error(`[DEBUG-EVENTBUS] emit(${event}): ${listeners.size} listeners for this event`);

        const fullContext: EventContext = {
            event,
            timestamp: Date.now(),
            ...context
        };

        const triggered: AbilityListener[] = [];

        for (const listener of listeners) {
            const should = listener.shouldTrigger(fullContext);
            console.error(`[DEBUG-EVENTBUS] Listener card=${listener.card?.name}, ability=${listener.ability?.rawText?.substring(0, 30)}..., shouldTrigger=${should}`);
            if (should) {
                triggered.push(listener);
            }
        }
        console.error(`[DEBUG-EVENTBUS] Returning ${triggered.length} triggered abilities`);
        return triggered;
    }

    /**
     * Get all registered listeners (for debugging)
     */
    getListeners(event?: GameEvent): AbilityListener[] {
        if (event) {
            return Array.from(this.listeners.get(event) || []);
        }

        const all: AbilityListener[] = [];
        this.listeners.forEach(listeners => {
            all.push(...Array.from(listeners));
        });
        return all;
    }
}

/**
 * Helper: Evaluate a condition
 */
function evaluateCondition(condition: any, context: EventContext, card: any): boolean {
    switch (condition.type) {
        case 'is_self':
            return context.card === card;
        case 'in_challenge':
            return context.inChallenge === true;
        default:
            return true;
    }
}
