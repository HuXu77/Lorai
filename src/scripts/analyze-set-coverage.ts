
import { CardLoader } from '../engine/card-loader';
import { parseToAbilityDefinition } from '../engine/ability-parser';
import { Card } from '../engine/models';

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

async function analyzeSetCoverage() {
    // Get set code from args
    const args = process.argv.slice(2);
    const setCode = args[0];

    if (!setCode) {
        console.error('Please provide a set code (e.g. "1", "11", "Winterspell")');
        process.exit(1);
    }

    console.log(`=== Analyzing Coverage for Set: ${setCode} ===\n`);

    const cardLoader = new CardLoader();
    await cardLoader.loadCards();
    const allCards = cardLoader.getAllCards();

    // Filter by set
    const setCards = allCards.filter(c => c.setCode == setCode);

    if (setCards.length === 0) {
        console.error(`No cards found for set code "${setCode}"`);
        process.exit(1);
    }

    console.log(`Found ${setCards.length} cards in set ${setCode}.`);

    const stats: CoverageStats = {
        totalCards: setCards.length,
        cardsWithAbilities: 0,
        totalAbilities: 0,
        parsedAbilities: 0,
        unparsedAbilities: 0,
        partiallyParsedCards: 0,
        fullyParsedCards: 0,
        failedCards: 0
    };

    const unparsedPatterns = new Map<string, string[]>();
    const failedCardsList: Array<{ name: string, reason: string }> = [];

    for (const card of setCards) {
        // Handle Vanilla Cards (no abilities)
        if ((!card.abilities || card.abilities.length === 0) && (!card.fullText)) {
            // Fully implemented effectively
            stats.fullyParsedCards++;
            continue;
        }

        stats.cardsWithAbilities++;
        const cardAbilityCount = card.abilities?.length || (card.fullText ? 1 : 0);
        stats.totalAbilities += cardAbilityCount;

        try {
            const parsed = parseToAbilityDefinition(card);

            // Filter for meaningful parsed abilities (not unknown/empty)
            const meaningfullyParsed = parsed.filter(ability => {
                if (ability.type === 'static' && (ability as any).keyword) {
                    return true;
                }
                if ((ability as any).effects && (ability as any).effects.length > 0) {
                    return true;
                }
                return false;
            });

            stats.parsedAbilities += meaningfullyParsed.length;

            // Check card status
            if (meaningfullyParsed.length >= cardAbilityCount) {
                stats.fullyParsedCards++;
            } else if (meaningfullyParsed.length > 0) {
                stats.partiallyParsedCards++;
                stats.unparsedAbilities += (cardAbilityCount - meaningfullyParsed.length);

                // Track unparsed patterns 
                // This is an approximation since we don't map 1:1 easily here without more logic
                // We'll just collect the whole card's abilities if it's partial
                failedCardsList.push({
                    name: card.fullName || card.name,
                    reason: `Partial: ${meaningfullyParsed.length}/${cardAbilityCount} abilities parsed`
                });

                collectUnparsedPatterns(card, meaningfullyParsed, unparsedPatterns);

            } else {
                stats.failedCards++;
                stats.unparsedAbilities += cardAbilityCount;
                failedCardsList.push({
                    name: card.fullName || card.name,
                    reason: `Failed: 0/${cardAbilityCount} abilities parsed`
                });

                collectUnparsedPatterns(card, [], unparsedPatterns);
            }

        } catch (error) {
            stats.failedCards++;
            stats.unparsedAbilities += cardAbilityCount;
            failedCardsList.push({
                name: card.fullName || card.name,
                reason: `Error: ${error}`
            });
        }
    }

    // Print Results
    console.log('\n## Coverage Statistics\n');
    console.log(`Total Cards: ${stats.totalCards}`);
    console.log(`Cards with Abilities: ${stats.cardsWithAbilities}`);
    console.log(`Total Abilities: ${stats.totalAbilities}`);
    console.log(`\nParsed Abilities: ${stats.parsedAbilities} (${(stats.parsedAbilities / stats.totalAbilities * 100).toFixed(1)}%)`);
    console.log(`Unparsed Abilities: ${stats.unparsedAbilities}\n`);

    console.log(`Fully Implemented Cards: ${stats.fullyParsedCards} (${(stats.fullyParsedCards / stats.totalCards * 100).toFixed(1)}%)`);
    console.log(`Partially Implemented Cards: ${stats.partiallyParsedCards}`);
    console.log(`Failed Cards: ${stats.failedCards}\n`);

    // Top Patterns
    const sortedPatterns: PatternFrequency[] = Array.from(unparsedPatterns.entries())
        .map(([pattern, examples]) => ({
            pattern,
            count: examples.length,
            exampleCards: examples.slice(0, 3)
        }))
        .sort((a, b) => b.count - a.count);

    if (sortedPatterns.length > 0) {
        console.log('## Top Unparsed Patterns\n');
        sortedPatterns.slice(0, 10).forEach((item, index) => {
            console.log(`${index + 1}. "${item.pattern}" - ${item.count} occurrences`);
            item.exampleCards.forEach(example => console.log(`   ${example}`));
            console.log('');
        });
    }

    if (failedCardsList.length > 0 && failedCardsList.length < 50) {
        console.log('## Cards Requiring Attention\n');
        failedCardsList.forEach(f => console.log(`- ${f.name}: ${f.reason}`));
    } else if (failedCardsList.length >= 50) {
        console.log(`\n(Omitted list of ${failedCardsList.length} failed cards for brevity)`);
    }
}

function collectUnparsedPatterns(card: Card, parsed: any[], patterns: Map<string, string[]>) {
    if (!card.abilities) return;

    // Normalize logic
    const normalizeText = (text: string) => text.replace(/\([^)]+\)/g, '').replace(/\s+/g, ' ').trim();

    card.abilities.forEach((ability: any) => {
        const abilityFullText = normalizeText(ability.fullText || '');
        const abilityEffect = normalizeText(ability.effect || '');

        // Check if this ability was parsed
        const wasParsed = parsed.some(p => {
            const parsedText = normalizeText(p.rawText || '');
            return parsedText === abilityFullText ||
                parsedText === abilityEffect ||
                parsedText.includes(abilityFullText) ||
                abilityFullText.includes(parsedText);
        });

        if (!wasParsed) {
            const text = ability.effect || ability.fullText || ability.name || '';
            const pattern = extractPattern(text);
            if (!patterns.has(pattern)) {
                patterns.set(pattern, []);
            }
            patterns.get(pattern)!.push(`${card.fullName || card.name}`);
        }
    });

}

function extractPattern(text: string): string {
    text = text.toLowerCase().trim();
    text = text.replace(/\([^)]+\)/g, '').trim(); // Remove reminder
    const match = text.match(/^[^,.]+/);
    if (match) {
        let pattern = match[0].trim();
        if (pattern.length > 60) pattern = pattern.substring(0, 60);
        return pattern;
    }
    return text.substring(0, 60);
}

analyzeSetCoverage().catch(console.error);
