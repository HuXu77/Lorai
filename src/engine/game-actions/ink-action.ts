/**
 * Ink Action Handler
 * 
 * Moves a card from hand to inkwell, providing resources for playing cards.
 * Players may ink one card per turn.
 */

import { PlayerState } from '../state';
import { ZoneType } from '../models';
import { GameEvent } from '../abilities/events';
import type { TurnManager } from '../actions';

/**
 * Execute ink action - move a card from hand to inkwell
 * 
 * @param turnManager - The TurnManager instance
 * @param player - The player inking the card
 * @param cardId - Instance ID of the card to ink
 * @returns True if successfully inked, false if already inked this turn or card not found
 */
export function executeInkCard(turnManager: TurnManager, player: PlayerState, cardId: string): boolean {
    const logger = turnManager.logger;

    if (player.inkedThisTurn) {
        logger.debug('Already inked this turn.');
        return false;
    }

    const cardIndex = player.hand.findIndex(c => c.instanceId === cardId);
    if (cardIndex === -1) return false;

    const card = player.hand[cardIndex];
    if (!card.inkwell) {
        logger.debug('Card is not inkable');
        return false;
    }

    // Move to Inkwell
    player.hand.splice(cardIndex, 1);
    card.zone = ZoneType.Inkwell;
    card.ready = true; // Enters ready - Rules say "facedown and ready" (4.3.3.2)
    player.inkwell.push(card);

    player.inkedThisTurn = true;

    logger.action(player.name, 'Inked card', card.name);

    // Emit CARD_INKED event (fire-and-forget to preserve sync behavior)
    turnManager.abilitySystem.emitEvent(GameEvent.CARD_INKED, {
        event: GameEvent.CARD_INKED,
        card: card,
        sourceCard: card,
        player: player,
        timestamp: Date.now()
    }).catch(e => logger.error('Error emitting CARD_INKED', e));

    return true;
}

