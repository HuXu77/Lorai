import { InkColor } from '../engine/models';

// Import card definitions
// Note: allCards.json is at project root, so from src/utils it is ../../allCards.json
const allCards = require('../../allCards.json');

// Interface for validation result
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}

// Cards that can have more than 4 copies
// We check against fullName or specific substrings if needed
// Cards that can have more than 4 copies
// We check against the maxCopiesInDeck property on the card data

/**
 * Validates a deck list against game rules.
 * @param cardNames List of card names (e.g., ["Stitch - Rock Star", "Stitch - Rock Star", ...])
 * @returns ValidationResult
 */
export function validateDeck(cardNames: string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!cardNames || cardNames.length === 0) {
        return { isValid: false, errors: ['Deck is empty.'] };
    }

    // 1. Build Card Map for Lookup
    // We reuse the logic from GamePage to map names to card objects
    // TODO: Centralize this mapping logic if used in multiple places
    const cardMap = new Map<string, any>();
    (allCards.cards as any[]).forEach(card => {
        // We use lowercase for case-insensitive lookup
        const existing = cardMap.get(card.fullName.toLowerCase());
        // First Match Strategy: Only set if not already present.
        // This avoids overwritting standard cards with later promo/enchanted variants that might be broken or duplicates.
        if (!existing) {
            cardMap.set(card.fullName.toLowerCase(), card);
        }
    });

    // 2. Validate Cards Exist & Collect Attributes
    const deckCards: any[] = [];
    const unknownCards: string[] = [];

    cardNames.forEach(name => {
        const normalizedName = name.trim().toLowerCase().replace(/\s+/g, ' ');
        const card = cardMap.get(normalizedName);
        if (card) {
            deckCards.push(card);
        } else {
            unknownCards.push(name);
        }
    });

    if (unknownCards.length > 0) {
        // Limit error message length
        const uniqueUnknown = Array.from(new Set(unknownCards));
        const displayUnknown = uniqueUnknown.slice(0, 3).join(', ');
        const remaining = uniqueUnknown.length - 3;
        errors.push(`Unknown cards: ${displayUnknown}${remaining > 0 ? ` and ${remaining} others` : ''}`);
    }

    // If we have critical errors (card not found), we might want to stop or continue best effort.
    // Usually, validation fails if cards aren't valid.
    if (errors.length > 0) {
        return { isValid: false, errors, warnings };
    }

    // 3. Validate Ink Colors (Max 2)
    const inkColors = new Set<string>();
    deckCards.forEach(card => {
        // Check 'ink' first, fall back to 'color'
        const colorString = card.ink || card.color;
        if (colorString) {
            // Handle multi-ink cards (e.g. "Amber/Emerald" or "Amber-Emerald")
            const colors = colorString.split(/[\/-]/).map((c: string) => c.trim());
            colors.forEach((c: string) => inkColors.add(c));
        }
    });

    if (inkColors.size > 2) {
        const colors = Array.from(inkColors).join(', ');
        errors.push(`Deck contains ${inkColors.size} ink colors (${colors}). Maximum allowed is 2.`);
    }

    // 4. Validate Card Counts (Max 4, unless exception)
    const cardCounts = new Map<string, number>();
    deckCards.forEach(card => {
        const name = card.fullName;
        cardCounts.set(name, (cardCounts.get(name) || 0) + 1);
    });

    cardCounts.forEach((count, name) => {
        // Find the card object to check its properties
        const card = deckCards.find(c => c.fullName === name);
        const limit = card?.maxCopiesInDeck || 4;

        if (count > limit) {
            errors.push(`Triggered limit of ${limit} copies for "${name}" (Found: ${count}).`);
        }
    });

    // 5. Validate Deck Size (Optional, user didn't explicitly ask but it's a core rule)
    if (deckCards.length < 60) {
        warnings.push(`Deck has only ${deckCards.length} cards. Standard minimum is 60.`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
