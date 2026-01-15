/**
 * Challenge Handler
 * 
 * Handles character combat (challenges) including:
 * - Validation (ready, dry, Rush, Bodyguard, Evasive)
 * - Damage calculation (Challenger bonus, Resist)
 * - Combat resolution and banishment
 */

import { PlayerState, GameStateManager } from '../state';
import { CardInstance, ZoneType, ChoiceRequest, ChoiceType } from '../models';
import { GameEvent } from '../abilities/events';
import type { TurnManager } from '../actions';
import { checkBanishment } from './banishment';

/**
 * Check if a challenge is valid (without executing)
 * 
 * @param attacker - The attacking character
 * @param target - The target character
 * @returns True if challenge is valid
 */
export function canChallenge(attacker: CardInstance, target: CardInstance): boolean {
    // Rule: Attacker must be ready
    if (!attacker.ready) return false;

    // Rule: Target must be exerted (unless attacker can challenge ready OR target is Location)
    const canChallengeReady = attacker.parsedEffects?.some(e => e.action === 'can_challenge_ready_characters');
    const isLocation = target.type === 'Location';

    if (target.ready && !isLocation && !canChallengeReady) return false;

    // Rule: Evasive - Only characters with Evasive can challenge Evasive
    // Rule: Evasive - Only characters with Evasive can challenge Evasive
    const targetIsEvasive = target.parsedEffects?.some(e =>
        e.action === 'keyword_evasive' ||
        (e as any).keyword === 'evasive' ||
        ((e as any).effects && (e as any).effects.some((eff: any) => eff.type === 'evasive'))
    ) || target.keywords?.includes('Evasive');

    if (targetIsEvasive) {
        const attackerIsEvasive = attacker.parsedEffects?.some(e =>
            e.action === 'keyword_evasive' ||
            (e as any).keyword === 'evasive' ||
            ((e as any).effects && (e as any).effects.some((eff: any) => eff.type === 'evasive'))
        ) || attacker.keywords?.includes('Evasive');

        if (!attackerIsEvasive) return false;
    }

    return true;
}

/**
 * Execute a challenge between two characters
 * 
 * @param turnManager - The TurnManager instance
 * @param player - The player initiating the challenge
 * @param attackerId - Instance ID of the attacking character
 * @param targetId - Instance ID of the target character
 * @param payload - Optional: Additional data
 * @returns True if challenge was successful
 */
export async function executeChallenge(
    turnManager: TurnManager,
    player: PlayerState,
    attackerId: string,
    targetId: string,
    payload?: any
): Promise<boolean> {
    const logger = turnManager.logger;
    const game = turnManager.game;
    const abilitySystem = turnManager.abilitySystem;

    const attacker = player.play.find(c => c.instanceId === attackerId);
    if (!attacker) {
        logger.debug('Attacker not found.');
        return false;
    }

    // Find opponent
    const opponentId = Object.keys(game.state.players).find(id => id !== player.id);
    if (!opponentId) return false;
    const opponent = game.getPlayer(opponentId);

    const target = opponent.play.find(c => c.instanceId === targetId);
    if (!target) {
        logger.debug('Target not found.');
        return false;
    }

    // CRITICAL RULE: Can only challenge characters or locations
    if (target.type !== 'Character' && target.type !== 'Location') {
        logger.warn(`[${player.name}] Cannot challenge ${target.type} "${target.name}" - only characters and locations can be challenged.`);
        return false;
    }

    logger.action(player.name, `Challenge`, {
        type: 'challenge_start',
        attacker,
        defender: target,
        attackerName: attacker.fullName || attacker.name,
        defenderName: target.fullName || target.name
    });

    // Rule: Attacker must be ready
    if (!attacker.ready) {
        logger.debug(`${attacker.name} is exerted and cannot challenge.`);
        return false;
    }

    // Rule: Attacker must be dry (unless Rush)
    const hasRush = attacker.parsedEffects?.some(e => e.action === 'keyword_rush');
    if (attacker.turnPlayed === game.state.turnCount && !hasRush) {
        logger.debug(`${attacker.name} is drying and cannot challenge.`);
        return false;
    }

    // Rule: Target must be exerted (Locations can be challenged even if ready)
    const canChallengeReadyAbility = attacker.parsedEffects?.some(e => e.action === 'can_challenge_ready_characters');
    const isLocation = target.type === 'Location';

    if (target.ready && !isLocation && !canChallengeReadyAbility) {
        logger.debug(`${target.name} is ready and cannot be challenged.`);
        return false;
    }

    // Rule: Bodyguard
    const opponentBodyguards = opponent.play.filter(c => {
        if (c.ready) return false;
        return c.parsedEffects?.some((e: any) =>
            e.action === 'keyword_bodyguard' ||
            e.keyword === 'bodyguard' ||
            (e.type === 'static' && e.effects?.some((ef: any) => ef.type === 'bodyguard'))
        );
    });

    if (opponentBodyguards.length > 0) {
        const targetHasBodyguard = target.parsedEffects?.some((e: any) =>
            e.action === 'keyword_bodyguard' ||
            e.keyword === 'bodyguard' ||
            (e.type === 'static' && e.effects?.some((ef: any) => ef.type === 'bodyguard'))
        );
        if (!targetHasBodyguard) {
            logger.debug(`[${player.name}] Must challenge a Bodyguard character (e.g., ${opponentBodyguards[0].name}).`);
            return false;
        }
    }

    // Rule: Evasive
    const targetIsEvasive = target.parsedEffects?.some(e =>
        e.action === 'keyword_evasive' ||
        (e as any).keyword === 'evasive' ||
        ((e as any).effects && (e as any).effects.some((eff: any) => eff.type === 'evasive'))
    ) || target.keywords?.includes('Evasive');

    if (targetIsEvasive) {
        const attackerIsEvasive = attacker.parsedEffects?.some(e =>
            e.action === 'keyword_evasive' ||
            (e as any).keyword === 'evasive' ||
            ((e as any).effects && (e as any).effects.some((eff: any) => eff.type === 'evasive'))
        ) || attacker.keywords?.includes('Evasive');

        if (!attackerIsEvasive) {
            logger.debug(`[${player.name}] ${target.name} has Evasive and can only be challenged by characters with Evasive.`);
            return false;
        }
    }

    // Exert Attacker (unless they have Alert)
    const hasAlert = attacker.keywords?.includes('Alert') ||
        attacker.parsedEffects?.some((e: any) =>
            e.keyword === 'alert' ||
            e.type === 'alert' ||
            e.action === 'keyword_alert'
        );

    if (!hasAlert) {
        attacker.ready = false;

        // Emit CARD_EXERTED event (fire-and-forget)
        abilitySystem.emitEvent(GameEvent.CARD_EXERTED, {
            event: GameEvent.CARD_EXERTED,
            card: attacker,
            sourceCard: attacker,
            player: player,
            reason: 'challenge',
            timestamp: Date.now()
        }).catch(e => logger.error('Error emitting CARD_EXERTED', e));
    } else {
        logger.effect(attacker.name, `Alert: Stays ready after challenging`);
    }

    // Emit CARD_CHALLENGED event
    logger.info(`📢 [Event] Emitting CARD_CHALLENGED for ${target.name} (challenged by ${attacker.name})`);
    await abilitySystem.emitEvent(GameEvent.CARD_CHALLENGED, {
        card: target,
        player: opponent,
        challenger: attacker,
        challengingPlayer: player
    });

    // Calculate damage
    let attackerDmg = attacker.strength || 0;
    const targetDmg = target.strength || 0;

    // Apply Challenger Bonus
    const challengerEffect = attacker.parsedEffects?.find((e: any) =>
        e.action === 'keyword_challenger' ||
        e.keyword === 'challenger' ||
        (e.type === 'static' && e.keyword === 'challenger')
    );
    if (challengerEffect) {
        const bonus = (challengerEffect as any).amount || (challengerEffect as any).value || 0;
        attackerDmg += bonus;
    }

    // Check for granted Challenger effects
    const activeChallengerEffects = game.state.activeEffects.filter(e =>
        e.type === 'modification' &&
        e.targetCardIds?.includes(attacker.instanceId) &&
        e.modification?.challenger
    );
    activeChallengerEffects.forEach(e => {
        attackerDmg += (e.modification?.challenger || 0);
    });

    // Calculate Resist
    const targetResist = target.meta?.resist || 0;
    const attackerResist = attacker.meta?.resist || 0;
    const damageToTarget = Math.max(0, attackerDmg - targetResist);
    const damageToAttacker = Math.max(0, targetDmg - attackerResist);

    logger.action(player.name,
        `Combat: ${attacker.name} ⚔️ ${target.name}`,
        {
            type: 'challenge_result',
            attacker,
            defender: target,
            damageToAttacker,
            damageToTarget,
            attackerDmg,
            targetDmg,
            attackerResist,
            targetResist
        }
    );

    // Apply Damage
    turnManager.applyDamage(player, attacker, targetDmg, target.instanceId);
    turnManager.applyDamage(opponent, target, attackerDmg, attacker.instanceId);

    // Emit CARD_DEALS_DAMAGE events (for triggers like Mulan)
    if (attackerDmg > 0) {
        // Attacker deals damage to target
        await abilitySystem.emitEvent(GameEvent.CARD_DEALS_DAMAGE, {
            card: attacker,
            target: target,
            amount: attackerDmg,
            source: 'challenge',
            player: player
        });
    }

    if (targetDmg > 0) {
        // Defender deals damage to attacker
        await abilitySystem.emitEvent(GameEvent.CARD_DEALS_DAMAGE, {
            card: target,
            target: attacker,
            amount: targetDmg,
            source: 'challenge',
            player: opponent
        });
    }

    turnManager.recalculateEffects();

    // Emit CARD_CHALLENGES event
    await abilitySystem.emitEvent(GameEvent.CARD_CHALLENGES, {
        card: attacker,
        target: target,
        player: player
    });

    // Resolve queued triggered abilities (The Bag)
    await abilitySystem.resolveQueuedAbilities((player: any, abilities: any[]) => {
        const randomIndex = Math.floor(Math.random() * abilities.length);
        return Promise.resolve(abilities[randomIndex]);
    });

    // Handle Vanish
    const hasVanish = attacker.keywords?.includes('Vanish') ||
        attacker.parsedEffects?.some((e: any) =>
            e.keyword === 'vanish' ||
            e.type === 'vanish' ||
            e.action === 'keyword_vanish'
        );

    if (hasVanish) {
        const stillInPlay = player.play.some(c => c.instanceId === attacker.instanceId);
        if (stillInPlay) {
            player.play = player.play.filter(c => c.instanceId !== attacker.instanceId);
            attacker.zone = ZoneType.Hand;
            attacker.ready = true;
            attacker.damage = 0;
            player.hand.push(attacker);
            logger.effect(attacker.name, `Vanish: Returned to hand after challenging`);
        }
    }

    // Check Banishment
    await checkBanishment(turnManager, player, attacker, target);
    await checkBanishment(turnManager, opponent, target, attacker);

    return true;
}
