/**
 * Banishment Handler
 * 
 * Handles card banishment logic including:
 * - Checking if cards should be banished (damage >= willpower)
 * - Moving cards to discard and resetting state
 * - Triggering on_banished and on_banish_other effects
 */

import { PlayerState } from '../state';
import { CardInstance, ZoneType } from '../models';
import { GameEvent } from '../abilities/events';
import type { TurnManager } from '../actions';

/**
 * Check if a card should be banished (damage >= willpower)
 * 
 * @param turnManager - The TurnManager instance
 * @param player - The player who owns the card
 * @param card - The card to check
 * @param banisher - Optional: The card that dealt damage (for triggers)
 */
export async function checkBanishment(
    turnManager: TurnManager,
    player: PlayerState,
    card: CardInstance,
    banisher?: CardInstance
): Promise<void> {
    if (card.damage >= (card.willpower ?? 0)) {
        // Emit CHALLENGE_BANISH if applicable
        if (banisher) {
            turnManager.abilitySystem.emitEvent(GameEvent.CHALLENGE_BANISH, {
                card: banisher,
                player: turnManager.game.getPlayer(banisher.ownerId),
                banishedCard: card
            });
        }

        await banishCard(turnManager, player, card, banisher);
    }
}

/**
 * Banish a card - move from play to discard and reset state
 * 
 * @param turnManager - The TurnManager instance
 * @param player - The player who owns the card
 * @param card - The card to banish
 * @param banisher - Optional: The card that caused banishment (for triggers)
 */
export async function banishCard(
    turnManager: TurnManager,
    player: PlayerState,
    card: CardInstance,
    banisher?: CardInstance
): Promise<void> {
    const logger = turnManager.logger;

    if (card.zone === ZoneType.Play) {
        player.play = player.play.filter(c => c.instanceId !== card.instanceId);
    } else {
        logger.warn(`[banishCard] Card ${card.name} not in Play (Zone: ${card.zone})`);
    }

    // Add to discard
    card.zone = ZoneType.Discard;
    card.ready = true;
    card.damage = 0;
    card.turnPlayed = 0;

    // Reset stats
    if (card.baseStrength !== undefined) card.strength = card.baseStrength;
    if (card.baseWillpower !== undefined) card.willpower = card.baseWillpower;
    if (card.baseLore !== undefined) card.lore = card.baseLore;

    player.discard.push(card);
    logger.effect(player.name, 'Banish', card.name, {
        card,
        type: 'banish',
        banisher: banisher
    });

    await triggerBanishEffects(turnManager, card, banisher);
}

/**
 * Trigger banishment-related effects
 * 
 * @param turnManager - The TurnManager instance
 * @param card - The card that was banished
 * @param banisher - Optional: The card that caused banishment
 */
export async function triggerBanishEffects(
    turnManager: TurnManager,
    card: CardInstance,
    banisher?: CardInstance
): Promise<void> {
    const logger = turnManager.logger;
    const game = turnManager.game;

    // CRITICAL FIX: Emit CARD_BANISHED event for EventBus-registered abilities
    // Abilities parsed with event: 'card_banished' (new format) won't see the legacy trigger check below
    await turnManager.abilitySystem.emitEvent(GameEvent.CARD_BANISHED, {
        event: GameEvent.CARD_BANISHED,
        card: card,
        sourceCard: card, // The banished card is both the card and source for "when THIS is banished"
        player: turnManager.game.getPlayer(card.ownerId),
        banisher: banisher,
        timestamp: Date.now()
    });

    // LEGACY: Trigger on_banished effects (for older parsed format)
    // This can be removed once all parsers use the event-based format
    if (card.parsedEffects) {
        for (const effect of card.parsedEffects) {
            if (effect.trigger === 'on_banished') {
                logger.debug(`[Trigger] Triggering on_banished effect for ${card.name} (legacy format)`);
                // Handle chained effects (delegation)
                if (effect.params?.chainedEffect) {
                    await turnManager.resolveEffect(game.getPlayer(card.ownerId), effect.params.chainedEffect, card);
                } else {
                    await turnManager.resolveEffect(game.getPlayer(card.ownerId), effect, card);
                }
            }
        }
    }

    // Trigger on_banish_other effects (Global)
    const allPlayers = Object.values(game.state.players);
    for (const p of allPlayers) {
        for (const c of p.play) {
            if (c.parsedEffects) {
                for (const effect of c.parsedEffects) {
                    // Check for "Whenever this character banishes another character" (Active)
                    if (effect.trigger === 'on_banish_other_active') {
                        // Enforce "During your turn"
                        if (game.state.turnPlayerId !== p.id) {
                            continue;
                        }
                        if (banisher && c.instanceId === banisher.instanceId) {
                            logger.debug(`[${p.name}] Triggering on_banish_other_active for ${c.name}`);
                            await turnManager.resolveEffect(game.getPlayer(p.id), effect, c, card); // card is the banished card (target)
                        }
                    }
                }
            }
        }
    }
}
