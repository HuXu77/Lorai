/**
 * Comprehensive Parser Coverage Test
 * 
 * Validates parser coverage against ALL cards in allCards.json
 */

import { CardLoader } from '../engine/card-loader';
import { parseToAbilityDefinition } from '../engine/ability-parser';

describe('Comprehensive Parser Coverage', () => {
    let cardLoader: CardLoader;
    let allCards: any[];

    beforeAll(async () => {
        cardLoader = new CardLoader();
        await cardLoader.loadCards();
        allCards = cardLoader.getAllCards();
    });

    it('should report complete parser coverage statistics', () => {
        const results = {
            totalCards: allCards.length,
            cardsWithAbilities: 0,
            cardsSuccessfullyParsed: 0,
            cardsWith0Parsed: 0,
            cardsWith1Plus: 0,
            cardsWith2Plus: 0,
            totalAbilitiesParsed: 0,
            byType: {
                triggered: 0,
                static: 0,
                activated: 0
            },
            sampleSuccesses: [] as any[],
            sampleFailures: [] as any[]
        };

        allCards.forEach(card => {
            if (card.abilities && card.abilities.length > 0) {
                // EXCLUDE SPECIAL GAME MODES (Batch 53)
                const abilityText = card.abilities.map((a: any) => a.effect || a.fullText || '').join(' ').toLowerCase();
                if (abilityText.includes('when jafar plays this character') ||
                    abilityText.includes('opponents need') && abilityText.includes('lore to win')) {
                    return;
                }

                results.cardsWithAbilities++;

                const parsed = parseToAbilityDefinition(card);
                const abilityCount = parsed.length;

                if (abilityCount > 0) {
                    results.cardsSuccessfullyParsed++;
                    results.cardsWith1Plus++;
                    results.totalAbilitiesParsed += abilityCount;

                    if (abilityCount >= 2) results.cardsWith2Plus++;

                    // Count by type
                    parsed.forEach(a => {
                        if (a.type === 'triggered') results.byType.triggered++;
                        else if (a.type === 'static') results.byType.static++;
                        else if (a.type === 'activated') results.byType.activated++;
                    });

                    // Sample successes
                    if (results.sampleSuccesses.length < 5) {
                        results.sampleSuccesses.push({
                            name: card.fullName || card.name,
                            abilitiesParsed: abilityCount
                        });
                    }
                } else {
                    results.cardsWith0Parsed++;

                    // Sample failures
                    if (results.sampleFailures.length < 5) {
                        results.sampleFailures.push({
                            name: card.fullName || card.name,
                            rawAbilities: card.abilities.map((a: any) => a.fullText || a.effect)
                        });
                    }
                }
            }
        });

        // Calculate percentages
        const successRate = (results.cardsSuccessfullyParsed / results.cardsWithAbilities * 100).toFixed(1);

        console.log('\n========================================');
        console.log('COMPREHENSIVE PARSER COVERAGE REPORT');
        console.log('========================================\n');

        console.log('Overall Statistics:');
        console.log(`  Total cards: ${results.totalCards}`);
        console.log(`  Cards with abilities: ${results.cardsWithAbilities}`);
        console.log(`  Successfully parsed: ${results.cardsSuccessfullyParsed} (${successRate}%)`);
        console.log(`  Failed to parse: ${results.cardsWith0Parsed}\n`);

        console.log('Parsing Distribution:');
        console.log(`  Cards with 1+ abilities parsed: ${results.cardsWith1Plus}`);
        console.log(`  Cards with 2+ abilities parsed: ${results.cardsWith2Plus}`);
        console.log(`  Total abilities parsed: ${results.totalAbilitiesParsed}\n`);

        console.log('By Ability Type:');
        console.log(`  Triggered abilities: ${results.byType.triggered}`);
        console.log(`  Static abilities: ${results.byType.static}`);
        console.log(`  Activated abilities: ${results.byType.activated}\n`);

        console.log('Sample Successes:');
        results.sampleSuccesses.forEach(s => {
            console.log(`  ✓ ${s.name} (${s.abilitiesParsed} abilities)`);
        });

        console.log('\nSample Failures:');
        results.sampleFailures.forEach(f => {
            console.log(`  ✗ ${f.name}`);
        });

        console.log('\n========================================\n');

        // Test assertions
        expect(results.cardsWithAbilities).toBeGreaterThan(500);
        expect(results.cardsSuccessfullyParsed).toBeGreaterThan(400);
        expect(parseFloat(successRate)).toBeGreaterThan(70);
    });
});
