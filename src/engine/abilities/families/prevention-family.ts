import { BaseFamilyHandler } from './base-family-handler';
import type { GameContext } from '../executor';

/**
 * Prevention Family Handler
 * Unified handler for all prevention/restriction mechanics
 * Optimization: Consolidates all "prevent_" effects to reduce code duplication
 */
export class PreventionFamilyHandler extends BaseFamilyHandler {
    async execute(effect: any, context: GameContext): Promise<void> {
        const player = context.player;
        const card = context.card;
        if (!player || !card) return;

        switch (effect.type) {
            case 'prevent_ability_use':
                // Prevent specific abilities from being used
                this.registerPassiveEffect({
                    type: 'prevent_ability_use',
                    abilityType: effect.abilityType,
                    target: effect.target,
                    sourceCardId: card.instanceId
                }, context);

                this.turnManager.logger.info(`[Prevention] 🚫 Preventing ability use: ${effect.abilityType || 'all'}`);
                break;

            case 'prevent_discard':
                // Prevent target from being discarded
                const preventDiscardTargets = await this.resolveTargets(effect.target, context);

                this.registerPassiveEffect({
                    type: 'prevent_discard',
                    targetIds: preventDiscardTargets.map((t: any) => t.instanceId),
                    sourceCardId: card.instanceId
                }, context);

                this.turnManager.logger.info(`[Prevention] 🛡️ Preventing discard for ${preventDiscardTargets.length} card(s)`);
                break;

            case 'prevent_discard_effects':
                // Prevent all discard effects
                this.registerPassiveEffect({
                    type: 'prevent_discard_effects',
                    sourceCardId: card.instanceId
                }, context);

                this.turnManager.logger.info(`[Prevention] 🛡️ Preventing all discard effects`);
                break;

            case 'prevent_lore_at_location':
                // Prevent lore gain at specific location
                this.registerPassiveEffect({
                    type: 'prevent_lore_at_location',
                    location: effect.location,
                    sourceCardId: card.instanceId
                }, context);

                this.turnManager.logger.info(`[Prevention] 🚫 Preventing lore at location: ${effect.location || 'any'}`);
                break;

            case 'prevent_play':
                // Prevent playing specific cards
                this.registerPassiveEffect({
                    type: 'prevent_play',
                    filter: effect.filter,
                    target: effect.target,
                    sourceCardId: card.instanceId
                }, context);

                this.turnManager.logger.info(`[Prevention] 🚫 Preventing play (filter applied)`);
                break;

            case 'prevent_selection':
                // Prevent target from being selected/targeted
                const preventSelectionTargets = await this.resolveTargets(effect.target, context);

                this.registerPassiveEffect({
                    type: 'prevent_selection',
                    targetIds: preventSelectionTargets.map((t: any) => t.instanceId),
                    sourceCardId: card.instanceId
                }, context);

                this.turnManager.logger.info(`[Prevention] 🛡️ Preventing selection for ${preventSelectionTargets.length} card(s)`);
                break;

            // Play-triggered effects
            case 'play_trigger_draw_opponent':
            case 'play_trigger_opponent_draws':
                // When this is played, opponent draws cards
                const drawAmount = effect.amount || 1;

                // Get opponent
                const opponents = this.turnManager.game.getOpponents?.(player.id) || [];
                if (opponents.length > 0) {
                    const opponent = opponents[0];

                    // Draw cards
                    for (let i = 0; i < drawAmount && opponent.deck.length > 0; i++) {
                        const drawnCard = opponent.deck.pop();
                        if (drawnCard) {
                            drawnCard.zone = 'hand';
                            opponent.hand.push(drawnCard);
                        }
                    }

                    this.turnManager.logger.info(`[Prevention] 📤 Play trigger: Opponent drew ${drawAmount} card(s)`);
                }
                break;

            case 'play_action_trigger_buff':
                // When an action is played, buff targets
                const buffTargets = await this.resolveTargets(effect.target, context);

                buffTargets.forEach((target: any) => {
                    if (effect.strength) target.strength += effect.strength;
                    if (effect.willpower) target.willpower += effect.willpower;
                });

                this.turnManager.logger.info(`[Prevention] ⚡ Action play trigger: Buffed ${buffTargets.length} target(s)`, {
                    strength: effect.strength,
                    willpower: effect.willpower
                });
                break;

            default:
                this.turnManager.logger.warn(`[Prevention] Unhandled prevention effect: ${effect.type}`);
                break;
        }
    }
}
