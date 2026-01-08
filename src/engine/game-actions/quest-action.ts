/**
 * Quest Action Handler
 * 
 * Handles the quest action for characters:
 * - Validates readiness, drying status, and restrictions
 * - Calculates lore (including conditional bonuses)
 * - Handles Support keyword
 * - Triggers on_quest effects
 * - Checks win condition
 */

import { PlayerState } from '../state';
import { CardInstance, ChoiceRequest, ChoiceType } from '../models';
import { GameEvent } from '../abilities/events';
import type { TurnManager } from '../actions';

/**
 * Execute quest action with a character
 * 
 * @param turnManager - The TurnManager instance
 * @param player - The player questing
 * @param cardId - Instance ID of the character to quest with
 * @param payload - Optional: Additional data for on_quest effects
 * @returns True if quest was successful
 */
export async function executeQuest(
    turnManager: TurnManager,
    player: PlayerState,
    cardId: string,
    payload?: any
): Promise<boolean> {
    const logger = turnManager.logger;
    const game = turnManager.game;
    const abilitySystem = turnManager.abilitySystem;

    const card = player.play.find(c => c.instanceId === cardId);
    if (!card) return false;

    // Rule: Character must be ready
    if (!card.ready) {
        logger.debug(`${card.name} is exerted and cannot quest.`);
        return false;
    }

    // Rule: Character cannot be Reckless
    if (card.meta?.hasReckless || card.keywords?.includes('Reckless')) {
        logger.debug(`${card.name} is Reckless and cannot quest.`);
        return false;
    }

    // Rule: Check for "Can't Quest" restrictions
    const cantQuest = game.state.activeEffects.some(e =>
        e.restrictionType === 'cant_quest' &&
        e.targetCardIds?.includes(card.instanceId)
    );

    if (cantQuest) {
        logger.debug(`${card.name} cannot quest due to an effect.`);
        return false;
    }

    // Rule: Character must be dry (played in a previous turn)
    if (card.turnPlayed === game.state.turnCount) {
        logger.debug(`${card.name} is drying and cannot quest.`);
        return false;
    }

    // Exert
    card.ready = false;

    // Emit CARD_EXERTED event (fire-and-forget)
    abilitySystem.emitEvent(GameEvent.CARD_EXERTED, {
        event: GameEvent.CARD_EXERTED,
        card: card,
        sourceCard: card,
        player: player,
        reason: 'quest',
        timestamp: Date.now()
    }).catch(e => logger.error('Error emitting CARD_EXERTED', e));

    // CRITICAL: Emit quest event for "whenever this character quests" abilities
    await abilitySystem.emitEvent(GameEvent.CARD_QUESTED, {
        event: GameEvent.CARD_QUESTED,
        player: player,
        sourceCard: card,
        timestamp: Date.now()
    });

    // Calculate Lore (including conditionals)
    const totalLore = abilitySystem ? abilitySystem.getModifiedStat(card, 'lore') : (card.lore || 0);
    const baseLore = card.lore || 0;
    const conditionalLore = totalLore - baseLore;

    player.lore += totalLore;

    // Emit LORE_GAINED event for triggered abilities
    if (totalLore > 0) {
        await abilitySystem.emitEvent(GameEvent.LORE_GAINED, {
            event: GameEvent.LORE_GAINED,
            card: card,
            sourceCard: card,
            player: player,
            amount: totalLore,
            timestamp: Date.now()
        });
    }

    if (conditionalLore > 0) {
        logger.action(player.name, `Quested with ${card.name}`, `Lore: ${totalLore} (Base: ${baseLore}, Bonus: ${conditionalLore}). Total: ${player.lore}`);
    } else {
        logger.action(player.name, `Quested with ${card.name}`, `Lore: ${totalLore}. Total: ${player.lore}`);
    }

    // Handle Support
    if (card.parsedEffects) {
        for (const effect of card.parsedEffects) {
            const effectAny = effect as any;
            const isSupport = effect.action === 'keyword_support' ||
                effectAny.keyword === 'support' ||
                (effectAny.type === 'static' && effectAny.effects?.some((e: any) => e.type === 'support'));

            if (isSupport) {
                await handleSupport(turnManager, player, card, cardId);
            }
            // Handle on_quest triggers (e.g., Lady Tremaine)
            else if (effect.trigger === 'on_quest') {
                // Check if conditional
                const condition = effect.params?.condition;
                if (condition) {
                    // Check: card placed under this character this turn
                    if (condition.type === 'card_placed_under_this_turn') {
                        const wasBoostedThisTurn = game.state.turnHistory?.cardsPlacedUnder?.some(
                            cpu => cpu.characterId === card.instanceId
                        );

                        if (!wasBoostedThisTurn) {
                            logger.debug(`[Conditional Quest] ${card.name}: No card placed under this turn, skipping.`);
                            continue;
                        }

                        logger.debug(`[Conditional Quest] ${card.name}: Card was placed under this turn, triggering effect.`);
                    }
                }

                // Resolve the effect (will handle payload for card selection)
                await turnManager.resolveEffect(player, effect, card, undefined, payload);
            }
        }
    }

    turnManager.checkWinCondition(player);

    return true;
}

/**
 * Handle Support keyword during quest
 */
async function handleSupport(
    turnManager: TurnManager,
    player: PlayerState,
    card: CardInstance,
    cardId: string
): Promise<void> {
    const logger = turnManager.logger;

    // Get valid support targets (other characters in play)
    const supportTargets = player.play.filter(c => c.instanceId !== cardId && c.type === 'Character');

    if (supportTargets.length === 0) {
        logger.debug(`[Support] No valid targets for ${card.name}`);
        return;
    }

    // Try to get player choice if available
    if (turnManager.requestChoice) {
        const supportRequest: ChoiceRequest = {
            id: `support_${card.instanceId}_${Date.now()}`,
            type: ChoiceType.TARGET_CHARACTER,
            playerId: player.id,
            prompt: `Choose a character for ${card.name} to support (add ${card.strength || 0} strength)`,
            options: supportTargets.map(t => ({
                id: t.instanceId,
                display: `${t.name} (${t.strength || 0} STR)`,
                valid: true,
                card: t
            })),
            optional: false,
            source: {
                card: card,
                abilityName: 'Support',
                player: player as any
            },
            timestamp: Date.now()
        };

        try {
            const response = await turnManager.requestChoice(supportRequest);
            const targetId = response.selectedIds?.[0];
            const target = player.play.find(c => c.instanceId === targetId);

            if (target) {
                applySupport(turnManager, player, card, target);
                return; // Successfully applied via choice
            }
        } catch (e) {
            logger.debug(`[Support] Choice request failed, using fallback`);
        }
    }

    // Fallback: Auto-select first target (for bot/tests or when choice fails)
    const target = supportTargets[0];
    applySupport(turnManager, player, card, target);
}
/**
 * Apply Support effect to a target
 */
function applySupport(
    turnManager: TurnManager,
    player: PlayerState,
    card: CardInstance,
    target: CardInstance
): void {
    const logger = turnManager.logger;

    target.strength = (target.strength || 0) + (card.strength || 0);
    // Add temporary effect to revert strength at end of turn
    if (!target.meta) target.meta = {};
    if (!target.meta.temporaryStrength) target.meta.temporaryStrength = 0;
    target.meta.temporaryStrength += (card.strength || 0);

    logger.effect(card.name, `Support: Added ${card.strength} strength to ${target.name}`);

    // Trigger "on_chosen_for_support" effects
    player.play.forEach(c => {
        if (c.parsedEffects) {
            c.parsedEffects.forEach(e => {
                if (e.trigger === 'on_chosen_for_support') {
                    turnManager.resolveEffect(player, e, c, target);
                }
            });
        }
    });
}
