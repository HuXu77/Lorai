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
            card.parsedEffects.forEach(effect => {
                if (effect.action === 'cant_ready_if_hand_size') {
                    const threshold = typeof effect.amount === 'number' ? effect.amount : parseInt(effect.amount as string || '0');
                    if (player.hand.length >= threshold) {
                        canReady = false;
                        logger.debug(`[${player.name}] ${card.name} cannot ready (Hand size ${player.hand.length} >= ${threshold}).`);
                    }
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
