
/**
 * Utility for managing persistent deck storage in localStorage.
 */

export interface SavedDeck {
    id: string;
    name: string;
    cards: string[];     // Array of card names/counts (raw text format) or Dreamborn string
    sourceType: 'text' | 'url';
    sourceValue: string; // The raw text or URL
    createdAt: number;
    lastUsedAt: number;
}

const STORAGE_KEY = 'lorai_saved_decks';

export const DeckStorage = {
    getDecks(): SavedDeck[] {
        if (typeof window === 'undefined') return [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to load decks', e);
            return [];
        }
    },

    saveDeck(deck: Omit<SavedDeck, 'id' | 'createdAt' | 'lastUsedAt'>): SavedDeck {
        const decks = DeckStorage.getDecks();
        const newDeck: SavedDeck = {
            ...deck,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            lastUsedAt: Date.now()
        };
        decks.push(newDeck);
        DeckStorage.persist(decks);
        return newDeck;
    },

    updateDeck(id: string, updates: Partial<SavedDeck>): void {
        const decks = DeckStorage.getDecks();
        const index = decks.findIndex(d => d.id === id);
        if (index !== -1) {
            decks[index] = { ...decks[index], ...updates, lastUsedAt: Date.now() };
            DeckStorage.persist(decks);
        }
    },

    deleteDeck(id: string): void {
        const decks = DeckStorage.getDecks();
        const filtered = decks.filter(d => d.id !== id);
        DeckStorage.persist(filtered);
    },

    persist(decks: SavedDeck[]): void {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
        } catch (e) {
            console.error('Failed to save decks', e);
        }
    }
};
