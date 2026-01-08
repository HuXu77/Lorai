import * as fs from 'fs';
import * as path from 'path';

interface PatternCluster {
    pattern: string;
    normalizedPattern: string;
    count: number;
    examples: Array<{ cardName: string; fullText: string }>;
    category: string;
}

function extractSkippedAbilities(): Array<{ cardName: string; abilityText: string; abilityType: string }> {
    const autoTestsDir = path.join(__dirname, '../tests/abilities/auto');
    const files = fs.readdirSync(autoTestsDir).filter(f => f.endsWith('.test.ts'));

    const abilities: Array<{ cardName: string; abilityText: string; abilityType: string }> = [];

    for (const file of files) {
        const content = fs.readFileSync(path.join(autoTestsDir, file), 'utf-8');

        // Find all describe.skip blocks
        const skipRegex = /describe\.skip\('([^']+)',[\s\S]*?abilities:\s*\[([\s\S]*?)\]/g;
        let match;

        while ((match = skipRegex.exec(content)) !== null) {
            const cardName = match[1];
            const abilitiesText = match[2];

            // Extract individual abilities
            const abilityBlocks = abilitiesText.match(/\{[\s\S]*?"(?:effect|fullText)"[\s\S]*?\}/g) || [];

            for (const block of abilityBlocks) {
                try {
                    // Extract effect or fullText
                    const effectMatch = block.match(/"effect":\s*"([^"]+)"/);
                    const fullTextMatch = block.match(/"fullText":\s*"([^"]+)"/);
                    const typeMatch = block.match(/"type":\s*"([^"]+)"/);
                    const keywordMatch = block.match(/"keyword":\s*"([^"]+)"/);

                    let abilityText = '';
                    if (effectMatch) abilityText = effectMatch[1];
                    else if (fullTextMatch) abilityText = fullTextMatch[1];
                    else if (keywordMatch) abilityText = `Keyword: ${keywordMatch[1]}`;

                    const abilityType = typeMatch ? typeMatch[1] : 'unknown';

                    if (abilityText) {
                        // Clean up escaped characters
                        abilityText = abilityText
                            .replace(/\\\\n/g, ' ')
                            .replace(/\\n/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();

                        abilities.push({ cardName, abilityText, abilityType });
                    }
                } catch (e) {
                    // Skip malformed blocks
                }
            }
        }
    }

    return abilities;
}

function normalizePattern(text: string): string {
    return text
        .toLowerCase()
        .replace(/\d+/g, 'N')  // Replace numbers with N
        .replace(/[¤◊⬡🛡️⛉]/g, 'STAT')  // Replace stat symbols
        .replace(/⟳/g, 'EXERT')  // Replace exert symbol
        .replace(/\b(chosen|selected|target)\b/g, 'CHOSEN')
        .replace(/\b(your|my)\b/g, 'YOUR')
        .replace(/\b(this|that|it)\b/g, 'THIS')
        .replace(/\b(opponent's?|opposing)\b/g, 'OPPONENT')
        .replace(/\b(character|item|location|action|song)s?\b/g, 'CARD')
        .replace(/\s+/g, ' ')
        .trim();
}

function categorizeAbility(text: string): string {
    const lower = text.toLowerCase();

    // Combat/Challenge patterns
    if (lower.includes('during your turn') && lower.includes('banishes another character in a challenge')) {
        return 'Combat: Banish in Challenge → Gain Lore';
    }
    if (lower.includes('when') && lower.includes('challenges and is banished')) {
        return 'Combat: When Challenges and Banished';
    }
    if (lower.includes('whenever') && lower.includes('challenges')) {
        return 'Combat: Challenge Trigger';
    }

    // Enters play patterns
    if (lower.includes('enters play exerted')) {
        return 'Enter Play: Exerted';
    }

    // Banishment patterns
    if (lower.includes('when this character is banished')) {
        return 'Banish Trigger: Self Banished';
    }
    if (lower.includes('exert all opposing')) {
        return 'Mass Effect: Exert All Opposing';
    }

    // Rush keyword (should be parsed but isn't)
    if (lower.match(/^rush\b/)) {
        return 'Keyword: Rush (Should Parse)';
    }

    // During turn patterns
    if (lower.includes('during your turn') || lower.includes('during each opponent')) {
        return 'Turn-Based: During Turn';
    }

    // Conditional play effects
    if (lower.includes('when you play') && lower.includes('if you')) {
        return 'Conditional: On Play If';
    }

    // Gain/Grant keyword patterns
    if (lower.match(/\b(gain|gains|grant|grants)\b/) && lower.match(/\b(evasive|bodyguard|ward|reckless|rush|support)\b/)) {
        return 'Grant Keyword: To Target';
    }

    // Lose keyword patterns
    if (lower.includes('lose') && lower.match(/\b(evasive|bodyguard|ward|reckless)\b/)) {
        return 'Remove Keyword: From Target';
    }

    // Named character patterns
    if (lower.includes('named') && lower.includes('character')) {
        return 'Named Character: Effects';
    }

    // Skip turn phases
    if (lower.includes('skip') && lower.includes('turn')) {
        return 'Turn Phase: Skip';
    }

    // Each opponent effects
    if (lower.includes('each opponent')) {
        return 'Multi-Target: Each Opponent';
    }

    // Location/Movement
    if (lower.includes('move') && lower.includes('location')) {
        return 'Location: Movement';
    }

    // While conditions
    if (lower.match(/^while\b/)) {
        return 'Conditional: While';
    }

    return 'Uncategorized';
}

function clusterPatterns(abilities: Array<{ cardName: string; abilityText: string; abilityType: string }>) {
    const clusters = new Map<string, PatternCluster>();

    for (const ability of abilities) {
        const normalized = normalizePattern(ability.abilityText);
        const category = categorizeAbility(ability.abilityText);

        if (!clusters.has(normalized)) {
            clusters.set(normalized, {
                pattern: ability.abilityText,
                normalizedPattern: normalized,
                count: 0,
                examples: [],
                category
            });
        }

        const cluster = clusters.get(normalized)!;
        cluster.count++;

        if (cluster.examples.length < 5) {
            cluster.examples.push({
                cardName: ability.cardName,
                fullText: ability.abilityText
            });
        }
    }

    return Array.from(clusters.values()).sort((a, b) => b.count - a.count);
}

function analyzePatterns() {
    console.log('=== UNKNOWN PATTERN CLUSTERING ANALYSIS ===\n');

    const abilities = extractSkippedAbilities();
    console.log(`Total skipped abilities: ${abilities.length}\n`);

    const clusters = clusterPatterns(abilities);

    // Group by category
    const byCategory = new Map<string, PatternCluster[]>();
    for (const cluster of clusters) {
        if (!byCategory.has(cluster.category)) {
            byCategory.set(cluster.category, []);
        }
        byCategory.get(cluster.category)!.push(cluster);
    }

    // Sort categories by total count
    const sortedCategories = Array.from(byCategory.entries())
        .map(([category, patterns]) => ({
            category,
            patterns,
            totalCount: patterns.reduce((sum, p) => sum + p.count, 0)
        }))
        .sort((a, b) => b.totalCount - a.totalCount);

    console.log('=== PATTERNS BY CATEGORY ===\n');

    for (const { category, patterns, totalCount } of sortedCategories.slice(0, 20)) {
        console.log(`\n## ${category} (${totalCount} occurrences, ${patterns.length} unique patterns)\n`);

        for (const pattern of patterns.slice(0, 5)) {
            console.log(`### Pattern (${pattern.count} occurrences):`);
            console.log(`"${pattern.pattern}"\n`);
            console.log('Examples:');
            for (const ex of pattern.examples.slice(0, 3)) {
                console.log(`  - ${ex.cardName}: ${ex.fullText.substring(0, 100)}...`);
            }
            console.log();
        }
    }

    console.log('\n=== TOP 30 MOST COMMON NORMALIZED PATTERNS ===\n');
    for (const cluster of clusters.slice(0, 30)) {
        console.log(`${cluster.count} occurrences: [${cluster.category}]`);
        console.log(`  Pattern: "${cluster.pattern}"`);
        console.log(`  Examples: ${cluster.examples.slice(0, 2).map(e => e.cardName).join(', ')}`);
        console.log();
    }
}

analyzePatterns();
