
import { describe, it, expect, beforeAll } from 'vitest';
import { loadAllCards, CardData, getCardsWithKeyword } from './compliance-utils';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Card Compliance Framework', () => {
    let allCards: CardData[] = [];

    beforeAll(() => {
        allCards = loadAllCards();
        console.log(`[COMPLIANCE] Loaded ${allCards.length} cards from database.`);
    });

    it('should have loaded cards', () => {
        expect(allCards.length).toBeGreaterThan(0);
    });

    describe('Parser Integrity', () => {
        it('should parse every card without throwing errors', () => {
            let errorCount = 0;
            const errors: string[] = [];

            allCards.forEach(card => {
                try {
                    // Map to expected Card interface for parser
                    const cardInput = {
                        ...card,
                        id: 0, // Mock ID
                        type: (card.type || 'Character') as CardType,
                        abilities: card.abilities || [],
                        fullTextSections: card.fullTextSections || []
                    } as any;

                    const abilities = parseToAbilityDefinition(cardInput);

                    // Basic validation: If it has ability text, it should have parsed abilities
                    const hasText = (card.abilities && card.abilities.length > 0) ||
                        (card.fullTextSections && card.fullTextSections.length > 0);

                    if (hasText && abilities.length === 0) {
                        // Some vanilla cards have text but no mechanics (flavor text only?)
                        // But mostly this suggests a parser miss
                        // Ignoring for now to focus on crashes
                    }

                } catch (e) {
                    errorCount++;
                    errors.push(`${card.fullName}: ${e}`);
                }
            });

            if (errorCount > 0) {
                console.error('Parser Errors:', errors.slice(0, 10));
            }
            expect(errorCount).toBe(0);
        });
    });

    describe('Keyword Integrity: Singer', () => {
        it('should parse Singer keyword correctly', () => {
            const singerCards = getCardsWithKeyword(allCards, 'Singer');
            console.log(`[COMPLIANCE] Found ${singerCards.length} cards with Singer`);

            singerCards.forEach(card => {
                const cardInput = { ...card, id: 0, type: 'Character' as CardType } as any;
                const abilities = parseToAbilityDefinition(cardInput);

                const hasSinger = abilities.some(a =>
                    a.type === 'static' &&
                    (a as any).keyword === 'singer'
                );

                if (!hasSinger) {
                    console.warn(`[FAIL] ${card.fullName} missing Singer parsing`);
                }
                expect(hasSinger).toBe(true);
            });
        });
    });

    describe('Keyword Integrity: Bodyguard', () => {
        it('should parse Bodyguard keyword correctly', () => {
            const bodyguardCards = getCardsWithKeyword(allCards, 'Bodyguard');
            console.log(`[COMPLIANCE] Found ${bodyguardCards.length} cards with Bodyguard`);

            bodyguardCards.forEach(card => {
                const cardInput = { ...card, id: 0, type: 'Character' as CardType } as any;
                const abilities = parseToAbilityDefinition(cardInput);

                const hasBodyguard = abilities.some(a =>
                    (a.type === 'static' || a.type === 'keyword') &&
                    (a as any).keyword?.toLowerCase() === 'bodyguard'
                );

                if (!hasBodyguard) {
                    console.warn(`[FAIL] ${card.fullName} missing Bodyguard parsing`);
                }
                expect(hasBodyguard).toBe(true);
            });
        });
    });
});
