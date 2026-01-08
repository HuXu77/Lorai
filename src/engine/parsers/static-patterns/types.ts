/**
 * Pattern Table Types and Infrastructure
 * 
 * Each pattern handler is a function that takes text and returns:
 * - null if the pattern doesn't match
 * - an array of effects if it matches
 */

export interface PatternHandler {
    /** Pattern name for debugging */
    name: string;
    /** The regex pattern to match */
    pattern: RegExp;
    /** Handler function that processes the match and returns effects */
    handle: (text: string, match: RegExpMatchArray) => any[] | null;
    /** Optional priority (higher = checked first) */
    priority?: number;
}

export interface PatternCategory {
    name: string;
    patterns: PatternHandler[];
}

/**
 * Try to match text against a list of pattern handlers
 * Returns the effects from the first matching pattern, or null if none match
 */
export function tryPatterns(text: string, patterns: PatternHandler[]): any[] | null {
    for (const handler of patterns) {
        const match = text.match(handler.pattern);
        if (match) {
            const result = handler.handle(text, match);
            if (result !== null) {
                return result;
            }
        }
    }
    return null;
}

/**
 * Sort patterns by priority (higher first)
 */
export function sortByPriority(patterns: PatternHandler[]): PatternHandler[] {
    return [...patterns].sort((a, b) => (b.priority || 0) - (a.priority || 0));
}
