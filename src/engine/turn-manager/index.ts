/**
 * Turn Manager Helper Modules
 * 
 * This directory contains decomposed helper functions extracted from
 * the TurnManager class for better testability and maintainability.
 * 
 * Each module contains pure functions that can be tested in isolation.
 * Uses loose typing (any) for runtime card state compatibility since
 * CardInstance has many runtime-added properties not in static interface.
 */

export * from './phase-helpers';
export * from './combat-helpers';
export * from './quest-helpers';
export * from './card-play-helpers';

// Export all helper functions grouped by category
import * as phaseHelpers from './phase-helpers';
import * as combatHelpers from './combat-helpers';
import * as questHelpers from './quest-helpers';
import * as cardPlayHelpers from './card-play-helpers';

export const helpers = {
    phase: phaseHelpers,
    combat: combatHelpers,
    quest: questHelpers,
    cardPlay: cardPlayHelpers
};

/**
 * Get statistics about extracted helpers
 */
export function getHelperStats() {
    return {
        modules: 4,
        totalFunctions: 19,
        breakdown: {
            phase: 4,
            combat: 5,
            quest: 4,
            cardPlay: 6
        }
    };
}
