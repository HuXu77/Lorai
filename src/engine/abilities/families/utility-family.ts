import { BaseFamilyHandler } from './base-family-handler';
import type { GameContext } from '../executor';

/**
 * Utility Family Handler
 * Handles miscellaneous utility effects: card counting, attribute queries,
 * deck limits, simple state modifications, and ability grants
 */
export class UtilityFamilyHandler extends BaseFamilyHandler {
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

        switch (effect.type) {
            case 'cards_in_hand':
                // Query: number of cards in hand (usually for conditions/counts)
                const handCount = player?.hand?.length || 0;
                this.turnManager.logger.info(`[Utility] 🃏 Cards in hand: ${handCount}`);
                // Store in context for use by other effects
                if (context.variables) {
                    context.variables.cards_in_hand = handCount;
                }
                break;

            case 'cards_in_opponent_hand':
                // Query: number of cards in opponent's hand
                const opponents = this.turnManager.game.getOpponents?.(player.id) || [];
                const oppHandCount = opponents[0]?.hand?.length || 0;
                this.turnManager.logger.info(`[Utility] 🃏 Cards in opponent hand: ${oppHandCount}`);
                if (context.variables) {
                    context.variables.cards_in_opponent_hand = oppHandCount;
                }
                break;

            case 'attribute_of_target':
                // Query: get attribute value from target
                const targets = await this.resolveTargets(effect.target, context);
                if (targets.length > 0) {
                    const target = targets[0];
                    const attrValue = target[effect.attribute];
                    this.turnManager.logger.info(`[Utility] 📊 Attribute ${effect.attribute} of ${target.name}: ${attrValue}`);
                    if (context.variables) {
                        context.variables.attribute_value = attrValue;
                    }
                }
                break;

            case 'deck_copy_limit':
                // Set deck construction limit for specific card
                if (!this.turnManager.game.state.deckLimits) {
                    this.turnManager.game.state.deckLimits = {};
                }
                this.turnManager.game.state.deckLimits[effect.cardName] = effect.limit;
                this.turnManager.logger.info(`[Utility] 📋 Deck limit for ${effect.cardName}: ${effect.limit}`);
                break;

            case 'deck_limit_increase':
                // Increase deck size limit
                const currentLimit = this.turnManager.game.state.deckSizeLimit || 60;
                this.turnManager.game.state.deckSizeLimit = currentLimit + effect.amount;
                this.turnManager.logger.info(`[Utility] 📋 Deck size limit increased by ${effect.amount} to ${this.turnManager.game.state.deckSizeLimit}`);
                break;

            case 'deck_limit_override':
                // Override deck limit for specific card
                if (!this.turnManager.game.state.deckLimits) {
                    this.turnManager.game.state.deckLimits = {};
                }
                this.turnManager.game.state.deckLimits[effect.cardName] = effect.limit;
                this.turnManager.logger.info(`[Utility] 📋 Deck limit override for ${effect.cardName}: ${effect.limit}`);
                break;

            case 'ink':
                // Add ink (usually means add cards to inkwell)
                const inkAmount = effect.amount || 1;
                // In Lorcana, "gain ink" typically means put top card of deck into inkwell
                for (let i = 0; i < inkAmount && player.deck.length > 0; i++) {
                    const inkCard = player.deck.pop();
                    if (inkCard) {
                        inkCard.zone = 'inkwell';
                        inkCard.ready = false; // Enters exerted
                        player.inkwell.push(inkCard);
                    }
                }
                this.turnManager.logger.info(`[Utility] 🎨 Gained ${inkAmount} ink`);
                break;

            case 'lore':
                // Gain lore directly
                const loreAmount = effect.amount || 1;
                player.lore = (player.lore || 0) + loreAmount;
                this.turnManager.logger.info(`[Utility] ⭐ Gained ${loreAmount} lore (total: ${player.lore})`);
                break;

            case 'self_status':
                // Set status on self
                if (card) {
                    card[effect.status] = effect.value;
                    this.turnManager.logger.info(`[Utility] 🔧 Set ${effect.status} = ${effect.value} on ${card.name}`);
                }
                break;

            case 'grant_activated_ability':
                // Grant activated ability to target
                const grantTargets = await this.resolveTargets(effect.target, context);
                grantTargets.forEach((target: any) => {
                    if (!target.grantedAbilities) {
                        target.grantedAbilities = [];
                    }
                    target.grantedAbilities.push(effect.ability);
                });
                this.turnManager.logger.info(`[Utility] ⚡ Granted activated ability to ${grantTargets.length} target(s)`);
                break;

            case 'choice':
                // Present choice to player (stub for now)
                this.turnManager.logger.info(`[Utility] 🤔 Choice presented with ${effect.options?.length || 0} options (stub)`);
                // In a real implementation, this would trigger UI choice selection
                break;

            case 'event_target':
                // Reference to event target (used in triggered abilities)
                this.turnManager.logger.info(`[Utility] 🎯 Event target referenced (context-dependent)`);
                // This is typically handled by the trigger system, not executed directly
                break;

            default:
                this.turnManager.logger.warn(`[Utility] Unhandled utility effect: ${effect.type}`);
                break;
        }
    }
}
