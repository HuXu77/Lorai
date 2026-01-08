/**
 * Deep analysis of remaining test failures
 * Samples more failures to identify next batch of patterns
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('🔍 Deep Analysis of Remaining Failures...\n');

const testDir = path.join(__dirname, '../tests/abilities/auto');
const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.ts'));

const patterns: Map<string, { count: number; examples: string[] }> = new Map();

function addPattern(key: string, example: string) {
    if (!patterns.has(key)) {
        patterns.set(key, { count: 0, examples: [] });
    }
    const p = patterns.get(key)!;
    p.count++;
    if (p.examples.length < 3) {
        p.examples.push(example.substring(0, 100));
    }
}

let sampleCount = 0;
for (const file of testFiles.slice(0, 200)) { // Sample more files
    const content = fs.readFileSync(path.join(testDir, file), 'utf-8');

    const abilityMatch = content.match(/\/\/ Ability Text: (.+)/);
    if (!abilityMatch) continue;

    const text = abilityMatch[1];
    if (!text || text === 'undefined') continue;

    const lower = text.toLowerCase();

    // Time-based triggers
    if (lower.includes('at the start of your turn')) addPattern('Start of turn trigger', text);
    if (lower.includes('at the end of your turn')) addPattern('End of turn trigger', text);

    // Cost reduction
    if (lower.match(/(?:your|opponent's) .* cost \d+ less/)) addPattern('Cost reduction', text);
    if (lower.match(/costs? \d+ less/)) addPattern('Cost reduction (general)', text);

    // Gains abilities
    if (lower.includes('gains') && (lower.includes('challenger') || lower.includes('evasive') || lower.includes('rush'))) {
        addPattern('Gains keyword', text);
    }

    // Conditional effects
    if (lower.match(/if (?:you have|there'?s|this character)/)) addPattern('Conditional (if)', text);
    if (lower.includes('while at a location')) addPattern('Location conditional', text);

    // Complex triggers
    if (lower.includes('when this character is banished')) addPattern('Banishment trigger', text);
    if (lower.includes('when this character is challenged')) addPattern('Challenged trigger', text);

    // Area effects
    if (lower.match(/(?:each|all) (?:player|opponent)/)) addPattern('Area effect (players)', text);
    if (lower.match(/all .* characters/)) addPattern('Area effect (characters)', text);

    // Move/location
    if (lower.includes('move to') || lower.includes('move another')) addPattern('Move character', text);
    if (lower.includes('location')) addPattern('Location interaction', text);

    // Ready/Exert state
    if (lower.includes('ready') && !lower.includes('already')) addPattern('Ready character', text);

    // Card types
    if (lower.includes('song') && !lower.includes('sing')) addPattern('Song interaction', text);
    if (lower.includes('item')) addPattern('Item interaction', text);

    // Pay costs
    if (lower.match(/pay \d+ ⬡/)) addPattern('Pay ink cost', text);
    if (lower.includes('you may pay')) addPattern('Optional payment', text);

    // Multiple effects
    if (lower.includes('chosen character gains')) addPattern('Chosen gains ability', text);

    sampleCount++;
}

// Sort and display
const sorted = Array.from(patterns.entries())
    .sort((a, b) => b[1].count - a[1].count);

console.log('Top Next Patterns to Add (200 card sample):');
console.log('='.repeat(80));
console.log('Count  Pattern                              Example');
console.log('='.repeat(80));

for (const [pattern, data] of sorted.slice(0, 15)) {
    console.log(
        data.count.toString().padStart(5) + '  ' +
        pattern.padEnd(40) +
        data.examples[0]?.substring(0, 35) || ''
    );
}

console.log('\n💡 Recommended: Add top 10 patterns with TDD approach');
console.log('   1. Write tests first');
console.log('   2. Implement patterns');
console.log('   3. Verify all tests pass');
console.log('   4. Run full suite for coverage\n');
