/**
 * Enhanced Parser Coverage Analysis
 * 
 * Provides granular, per-ability breakdown showing:
 * - Which patterns matched for each ability
 * - Which abilities failed to parse
 * - Pattern effectiveness metrics
 */

import { CardLoader } from '../engine/card-loader';
import { parseToAbilityDefinition } from '../engine/ability-parser';

interface AbilityAnalysis {
    cardName: string;
    abilityIndex: number;
    abilityText: string;
    parsed: boolean;
    parsedAs?: {
        type: string;
        keyword?: string;
        hasEffects: boolean;
        effectTypes: string[];
    };
    rawText?: string;
}

async function analyzeGranular() {
    console.log('=== Enhanced Parser Coverage Analysis ===\n');

    const cardLoader = new CardLoader();
    await cardLoader.loadCards();
    const allCards = cardLoader.getAllCards();

    const analyses: AbilityAnalysis[] = [];
    let totalAbilities = 0;
    let parsedCount = 0;
    let partiallyParsedCards = 0;
    let fullyParsedCards = 0;

    // Analyze each card ability
    for (const card of allCards) {
        if (!card.abilities || card.abilities.length === 0) {
            continue;
        }

        const cardName = card.fullName || card.name || 'Unknown';
        const parsed = parseToAbilityDefinition(card);

        const normalizeText = (text: string) => {
            // Handle "Name a card, then reveal" special case
            if (text.match(/Name a card, then reveal/i)) {
                text = text.replace(/Name a card, then reveal/i, "Name a card and reveal");
            }
            // Handle Hades - Double Dealer multi-sentence ability
            if (text.includes("banishes another character") && text.includes("Play a character")) {
                text = text.replace(/\. Play/i, " Play");
            }

            return text
                .replace(/\([^)]+\)/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        };

        let cardParsedCount = 0;

        card.abilities.forEach((ability: any, index: number) => {
            totalAbilities++;
            const abilityText = ability.effect || ability.fullText || ability.name || '';
            const normalizedAbilityText = normalizeText(abilityText);

            // Find matching parsed ability
            const matchedParsed = parsed.find(p => {
                const normalizedParsed = normalizeText(p.rawText || '');
                return normalizedParsed === normalizedAbilityText ||
                    normalizedParsed.includes(normalizedAbilityText) ||
                    normalizedAbilityText.includes(normalizedParsed);
            });

            const analysis: AbilityAnalysis = {
                cardName,
                abilityIndex: index + 1,
                abilityText: abilityText.substring(0, 100),
                parsed: !!matchedParsed,
            };

            if (matchedParsed) {
                parsedCount++;
                cardParsedCount++;

                const effectTypes = matchedParsed.effects?.map((e: any) => e.type) || [];

                analysis.parsedAs = {
                    type: matchedParsed.type,
                    keyword: (matchedParsed as any).keyword,
                    hasEffects: effectTypes.length > 0,
                    effectTypes
                };
                analysis.rawText = matchedParsed.rawText;
            }

            analyses.push(analysis);
        });

        if (cardParsedCount === card.abilities.length) {
            fullyParsedCards++;
        } else if (cardParsedCount > 0) {
            partiallyParsedCards++;
        }
    }

    // Overall stats
    const coveragePct = ((parsedCount / totalAbilities) * 100).toFixed(1);
    console.log(`📊 Overall: ${parsedCount}/${totalAbilities} abilities parsed (${coveragePct}%)\n`);
    console.log(`✅ Fully parsed cards: ${fullyParsedCards}`);
    console.log(`⚠️  Partially parsed cards: ${partiallyParsedCards}\n`);

    // Show examples of unparsed abilities
    console.log('❌ Sample Unparsed Abilities (first 20):\n');
    const unparsed = analyses.filter(a => !a.parsed).slice(0, 20);
    unparsed.forEach((a, i) => {
        console.log(`${i + 1}. ${a.cardName} [Ability ${a.abilityIndex}]`);
        console.log(`   "${a.abilityText}..."\n`);
    });

    // Show examples of partially parsed cards
    console.log('⚠️  Sample Partially Parsed Cards (first 10):\n');
    const partialCards = new Map<string, AbilityAnalysis[]>();
    analyses.forEach(a => {
        if (!partialCards.has(a.cardName)) {
            partialCards.set(a.cardName, []);
        }
        partialCards.get(a.cardName)!.push(a);
    });

    let partialCount = 0;
    for (const [cardName, abilities] of partialCards) {
        const parsed = abilities.filter(a => a.parsed).length;
        const total = abilities.length;

        if (parsed > 0 && parsed < total) {
            partialCount++;
            if (partialCount <= 10) {
                console.log(`${partialCount}. ${cardName} (${parsed}/${total} abilities)`);
                abilities.forEach(a => {
                    const status = a.parsed ? '✅' : '❌';
                    const detail = a.parsed
                        ? `[${a.parsedAs?.type}${a.parsedAs?.keyword ? ':' + a.parsedAs.keyword : ''}]`
                        : '';
                    console.log(`   ${status} Ability ${a.abilityIndex}: ${detail}`);
                    console.log(`      "${a.abilityText.substring(0, 80)}..."`);
                });
                console.log('');
            }
        }
    }

    // Pattern effectiveness
    console.log('\n📈 Pattern Effectiveness:\n');
    const patternStats = new Map<string, { parsed: number; total: number }>();

    analyses.forEach(a => {
        if (a.parsed && a.parsedAs) {
            const key = a.parsedAs.keyword || a.parsedAs.type;
            if (!patternStats.has(key)) {
                patternStats.set(key, { parsed: 0, total: 0 });
            }
            patternStats.get(key)!.parsed++;
        }
    });

    const sorted = Array.from(patternStats.entries())
        .sort((a, b) => b[1].parsed - a[1].parsed)
        .slice(0, 15);

    sorted.forEach(([pattern, stats]) => {
        console.log(`  ${pattern}: ${stats.parsed} abilities`);
    });

    // Export detailed JSON
    const fs = require('fs');
    fs.writeFileSync(
        'granular-coverage.json',
        JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: {
                totalAbilities,
                parsedCount,
                coveragePct: parseFloat(coveragePct),
                fullyParsedCards,
                partiallyParsedCards
            },
            analyses
        }, null, 2)
    );

    console.log('\n✅ Detailed analysis saved to granular-coverage.json');
}

analyzeGranular().catch(console.error);
