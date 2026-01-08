import { BaseFamilyHandler } from './base-family-handler';
import type { GameContext } from '../executor';

/**
 * Static Effect Family Handler
 * Handles conditional stat buffs and passive abilities that continuously evaluate game state
 */
export class StaticEffectFamilyHandler extends BaseFamilyHandler {
    async execute(effect: any, context: GameContext): Promise<void> {
        const player = context.player;
        const card = context.card;
        if (!player || !card) return;

        switch (effect.type) {
            case 'conditional_buff_subtype_in_play':
                // +X/+Y while you have a [Subtype] in play
                this.registerPassiveEffect({
                    type: 'conditional_buff_subtype_in_play',
                    subtype: effect.subtype,
                    strength: effect.strength || 0,
                    willpower: effect.willpower || 0,
                    sourceCardId: card.instanceId,
                    targetCardId: card.instanceId // Buffs self
                }, context);

                this.turnManager.logger.info(`[StaticEffect] 💪 Registered conditional buff while ${effect.subtype} in play`, {
                    subtype: effect.subtype,
                    strength: effect.strength,
                    willpower: effect.willpower
                });
                break;

            case 'conditional_multi_buff_subtype_count':
                // +X/+Y per [Subtype] in play
                this.registerPassiveEffect({
                    type: 'conditional_multi_buff_subtype_count',
                    subtype: effect.subtype,
                    strengthPerCount: effect.strengthPerCount || 0,
                    willpowerPerCount: effect.willpowerPerCount || 0,
                    sourceCardId: card.instanceId,
                    targetCardId: card.instanceId
                }, context);

                this.turnManager.logger.info(`[StaticEffect] 💪 Registered scaling buff per ${effect.subtype}`, {
                    subtype: effect.subtype
                });
                break;

            case 'conditional_stat_buff_while_item_in_discard':
                // +X/+Y while you have an Item in your discard
                this.registerPassiveEffect({
                    type: 'conditional_stat_buff_while_item_in_discard',
                    strength: effect.strength || 0,
                    willpower: effect.willpower || 0,
                    sourceCardId: card.instanceId,
                    targetCardId: card.instanceId
                }, context);

                this.turnManager.logger.info(`[StaticEffect] 💪 Registered conditional buff while Item in discard`);
                break;

            case 'conditional_gain_keyword_while_damaged':
                // Gain [Keyword] while damaged
                this.registerPassiveEffect({
                    type: 'conditional_gain_keyword_while_damaged',
                    keyword: effect.keyword,
                    sourceCardId: card.instanceId,
                    targetCardId: card.instanceId
                }, context);

                this.turnManager.logger.info(`[StaticEffect] ⚡ Registered conditional keyword: ${effect.keyword} while damaged`);
                break;

            case 'conditional_resist_no_damage':
                // Resist while undamaged
                this.registerPassiveEffect({
                    type: 'conditional_resist_no_damage',
                    sourceCardId: card.instanceId,
                    targetCardId: card.instanceId
                }, context);

                this.turnManager.logger.info(`[StaticEffect] 🛡️ Registered Resist while undamaged`);
                break;

            case 'stat_buff_per_damage':
                // +X strength/willpower per damage on this
                this.registerPassiveEffect({
                    type: 'stat_buff_per_damage',
                    strengthPerDamage: effect.strengthPerDamage || 0,
                    willpowerPerDamage: effect.willpowerPerDamage || 0,
                    sourceCardId: card.instanceId,
                    targetCardId: card.instanceId
                }, context);

                this.turnManager.logger.info(`[StaticEffect] 💥 Registered damage-scaling buff`, {
                    strengthPerDamage: effect.strengthPerDamage,
                    willpowerPerDamage: effect.willpowerPerDamage
                });
                break;

            case 'while_exerted_buff_others':
                // While exerted, other characters get +X/+Y
                const targets = await this.resolveTargets(effect.target, context);

                this.registerPassiveEffect({
                    type: 'while_exerted_buff_others',
                    target: effect.target,
                    strength: effect.strength || 0,
                    willpower: effect.willpower || 0,
                    sourceCardId: card.instanceId
                }, context);

                this.turnManager.logger.info(`[StaticEffect] 🌟 Registered exert-conditional buff for others`, {
                    strength: effect.strength,
                    willpower: effect.willpower
                });
                break;

            case 'singing_power_buff':
                // +X to singing cost
                this.registerPassiveEffect({
                    type: 'singing_power_buff',
                    amount: effect.amount,
                    sourceCardId: card.instanceId,
                    targetCardId: card.instanceId
                }, context);

                this.turnManager.logger.info(`[StaticEffect] 🎵 Registered singing power buff: +${effect.amount}`);
                break;

            default:
                this.turnManager.logger.warn(`[StaticEffect] Unhandled static effect: ${effect.type}`);
                break;
        }
    }
}
