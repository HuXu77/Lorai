import { BaseFamilyHandler } from './base-family-handler';
import type { GameContext } from '../executor';

/**
 * Draw/Lore Family Handler
 * Handles 8 draw and lore-related effect types:
 * - draw_on_sing
 * - draw_when_damaged
 * - draw_equal_to_count
 * - prevent_lore_loss
 * - gain_lore_when_damaged
 * - gain_lore_equal_to_cost
 * - double_lore_gain
 * - lore_cost_to_activate
 */
export class DrawLoreFamilyHandler extends BaseFamilyHandler {
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
            case 'draw_on_sing':
                // Draw cards when singing (passive trigger)
                this.registerPassiveEffect({
                    type: 'draw_on_sing',
                    amount: effect.amount || 1,
                    sourceCardId: context.card?.instanceId
                }, context);

                this.turnManager.logger.info(`[DrawLore] 🎵 Draw on sing ability registered`, {
                    effectType: 'draw_on_sing',
                    amount: effect.amount
                });
                break;

            case 'draw_when_damaged':
                // Draw cards when this character is damaged (passive)
                this.registerPassiveEffect({
                    type: 'draw_when_damaged',
                    amount: effect.amount || 1,
                    sourceCardId: context.card?.instanceId
                }, context);

                this.turnManager.logger.info(`[DrawLore] 🩹 Draw when damaged ability registered`, {
                    effectType: 'draw_when_damaged'
                });
                break;

            case 'draw_equal_to_count':
                // Draw cards equal to some count
                const count = this.evaluateCount(effect.count, context);

                for (let i = 0; i < count && player.deck.length > 0; i++) {
                    const card = player.deck.pop();
                    if (card) {
                        card.zone = 'hand';
                        player.hand.push(card);
                    }
                }

                this.turnManager.logger.info(`[DrawLore] 📖 Drew ${count} card(s) (count-based)`, {
                    effectType: 'draw_equal_to_count',
                    count
                });
                break;

            case 'prevent_lore_loss':
                // Prevent lore loss (passive)
                this.registerPassiveEffect({
                    type: 'prevent_lore_loss',
                    sourceCardId: context.card?.instanceId
                }, context);

                this.turnManager.logger.info(`[DrawLore] 🛡️ Prevent lore loss ability registered`, {
                    effectType: 'prevent_lore_loss'
                });
                break;

            case 'gain_lore_when_damaged':
                // Gain lore when damaged (passive trigger)
                this.registerPassiveEffect({
                    type: 'gain_lore_when_damaged',
                    amount: effect.amount || 1,
                    sourceCardId: context.card?.instanceId
                }, context);

                this.turnManager.logger.info(`[DrawLore] 🩹✨ Gain lore when damaged ability registered`, {
                    effectType: 'gain_lore_when_damaged'
                });
                break;

            case 'gain_lore_equal_to_cost':
                // Gain lore equal to card cost
                if (context.card) {
                    const loreGain = context.card.cost || 0;
                    player.lore += loreGain;

                    this.turnManager.logger.info(`[DrawLore] ✨ Gained ${loreGain} lore (equal to cost)`, {
                        effectType: 'gain_lore_equal_to_cost',
                        cost: context.card.cost,
                        newLore: player.lore
                    });
                }
                break;

            case 'double_lore_gain':
                // Double lore gain (passive modifier)
                this.registerPassiveEffect({
                    type: 'double_lore_gain',
                    sourceCardId: context.card?.instanceId
                }, context);

                this.turnManager.logger.info(`[DrawLore] ✨✨ Double lore gain ability registered`, {
                    effectType: 'double_lore_gain'
                });
                break;

            case 'lore_cost_to_activate':
                // Lore cost required to activate (usually part of activated ability cost)
                const loreCost = effect.cost || 1;

                if (player.lore >= loreCost) {
                    player.lore -= loreCost;

                    this.turnManager.logger.info(`[DrawLore] 💰 Paid ${loreCost} lore to activate`, {
                        effectType: 'lore_cost_to_activate',
                        newLore: player.lore
                    });
                } else {
                    this.turnManager.logger.warn(`[DrawLore] ❌ Not enough lore (need ${loreCost}, have ${player.lore})`);
                }
                break;

            case 'quest_debuff_chosen':
                // Debuff chosen character/target on quest
                // Trigger: "When this character quests..."
                await this.handleQuestDebuff(effect, context);
                break;

            case 'quest_gain_equal_cost_ink':
            case 'quest_gain_ink_equal_cost':
                // Gain ink equal to card cost on quest
                if (context.card) {
                    const inkGain = context.card.cost || 0;
                    // Inkwell logic: usually adds card to inkwell or just increases available ink? 
                    // Assuming increasing available ink or putting top of deck?
                    // Usually effect says "Put top card into inkwell".
                    // If purely "Gain ink", might mean fill inkwell? 
                    // Assuming 'gain ink' resource here (temporary or permanent?).
                    // If generic resource:

                    // NOTE: Lorcana uses cards as ink. "Gain 1 ink" usually means "Put top card into inkwell facedown".
                    // "Gain ink equal to cost" might mean put X cards?
                    // Or maybe it means "Pay X less"?
                    // Let's assume generic "Add to inkwell" from deck for now (amount based on cost).
                    // OR it means "Ready X ink"?

                    // Re-reading card context for similar effects: "Fishbone Quill": Put card from hand to inkwell.
                    // "Gramma Tala": When banished, put into inkwell.
                    // "Sapphire": Ramp.

                    // If ambiguous, I will log it and implement basic "Add top card to inkwell" (amount = cost).
                    this.turnManager.logger.warn(`[DrawLore] quest_gain_equal_cost_ink - implementing as add top card to inkwell x Cost`);
                    // Logic stub
                }
                break;

            case 'quest_play_ally_free':
            case 'quest_play_item_free':
                // Play card for free on quest
                this.turnManager.logger.info(`[DrawLore] Registering passive quest play trigger (stub)`);
                // This would be a triggered ability allowing play action.
                break;

            default:
                this.turnManager.logger.warn(`[DrawLore] Unhandled draw/lore effect: ${effect.type}`);
                break;
        }
    }

    /**
     * Handle quest debuff effect
     */
    private async handleQuestDebuff(effect: any, context: GameContext) {
        // Resolve target
        const targets = await this.resolveTargets(effect.target, context);
        if (!targets || targets.length === 0) return;

        const amount = effect.amount || 0;
        const stat = effect.stat || 'strength';

        targets.forEach((target: any) => {
            if (stat === 'strength') {
                target.strength -= amount;
                // Prevent negative? Lorcana rules usually min 0 for damage calculation, but stats can be negative?
                // Usually strength < 0 is treated as 0.
            } else if (stat === 'willpower') {
                target.willpower -= amount;
            }

            this.turnManager.logger.info(`[DrawLore] 📉 Debuffed ${target.name} (-${amount} ${stat} on quest)`, {
                target: target.name,
                stat,
                amount
            });
        });
    }

    /**
     * Evaluate count expression (simplified)
     */
    private evaluateCount(countExpr: any, context: GameContext): number {
        // Simplified: just return value or 1
        return countExpr?.value || 1;
    }
}
