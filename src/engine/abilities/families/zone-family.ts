/**
 * ZoneFamilyHandler - Zone Transfer Effect Handlers
 * ==================================================
 * 
 * Handles all zone transfer effects (moving cards between zones):
 * - return_to_hand: Return cards from play to hand
 * - return_self: Return self to hand
 * - return_from_discard: Return cards from discard to hand/deck
 * - banish: Move cards to discard (banish)
 * - bounce_all: Return all matching cards to hand
 * - exile: Move cards to exile zone
 * - return_from_exile: Return cards from exile
 * - put_into_inkwell: Put cards into inkwell
 * 
 * @module ZoneFamilyHandler
 * @since 1.0.0
 */

import { BaseFamilyHandler } from './base-family-handler';
import type { GameContext } from '../executor';
import type { EffectAST, TargetAST } from '../effect-ast';
import { ZoneType } from '../../models';

export class ZoneFamilyHandler extends BaseFamilyHandler {
    private executor: any;

    constructor(executor: any) {
        super(executor.turnManager);
        this.executor = executor;
    }

    setTurnManager(turnManager: any): void {
        this.turnManager = turnManager;
    }

    /**
     * Override to use executor's full resolveTargets implementation
     */
    protected async resolveTargets(target: any, context: any): Promise<any[]> {
        if (this.executor?.resolveTargets) {
            return this.executor.resolveTargets(target, context);
        }
        return super.resolveTargets(target, context);
    }

    /**
     * Route zone-related effects to handlers
     */
    async execute(effect: any, context: GameContext): Promise<void> {
        switch (effect.type) {
            case 'return_to_hand':
                await this.executeReturnToHand(effect, context);
                break;
            case 'return_self':
                await this.executeReturnToHand(effect, context, true);
                break;
            case 'return_from_discard':
                await this.executeReturnFromDiscard(effect, context);
                break;
            case 'banish':
                await this.executeBanish(effect, context);
                break;
            case 'bounce_all':
                await this.executeBounceAll(effect, context);
                break;
            case 'exile':
                await this.executeExile(effect, context);
                break;
            case 'return_from_exile':
                await this.executeReturnFromExile(effect, context);
                break;
            case 'put_into_inkwell':
                await this.executePutIntoInkwell(effect, context);
                break;
            case 'opponent_deck_to_inkwell':
                await this.executeOpponentDeckToInkwell(effect, context);
                break;
            case 'return_multiple_with_cost_filter':
                await this.executeReturnMultipleWithCostFilter(effect, context);
                break;
            default:
                this.turnManager?.logger.warn(`ZoneFamilyHandler: Unknown effect type ${effect.type}`);
        }
    }

    /**
     * Return cards to hand
     */
    private async executeReturnToHand(effect: any, context: GameContext, isSelfTarget: boolean = false): Promise<void> {
        if (!this.turnManager) return;

        let targets: any[] = [];
        if (isSelfTarget) {
            targets = [context.card];
        } else {
            targets = await this.resolveTargets(effect.target, context);
        }

        targets.forEach(target => {
            const owner = this.turnManager.game.getPlayer(target.ownerId);
            if (!owner) return;

            // Remove from all possible zones
            owner.play = owner.play.filter((c: any) => c.instanceId !== target.instanceId);
            owner.discard = owner.discard.filter((c: any) => c.instanceId !== target.instanceId);
            owner.hand = owner.hand.filter((c: any) => c.instanceId !== target.instanceId);
            owner.deck = owner.deck.filter((c: any) => c.instanceId !== target.instanceId);

            // Reset card state when returning to hand
            target.zone = ZoneType.Hand;
            target.ready = true;   // Cards in hand are always ready
            target.damage = 0;     // Clear damage when leaving play
            owner.hand.push(target);
        });

        if (this.turnManager) {
            const targetNames = targets.map((t: any) => t.name).join(', ');
            const source = context.abilityName ? ` (Source: ${context.abilityName})` : '';
            this.turnManager.logger.info(`↩️ Returned ${targetNames} to hand${source}`);
        }
    }

    /**
     * Return cards from discard to hand/deck
     */
    private async executeReturnFromDiscard(effect: any, context: GameContext): Promise<void> {
        const player = context.player;
        if (!player?.discard) return;

        const targets = await this.resolveTargets(effect.target, context);
        const destination = effect.destination || 'hand';

        if (this.turnManager?.logger?.debug) {
            this.turnManager.logger.debug(`[ZoneFamily] Resolved ${targets.length} targets from discard`);
        }

        targets.forEach((card: any) => {
            const index = player.discard.indexOf(card);
            if (index !== -1) {
                player.discard.splice(index, 1);

                if (destination === 'hand') {
                    player.hand.push(card);
                    card.zone = 'Hand';
                } else if (destination === 'top_of_deck') {
                    player.deck.unshift(card);
                    card.zone = 'deck';
                }

                if (this.turnManager) {
                    this.turnManager.logger.info(`[ZoneFamily] Returned ${card.name} from discard to ${destination}`);
                }
            }
        });
    }

    /**
     * Banish cards (move to discard)
     */
    private async executeBanish(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        if (!this.turnManager) return;

        // Check if optional via executor's checkOptional
        if (effect.optional && this.executor?.checkOptional) {
            const shouldExecute = await this.executor.checkOptional(
                effect, context,
                `Do you want to banish ${targets.length > 1 ? targets.length + ' cards' : 'card'}?`
            );
            if (!shouldExecute) return;
        }

        targets.forEach((target: any) => {
            const targetPlayer = this.turnManager.game.getPlayer(target.ownerId);
            this.turnManager.banishCard(targetPlayer, target);
        });

        const targetNames = targets.map((t: any) => t.name).join(', ');
        this.turnManager.logger.info(`🗑️  Banished ${targetNames}`, {
            targets: targets.map((t: any) => t.name)
        });
    }

    /**
     * Return all matching cards to hand
     */
    private async executeBounceAll(effect: any, context: GameContext): Promise<void> {
        if (!this.turnManager) return;

        const allPlayers = Object.values(this.turnManager.game.state.players);

        allPlayers.forEach((player: any) => {
            const cardsToBounce = player.play.filter((card: any) => {
                if (!effect.filter) return true;
                if (effect.filter.type && card.type !== effect.filter.type) return false;
                if (effect.filter.damaged && card.damage === 0) return false;
                return true;
            });

            cardsToBounce.forEach((card: any) => {
                const index = player.play.indexOf(card);
                if (index !== -1) {
                    player.play.splice(index, 1);
                }
                card.zone = 'hand';
                card.ready = true;
                card.damage = 0;
                player.hand.push(card);

                this.turnManager!.logger.info(`${card.name} returned to ${player.name}'s hand`);
            });
        });
    }

    /**
     * Move cards to exile zone
     */
    private async executeExile(effect: any, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        targets.forEach((target: any) => {
            const owner = Object.values(this.turnManager?.game?.state?.players || {}).find((p: any) =>
                p.play.includes(target) || p.hand.includes(target) || p.discard.includes(target)
            ) as any;

            if (owner) {
                owner.play = owner.play.filter((c: any) => c !== target);
                owner.hand = owner.hand.filter((c: any) => c !== target);
                owner.discard = owner.discard.filter((c: any) => c !== target);

                if (!owner.exile) owner.exile = [];
                target.zone = 'exile';
                owner.exile.push(target);

                if (this.turnManager) {
                    this.turnManager.logger.info(`${target.name} exiled`);
                }
            }
        });
    }

    /**
     * Return cards from exile
     */
    private async executeReturnFromExile(effect: any, context: GameContext): Promise<void> {
        const player = context.player;

        if (!player.exile || player.exile.length === 0) {
            if (this.turnManager) {
                this.turnManager.logger.info(`${player.name} has no exiled cards`);
            }
            return;
        }

        const card = player.exile.find((c: any) => {
            if (!effect.filter) return true;
            if (effect.filter.name && c.name !== effect.filter.name) return false;
            if (effect.filter.type && c.type !== effect.filter.type) return false;
            return true;
        });

        if (card) {
            player.exile = player.exile.filter((c: any) => c !== card);
            card.zone = 'hand';
            player.hand.push(card);

            if (this.turnManager) {
                this.turnManager.logger.info(`${card.name} returned from exile to hand`);
            }
        }
    }

    /**
     * Put cards into inkwell
     */
    private async executePutIntoInkwell(effect: any, context: GameContext): Promise<void> {
        if (!this.turnManager) return;

        const targets = await this.resolveTargets(effect.target, context);
        const exerted = effect.exerted || false;

        targets.forEach((card: any) => {
            const owner = this.turnManager.game.getPlayer(card.ownerId);
            if (!owner) return;

            // Remove from current location
            owner.hand = owner.hand.filter((c: any) => c.instanceId !== card.instanceId);
            owner.play = owner.play.filter((c: any) => c.instanceId !== card.instanceId);

            // Add to inkwell
            card.zone = 'inkwell';
            card.ready = !exerted;
            owner.inkwell.push(card);

            if (this.turnManager) {
                this.turnManager.logger.info(`${card.name} put into inkwell${exerted ? ' (exerted)' : ''}`);
            }
        });
    }

    /**
     * Opponent puts top card of their deck into inkwell (Sudden Scare chained effect)
     * The "opponent" is determined by the target owner from the previous put_into_inkwell effect.
     */
    private async executeOpponentDeckToInkwell(effect: any, context: GameContext): Promise<void> {
        if (!this.turnManager) return;

        // Determine which player to affect
        // For Sudden Scare, the target is the owner of the character that was just moved
        // This is passed via the 'target_owner' target type, but we can also determine from context
        // The context.targetCard should be set from the previous effect's target

        let targetPlayerId: string | undefined;

        // Try to get from context (the character that was moved belongs to this player)
        const ctx = context as any;
        if (ctx.targetCard) {
            targetPlayerId = ctx.targetCard.ownerId;
        }

        // Fallback: If targeting is 'target_owner', use the opponent of the active player
        if (!targetPlayerId && effect.target?.type === 'target_owner') {
            // Find opponent of context.player
            const allPlayers = Object.values(this.turnManager.game.state.players) as any[];
            const opponent = allPlayers.find((p: any) => p.id !== context.player.id);
            if (opponent) {
                targetPlayerId = opponent.id;
            }
        }

        if (!targetPlayerId) {
            this.turnManager.logger.warn('[ZoneFamily] Could not determine target player for opponent_deck_to_inkwell');
            return;
        }

        const targetPlayer = this.turnManager.game.getPlayer(targetPlayerId);
        if (!targetPlayer || targetPlayer.deck.length === 0) {
            this.turnManager.logger.info(`[ZoneFamily] ${targetPlayer?.name || 'Target player'} has no cards in deck`);
            return;
        }

        const amount = effect.amount || 1;

        for (let i = 0; i < amount; i++) {
            if (targetPlayer.deck.length === 0) break;

            // Take from top of deck (end of array)
            const card = targetPlayer.deck.pop();
            if (card) {
                card.zone = 'inkwell';
                card.ready = !effect.exerted; // Facedown is visual only; ready/exerted is functional
                targetPlayer.inkwell.push(card);

                this.turnManager.trackZoneChange(card, 'deck', 'inkwell');
                this.turnManager.logger.info(`[ZoneFamily] ${targetPlayer.name} puts ${card.name} from deck into inkwell (facedown)`);
            }
        }
    }

    /**
     * Return multiple cards with cost filter (from play to hand)
     */
    private async executeReturnMultipleWithCostFilter(effect: any, context: GameContext): Promise<void> {
        if (!this.turnManager) return;

        const player = context.player;
        const amount = effect.amount || 0;
        const maxCost = effect.maxCost;
        const filter = effect.filter;

        // Gather all characters in play from ALL players
        let allCharacters: any[] = [];
        Object.values(this.turnManager.game.state.players).forEach((p: any) => {
            allCharacters = allCharacters.concat(p.play);
        });

        // Filter by cost and type
        const validTargets = allCharacters.filter((c: any) => {
            if (filter && filter.cardType && c.type !== filter.cardType && !c.keywords?.includes(filter.cardType)) {
                // Continue to other checks
            }
            return c.cost <= maxCost;
        });

        if (validTargets.length === 0) {
            this.turnManager.logger.info(`[ZoneFamily] No valid targets found for return_multiple_with_cost_filter (Max Cost: ${maxCost})`);
            return;
        }

        // Prioritize returning opponent's cards
        const opponentTargets = validTargets.filter((c: any) => c.ownerId !== player.id);

        let returnedCount = 0;

        // Return opponent cards
        for (const target of opponentTargets) {
            if (returnedCount >= amount) break;

            const owner = this.turnManager.game.getPlayer(target.ownerId);
            owner.play = owner.play.filter((c: any) => c.instanceId !== target.instanceId);
            target.zone = 'hand';
            owner.hand.push(target);
            this.turnManager.logger.info(`[ZoneFamily] Returned ${target.name} to ${owner.name}'s hand`);
            this.turnManager.trackZoneChange(target, 'play', 'hand');
            returnedCount++;
        }
    }
}
