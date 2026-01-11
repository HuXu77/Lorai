import { BaseFamilyHandler } from './base-family-handler';
import type { GameContext } from '../executor';

/**
 * Prevention Family Handler
 * Unified handler for all prevention/restriction mechanics
 * Optimization: Consolidates all "prevent_" effects to reduce code duplication
 */
export class PreventionFamilyHandler extends BaseFamilyHandler {
    private executor: any;

    constructor(executor: any) {
        super(executor.turnManager);
        this.executor = executor;
    }

    protected async resolveTargets(target: any, context: GameContext): Promise<any[]> {
        if (this.executor?.resolveTargets) {
            return this.executor.resolveTargets(target, context);
        }
        return super.resolveTargets(target, context);
    }
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

            // ====== RESTRICTIONS ======
            case 'restriction':
                {
                    const targets = await this.resolveTargets(effect.target, context);
                    const duration = effect.duration || 'turn';

                    targets.forEach((target: any) => {
                        const activeEffect: any = {
                            type: 'restriction',
                            restrictionType: effect.restriction,
                            targetCardIds: target.instanceId ? [target.instanceId] : undefined,
                            targetPlayerIds: target.instanceId ? undefined : [target.id],
                            duration,
                            sourceCardId: context.card?.instanceId,
                            sourcePlayerId: context.player.id,
                            params: effect.params
                        };
                        this.turnManager.addActiveEffect(activeEffect);
                    });

                    this.turnManager.logger.info(`[Prevention] 🚫 Applied restriction ${effect.restriction} to ${targets.length} targets`);
                }
                break;

            case 'cant_quest':
                {
                    const targets = await this.resolveTargets(effect.target, context);

                    targets.forEach((target: any) => {
                        if (!target.restrictions) {
                            target.restrictions = [];
                        }

                        target.restrictions.push({
                            type: 'cant_quest',
                            duration: effect.duration || 'until_end_of_turn',
                            sourceId: context.card?.instanceId
                        });

                        this.turnManager.logger.info(`[Prevention] 🚫 ${target.name} cannot quest`);
                    });
                }
                break;

            case 'cant_challenge':
                {
                    const targets = await this.resolveTargets(effect.target, context);
                    const duration = effect.duration || 'turn';

                    targets.forEach((target: any) => {
                        this.turnManager.addActiveEffect({
                            type: 'cant_challenge',
                            targetCardIds: [target.instanceId],
                            duration,
                            sourceCardId: context.card?.instanceId
                        });
                    });

                    this.turnManager.logger.info(`[Prevention] 🚫 Applied cant_challenge to ${targets.length} card(s)`);
                }
                break;

            case 'must_challenge':
                {
                    const targets = await this.resolveTargets(effect.target, context);

                    targets.forEach((target: any) => {
                        if (!target.restrictions) {
                            target.restrictions = [];
                        }

                        target.restrictions.push({
                            type: 'must_challenge',
                            duration: 'until_end_of_turn',
                            sourceId: context.card?.instanceId
                        });

                        this.turnManager.logger.info(`[Prevention] ⚔️ ${target.name} must challenge if able`);
                    });
                }
                break;

            case 'force_quest':
                {
                    const targets = await this.resolveTargets(effect.target, context);

                    targets.forEach((target: any) => {
                        if (!target.restrictions) {
                            target.restrictions = [];
                        }

                        target.restrictions.push({
                            type: 'force_quest',
                            duration: effect.duration || 'next_turn', // Default to next_turn for forced actions typically? Or just let effect dictate.
                            sourceId: context.card?.instanceId
                        });

                        this.turnManager.logger.info(`[Prevention] ⚔️ ${target.name} must quest if able`);
                    });
                }
                break;

            case 'unexertable':
                {
                    const targets = await this.resolveTargets(effect.target, context);

                    targets.forEach((target: any) => {
                        if (!target.keywords) {
                            target.keywords = [];
                        }

                        if (!target.keywords.includes('Unexertable')) {
                            target.keywords.push('Unexertable');
                        }

                        this.turnManager.logger.info(`[Prevention] 🛡️ ${target.name} gains Unexertable`);
                    });
                }
                break;

            case 'hexproof':
                {
                    const targets = await this.resolveTargets(effect.target, context);

                    targets.forEach((target: any) => {
                        if (!target.keywords) {
                            target.keywords = [];
                        }

                        if (!target.keywords.includes('Hexproof')) {
                            target.keywords.push('Hexproof');
                        }

                        this.turnManager.logger.info(`[Prevention] 🛡️ ${target.name} gains Hexproof`);
                    });
                }
                break;

            case 'prevent_damage_from_source':
                {
                    const card = context.card;
                    if (!card.damageShields) {
                        card.damageShields = [];
                    }

                    card.damageShields.push({
                        amount: 'all',
                        duration: 'until_end_of_turn',
                        usage: 'always',
                        sourceType: effect.source // e.g. 'challenge'
                    });

                    this.turnManager.logger.info(`[Prevention] 🛡️ ${card.name} prevents damage from ${effect.source}`);
                }
                break;

            case 'prevent_damage':
                {
                    const targets = await this.resolveTargets(effect.target, context);
                    targets.forEach((target: any) => {
                        if (!target.damageShields) {
                            target.damageShields = [];
                        }

                        target.damageShields.push({
                            amount: effect.amount || 1,
                            duration: effect.duration || 'until_end_of_turn',
                            usage: 'next_damage'
                        });

                        this.turnManager.logger.info(`[Prevention] 🛡️ ${target.name} prevents next ${effect.amount} damage`);
                    });
                }
                break;

            default:
                this.turnManager.logger.warn(`[Prevention] Unhandled prevention effect: ${effect.type}`);
                break;
        }
    }
}
