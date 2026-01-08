/**
 * Parser Coverage Analysis Tool
 * 
 * Analyzes all cards to determine:
 * 1. Parser success rate
 * 2. Most common unparsed patterns
 * 3. Prioritized implementation roadmap
 */

import { CardLoader } from '../engine/card-loader';
import { parseToAbilityDefinition } from '../engine/ability-parser';

interface CoverageStats {
    totalCards: number;
    cardsWithAbilities: number;
    totalAbilities: number;
    parsedAbilities: number;
    unparsedAbilities: number;
    partiallyParsedCards: number;
    fullyParsedCards: number;
    failedCards: number;
}

interface PatternFrequency {
    pattern: string;
    count: number;
    exampleCards: string[];
}

async function analyzeCoverage() {
    console.log('=== Parser Coverage Analysis ===\n');

    const cardLoader = new CardLoader();
    await cardLoader.loadCards();
    const allCards = cardLoader.getAllCards();

    const stats: CoverageStats = {
        totalCards: allCards.length,
        cardsWithAbilities: 0,
        totalAbilities: 0,
        parsedAbilities: 0,
        unparsedAbilities: 0,
        partiallyParsedCards: 0,
        fullyParsedCards: 0,
        failedCards: 0
    };

    const unparsedPatterns = new Map<string, string[]>();
    const failedCards: Array<{ name: string, abilities: any[] }> = [];

    // Analyze each card
    for (const card of allCards) {
        if (!card.abilities || card.abilities.length === 0) {
            continue;
        }

        stats.cardsWithAbilities++;
        const cardAbilityCount = card.abilities.length;
        stats.totalAbilities += cardAbilityCount;

        try {
            const parsed = parseToAbilityDefinition(card);

            // Count parsed abilities
            // A parsed ability should have meaningful effects or be a keyword
            const meaningfullyParsed = parsed.filter(ability => {
                if (ability.type === 'static' && (ability as any).keyword) {
                    // Keywords are considered parsed
                    return true;
                }
                if (ability.effects && ability.effects.length > 0) {
                    // Has effects - check if they're meaningful (not just placeholders)
                    return true;
                }
                return false;
            });

            stats.parsedAbilities += meaningfullyParsed.length;

            // Check if card is fully parsed
            if (meaningfullyParsed.length === cardAbilityCount) {
                stats.fullyParsedCards++;
            } else if (meaningfullyParsed.length > 0) {
                stats.partiallyParsedCards++;
                stats.unparsedAbilities += (cardAbilityCount - meaningfullyParsed.length);
            } else {
                stats.failedCards++;
                stats.unparsedAbilities += cardAbilityCount;
            }

            // Collect unparsed ability text
            if (meaningfullyParsed.length < cardAbilityCount) {
                card.abilities.forEach((ability: any) => {
                    // Normalize ability text the same way parser does
                    const normalizeText = (text: string) => {
                        return text
                            .replace(/\([^)]+\)/g, '')  // Strip parentheses (like parser does)
                            .replace(/\s+/g, ' ')        // Normalize whitespace
                            .trim();
                    };

                    const abilityFullText = normalizeText(ability.fullText || '');
                    const abilityEffect = normalizeText(ability.effect || '');

                    // Check if this ability was parsed
                    const wasParsed = meaningfullyParsed.some(p => {
                        const parsedText = normalizeText(p.rawText || '');
                        return parsedText === abilityFullText ||
                            parsedText === abilityEffect ||
                            parsedText.includes(abilityFullText) ||
                            abilityFullText.includes(parsedText);
                    });

                    if (!wasParsed) {
                        const abilityText = ability.effect || ability.fullText || ability.name || '';
                        if (abilityText) {
                            // Extract key pattern (first few words)
                            const pattern = extractPattern(abilityText);
                            if (!unparsedPatterns.has(pattern)) {
                                unparsedPatterns.set(pattern, []);
                            }
                            unparsedPatterns.get(pattern)!.push(
                                `${card.fullName || card.name}: "${abilityText.substring(0, 100)}..."`
                            );
                        }
                    }
                });
            }

        } catch (error) {
            stats.failedCards++;
            stats.unparsedAbilities += cardAbilityCount;
            failedCards.push({
                name: card.fullName || card.name || 'Unknown',
                abilities: card.abilities
            });
        }
    }

    // Calculate coverage percentage
    const coveragePercentage = (stats.parsedAbilities / stats.totalAbilities * 100).toFixed(1);
    const cardCoveragePercentage = (stats.fullyParsedCards / stats.cardsWithAbilities * 100).toFixed(1);

    // Print results
    console.log('## Overall Statistics\n');
    console.log(`Total Cards: ${stats.totalCards}`);
    console.log(`Cards with Abilities: ${stats.cardsWithAbilities}`);
    console.log(`Total Abilities: ${stats.totalAbilities}`);
    console.log(`\nParsed Abilities: ${stats.parsedAbilities} (${coveragePercentage}%)`);
    console.log(`Unparsed Abilities: ${stats.unparsedAbilities}\n`);

    console.log(`Fully Parsed Cards: ${stats.fullyParsedCards} (${cardCoveragePercentage}%)`);
    console.log(`Partially Parsed Cards: ${stats.partiallyParsedCards}`);
    console.log(`Failed Cards: ${stats.failedCards}\n`);

    // Sort patterns by frequency
    const sortedPatterns: PatternFrequency[] = Array.from(unparsedPatterns.entries())
        .map(([pattern, examples]) => ({
            pattern,
            count: examples.length,
            exampleCards: examples.slice(0, 3) // Top 3 examples
        }))
        .sort((a, b) => b.count - a.count);

    console.log('## Top 20 Unparsed Patterns (by frequency)\n');
    sortedPatterns.slice(0, 20).forEach((item, index) => {
        console.log(`${index + 1}. "${item.pattern}" - ${item.count} occurrences`);
        item.exampleCards.forEach(example => {
            console.log(`   ${example}`);
        });
        console.log('');
    });

    // Export detailed report
    const report = {
        timestamp: new Date().toISOString(),
        stats,
        coveragePercentage: parseFloat(coveragePercentage),
        cardCoveragePercentage: parseFloat(cardCoveragePercentage),
        topPatterns: sortedPatterns.slice(0, 50),
        failedCards: failedCards.slice(0, 20)
    };

    const fs = require('fs');
    fs.writeFileSync(
        'coverage-analysis.json',
        JSON.stringify(report, null, 2)
    );
    console.log('\n✅ Detailed report saved to coverage-analysis.json');
}

function extractPattern(text: string): string {
    // Normalize text
    text = text.toLowerCase().trim();

    // Remove reminder text in parentheses
    text = text.replace(/\([^)]+\)/g, '').trim();

    // Extract first significant phrase (up to first comma or period, max 60 chars)
    const match = text.match(/^[^,.]+/);
    if (match) {
        let pattern = match[0].trim();
        if (pattern.length > 60) {
            pattern = pattern.substring(0, 60);
        }
        return pattern;
    }

    return text.substring(0, 60);
}

// Run analysis
analyzeCoverage().catch(console.error);
