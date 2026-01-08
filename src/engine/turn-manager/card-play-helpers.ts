/**
 * Card Play Helpers
 * 
 * Pure functions for card playing validation and cost calculations.
 * Uses loose typing for runtime card state compatibility.
 */

export interface PlayValidation {
    valid: boolean;
    reason?: string;
}

/**
 * Check if a card can be played based on ink cost
 */
export function canAffordCard(
    cardCost: number,
    availableInk: number
): PlayValidation {
    if (availableInk < cardCost) {
        return {
            valid: false,
            reason: `Not enough ink (need ${cardCost}, have ${availableInk})`
        };
    }
    return { valid: true };
}

/**
 * Check if a character can be shifted onto a target
 */
export function canShift(
    shiftingCard: any,
    targetCard: any
): PlayValidation {
    // Cards must share a name (first part of fullName)
    const shiftingName = shiftingCard.name?.split(' - ')[0];
    const targetName = targetCard.name?.split(' - ')[0];

    if (shiftingName !== targetName) {
        return { valid: false, reason: 'Cards must share the same character name to Shift' };
    }

    return { valid: true };
}

/**
 * Get the Shift cost for a card (if it has Shift keyword)
 */
export function getShiftCost(card: any): number | null {
    const keywords = card.keywords || card.baseKeywords || [];

    for (const keyword of keywords) {
        if (typeof keyword === 'string') {
            const match = keyword.match(/shift\s+(\d+)/i);
            if (match) {
                return parseInt(match[1]);
            }
        }
    }

    return null;
}

/**
 * Check if a song can be sung by a character
 * 
 * @param songCost - Cost of the song
 * @param singer - The character attempting to sing
 * @param getSingValue - Function to get the sing value of a character
 */
export function canSingSong(
    songCost: number,
    singer: any,
    getSingValue: (card: any) => number
): PlayValidation {
    const singerValue = getSingValue(singer);

    if (singerValue < songCost) {
        return {
            valid: false,
            reason: `Singer cost (${singerValue}) is less than song cost (${songCost})`
        };
    }

    // Singer must not be exerted
    const isExerted = singer.exerted === true || singer.ready === false;
    if (isExerted) {
        return { valid: false, reason: 'Singer is already exerted' };
    }

    // Check "can't sing" restrictions
    if (singer.cantSing) {
        return { valid: false, reason: 'Character cannot sing songs' };
    }

    return { valid: true };
}

/**
 * Calculate available ink for a player
 */
export function getAvailableInk(inkwell: any[]): number {
    return inkwell.filter(ink => !ink.exerted).length;
}

/**
 * Check if a card is inkable
 */
export function isInkable(card: any): boolean {
    // Check inkwell property (explicitly set)
    if (card.inkwell === true) {
        return true;
    }
    if (card.inkwell === false) {
        return false;
    }

    // Default: non-character cards are generally inkable
    const cardType = (card.type || '').toLowerCase();
    return cardType !== 'character';
}
