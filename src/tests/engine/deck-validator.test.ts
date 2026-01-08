import { DeckValidator } from '../../engine/deck-validator';
import { Card, InkColor } from '../../engine/models';
import { CardType } from '../../engine/models';

describe('DeckValidator', () => {
    let validator: DeckValidator;

    beforeEach(() => {
        validator = new DeckValidator();
    });

    const createCard = (name: string, color: InkColor = InkColor.Amber): Card => ({
        name,
        fullName: name,
        color,
        cost: 1,
        inkwell: true,
        type: 'Character' as CardType,
        strength: 1,
        willpower: 1,
        lore: 1,
        subtypes: [],
        abilities: []
    } as any);

    it('should validate a correct deck', () => {
        const deck: Card[] = [];
        for (let i = 0; i < 60; i++) {
            deck.push(createCard(`Card ${i}`));
        }
        const result = validator.validateDeck(deck);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should fail if deck size is less than 60', () => {
        const deck: Card[] = [];
        for (let i = 0; i < 59; i++) {
            deck.push(createCard(`Card ${i}`));
        }
        const result = validator.validateDeck(deck);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('Deck must have at least 60 cards');
    });

    it('should fail if more than 4 copies of a card', () => {
        const deck: Card[] = [];
        for (let i = 0; i < 5; i++) {
            deck.push(createCard('Same Card'));
        }
        // Fill rest
        for (let i = 5; i < 60; i++) {
            deck.push(createCard(`Card ${i}`));
        }
        const result = validator.validateDeck(deck);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('Deck contains 5 copies');
    });

    it('should fail if more than 2 ink colors', () => {
        const deck: Card[] = [];
        deck.push(createCard('Amber Card', InkColor.Amber));
        deck.push(createCard('Amethyst Card', InkColor.Amethyst));
        deck.push(createCard('Steel Card', InkColor.Steel));
        // Fill rest
        for (let i = 3; i < 60; i++) {
            deck.push(createCard(`Card ${i}`, InkColor.Amber));
        }
        const result = validator.validateDeck(deck);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('Deck can only have up to 2 ink colors');
    });

    it('should allow dual-color cards if within 2 color limit', () => {
        const deck: Card[] = [];
        // Amber cards
        for (let i = 0; i < 20; i++) deck.push(createCard(`Amber ${i}`, InkColor.Amber));
        // Emerald cards
        for (let i = 0; i < 20; i++) deck.push(createCard(`Emerald ${i}`, InkColor.Emerald));
        // Amber/Emerald cards
        for (let i = 0; i < 20; i++) deck.push(createCard(`Dual ${i}`, 'Amber-Emerald' as InkColor));

        const result = validator.validateDeck(deck);
        expect(result.valid).toBe(true);
    });
});
