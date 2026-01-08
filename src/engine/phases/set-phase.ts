/**
 * Set Phase Handler
 * 
 * Executes the Set Phase of a player's turn:
 * - Emits TURN_START event
 * - Triggers "At the start of your turn" effects
 */

import { PlayerState } from '../state';
import { GameEvent } from '../abilities/events';
import type { TurnManager } from '../actions';

/**
 * Execute the Set Phase for a player
 * 
 * @param turnManager - The TurnManager instance
 * @param player - The player whose turn is starting
 */
export function executeSetPhase(turnManager: TurnManager, player: PlayerState): void {
    const logger = turnManager.logger;
    const abilitySystem = turnManager.abilitySystem;

    logger.debug(`[${player.name}] Set Phase.`);

    // Emit TURN_START event
    abilitySystem.emitEvent(GameEvent.TURN_START, {
        player,
        timestamp: Date.now()
    });

    // Check for "At the start of your turn" effects
    player.play.forEach(card => {
        if (card.parsedEffects) {
            card.parsedEffects.forEach((effect, index) => {
                if (effect.trigger === 'on_start_turn') {
                    logger.debug(`[${player.name}] Trigger available: ${card.name} (Index: ${index}) - ${effect.rawText}`);

                    // Check if optional
                    const isOptional = effect.params?.optional;

                    if (!isOptional) {
                        logger.action(player.name, 'Auto-triggering mandatory start of turn effect', card.name);
                        turnManager.resolveEffect(player, effect, card);
                    }
                    // If optional, we rely on the user (or test) to send a UseAbility action.
                }
            });
        }
    });
}
