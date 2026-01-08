import * as fs from 'fs';
import * as path from 'path';
import { Card } from './models';
const allCards = require('../../allCards.json');

export class DeckLoader {
    private cardMap: Map<string, Card>;

    constructor() {
        this.cardMap = new Map();
        // Index cards by full name for quick lookup
        (allCards.cards as any[]).forEach(card => {
            this.cardMap.set(card.fullName.toLowerCase(), card as Card);
        });
    }

    loadDeck(filePath: string): Card[] {
        const absolutePath = path.resolve(filePath);
        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Deck file not found: ${absolutePath}`);
        }

        const content = fs.readFileSync(absolutePath, 'utf-8');

        // Try parsing as JSON first
        let deckData;
        try {
            deckData = JSON.parse(content);
        } catch (e) {
            // Not JSON, continue to text parsing
        }

        if (deckData && deckData.cards && Array.isArray(deckData.cards)) {
            return this.loadDeckFromList(deckData.cards);
        }

        // Parse as Dreamborn.ink text format (Quantity Name)
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        const cardList: string[] = [];

        lines.forEach(line => {
            const match = line.match(/^(\d+)\s+(.+)$/);
            if (match) {
                const count = parseInt(match[1], 10);
                const name = match[2].trim();
                for (let i = 0; i < count; i++) {
                    cardList.push(name);
                }
            }
        });

        if (cardList.length > 0) {
            return this.loadDeckFromList(cardList);
        }

        throw new Error(`Could not parse deck file: ${filePath}. Supported formats: JSON or "Quantity Name" list.`);
    }

    loadDeckFromList(cardNames: string[]): Card[] {
        const deck: Card[] = [];
        const errors: string[] = [];

        cardNames.forEach(name => {
            const card = this.cardMap.get(name.toLowerCase());
            if (card) {
                // Return a deep copy of the card to prevent mutation issues
                deck.push(JSON.parse(JSON.stringify(card)));
            } else {
                errors.push(`Card not found: "${name}"`);
            }
        });

        if (errors.length > 0) {
            throw new Error(`Failed to load deck:\n${errors.join('\n')}`);
        }

        return deck;
    }
}
