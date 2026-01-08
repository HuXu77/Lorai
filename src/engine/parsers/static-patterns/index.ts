/**
 * Static Pattern Categories Index
 * 
 * Re-exports all pattern categories for easy importing
 */

export * from './types';
export { costPatterns } from './cost-patterns';
export { restrictionPatterns } from './restriction-patterns';
export { statModificationPatterns } from './stat-patterns';
export { keywordGrantPatterns } from './keyword-patterns';
export { conditionalPatterns } from './conditional-patterns';
export { actionPatterns } from './action-patterns';

import { PatternHandler, sortByPriority, tryPatterns } from './types';
import { costPatterns } from './cost-patterns';
import { restrictionPatterns } from './restriction-patterns';
import { statModificationPatterns } from './stat-patterns';
import { keywordGrantPatterns } from './keyword-patterns';
import { conditionalPatterns } from './conditional-patterns';
import { actionPatterns } from './action-patterns';

/**
 * All non-recursive static effect patterns combined, sorted by priority
 * These patterns can be executed directly without recursive parsing
 */
export const directPatterns: PatternHandler[] = sortByPriority([
    ...costPatterns,
    ...restrictionPatterns,
    ...statModificationPatterns,
    ...keywordGrantPatterns,
    ...actionPatterns
]);

/**
 * Conditional wrapper patterns that need recursive parsing
 */
export const recursivePatterns: PatternHandler[] = sortByPriority([
    ...conditionalPatterns
]);

/**
 * All static effect patterns combined
 */
export const allStaticPatterns: PatternHandler[] = sortByPriority([
    ...directPatterns,
    ...recursivePatterns
]);

/**
 * Pattern categories for debugging/testing
 */
export const patternCategories = {
    cost: costPatterns,
    restriction: restrictionPatterns,
    statModification: statModificationPatterns,
    keywordGrant: keywordGrantPatterns,
    conditional: conditionalPatterns,
    action: actionPatterns
};

/**
 * Try to match text against direct (non-recursive) patterns
 */
export function tryDirectPatterns(text: string): any[] | null {
    return tryPatterns(text, directPatterns);
}

/**
 * Get pattern statistics
 */
export function getPatternStats() {
    return {
        total: allStaticPatterns.length,
        direct: directPatterns.length,
        recursive: recursivePatterns.length,
        byCategory: {
            cost: costPatterns.length,
            restriction: restrictionPatterns.length,
            statModification: statModificationPatterns.length,
            keywordGrant: keywordGrantPatterns.length,
            conditional: conditionalPatterns.length,
            action: actionPatterns.length
        }
    };
}
