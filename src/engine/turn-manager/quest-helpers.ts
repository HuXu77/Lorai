/**
 * Quest Helpers
 * 
 * Pure functions for quest validation and lore calculations.
 * Uses loose typing for runtime card state compatibility.
 */

export interface QuestValidation {
    valid: boolean;
    reason?: string;
}

/**
 * Check if a character can quest
 */
export function canQuest(
    card: any,
    cantQuestChecker?: (card: any) => boolean
): QuestValidation {
    // Must not be exerted
    const isExerted = card.exerted === true || card.ready === false;
    if (isExerted) {
        return { valid: false, reason: 'Character is exerted' };
    }

    // Must be "dry" (not just played)
    if (card.playedThisTurn) {
        return { valid: false, reason: 'Character was just played this turn' };
    }

    // Check custom restrictions callback
    if (cantQuestChecker && cantQuestChecker(card)) {
        return { valid: false, reason: 'Character cannot quest due to restrictions' };
    }

    // Check card-level restriction flag
    if (card.cantQuest) {
        return { valid: false, reason: 'Character cannot quest' };
    }

    return { valid: true };
}

/**
 * Calculate base lore value for a character
 */
export function getBaseLore(card: any): number {
    return card.currentLore ?? card.lore ?? 0;
}

/**
 * Check if gaining lore would win the game
 */
export function wouldWinGame(
    currentLore: number,
    loreGain: number,
    winThreshold: number = 20
): boolean {
    return currentLore + loreGain >= winThreshold;
}

/**
 * Evaluate a simple condition for lore calculations
 */
export function evaluateLoreCondition(
    condition: any,
    card: any
): boolean {
    if (!condition) return true;

    switch (condition.type) {
        case 'has_card_under':
            return (card.cardsUnder?.length || card.boostedCards?.length || 0) > 0;

        case 'self_exerted':
            return card.exerted === true || card.ready === false;

        case 'self_has_damage':
            return (card.damage || 0) > 0;

        case 'self_no_damage':
            return (card.damage || 0) === 0;

        case 'at_location':
            return card.locationId !== undefined;

        default:
            return false;
    }
}
