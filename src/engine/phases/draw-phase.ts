/**
 * Draw Phase Handler
 * 
 * Executes the Draw Phase of a player's turn:
 * - Skips draw on first turn for starting player
 * - Draws one card from deck
 * - Handles deck-out loss condition
 */

import { executeRecalculateEffects } from '../effects';
import { PlayerState } from '../state';
import { ZoneType } from '../models';
import { GameEvent } from '../abilities/events';
import type { TurnManager } from '../actions';

/**
 * Execute the Draw Phase for a player
 * 
 * @param turnManager - The TurnManager instance
 * @param player - The player whose turn is starting
 */
export function executeDrawPhase(turnManager: TurnManager, player: PlayerState): void {
    const logger = turnManager.logger;
    const game = turnManager.game;

    // First turn: starting player skips draw
    if (game.state.turnCount === 1 && player.id === game.state.turnPlayerId) {
        logger.info(`[${player.name}] Skips draw (First Turn Rule).`);
        return;
    }

    if (player.deck.length > 0) {
        const card = player.deck.pop();
        if (card) {
            card.zone = ZoneType.Hand;
            player.hand.push(card);
            logger.action(player.name, 'Drew a card');

            // Emit CARD_DRAWN event (fire-and-forget to preserve sync behavior)
            turnManager.abilitySystem.emitEvent(GameEvent.CARD_DRAWN, {
                event: GameEvent.CARD_DRAWN,
                card: card,
                sourceCard: card,
                player: player,
                timestamp: Date.now()
            }).catch(e => logger.error('Error emitting CARD_DRAWN', e));
        }
    } else {
        logger.info(`[${player.name}] Deck empty! Cannot draw.`);
        const opponentId = Object.keys(game.state.players).find(id => id !== player.id);
        if (opponentId) {
            game.state.winnerId = opponentId;
            logger.info(`[${game.getPlayer(opponentId).name}] WINS THE GAME!`);
        }
    }
}

/**
 * Draw specific number of cards for a player
 * Generic helper for effects (like "Draw 2 cards")
 * 
 * @param turnManager - The TurnManager instance
 * @param playerId - ID of the player drawing cards
 * @param amount - Number of cards to draw
 */
export async function drawCards(turnManager: TurnManager, playerId: string, amount: number): Promise<void> {
    const game = turnManager.game;
    const logger = turnManager.logger;
    const player = game.getPlayer(playerId);
    let drawn = 0;

    for (let i = 0; i < amount; i++) {
        if (player.deck.length > 0) {
            const card = player.deck.pop();
            if (card) {
                card.zone = ZoneType.Hand;
                player.hand.push(card);
                drawn++;

                // Emit CARD_DRAWN event (await to ensure triggers process before returning)
                await turnManager.abilitySystem.emitEvent(GameEvent.CARD_DRAWN, {
                    event: GameEvent.CARD_DRAWN,
                    card: card,
                    sourceCard: card,
                    player: player,
                    timestamp: Date.now()
                });
            }
        }
    }

    if (drawn > 0) {
        logger.action(player.name, `Drew ${drawn} card(s) (Effect)`);

        // Recalculate effects (e.g. Royal Guard trigger "When you draw a card")
        // Trigger was emitted inside loop, which adds active effects.
        // We must recalculate to apply them (e.g. update Challenger stat).
        executeRecalculateEffects(turnManager);
    } else {
        logger.info(`[${player.name}] Could not draw cards (Deck empty)`);
    }
}
