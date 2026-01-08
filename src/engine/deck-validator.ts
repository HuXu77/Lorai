import { Card, InkColor } from './models';

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export class DeckValidator {
    static readonly MIN_DECK_SIZE = 60;
    static readonly MAX_COPIES = 4;
    static readonly MAX_INK_COLORS = 2;

    validateDeck(deck: Card[]): ValidationResult {
        const errors: string[] = [];

        // 1. Check Deck Size
        if (deck.length < DeckValidator.MIN_DECK_SIZE) {
            errors.push(`Deck must have at least ${DeckValidator.MIN_DECK_SIZE} cards. Current count: ${deck.length}`);
        }

        // 2. Check Ink Colors
        const inkColors = new Set<InkColor>();
        deck.forEach(card => {
            if (card.color) {
                // Handle dual colors (e.g., "Amber-Emerald")
                const colors = card.color.split('-');
                colors.forEach(color => inkColors.add(color.trim() as InkColor));
            }
        });

        if (inkColors.size > DeckValidator.MAX_INK_COLORS) {
            errors.push(`Deck can only have up to ${DeckValidator.MAX_INK_COLORS} ink colors. Found: ${Array.from(inkColors).join(', ')}`);
        }

        // 3. Check Card Copies
        const cardCounts = new Map<string, number>();
        deck.forEach(card => {
            // Unique identifier for a card is its full name (Name + Version)
            // Assuming card.fullName is unique enough, or we can use card.name + card.version
            const key = card.fullName;
            cardCounts.set(key, (cardCounts.get(key) || 0) + 1);
        });

        cardCounts.forEach((count, name) => {
            if (count > DeckValidator.MAX_COPIES) {
                errors.push(`Deck contains ${count} copies of "${name}". Maximum allowed is ${DeckValidator.MAX_COPIES}.`);
            }
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }
}
