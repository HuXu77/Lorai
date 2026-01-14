/**
 * Ready Phase Handler
 * 
 * Executes the Ready Phase of a player's turn:
 * - Resets ability usage tracking
 * - Readies all cards in play and inkwell (unless prevented)
 * - Emits CARD_READIED events
 */

import { PlayerState } from '../state';
import { GameEvent } from '../abilities/events';
import type { TurnManager } from '../actions';

/**
 * Execute the Ready Phase for a player
 * 
 * @param turnManager - The TurnManager instance
 * @param player - The player whose turn is starting
 */
export function executeReadyPhase(turnManager: TurnManager, player: PlayerState): void {
    const logger = turnManager.logger;
    const abilitySystem = turnManager.abilitySystem;

    // Reset ability usage tracking for new turn
    player.play.forEach(card => {
        if (card.meta?.usedAbilities) {
            card.meta.usedAbilities = {};
        }
    });

    // Ready all cards in Play and Inkwell
    [...player.play, ...player.inkwell].forEach(card => {
        // Check for "can't ready" effects
        let canReady = true;
        if (card.parsedEffects) {
            // Debug logging for troubleshooting
            if (card.name.includes("Demona")) {
                logger.debug(`Checking effects for ${card.name}. Effects: ${JSON.stringify(card.parsedEffects)}`);
            }

            // Fix: parseEffects is an array of AbilityDefinitions, each containing an 'effects' array
            card.parsedEffects.forEach((ability: any) => {
                if (ability.effects) {
                    ability.effects.forEach((effect: any) => {
                        // Check for "can't ready" restriction
                        const isCantReady = effect.type === 'restriction' && effect.restriction === 'cant_ready';
                        const isConditionalCantReady = effect.type === 'conditional_cant_ready'; // Legacy/Specific parser output
                        const isLegacyAction = effect.action === 'cant_ready_if_hand_size';

                        if (isCantReady || isConditionalCantReady || isLegacyAction) {
                            // Check for Condition: Hand Size
                            if (effect.condition && effect.condition.type === 'hand_size') {
                                let threshold = 0;
                                if (effect.condition.min !== undefined) {
                                    threshold = effect.condition.min;
                                } else if (effect.condition.amount !== undefined) {
                                    threshold = effect.condition.amount; // Handle both schemas
                                }

                                if (player.hand.length >= threshold) {
                                    canReady = false;
                                    logger.debug(`[${player.name}] ${card.name} cannot ready (Hand size ${player.hand.length} >= ${threshold}).`);
                                }
                            }
                            // Check for direct amount (Legacy)
                            else if (effect.amount && isLegacyAction) {
                                const threshold = typeof effect.amount === 'number' ? effect.amount : parseInt(effect.amount);
                                if (player.hand.length >= threshold) {
                                    canReady = false;
                                    logger.debug(`[${player.name}] ${card.name} cannot ready (Hand size ${player.hand.length} >= ${threshold}).`);
                                }
                            }
                            // Unconditional 'cant_ready' (if reached here without condition logic filtering it out)
                            else if (isCantReady && !effect.condition && (!effect.duration || effect.duration === 'permanent')) {
                                // If it really checks "cant ready at start of turn" it might be here
                                // But usually those are handled by active effects.
                                // If this is a static ability on the card that says "This character can't ready", it applies.
                                if (effect.timing === 'turn_start' || !effect.timing) {
                                    canReady = false;
                                    logger.debug(`[${player.name}] ${card.name} cannot ready (Unconditional).`);
                                }
                            }
                        }
                    });
                }
            });
        }

        if (canReady) {
            card.ready = true;

            // Emit CARD_READIED event
            abilitySystem.emitEvent(GameEvent.CARD_READIED, {
                card: card,
                player: player,
                timestamp: Date.now(),
                source: 'ready_phase'
            });
        }
    });
    logger.debug(`[${player.name}] Ready Phase: Cards readied.`);
}
