import * as fs from 'fs';
import * as path from 'path';

interface CardData {
    id: number;
    name: string;
    subtitle?: string;
    abilities?: any[];
    fullTextSections?: any[];
}

/**
 * Extract abilities from skipped tests to identify missing patterns
 */
function analyzeSkippedTests() {
    console.log('📋 Analyzing skipped tests to find missing patterns...\n');

    // Load allCards.json
    const cardsPath = path.join(__dirname, '../../allCards.json');
    const cardsData = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
    const allCards: CardData[] = cardsData.cards;

    // Load test files and find skipped cards
    const testDir = path.join(__dirname, '../tests/abilities/auto');
    const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.ts'));

    const skippedCards: string[] = [];

    // Parse test files to find .skip
    testFiles.forEach(file => {
        const content = fs.readFileSync(path.join(testDir, file), 'utf-8');
        const skipMatches = content.matchAll(/describe\.skip\('([^']+)'/g);
        for (const match of skipMatches) {
            skippedCards.push(match[1]);
        }
    });

    console.log(`Found ${skippedCards.length} skipped cards\n`);

    // Extract abilities from skipped cards
    const failedAbilities: { card: string; ability: string; type?: string }[] = [];

    skippedCards.forEach(cardName => {
        const card = allCards.find(c => {
            const fullName = c.subtitle ? `${c.name} - ${c.subtitle}` : c.name;
            return fullName === cardName;
        });

        if (card && card.abilities) {
            card.abilities.forEach(ability => {
                const text = ability.fullText || ability.effect || ability.keyword || '';
                if (text) {
                    failedAbilities.push({
                        card: cardName,
                        ability: text,
                        type: ability.type
                    });
                }
            });
        }
    });

    console.log(`Extracted ${failedAbilities.length} abilities from skipped cards\n`);

    // Cluster by pattern type
    const patterns: Map<string, { count: number; examples: string[] }> = new Map();

    failedAbilities.forEach(({ ability, card }) => {
        // Normalize the ability text for pattern matching
        const normalized = normalizePattern(ability);

        if (!patterns.has(normalized)) {
            patterns.set(normalized, { count: 0, examples: [] });
        }

        const pattern = patterns.get(normalized)!;
        pattern.count++;
        if (pattern.examples.length < 3) {
            pattern.examples.push(`${card}: ${ability.substring(0, 80)}`);
        }
    });

    // Sort by frequency
    const sortedPatterns = Array.from(patterns.entries())
        .sort((a, b) => b[1].count - a[1].count);

    // Output top patterns
    console.log('=== TOP 50 MISSING PATTERNS ===\n');
    sortedPatterns.slice(0, 50).forEach(([pattern, data], idx) => {
        console.log(`${idx + 1}. Pattern (${data.count} occurrences):`);
        console.log(`   "${pattern}"`);
        console.log(`   Examples:`);
        data.examples.forEach(ex => console.log(`     - ${ex}`));
        console.log('');
    });

    // Output summary statistics
    console.log('\n=== PATTERN STATISTICS ===');
    console.log(`Total unique patterns: ${patterns.size}`);
    console.log(`Patterns with 5+ occurrences: ${sortedPatterns.filter(p => p[1].count >= 5).length}`);
    console.log(`Patterns with 10+ occurrences: ${sortedPatterns.filter(p => p[1].count >= 10).length}`);
}

/**
 * Normalize ability text to identify patterns
 */
function normalizePattern(text: string): string {
    let normalized = text.toLowerCase();

    // Normalize numbers
    normalized = normalized.replace(/\d+/g, 'N');

    // Normalize character names (simplistic approach)
    normalized = normalized.replace(/\b[A-Z][a-z]+\b/g, 'X');

    // Keep first 100 chars for pattern matching
    normalized = normalized.substring(0, 100);

    return normalized;
}

analyzeSkippedTests();
