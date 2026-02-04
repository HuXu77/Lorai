
import fs from 'fs';
import path from 'path';

export interface CardData {
    name: string;
    fullName: string;
    cost: number;
    type: string;
    color: string;
    inkwell: boolean;
    abilities?: any[];
    fullTextSections?: string[];
    strength?: number;
    willpower?: number;
    lore?: number;

    // Test extensions
    set?: string;
    number?: number;
}

/**
 * Load all cards from the root allCards.json file
 */
export function loadAllCards(): CardData[] {
    try {
        const filePath = path.join(process.cwd(), 'allCards.json');
        const content = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);

        // Handle different JSON structures (sets vs flat list)
        // Based on the 'head' output, it seems to be organized by sets
        if (json.sets) {
            const allCards: CardData[] = [];
            Object.values(json.sets).forEach((set: any) => {
                if (set.cards) {
                    allCards.push(...set.cards);
                }
            });
            // If sets don't have cards directly (might be structured differently), checking cards array at root
            if (allCards.length === 0 && json.cards) {
                return json.cards;
            }
            return allCards;
        }

        if (json.cards) {
            return json.cards;
        }

        return [];
    } catch (e) {
        console.error("Failed to load allCards.json:", e);
        return [];
    }
}

/**
 * Filter cards by exact keyword
 */
export function getCardsWithKeyword(cards: CardData[], keyword: string): CardData[] {
    return cards.filter(card => {
        // Check structured abilities
        if (card.abilities) {
            return card.abilities.some((a: any) =>
                (a.type === 'keyword' && a.keyword === keyword) ||
                (typeof a === 'string' && a.includes(keyword))
            );
        }
        // Check full text
        if (card.fullTextSections) {
            return card.fullTextSections.some(text => {
                const clean = text.trim();
                // Keyword should be at start of text (e.g. "Bodyguard (...)")
                // Or start of a line if multiple keywords
                return clean.toLowerCase().startsWith(keyword.toLowerCase());
            });
        }
        return false;
    });
}
