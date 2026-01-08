import * as fs from 'fs';
import * as path from 'path';

interface GapStatistics {
    totalCards: number;
    passingCards: number;
    failingCards: number;
    totalExpectedAbilities: number;
    totalParsedAbilities: number;
    cardsByGapSize: Map<number, string[]>;
    missingPatternExamples: Array<{ card: string; expected: number; actual: number; abilities: string[] }>;
}

/**
 * Extract gap statistics from auto-generated test files
 */
function analyzeParserGaps(): GapStatistics {
    const testDir = path.join(__dirname, '../tests/abilities/auto');
    const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.ts'));

    const stats: GapStatistics = {
        totalCards: 0,
        passingCards: 0,
        failingCards: 0,
        totalExpectedAbilities: 0,
        totalParsedAbilities: 0,
        cardsByGapSize: new Map(),
        missingPatternExamples: []
    };

    for (const file of testFiles) {
        const filePath = path.join(testDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Extract all test blocks with Expected/Actual comments
        const testBlocks = content.match(/describe\.skip\([^)]+\)[^{]*\{[^]*?}\s*\}\);/g) || [];
        const passingBlocks = content.match(/describe\([^)]+\)[^{]*\{[^]*?}\s*\}\);/g) || [];

        // Process failing (skipped) tests
        for (const block of testBlocks) {
            const cardNameMatch = block.match(/describe\.skip\('([^']+)'/);
            const expectedMatch = block.match(/\/\/ Expected: (\d+)/);
            const actualMatch = block.match(/\/\/ Actual: (\d+)/);

            if (expectedMatch && actualMatch) {
                const cardName = cardNameMatch ? cardNameMatch[1] : 'Unknown';
                const expected = parseInt(expectedMatch[1]);
                const actual = parseInt(actualMatch[1]);
                const gap = expected - actual;

                stats.totalCards++;
                stats.failingCards++;
                stats.totalExpectedAbilities += expected;
                stats.totalParsedAbilities += actual;

                // Track by gap size
                if (!stats.cardsByGapSize.has(gap)) {
                    stats.cardsByGapSize.set(gap, []);
                }
                stats.cardsByGapSize.get(gap)!.push(cardName);

                // Extract ability text for analysis
                const abilitiesMatch = block.match(/abilities: \[([^\]]*)\]/s);
                const abilities: string[] = [];
                if (abilitiesMatch) {
                    const abilityObjects = abilitiesMatch[1].match(/\{[^}]*"effect":\s*"([^"]+)"/g) || [];
                    abilities.push(...abilityObjects.map(obj => {
                        const match = obj.match(/"effect":\s*"([^"]+)"/);
                        return match ? match[1] : '';
                    }).filter(a => a));
                }

                //Store examples for detailed analysis (first 50)
                if (stats.missingPatternExamples.length < 50) {
                    stats.missingPatternExamples.push({
                        card: cardName,
                        expected,
                        actual,
                        abilities
                    });
                }
            }
        }

        // Process passing tests
        for (const block of passingBlocks) {
            const expectedMatch = block.match(/\/\/ Expected: (\d+)/);
            const actualMatch = block.match(/\/\/ Actual: (\d+)/);

            if (expectedMatch && actualMatch) {
                const expected = parseInt(expectedMatch[1]);
                const actual = parseInt(actualMatch[1]);

                stats.totalCards++;
                if (actual >= expected) {
                    stats.passingCards++;
                }
                stats.totalExpectedAbilities += expected;
                stats.totalParsedAbilities += actual;
            }
        }
    }

    return stats;
}

/**
 * Print gap analysis report
 */
function printReport(stats: GapStatistics) {
    console.log('\n📊 PARSER GAP ANALYSIS REPORT');
    console.log('═'.repeat(60));
    console.log('');

    console.log('📈 Overall Statistics:');
    console.log(`  Total Cards Analyzed:     ${stats.totalCards}`);
    console.log(`  ✅ Passing:                ${stats.passingCards} (${((stats.passingCards / stats.totalCards) * 100).toFixed(1)}%)`);
    console.log(`  ❌ Failing:                ${stats.failingCards} (${((stats.failingCards / stats.totalCards) * 100).toFixed(1)}%)`);
    console.log('');

    console.log('🎯 Ability Coverage:');
    console.log(`  Expected Total Abilities: ${stats.totalExpectedAbilities}`);
    console.log(`  Actually Parsed:          ${stats.totalParsedAbilities}`);
    console.log(`  Missing Abilities:        ${stats.totalExpectedAbilities - stats.totalParsedAbilities}`);
    const coverage = (stats.totalParsedAbilities / stats.totalExpectedAbilities) * 100;
    console.log(`  Parser Coverage:          ${coverage.toFixed(1)}%`);
    console.log('');

    console.log('📊 Gap Distribution:');
    const sortedGaps = Array.from(stats.cardsByGapSize.entries()).sort((a, b) => b[1].length - a[1].length);
    for (const [gap, cards] of sortedGaps.slice(0, 10)) {
        console.log(`  Missing ${gap} ${gap === 1 ? 'ability' : 'abilities'}:  ${cards.length} cards`);
    }
    console.log('');

    console.log('🔍 Example Failing Cards (first 10):');
    for (const example of stats.missingPatternExamples.slice(0, 10)) {
        console.log(`  • ${example.card}`);
        console.log(`    Expected: ${example.expected} | Actual: ${example.actual} | Gap: ${example.expected - example.actual}`);
        if (example.abilities.length > 0) {
            console.log(`    Abilities:`);
            for (const ability of example.abilities) {
                const truncated = ability.length > 80 ? ability.substring(0, 77) + '...' : ability;
                console.log(`      - "${truncated}"`);
            }
        }
        console.log('');
    }

    console.log('═'.repeat(60));
    console.log('');
}

// Run analysis
const stats = analyzeParserGaps();
printReport(stats);
