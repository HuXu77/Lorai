import { BaseFamilyHandler } from './base-family-handler';
import { GameContext } from '../executor';
import { EffectAST } from '../effect-ast';
import { ZoneType } from '../../models';
import { GameEvent } from '../events';

export class ChallengeFamilyHandler extends BaseFamilyHandler {
    async execute(effect: EffectAST, context: GameContext): Promise<void> {
        const player = context.player;
        if (!player) return;

        switch (effect.type) {
            case 'challenge_banish_both':
            case 'challenge_banish_both_characters':
                await this.handleBanishBoth(effect, context);
                break;

            case 'challenge_damage_all_damaged':
                await this.handleDamageAllDamaged(effect, context);
                break;

            case 'damage_on_being_challenged':
                await this.handleDamageOnBeingChallenged(effect, context);
                break;

            case 'return_character_banished_in_challenge':
                await this.handleReturnBanishedInChallenge(effect, context);
                break;

            case 'while_challenging_debuff_challenger':
                // Note: This sounds like a static continuous effect, but if modeled as triggered:
                // "When being challenged, debuff challenger" or similar.
                await this.handleWhileChallengingDebuff(effect, context);
                break;

            default:
                this.turnManager.logger.warn(`[ChallengeFamily] Unknown effect type: ${effect.type}`);
        }
    }

    // --- Implementations ---

    private async handleBanishBoth(effect: EffectAST, context: GameContext) {
        // "Banish both characters in this challenge"
        // Context should contain the relevant characters (attacker/defender).
        // Usually eventContext includes `attacker` and `defender`.

        // This effect usually triggers AFTER challenge or DURING challenge resolution step?
        // Or it forces a banish immediately.

        // We need to identify attacker and defender.
        const attacker = context.eventContext?.attacker || context.card;
        const defender = context.eventContext?.defender || (context.eventContext as any)?.target;

        if (!attacker || !defender) {
            this.turnManager.logger.warn(`[ChallengeFamily] Cannot banish both: missing attacker or defender`);
            return;
        }

        this.turnManager.logger.info(`[ChallengeFamily] Banishing both ${attacker.name} and ${defender.name}`);

        // Banish Attacker
        await this.turnManager.game.addCardToZone(context.player, attacker, ZoneType.Discard);

        // Banish Defender (Owner might be opponent)
        const defenderOwnerId = defender.ownerId;
        const defenderOwner = this.turnManager.game.getPlayer(defenderOwnerId);
        if (defenderOwner) {
            await this.turnManager.game.addCardToZone(defenderOwner, defender, ZoneType.Discard);
        }
    }

    private async handleDamageAllDamaged(effect: EffectAST, context: GameContext) {
        // "Deal X damage to all damaged characters" (e.g. Giant Tinker Bell?)
        // Or "Banish all damaged characters"?
        // If it's damage, 'amount' should be in effect.
        // If it's banish, type might be 'challenge_banish_all_damaged'.

        // Assuming this is "Deal 1 damage to all damaged opposing characters" or similar.
        // Need to check EffectAST definition or usage.
        // Let's assume generic "Deal damage to all damaged chars".

        // For now, logging stub as specific logic depends on effect params.
        this.turnManager.logger.warn(`[ChallengeFamily] handleDamageAllDamaged not fully implemented without params.`);
    }

    private async handleDamageOnBeingChallenged(effect: EffectAST, context: GameContext) {
        // "When challenged, deal damage to challenger"
        // Triggered ability.
        const damageAmount = (effect as any).amount || 0;
        const challenger = context.eventContext?.attacker;

        if (challenger && damageAmount > 0) {
            this.turnManager.logger.info(`[ChallengeFamily] Dealing ${damageAmount} damage to challenger ${challenger.name}`);
            challenger.damage += damageAmount;
        }
    }

    private async handleReturnBanishedInChallenge(effect: EffectAST, context: GameContext) {
        // "Return character banished in challenge to hand"?
        // Typically "When a character is banished in a challenge" trigger.
        // Context should contain the banished card.
        // `eventContext.card` or similar depending on trigger.

        // Assuming context.card is the one executing (Source of ability like Dr. Facilier),
        // and eventContext.target is the banished card?
        // Need to inspect trigger payload.

        this.turnManager.logger.warn(`[ChallengeFamily] handleReturnBanishedInChallenge - logic depends on trigger payload structure.`);
    }

    private async handleWhileChallengingDebuff(effect: EffectAST, context: GameContext) {
        // "While challenging, opponent gets -X strength".
        // Trigger: "When challenging" -> Apply temp condition?
        // Similar to 'temporary_buff' but debuff.

        // Assuming effect params: { amount: number, duration: 'turn' } or similar.
        // Target: Defender.
        const defender = context.eventContext?.defender;
        const amount = (effect as any).amount || 0;

        if (defender && amount > 0) {
            // We can't easily "debuff" permanently without 'temporary_buff' logic.
            // If we rely on generic 'temporary_buff' handler, we should use that type.
            // But if this is a custom effect type, we must implement it.

            // Simple implementation: modify valid for turn?
            // Since 'modifiers' aren't central yet (except static), maybe we just log it.
            this.turnManager.logger.warn(`[ChallengeFamily] Debuffing defender ${defender.name} by ${amount} strength (Not fully implemented)`);
        }
    }
}
