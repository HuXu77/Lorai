/**
 * Combat Helpers
 * 
 * Pure functions for combat validation and calculations.
 * Uses loose typing for runtime card state compatibility.
 */

export interface ChallengeValidation {
    valid: boolean;
    reason?: string;
}

export interface CombatResult {
    attackerDamageDealt: number;
    defenderDamageDealt: number;
    attackerBanished: boolean;
    defenderBanished: boolean;
}

/**
 * Check if a character can initiate a challenge
 * 
 * @param attacker - The attacking card
 * @param hasRush - Whether attacker has Rush keyword
 */
export function canInitiateChallenge(
    attacker: any,
    hasRush: boolean = false
): ChallengeValidation {
    // Must not be exerted (check both naming conventions)
    if (attacker.exerted === true || attacker.ready === false) {
        return { valid: false, reason: 'Attacker is exerted' };
    }

    // Must be "dry" (not just played) unless has Rush
    if (attacker.playedThisTurn && !hasRush) {
        return { valid: false, reason: 'Character was just played and does not have Rush' };
    }

    // Check for restrictions
    if (attacker.cantChallenge) {
        return { valid: false, reason: 'Character cannot challenge' };
    }

    return { valid: true };
}

/**
 * Check if a target can be challenged
 * 
 * @param target - The defending card
 * @param attackerHasEvasive - Whether attacker has Evasive
 * @param attackerCanChallengeReady - Whether attacker can challenge ready characters
 */
export function canBeChallenged(
    target: any,
    attackerHasEvasive: boolean = false,
    attackerCanChallengeReady: boolean = false
): ChallengeValidation {
    // Target must be exerted (unless attacker can challenge ready characters)
    const targetIsExerted = target.exerted === true || target.ready === false;
    if (!targetIsExerted && !attackerCanChallengeReady) {
        return { valid: false, reason: 'Target is not exerted' };
    }

    // Check Evasive keyword
    const targetKeywords = target.keywords || [];
    if (targetKeywords.some((k: string) => k.toLowerCase().includes('evasive')) && !attackerHasEvasive) {
        return { valid: false, reason: 'Target has Evasive and attacker does not' };
    }

    return { valid: true };
}

/**
 * Check if a Bodyguard is protecting the target
 */
export function getBlockingBodyguard(
    target: any,
    opponentField: any[]
): any | null {
    for (const card of opponentField) {
        if (card.instanceId !== target.instanceId) {
            const isExerted = card.exerted === true || card.ready === false;
            const hasBodyguard = (card.keywords || []).some(
                (k: string) => k.toLowerCase().includes('bodyguard')
            );
            if (isExerted && hasBodyguard) {
                return card;
            }
        }
    }
    return null;
}

/**
 * Calculate combat damage between two cards
 */
export function calculateCombatDamage(
    attacker: any,
    defender: any,
    attackerChallengerBonus: number = 0
): CombatResult {
    // Get effective stats (currentX takes precedence over base X)
    const attackerStrength = (attacker.currentStrength ?? attacker.strength ?? 0) + attackerChallengerBonus;
    const defenderStrength = defender.currentStrength ?? defender.strength ?? 0;

    const attackerWillpower = attacker.currentWillpower ?? attacker.willpower ?? 0;
    const defenderWillpower = defender.currentWillpower ?? defender.willpower ?? 0;

    // Damage happens simultaneously
    const damageToDefender = attackerStrength;
    const damageToAttacker = defenderStrength;

    // Check for banishment (total damage >= willpower)
    const attackerTotalDamage = (attacker.damage || 0) + damageToAttacker;
    const defenderTotalDamage = (defender.damage || 0) + damageToDefender;

    return {
        attackerDamageDealt: damageToDefender,
        defenderDamageDealt: damageToAttacker,
        attackerBanished: attackerTotalDamage >= attackerWillpower,
        defenderBanished: defenderTotalDamage >= defenderWillpower
    };
}

/**
 * Apply Resist keyword damage reduction
 */
export function applyResist(damage: number, resistValue: number): number {
    return Math.max(0, damage - resistValue);
}
