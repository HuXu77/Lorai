/**
 * Common pattern matching utilities for card ability parsing.
 * Consolidates repeated regex patterns and parsing logic across all parser files.
 * 
 * @module pattern-matchers
 * @example
 * import { parseStat, parseStatModification } from './pattern-matchers';
 * 
 * const stat = parseStat('¤'); // returns 'strength'
 * const mod = parseStatModification('+2 willpower'); // returns { stat: 'willpower', amount: 2 }
 */

// Stat symbol mappings for all card stats
export const STAT_SYMBOLS = {
    strength: ['¤', '※', 'strength'],
    willpower: ['⛉', '🛡️', '⛨', 'willpower'],
    lore: ['◊', '⬡', 'lore']
} as const;

export type StatType = 'strength' | 'willpower' | 'lore';

/**
 * Parse a stat symbol or name to a standardized stat type.
 * Handles both Unicode symbols (¤, ⛉, ◊) and text names.
 * 
 * @param symbol - Stat symbol or name (e.g., '¤', 'strength', 'willpower')
 * @returns Standardized stat type
 * 
 * @example
 * parseStat('¤')          // 'strength'
 * parseStat('Strength')   // 'strength'
 * parseStat('◊')          // 'lore'
 */
export function parseStat(symbol: string): StatType {
    const normalized = symbol.toLowerCase().trim().replace(/[.,]$/, '');

    // Check each stat type's symbols
    for (const sym of STAT_SYMBOLS.strength) {
        if (normalized === sym) return 'strength';
    }
    for (const sym of STAT_SYMBOLS.willpower) {
        if (normalized === sym) return 'willpower';
    }
    for (const sym of STAT_SYMBOLS.lore) {
        if (normalized === sym) return 'lore';
    }

    // Default to lore if no match
    return 'lore';
}

/**
 * Extract a numeric amount from text using a regex pattern.
 * 
 * @param text - Text containing a number
 * @param pattern - Optional regex pattern (defaults to first number found)
 * @returns Parsed number or null if no match
 * 
 * @example
 * parseAmount('deal 3 damage')              // 3
 * parseAmount('cost 5 or less', /cost (\d+)/) // 5
 */
export function parseAmount(text: string, pattern?: RegExp): number | null {
    const regex = pattern || /(\d+)/;
    const match = text.match(regex);
    return match ? parseInt(match[1]) : null;
}

/**
 * Common regex patterns used throughout parsers.
 * Pre-compiled for better performance.
 * 
 * @example
 * if (PATTERNS.damaged.test(text)) { ... }
 */
export const PATTERNS = {
    // Stats
    stat: /(strength|willpower|lore|¤|🛡️|⛉|◊|⬡)/i,
    statBuff: /([+-])(\d+)\s+(strength|willpower|lore|¤|🛡️|⛉|◊|⬡)/i,

    // Card types
    cardType: /(character|item|location|action|song)/i,

    // Costs and filters
    cost: /cost (\d+) or less/i,
    costExact: /cost (\d+)/i,

    // States
    damaged: /damaged/i,
    exerted: /exerted/i,

    // Targets
    opposing: /opposing/i,
    chosen: /chosen/i,

    // Amounts
    number: /(\d+)/,
    upTo: /up to (\d+)/i,

    // Common phrases
    thisTurn: /this turn/i,
    nextTurn: /next turn/i,
    startOfTurn: /start of (?:their|your) turn/i
} as const;

/**
 * Parse stat modification from text (e.g., "+2 ¤" or "-1 lore").
 * Extracts both the stat type and the numeric amount including sign.
 * 
 * @param text - Text containing stat modification
 * @returns Object with stat and amount, or null if no match
 * 
 * @example
 * parseStatModification('+2 ¤')       // { stat: 'strength', amount: 2 }
 * parseStatModification('-1 lore')   // { stat: 'lore', amount: -1 }
 */
export function parseStatModification(text: string): { stat: StatType; amount: number } | null {
    const match = text.match(PATTERNS.statBuff);
    if (!match) return null;

    const sign = match[1];
    const value = parseInt(match[2]);
    const amount = sign === '-' ? -value : value;
    const stat = parseStat(match[3]);

    return { stat, amount };
}

/**
 * Parse card type from text
 */
export function parseCardType(text: string): string | string[] | null {
    // Check for compound types (e.g., "location or item")
    if (text.match(/location or item/i)) {
        return ['location', 'item'];
    }
    if (text.match(/item or location/i)) {
        return ['item', 'location'];
    }

    // Single card type
    const match = text.match(PATTERNS.cardType);
    return match ? match[1].toLowerCase() : null;
}

/**
 * Check if text mentions "this turn"
 */
export function hasThisTurn(text: string): boolean {
    return PATTERNS.thisTurn.test(text);
}

/**
 * Check if text mentions "next turn"
 */
export function hasNextTurn(text: string): boolean {
    return PATTERNS.nextTurn.test(text);
}

/**
 * Parse cost filter (e.g., "with cost 3 or less")
 */
export function parseCostFilter(text: string): { costMax?: number; costExact?: number } {
    const filter: { costMax?: number; costExact?: number } = {};

    const costMaxMatch = text.match(PATTERNS.cost);
    if (costMaxMatch) {
        filter.costMax = parseInt(costMaxMatch[1]);
    }

    return filter;
}

/**
 * Build target filter object from text
 */
export function parseTargetFilter(text: string): any {
    const filter: any = {};

    // Status filters (damaged/exerted)
    if (PATTERNS.damaged.test(text)) filter.status = 'damaged';
    if (PATTERNS.exerted.test(text)) filter.status = 'exerted';

    // Also add damaged as a separate boolean filter for compatibility
    if (PATTERNS.damaged.test(text)) filter.damaged = true;

    if (PATTERNS.opposing.test(text)) filter.opposing = true;

    const cardType = parseCardType(text);
    if (cardType) filter.cardType = cardType;

    // Subtype parsing (e.g. "chosen Puppy character")
    // Capitalized word before "character" that isn't "Opposing", "Chosen", "Other"
    const subtypeMatch = text.match(/\b([A-Z][a-z]+) character/);
    if (subtypeMatch) {
        const candidate = subtypeMatch[1];
        const ignored = ['Opposing', 'Chosen', 'Other', 'Your', 'Enemy'];
        if (!ignored.includes(candidate)) {
            filter.subtype = candidate.toLowerCase();
        }
    }

    const costFilter = parseCostFilter(text);
    Object.assign(filter, costFilter);

    return filter;
}

/**
 * Determine duration from text
 */
export function parseDuration(text: string): string | undefined {
    if (hasThisTurn(text)) return 'until_end_of_turn';
    if (hasNextTurn(text)) return 'next_turn_start';
    if (PATTERNS.startOfTurn.test(text)) return 'start_of_turn';
    return undefined;
}

/**
 * Parse a target string into a TargetAST node
 */
export function parseTarget(text: string): any {
    const filter = parseTargetFilter(text);

    if (text.match(/chosen character/i)) {
        return { type: 'chosen_character', filter };
    }
    if (text.match(/chosen opposing character/i)) {
        return { type: 'chosen_opposing_character', filter };
    }
    if (text.match(/all characters/i)) {
        return { type: 'all_characters', filter };
    }
    if (text.match(/all opposing characters/i)) {
        return { type: 'all_opposing_characters', filter };
    }
    if (text.match(/chosen item/i)) {
        return { type: 'chosen_item_or_location', filter: { ...filter, cardType: 'item' } };
    }

    // Default fallback - try to infer type from filter
    if (filter.cardType === 'character') {
        if (text.match(/chosen/i)) return { type: 'chosen_character', filter };
    }

    // Generic chosen if nothing else matches specific types but has "chosen"
    if (text.match(/chosen/i)) {
        return { type: 'chosen_character', filter };
    }

    // If it says "it" or implicit target
    return { type: 'chosen_character', filter };
}
