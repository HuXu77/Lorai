import { BaseFamilyHandler } from './base-family-handler';
import type { GameContext } from '../executor';

/**
 * Ready/Exert Family Handler
 * Handles 13 ready/exert-related effect types:
 * - ready
 * - prevent_ready
 * - ready_after_challenge
 * - exert_characters
 * - exert_all
 * - exert_banish_damaged
 * - exert_banish_chosen_damaged
 * - exert_to_deal_damage
 * - exert_ally_for_damage
 * - exert_and_damage_to_move
 * - can_challenge_ready
 * - challenge_ready_damaged
 * - move_to_location
 */
export class ReadyExertFamilyHandler extends BaseFamilyHandler {
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

        switch (effect.type) {
            case 'ready':
                // Ready target characters (set ready = true)
                const readyTargets = await this.resolveTargets(effect.target, context);
                readyTargets.forEach((target: any) => {
                    if (target.ready === false) {
                        target.ready = true;
                    }
                });

                this.turnManager.logger.info(`[ReadyExertFamily] ↻ Readied ${readyTargets.length} character(s)`, {
                    effectType: 'ready',
                    targets: readyTargets.map((t: any) => t.name)
                });
                break;

            case 'exert_characters':
                // Exert X number of ready characters
                const amount = effect.amount || 1;
                const readyCharacters = player.play.filter((c: any) =>
                    c.type === 'Character' && c.ready
                );

                if (readyCharacters.length === 0) {
                    this.turnManager.logger.info(`[ReadyExertFamily] 😴 No ready characters to exert`);
                    break;
                }

                const toExert = readyCharacters.slice(0, Math.min(amount, readyCharacters.length));
                toExert.forEach((char: any) => {
                    char.ready = false;
                });

                this.turnManager.logger.info(`[ReadyExertFamily] 😴 Exerted ${toExert.length} character(s)`, {
                    effectType: 'exert_characters',
                    amount,
                    exerted: toExert.map((c: any) => c.name)
                });
                break;

            case 'exert_all':
                // Exert all characters matching filter
                const filter = effect.filter || {};
                const targets = player.play.filter((c: any) => {
                    if (c.type !== 'Character' || !c.ready) return false;
                    if (filter.damaged && !c.damage) return false;
                    return true;
                });

                targets.forEach((char: any) => {
                    char.ready = false;
                });

                this.turnManager.logger.info(`[ReadyExertFamily] 😴 Exerted all matching characters (${targets.length})`, {
                    effectType: 'exert_all',
                    count: targets.length
                });
                break;

            case 'exert_banish_damaged':
                // Exert this card, banish damaged characters
                if (context.card) {
                    context.card.ready = false;
                }

                const damagedChars = player.play.filter((c: any) =>
                    c.type === 'Character' && c.damage && c.damage > 0
                );

                damagedChars.forEach((char: any) => {
                    player.play = player.play.filter((c: any) => c.instanceId !== char.instanceId);
                    player.discard.push(char);
                });

                this.turnManager.logger.info(`[ReadyExertFamily] 😴🗑️ Exerted self, banished ${damagedChars.length} damaged character(s)`, {
                    effectType: 'exert_banish_damaged',
                    banished: damagedChars.map((c: any) => c.name)
                });
                break;

            case 'exert_banish_chosen_damaged':
                // Exert to banish chosen damaged character
                const chosenTarget = (await this.resolveTargets(effect.target, context))[0];
                if (chosenTarget && chosenTarget.damage && chosenTarget.damage > 0) {
                    const owner = this.turnManager.game.state.players.find((p: any) =>
                        p.play.some((c: any) => c.instanceId === chosenTarget.instanceId)
                    );

                    if (owner) {
                        owner.play = owner.play.filter((c: any) => c.instanceId !== chosenTarget.instanceId);
                        owner.discard.push(chosenTarget);
                    }

                    if (context.card) {
                        context.card.ready = false;
                    }

                    this.turnManager.logger.info(`[ReadyExertFamily] 😴🗑️ Exerted to banish damaged character`, {
                        effectType: 'exert_banish_chosen_damaged',
                        banished: chosenTarget.name
                    });
                }
                break;

            case 'exert_to_deal_damage':
            case 'exert_ally_for_damage':
                // Exert to deal damage (passive ability)
                this.registerPassiveEffect({
                    type: effect.type,
                    amount: effect.amount,
                    target: effect.target,
                    sourceCardId: context.card?.instanceId
                }, context);

                this.turnManager.logger.info(`[ReadyExertFamily] 😴💥 Exert for damage ability registered`, {
                    effectType: effect.type
                });
                break;

            case 'exert_and_damage_to_move':
                // Exert and damage to move location (passive)
                this.registerPassiveEffect({
                    type: effect.type,
                    damageCost: effect.damageCost,
                    sourceCardId: context.card?.instanceId
                }, context);

                this.turnManager.logger.info(`[ReadyExertFamily] 😴➡️ Exert and damage to move registered`, {
                    effectType: 'exert_and_damage_to_move'
                });
                break;

            case 'move_to_location':
                // Move character to a location
                if (context.card) {
                    const location = effect.location;
                    context.card.location = location;

                    this.turnManager.logger.info(`[ReadyExertFamily] ➡️ Moved to location`, {
                        effectType: 'move_to_location',
                        card: context.card.name,
                        location
                    });
                }
                break;

            case 'prevent_ready':
            case 'ready_after_challenge':
            case 'can_challenge_ready':
            case 'challenge_ready_damaged':
                // Register passive ready/challenge effects
                this.registerPassiveEffect({
                    type: effect.type,
                    filter: effect.filter,
                    target: effect.target,
                    sourceCardId: context.card?.instanceId
                }, context);

                this.turnManager.logger.info(`[ReadyExertFamily] ↻ Passive ready/challenge effect registered`, {
                    effectType: effect.type
                });
                break;

            case 'ready_inkwell':
                // Ready X cards in inkwell
                const readyInkTargets = await this.resolveTargets(effect.target, context);
                // The target resolver usually returns matching cards. 
                // For inkwell, we expect it to return inkwell cards if configured or fallback to manual logic.

                // If specific targets weren't resolved (e.g. self-targeting just returns player), use manual logic based on amount
                let inkToReady: any[] = [];

                if (readyInkTargets.length > 0 && readyInkTargets[0].zone === 'inkwell') {
                    inkToReady = readyInkTargets;
                } else if (effect.amount) {
                    const owner = this.resolvePlayer(context, effect.target);
                    // Filter exerted ink
                    const exertedInk = owner.inkwell.filter((c: any) => !c.ready);
                    inkToReady = exertedInk.slice(0, effect.amount);
                }

                inkToReady.forEach((card: any) => {
                    card.ready = true;
                });

                this.turnManager.logger.info(`[ReadyExertFamily] ↻ Readied ${inkToReady.length} ink card(s)`, {
                    effectType: 'ready_inkwell',
                    amount: effect.amount
                });
                break;

            case 'exert_inkwell':
                // Exert X cards in inkwell
                const exertInkTargets = await this.resolveTargets(effect.target, context);

                let inkToExert: any[] = [];

                if (exertInkTargets.length > 0 && exertInkTargets[0].zone === 'inkwell') {
                    inkToExert = exertInkTargets;
                } else if (effect.amount) {
                    const owner = this.resolvePlayer(context, effect.target);
                    // Filter ready ink
                    const readyInk = owner.inkwell.filter((c: any) => c.ready);
                    inkToExert = readyInk.slice(0, effect.amount);
                }

                inkToExert.forEach((card: any) => {
                    card.ready = false;
                });

                this.turnManager.logger.info(`[ReadyExertFamily] 😴 Exerted ${inkToExert.length} ink card(s)`, {
                    effectType: 'exert_inkwell',
                    amount: effect.amount
                });
                break;

            default:
                this.turnManager.logger.warn(`[ReadyExertFamily] Unhandled ready/exert effect: ${effect.type}`);
                break;
        }
    }

    /**
     * Helper to resolve player from target definition
     */
    private resolvePlayer(context: GameContext, targetDef: any): any {
        if (!targetDef) return context.player;

        if (targetDef.type === 'opponent') {
            // Robustly find opponent
            const allPlayers: any[] = typeof this.turnManager.game.getPlayers === 'function'
                ? this.turnManager.game.getPlayers()
                : Object.values(this.turnManager.game.state.players);

            const opponent = allPlayers.find((p: any) => p.id !== context.player.id);
            return opponent;
        }
        return context.player;
    }
}
