/**
 * Turn Phase Helpers
 * 
 * Pure functions for phase logic that can be called by TurnManager.
 * Uses loose typing (any) because runtime CardInstance objects have
 * additional properties not in the static interface (exerted, cantReady, etc.)
 */

export interface PhaseAction {
    type: 'ready' | 'set_ink' | 'draw' | 'trigger_effect';
    cardId?: string;
    data?: any;
}

/**
 * Get cards that should be readied during Ready Phase
 * Excludes cards with "can't ready" restrictions
 * 
 * @param cards - Array of cards to check (field, items, locations)
 * @param cantReadyChecker - Function to check if card has "can't ready" restriction
 */
export function getCardsToReady(
    cards: any[],
    cantReadyChecker?: (card: any) => boolean
): any[] {
    const cardsToReady: any[] = [];

    for (const card of cards) {
        // Check both 'exerted' and 'ready' since models use different conventions
        const isExerted = card.exerted === true || card.ready === false;
        if (isExerted && (!cantReadyChecker || !cantReadyChecker(card))) {
            cardsToReady.push(card);
        }
    }

    return cardsToReady;
}

/**
 * Get count of exerted ink that should be readied during Set Phase
 */
export function getExertedInkCount(inkwell: any[]): number {
    return inkwell.filter(ink => ink.exerted === true).length;
}

/**
 * Check if player can draw during Draw Phase
 * First player's first turn skips draw
 */
export function canDrawOnTurn(
    isFirstPlayer: boolean,
    turnNumber: number
): boolean {
    return !(isFirstPlayer && turnNumber === 1);
}

/**
 * Get number of cards to draw during Draw Phase
 */
export function getDrawCount(additionalDraws: number = 0): number {
    return 1 + additionalDraws;
}
