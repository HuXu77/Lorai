/**
 * Gap Analysis - Identify Missing Patterns
 * 
 * Analyze the 491 unparsed cards to find common patterns
 */

import { CardLoader } from '../engine/card-loader';
import { parseToAbilityDefinition } from '../engine/ability-parser';

(async () => {
    const loader = new CardLoader();
    await loader.loadCards();
    const allCards = loader.getAllCards();

    // Find cards that don't parse
    const unparsedCards: any[] = [];
    const unparsedAbilities: string[] = [];

    allCards.forEach(card => {
        if (card.abilities && card.abilities.length > 0) {
            const parsed = parseToAbilityDefinition(card);

            if (parsed.length === 0) {
                unparsedCards.push(card);
                card.abilities.forEach((a: any) => {
                    const text = a.effect || a.fullText || '';
                    if (text) unparsedAbilities.push(text);
                });
            }
        }
    });

    console.log(`\n========================================`);
    console.log(`GAP ANALYSIS - Path to 100% Coverage`);
    console.log(`========================================\n`);

    console.log(`Total unparsed cards: ${unparsedCards.length}`);
    console.log(`Total unparsed abilities: ${unparsedAbilities.length}\n`);

    // Pattern frequency analysis
    const patterns = new Map<string, number>();

    unparsedAbilities.forEach(text => {
        const lower = text.toLowerCase();

        // Look for common starting patterns
        if (lower.includes('whenever')) {
            const match = lower.match(/whenever ([^,]+)/);
            if (match) patterns.set(`whenever ${match[1]}`, (patterns.get(`whenever ${match[1]}`) || 0) + 1);
        }

        if (lower.includes('when')) {
            const match = lower.match(/when ([^,]+)/);
            if (match) patterns.set(`when ${match[1]}`, (patterns.get(`when ${match[1]}`) || 0) + 1);
        }

        if (lower.includes('while')) {
            patterns.set('while', (patterns.get('while') || 0) + 1);
        }

        if (lower.includes('for each')) {
            patterns.set('for each', (patterns.get('for each') || 0) + 1);
        }

        if (lower.includes('may') && lower.includes('pay')) {
            patterns.set('may pay [activated]', (patterns.get('may pay [activated]') || 0) + 1);
        }

        if (lower.includes('chosen character')) {
            patterns.set('chosen character', (patterns.get('chosen character') || 0) + 1);
        }

        if (lower.includes('look at') || lower.includes('reveal')) {
            patterns.set('look/reveal', (patterns.get('look/reveal') || 0) + 1);
        }

        if (lower.includes('put') && (lower.includes('into hand') || lower.includes('into play'))) {
            patterns.set('put into zone', (patterns.get('put into zone') || 0) + 1);
        }
    });

    // Sort by frequency
    const sorted = Array.from(patterns.entries()).sort((a, b) => b[1] - a[1]);

    console.log(`Top Missing Patterns:\n`);
    sorted.slice(0, 15).forEach(([pattern, count]) => {
        console.log(`  ${count.toString().padStart(3)} - ${pattern}`);
    });

    console.log(`\n========================================`);
    console.log(`Sample Unparsed Cards:\n`);
    unparsedCards.slice(0, 10).forEach(card => {
        console.log(`  ${card.fullName || card.name}`);
        card.abilities.forEach((a: any) => {
            const text = (a.effect || a.fullText || '').substring(0, 80);
            console.log(`    → ${text}...`);
        });
    });

    console.log(`\n========================================\n`);
})();
