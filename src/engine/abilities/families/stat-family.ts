/**
 * StatFamilyHandler - Stat Modification Effect Handlers
 * ======================================================
 * 
 * Handles all stat modification effects:
 * - modify_stats: Change strength, willpower, lore, damage
 * - grant_keyword: Grant keywords like Resist, Rush, Evasive
 * - grant_ability: Grant special abilities
 * - permanent_buff: Apply permanent stat buffs
 * - temporary_buff: Apply temporary stat buffs with duration
 * - copy_stats: Copy stats from one card to another
 * - set_cost: Set card cost
 * - double_lore: Double a card's lore value
 * - lose_all_abilities: Remove all abilities from a card
 * - transform: Transform card type/stats
 * 
 * @module StatFamilyHandler
 * @since 1.0.0
 */

import { BaseFamilyHandler } from './base-family-handler';
import type { GameContext } from '../executor';
import type { EffectAST, TargetAST } from '../effect-ast';

export class StatFamilyHandler extends BaseFamilyHandler {
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

    setTurnManager(turnManager: any): void {
        this.turnManager = turnManager;
    }

    /**
     * Override to use executor's full resolveTargets implementation
     * which supports all target types including all_friendly_characters
     */
    protected async resolveTargets(target: any, context: any): Promise<any[]> {
        if (this.executor?.resolveTargets) {
            return this.executor.resolveTargets(target, context);
        }
        // Fallback to base implementation
        return super.resolveTargets(target, context);
    }

    /**
     * Route stat-related effects to handlers
     */
    async execute(effect: any, context: GameContext): Promise<void> {
        switch (effect.type) {
            case 'modify_stats':
                await this.executeModifyStats(effect, context);
                break;
            case 'grant_keyword':
                await this.executeGrantKeyword(effect, context);
                break;
            case 'grant_ability':
                await this.executeGrantAbility(effect, context);
                break;
            case 'permanent_buff':
                await this.executePermanentBuff(effect, context);
                break;
            case 'temporary_buff':
                await this.executeTemporaryBuff(effect, context);
                break;
            case 'copy_stats':
                await this.executeCopyStats(effect, context);
                break;
            case 'set_cost':
                await this.executeSetCost(effect, context);
                break;
            case 'double_lore':
                await this.executeDoubleLore(effect, context);
                break;
            case 'lose_all_abilities':
                await this.executeLoseAllAbilities(effect, context);
                break;
            case 'transform':
                await this.executeTransform(effect, context);
                break;
            default:
                this.turnManager?.logger.warn(`StatFamilyHandler: Unknown effect type ${effect.type}`);
        }
    }

    /**
     * Modify stats (strength, willpower, lore, damage)
     */
    private async executeModifyStats(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach(target => {
            if (!this.turnManager?.game?.state?.activeEffects) {
                if (!this.turnManager?.game?.state) return;
                this.turnManager.game.state.activeEffects = [];
            }

            let effectType: string;
            if (effect.stat === 'strength') {
                effectType = 'modify_strength';
                target.strength = (target.strength || 0) + (effect.amount || 0);
            } else if (effect.stat === 'willpower') {
                effectType = 'modify_willpower';
                target.willpower = (target.willpower || 0) + (effect.amount || 0);
            } else if (effect.stat === 'lore') {
                effectType = 'modify_lore';
                target.lore = (target.lore || 0) + (effect.amount || 0);
            } else if (effect.stat === 'damage') {
                effectType = 'modify_damage';
                target.damage = (target.damage || 0) + (effect.amount || 0);
            } else {
                return;
            }

            const activeEffect = {
                id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                sourceCardId: context.card?.instanceId || 'unknown',
                targetCardId: target.instanceId,
                type: effectType,
                value: effect.amount,
                duration: effect.duration || 'until_end_of_turn',
                timestamp: Date.now()
            };

            this.turnManager.addActiveEffect(activeEffect);
        });

        if (this.turnManager) {
            const source = context.abilityName ? ` (Source: ${context.abilityName})` : '';
            this.turnManager.logger.info(`[StatFamily] Modified ${effect.stat} by ${effect.amount} for ${targets.length} target(s)${source}`);
        }
    }

    /**
     * Grant keyword to targets
     */
    private async executeGrantKeyword(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        let finalKeyword = effect.keyword;
        if (effect.amount !== undefined && (effect.keyword === 'Resist' || effect.keyword === 'Challenger')) {
            finalKeyword = `${effect.keyword} +${effect.amount}`;
        }

        targets.forEach(target => {
            if (!this.turnManager?.game?.state?.activeEffects) {
                if (!this.turnManager?.game?.state) return;
                this.turnManager.game.state.activeEffects = [];
            }

            if (!target.meta) target.meta = {};
            if (!target.meta.grantedKeywords) target.meta.grantedKeywords = [];
            if (!target.meta.grantedKeywords.includes(finalKeyword)) {
                target.meta.grantedKeywords.push(finalKeyword);
            }

            const activeEffect = {
                id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                sourceCardId: context.card?.instanceId || 'unknown',
                targetCardIds: [target.instanceId],
                type: 'modification',
                modificationType: 'grant_keyword',
                params: { keyword: finalKeyword },
                duration: effect.duration || 'until_end_of_turn',
                targetPlayerIds: [target.ownerId],
                sourcePlayerId: context.card?.ownerId || target.ownerId,
                timestamp: Date.now()
            };

            this.turnManager.addActiveEffect(activeEffect);
        });

        if (this.turnManager) {
            const source = context.abilityName ? ` (Source: ${context.abilityName})` : '';
            this.turnManager.logger.info(`[StatFamily] Granted ${finalKeyword} to ${targets.length} target(s)${source}`);
        }
    }

    /**
     * Grant special ability
     */
    private async executeGrantAbility(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);
        const duration = effect.duration || 'turn';

        if (!this.turnManager) return;

        targets.forEach(target => {
            this.turnManager.addActiveEffect({
                type: 'ability_grant',
                ability: effect.ability,
                targetCardIds: [target.instanceId],
                duration,
                sourceCardId: context.card?.instanceId
            });
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`[StatFamily] Granted ability ${effect.ability} to ${targets.length} target(s)`);
        }
    }

    /**
     * Apply permanent stat buff
     */
    private async executePermanentBuff(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach(target => {
            if (effect.strength !== undefined) {
                target.strength = (target.strength || 0) + effect.strength;
                target.baseStrength = (target.baseStrength || target.strength) + effect.strength;
            }
            if (effect.willpower !== undefined) {
                target.willpower = (target.willpower || 0) + effect.willpower;
                target.baseWillpower = (target.baseWillpower || target.willpower) + effect.willpower;
            }
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`[StatFamily] Applied permanent buff to ${targets.length} target(s)`);
        }
    }

    /**
     * Apply temporary stat buff with duration
     */
    private async executeTemporaryBuff(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach(target => {
            if (!this.turnManager?.game?.state?.activeEffects) {
                if (!this.turnManager?.game?.state) return;
                this.turnManager.game.state.activeEffects = [];
            }

            if (effect.strength !== undefined) {
                target.strength = (target.strength || 0) + effect.strength;
                this.turnManager.addActiveEffect({
                    id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    sourceCardId: context.card?.instanceId || 'unknown',
                    targetCardId: target.instanceId,
                    type: 'modify_strength',
                    value: effect.strength,
                    duration: effect.duration,
                    timestamp: Date.now()
                });
            }
            if (effect.willpower !== undefined) {
                target.willpower = (target.willpower || 0) + effect.willpower;
                this.turnManager.addActiveEffect({
                    id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    sourceCardId: context.card?.instanceId || 'unknown',
                    targetCardId: target.instanceId,
                    type: 'modify_willpower',
                    value: effect.willpower,
                    duration: effect.duration,
                    timestamp: Date.now()
                });
            }
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`[StatFamily] Applied temporary buff to ${targets.length} target(s) for ${effect.duration}`);
        }
    }

    /**
     * Copy stats from source to target
     */
    private async executeCopyStats(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);
        const sources = await this.resolveTargets(effect.source, context);

        if (sources.length === 0 || targets.length === 0) return;

        const source = sources[0];
        targets.forEach(target => {
            target.strength = source.strength;
            target.willpower = source.willpower;
            if (source.lore !== undefined) {
                target.lore = source.lore;
            }
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`[StatFamily] Copied stats from ${source.name} to ${targets.length} target(s)`);
        }
    }

    /**
     * Set card cost
     */
    private async executeSetCost(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach(target => {
            target.cost = effect.value;
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`[StatFamily] Set cost to ${effect.value} for ${targets.length} target(s)`);
        }
    }

    /**
     * Double target's lore value
     */
    private async executeDoubleLore(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach(target => {
            target.lore = (target.lore || 0) * 2;
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`[StatFamily] Doubled lore for ${targets.length} target(s)`);
        }
    }

    /**
     * Remove all abilities from target
     */
    private async executeLoseAllAbilities(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach(target => {
            target.parsedEffects = [];
            if (target.meta) {
                target.meta.grantedKeywords = [];
            }
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`[StatFamily] Removed all abilities from ${targets.length} target(s)`);
        }
    }

    /**
     * Transform card type/stats
     */
    private async executeTransform(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach(target => {
            if (effect.cardType) {
                target.type = effect.cardType;
            }
            if (effect.strength !== undefined) {
                target.strength = effect.strength;
                target.baseStrength = effect.strength;
            }
            if (effect.willpower !== undefined) {
                target.willpower = effect.willpower;
                target.baseWillpower = effect.willpower;
            }
        });

        if (this.turnManager) {
            this.turnManager.logger.info(`[StatFamily] Transformed ${targets.length} target(s)`);
        }
    }
}
