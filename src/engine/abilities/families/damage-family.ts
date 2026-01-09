import { BaseFamilyHandler } from './base-family-handler';
import type { GameContext } from '../executor';
import { ChoiceType } from '../../models';

/**
 * Damage Family Handler
 * Handles 13 damage-related effect types:
 * - damage_equal_to_count
 * - remove_all_damage
 * - damage_reflection
 * - redirect_damage
 * - prevent_damage
 * - prevent_damage_removal
 * - prevent_damage_high_strength
 * - multi_target_damage
 * - damage_on_any_play
 * - damage_on_character_play
 * - deal_damage_each_exerted
 * - play_trigger_damage_self
 * - location_damage_all_characters
 */
export class DamageFamilyHandler extends BaseFamilyHandler {
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
    private evaluateCountExpression(expr: any, context: any): number {
        if (!expr || typeof expr !== 'object') {
            return 0;
        }

        // Handle different count expression types
        if (expr.count) {
            const countType = expr.count;
            const gameState = this.turnManager?.game;

            if (!gameState) {
                return 0;
            }

            // Semantic count types (e.g., "damaged_opponent_characters")
            switch (countType) {
                case 'damaged_opponent_characters': {
                    const opponent = this.getOpponent(context.player.id);
                    if (!opponent) return 0;
                    return opponent.play.filter((c: any) => (c.damage || 0) > 0).length;
                }

                case 'opponent_characters': {
                    const opponent = this.getOpponent(context.player.id);
                    if (!opponent) return 0;
                    return opponent.play.length;
                }

                case 'your_characters': {
                    return context.player?.play?.filter((c: any) => c.type === 'Character').length || 0;
                }

                case 'damaged_characters': {
                    const allPlayers = Object.values(gameState.state.players);
                    let count = 0;
                    for (const player of allPlayers) {
                        count += (player as any).play.filter((c: any) => (c.damage || 0) > 0).length;
                    }
                    return count;
                }

                default:
                    this.turnManager?.logger.warn(`[DamageFamily] Unknown count type: ${countType}`);
                    return 0;
            }
        }

        // Handle zone-based counts
        if (expr.zone && expr.controller) {
            const player = expr.controller === 'self' ? context.player : this.getOpponent(context.player.id);
            if (!player) return 0;

            const zone = player[expr.zone];
            if (!zone || !Array.isArray(zone)) return 0;

            // Apply filters if present
            if (expr.filter) {
                return zone.filter((card: any) => this.matchesFilter(card, expr.filter)).length;
            }

            return zone.length;
        }

        // Fallback: return 0 for unrecognized expressions
        this.turnManager?.logger.warn('[DamageFamily] Could not evaluate count expression:', expr);
        return 0;
    }

    private matchesFilter(card: any, filter: any): boolean {
        // Simple filter matching - can be expanded
        if (filter.type && card.type !== filter.type) {
            return false;
        }

        if (filter.damaged !== undefined) {
            const isDamaged = (card.damage || 0) > 0;
            if (filter.damaged !== isDamaged) {
                return false;
            }
        }

        if (filter.classifications && filter.classifications.length > 0) {
            if (!card.classifications || !card.classifications.some((c: string) => filter.classifications.includes(c))) {
                return false;
            }
        }

        return true;
    }

    // Removed duplicate getOpponent - using inherited method from BaseFamilyHandler

    async execute(effect: any, context: GameContext): Promise<void> {
        const player = context.player;

        switch (effect.type) {
            case 'damage_equal_to_count':
                // Deal damage based on count expression
                const targets = await this.resolveTargets(effect.target, context);
                const count = this.evaluateCountExpression(effect.count, context);

                targets.forEach((target: any) => {
                    if (target.willpower !== undefined) {
                        target.damage = (target.damage || 0) + count;
                    }
                });

                this.turnManager.logger.effect(context.player.name, 'Damage', `Dealt ${count} damage to items`, {
                    type: 'damage_equal_to_count',
                    count,
                    targets: targets.map((t: any) => t.name)
                });
                break;

            case 'heal_and_draw':
                const healAndDrawTargets = await this.resolveTargets(effect.target, context);
                if (healAndDrawTargets.length === 0) return;

                const target = healAndDrawTargets[0]; // Assuming single target for now
                const currentDamage = target.damage || 0;
                const maxHeal = Math.min(currentDamage, effect.amount || 0);

                let amountToHeal = maxHeal;

                // Prompt user for specific amount if there is damage to heal
                if (maxHeal > 0 && this.turnManager.requestChoice) {
                    const options = [];
                    for (let i = 0; i <= maxHeal; i++) {
                        options.push({ id: i.toString(), display: i.toString(), valid: true });
                    }

                    const choice = await this.turnManager.requestChoice({
                        id: `choice_heal_${Date.now()}`,
                        type: ChoiceType.MODAL_CHOICE,
                        playerId: context.player.id,
                        prompt: `Choose damage to remove from ${target.name}`,
                        options: options,
                        min: 1,
                        max: 1,
                        timestamp: Date.now(),
                        source: {
                            card: context.card,
                            player: context.player,
                            abilityText: context.abilityText || effect.type
                        }
                    });

                    if (choice && choice.selectedIds && choice.selectedIds.length > 0) {
                        amountToHeal = parseInt(choice.selectedIds[0]);
                    }
                } else {
                    amountToHeal = 0; // No damage to heal
                }

                if (amountToHeal > 0) {
                    target.damage = (target.damage || 0) - amountToHeal;

                    this.turnManager.logger.effect(context.player.name, 'Heal', `Removed ${amountToHeal} damage from ${target.name}`, {
                        type: 'heal',
                        amount: amountToHeal,
                        target: target
                    });

                    // Draw cards equal to damage removed
                    if (this.turnManager.drawCards) {
                        await this.turnManager.drawCards(context.player.id, amountToHeal);
                    }
                }
                break;

            case 'remove_all_damage':
                // Heal all damage from targets
                const healTargets = await this.resolveTargets(effect.target, context);
                let totalRemoved = 0;

                healTargets.forEach((target: any) => {
                    if (target.damage && target.damage > 0) {
                        totalRemoved += target.damage;
                        target.damage = 0;
                    }
                });

                this.turnManager.logger.info(`[DamageFamily] 🏥 Removed ${totalRemoved} total damage`, {
                    effectType: 'remove_all_damage',
                    totalRemoved,
                    targets: healTargets.map((t: any) => t.name)
                });
                break;

            case 'multi_target_damage':
                // Deal same damage to multiple targets
                const multiTargets = effect.targets?.map((t: any) =>
                    this.resolveTargets(t, context)
                ).flat() || [];
                const damageAmount = effect.damage || 1;

                multiTargets.forEach((target: any) => {
                    if (target.willpower !== undefined) {
                        target.damage = (target.damage || 0) + damageAmount;
                    }
                });

                this.turnManager.logger.info(`[DamageFamily] 💥 Dealt ${damageAmount} damage to ${multiTargets.length} targets`, {
                    effectType: 'multi_target_damage',
                    damage: damageAmount,
                    targetCount: multiTargets.length
                });
                break;

            case 'play_trigger_damage_self':
                // Deal damage to self when played
                if (context.card) {
                    const selfDamage = effect.amount || 1;
                    context.card.damage = (context.card.damage || 0) + selfDamage;

                    this.turnManager.logger.info(`[DamageFamily] 💥 Self-damage on play`, {
                        effectType: 'play_trigger_damage_self',
                        damage: selfDamage,
                        card: context.card.name
                    });
                }
                break;

            case 'deal_damage_each_exerted':
                // Deal damage equal to number of exerted characters
                const exertedCount = player.play.filter((c: any) =>
                    c.type === 'Character' && !c.ready
                ).length;

                const exertedTargets = await this.resolveTargets(effect.target, context);
                exertedTargets.forEach((target: any) => {
                    if (target.willpower !== undefined) {
                        target.damage = (target.damage || 0) + exertedCount;
                    }
                });

                this.turnManager.logger.info(`[DamageFamily] 💥 Dealt ${exertedCount} damage (exerted count)`, {
                    effectType: 'deal_damage_each_exerted',
                    exertedCount,
                    targets: exertedTargets.map((t: any) => t.name)
                });
                break;

            case 'damage_reflection':
            case 'redirect_damage':
            case 'prevent_damage':
            case 'prevent_damage_removal':
            case 'prevent_damage_high_strength':
            case 'damage_on_any_play':
            case 'damage_on_character_play':
            case 'location_damage_all_characters':
                // Register passive damage effects
                this.registerPassiveEffect({
                    type: effect.type,
                    amount: effect.amount,
                    filter: effect.filter,
                    target: effect.target,
                    sourceCardId: context.card?.instanceId
                }, context);

                this.turnManager.logger.info(`[DamageFamily] 💥 Passive effect registered`, {
                    effectType: effect.type,
                    amount: effect.amount
                });
                break;

            default:
                this.turnManager.logger.warn(`[DamageFamily] Unhandled damage effect: ${effect.type}`);
                break;
        }
    }

    /**
     * Evaluate count expression (simplified for MVP)
     */
    private evaluateCount(countExpr: any, context: GameContext): number {
        // Simplified: just return 1 for now
        // TODO: Implement full count expression evaluation
        return countExpr?.value || 1;
    }
}
