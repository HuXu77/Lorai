import { DeckLoader } from '../../engine/deck-loader';
import * as path from 'path';

describe('DeckLoader', () => {
    let loader: DeckLoader;
    const validDeckPath = path.join(__dirname, '../decks/starter-amber-amethyst.json');

    beforeEach(() => {
        loader = new DeckLoader();
    });

    it('should load a valid deck from file', () => {
        const deck = loader.loadDeck(validDeckPath);
        expect(deck).toBeDefined();
        expect(deck.length).toBe(68);
        expect(deck[0].name).toBe('Ariel');
    });

    it('should throw error for non-existent file', () => {
        expect(() => {
            loader.loadDeck('non-existent-file.json');
        }).toThrow('Deck file not found');
    });

    it('should throw error for invalid card names', () => {
        expect(() => {
            loader.loadDeckFromList(['Invalid Card Name']);
        }).toThrow('Failed to load deck');
    });

    it('should correctly resolve card properties', () => {
        const deck = loader.loadDeckFromList(['Ariel - On Human Legs']);
        const card = deck[0];
        expect(card.cost).toBe(4);
        expect(card.inkwell).toBe(true);
        expect(card.color).toBe('Amber');
    });

    it('should load Dreamborn.ink text format', () => {
        // Create a temporary file
        const tempPath = path.join(__dirname, 'temp-deck.txt');
        const fs = require('fs');
        fs.writeFileSync(tempPath, `
2 Ariel - On Human Legs
1 Ursula - Deceiver
        `.trim());

        try {
            const deck = loader.loadDeck(tempPath);
            expect(deck.length).toBe(3);
            expect(deck[0].name).toBe('Ariel');
            expect(deck[2].name).toBe('Ursula');
        } finally {
            fs.unlinkSync(tempPath);
        }
    });
});
