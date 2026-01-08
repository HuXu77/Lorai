import { BaseFamilyHandler } from './base-family-handler';
import type { GameContext } from '../executor';

/**
 * Cost Family Handler
 * Handles 7 cost modification effect types:
 * - cost_reduction
 * - ability_cost_reduction
 * - singing_cost_modifier
 * - shift_cost_reduction_subtype
 * - reduce_shift_cost_subtype
 * - move_cost_reduction
 * - increase_play_cost
 */
export class CostFamilyHandler extends BaseFamilyHandler {
    async execute(effect: any, context: GameContext): Promise<void> {
        const player = context.player;
        const amount = effect.amount || 1;
        const filter = effect.filter;
        const duration = effect.duration || 'permanent';

        // Specific handling for cost_reduction to match TurnManager usage
        if (effect.type === 'cost_reduction' || effect.type === 'ability_cost_reduction') {
            if (!player.costReductions) {
                player.costReductions = [];
            }
            player.costReductions.push({
                amount,
                filter,
                duration,
                source: context.abilityName || 'Effect'
            });
            this.turnManager.logger.info(`[CostFamily] Added cost reduction for ${player.name}: -${amount} (Duration: ${duration})`);
            return;
        }

        // Sing cost: Allow characters with cost >= minCost to sing this song for free
        if (effect.type === 'sing_cost') {
            // This is a static property of the song card itself
            // The actual singing logic in playCard() will check this
            // We just need to make sure it's registered as a valid effect
            this.turnManager.logger.info(`[CostFamily] 🎵 Song can be sung for free by characters with cost ${effect.minCost}+`, {
                effectType: 'sing_cost',
                minCost: effect.minCost
            });
            return; // No active effect needed, just informational
        }

        // Register other cost modifications as passive effect
        this.registerPassiveEffect({
            type: effect.type,
            amount,
            filter,
            duration,
            sourceCardId: context.card?.instanceId
        }, context);

        this.turnManager.logger.info(`[CostFamily] 💰 ${player.name} cost modification (${effect.type})`, {
            effectType: effect.type,
            amount,
            filter,
            duration
        });
    }
}
