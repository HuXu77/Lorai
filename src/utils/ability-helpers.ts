/**
 * Ability Helpers - Shared utilities for ability detection and parsing
 * 
 * This module consolidates ability-related logic used across UI components
 * and the game engine. It provides a single source of truth for:
 * - Detecting keywords (Boost, Shift, Singer, etc.)
 * - Extracting ability costs
 * - Parsing ability prompts
 */

import { CardInstance } from '../engine/models';

// ============================================================================
// TYPES
// ============================================================================

export interface ActivatedAbility {
    index: number;
    type: string;
    cost?: number;
    inkCost?: number;
    exertCost?: boolean;
    discardCost?: number;
    name?: string;
    keyword?: string;
    text?: string;
    effects: any[];
}

export interface StatModification {
    statType: 'strength' | 'willpower' | 'lore';
    amount: number;
}

// ============================================================================
// BOOST DETECTION
// ============================================================================

/**
 * Get the Boost cost from a card's parsed effects.
 * Boost is an activated ability that places a card from deck under this character.
 * 
 * @param card - The card to check
 * @returns The ink cost for Boost, or null if card doesn't have Boost
 */
export function getBoostCost(card: CardInstance): number | null {
    if (!card.parsedEffects) return null;

    for (const effect of card.parsedEffects as any[]) {
        // Check for keyword='boost' and type='activated' (how keyword-parser creates it)
        if (effect.keyword === 'boost' && effect.type === 'activated') {
            // keyword-parser sets cost: { ink: N }
            if (effect.cost?.ink) return effect.cost.ink;
            // Also check costs array format
            if (effect.costs && Array.isArray(effect.costs)) {
                const inkCost = effect.costs.find((c: any) => c.type === 'ink');
                if (inkCost?.amount) return inkCost.amount;
            }
        }

        // Boost parses as activated ability with inner effect { type: 'boost', cost: N }
        if (effect.effects && Array.isArray(effect.effects)) {
            for (const eff of effect.effects) {
                if (eff.type === 'boost' && typeof eff.cost === 'number') {
                    return eff.cost;
                }
            }
        }
        // Also check direct boost type (alternative parsing)
        if (effect.type === 'boost' && typeof effect.cost === 'number') {
            return effect.cost;
        }
        // Check action field for boost keyword
        if (effect.action?.toLowerCase().includes('boost') && typeof effect.cost?.ink === 'number') {
            return effect.cost.ink;
        }

        // Check for keyword type 'Boost' (Flynn Rider style / Phase 2 parser)
        if (effect.type === 'keyword' && effect.keyword === 'Boost' && typeof effect.keywordValueNumber === 'number') {
            return effect.keywordValueNumber;
        }
    }
    return null;
}

/**
 * Check if a card has the Boost ability.
 */
export function hasBoost(card: CardInstance): boolean {
    return getBoostCost(card) !== null;
}

// ============================================================================
// SHIFT DETECTION
// ============================================================================

/**
 * Get the Shift cost from a card's parsed effects.
 * 
 * @param card - The card to check
 * @returns The ink cost for Shift, or null if card doesn't have Shift
 */
export function getShiftCost(card: CardInstance): number | null {
    if (!card.parsedEffects) return null;

    for (const effect of card.parsedEffects as any[]) {
        // Check for keyword_shift action
        if (effect.action === 'keyword_shift' && typeof effect.shiftCost === 'number') {
            return effect.shiftCost;
        }
        // Check for shift in effects array
        if (effect.effects && Array.isArray(effect.effects)) {
            for (const eff of effect.effects) {
                if (eff.type === 'shift' && typeof eff.cost === 'number') {
                    return eff.cost;
                }
            }
        }
        // Check type directly
        if (effect.type === 'shift' && typeof effect.cost === 'number') {
            return effect.cost;
        }
    }
    return null;
}

/**
 * Check if a card has the Shift ability.
 */
export function hasShift(card: CardInstance): boolean {
    return getShiftCost(card) !== null;
}

// ============================================================================
// KEYWORD DETECTION
// ============================================================================

/**
 * Check if a card has a specific ability keyword in its parsed effects.
 * This handles various parsing structures:
 * - Direct keyword type (e.g., { type: 'keyword', keyword: 'rush' })
 * - Action-based (e.g., { action: 'keyword_rush' })
 * - Nested in effects array
 * 
 * @param card - The card to check
 * @param keyword - The keyword to look for (case-insensitive)
 * @returns True if the card has the keyword
 */
export function hasAbilityKeyword(card: CardInstance, keyword: string): boolean {
    const keywordLower = keyword.toLowerCase();
    const cardAny = card as any;

    // Check direct keywords array (if populated)
    if (cardAny.keywords && Array.isArray(cardAny.keywords)) {
        if (cardAny.keywords.some((k: string) => k.toLowerCase().includes(keywordLower))) {
            return true;
        }
    }

    // Check baseKeywords array
    if (cardAny.baseKeywords && Array.isArray(cardAny.baseKeywords)) {
        if (cardAny.baseKeywords.some((k: string) => k.toLowerCase().includes(keywordLower))) {
            return true;
        }
    }

    if (!card.parsedEffects) return false;

    for (const effect of card.parsedEffects as any[]) {
        // NEW: Check for keyword field in activated abilities (e.g., keyword: 'boost', type: 'activated')
        if (effect.keyword && typeof effect.keyword === 'string') {
            if (effect.keyword.toLowerCase() === keywordLower) {
                return true;
            }
        }

        // Check action field (e.g., 'keyword_boost', 'keyword_rush')
        if (effect.action?.toLowerCase().includes(`keyword_${keywordLower}`)) {
            return true;
        }
        if (effect.action?.toLowerCase() === keywordLower) {
            return true;
        }

        // Check type field for keyword type
        if (effect.type === 'keyword' && effect.keyword?.toLowerCase() === keywordLower) {
            return true;
        }

        // Check direct type match
        if (effect.type?.toLowerCase() === keywordLower) {
            return true;
        }

        // Check nested effects array
        if (effect.effects && Array.isArray(effect.effects)) {
            for (const eff of effect.effects) {
                if (eff.type?.toLowerCase() === keywordLower) {
                    return true;
                }
            }
        }
    }

    return false;
}

// ============================================================================
// SONG DETECTION
// ============================================================================

/**
 * Check if a card is a Song (based on subtypes).
 */
export function isSong(card: CardInstance): boolean {
    return (card.subtypes || []).some((s: string) => s.toLowerCase() === 'song');
}

/**
 * Get characters that can sing a given song.
 * A character can sing if:
 * - It's in play
 * - It's ready (not exerted)
 * - It's not drying (wasn't played this turn)
 * - Its cost is >= the song's cost (or has Singer keyword)
 * 
 * @param song - The song card
 * @param characters - List of characters in play
 * @param currentTurn - Current turn number (for drying check)
 * @returns List of eligible singers
 */
export function getEligibleSingers(
    song: CardInstance,
    characters: CardInstance[],
    currentTurn: number
): CardInstance[] {
    return characters.filter(c => {
        if (String(c.type).toLowerCase() !== 'character') return false;
        if (!c.ready) return false;
        if (c.turnPlayed === currentTurn) return false;

        // Calculate singing value (max of cost or Singer ability)
        let singingValue = c.cost;
        if (c.parsedEffects) {
            const singerEffect = c.parsedEffects.find((e: any) =>
                e.keyword === 'singer' ||
                (e.type === 'static' && e.keyword === 'singer')
            );
            if (singerEffect) {
                const val = (singerEffect as any).value || (singerEffect as any).amount || parseInt((singerEffect as any).keywordValue);
                if (val) singingValue = Math.max(singingValue, val);
            }
        }

        return singingValue >= song.cost;
    });
}

// ============================================================================
// ACTIVATED ABILITIES
// ============================================================================

/**
 * Get all activated abilities from a card's parsed effects.
 * 
 * @param card - The card to check
 * @returns Array of activated abilities with their indices
 */
export function getActivatedAbilities(card: CardInstance): ActivatedAbility[] {
    if (!card.parsedEffects) return [];

    const abilities: ActivatedAbility[] = [];

    (card.parsedEffects as any[]).forEach((effect, index) => {
        const isActivated = effect.trigger === 'activated' || effect.type === 'activated';

        if (isActivated) {
            abilities.push({
                index,
                type: effect.action || effect.type || 'unknown',
                name: effect.name,
                keyword: effect.keyword,
                cost: effect.cost?.ink,
                inkCost: effect.cost?.ink,
                exertCost: effect.cost?.exert,
                discardCost: effect.cost?.discard,
                text: effect.text || effect.fullText || effect.rawText || effect.effect,
                effects: effect.effects || []
            });
        }
    });

    return abilities;
}

// ============================================================================
// PROMPT PARSING
// ============================================================================

/**
 * Parse stat modification info from a prompt or ability name.
 * Used for triggering stat change animations.
 * 
 * @param text - The prompt or ability name text
 * @returns Stat modification info, or null if not a stat modification
 */
export function parseStatModification(text: string): StatModification | null {
    if (!text) return null;

    const lower = text.toLowerCase();

    // Check if it's a stat modification
    const isStatMod =
        lower.includes('gets +') ||
        lower.includes('gets -') ||
        lower.includes('strength') ||
        lower.includes('willpower') ||
        lower.includes('lore');

    if (!isStatMod) return null;

    // Determine stat type
    let statType: 'strength' | 'willpower' | 'lore' = 'strength';
    if (lower.includes('willpower') || lower.includes('⛉')) {
        statType = 'willpower';
    } else if (lower.includes('lore') || lower.includes('◊')) {
        statType = 'lore';
    }

    // Extract amount
    let amount = 1;
    const amountMatch = lower.match(/[+-](\d+)/);
    if (amountMatch) {
        amount = parseInt(amountMatch[1]);
        if (lower.includes('-' + amountMatch[1])) {
            amount = -amount;
        }
    }

    return { statType, amount };
}

// ============================================================================
// BOOST ABILITY INDEX
// ============================================================================

/**
 * Find the index of the Boost ability in a card's parsed effects.
 * Used for calling TurnManager.useAbility().
 * 
 * @param card - The card to check
 * @returns The ability index, or -1 if not found
 */
export function getBoostAbilityIndex(card: CardInstance): number {
    if (!card.parsedEffects) return -1;

    return (card.parsedEffects as any[]).findIndex(effect =>
        (effect.type === 'keyword' && effect.keyword === 'Boost') ||
        (effect.effects && Array.isArray(effect.effects) &&
            effect.effects.some((eff: any) => eff.type === 'boost')) ||
        effect.type === 'boost' ||
        effect.action?.toLowerCase().includes('boost')
    );
}
