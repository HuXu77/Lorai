/**
 * Analysis: Final 200 Failures - Special Cases vs Patterns
 * Identify which need specific patterns vs which need card-specific handlers
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('🔍 Analyzing Final 200 Failures for Special Cases\n');

const testDir = path.join(__dirname, '../tests/abilities/auto');
const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.ts'));

interface Pattern {
    name: string;
    examples: string[];
    count: number;
    addable: boolean; // Can we add a pattern or needs card-specific?
}

const patterns: Map<string, Pattern> = new Map();

function add(name: string, example: string, addable: boolean = true) {
    if (!patterns.has(name)) {
        patterns.set(name, { name, examples: [], count: 0, addable });
    }
    const p = patterns.get(name)!;
    p.count++;
    if (p.examples.length < 2) p.examples.push(example.substring(0, 90));
}

let analyzed = 0;
for (const file of testFiles.slice(0, 250)) {
    const content = fs.readFileSync(path.join(testDir, file), 'utf-8');

    const abilityMatch = content.match(/\/\/ Ability Text: (.+)/);
    if (!abilityMatch) continue;

    const text = abilityMatch[1];
    if (!text || text === 'undefined') continue;

    const lower = text.toLowerCase();

    // ADDABLE PATTERNS (can write regex)
    if (lower.includes('enters play')) add('Enters play trigger', text, true);
    if (lower.match(/move.*damage/)) add('Move damage', text, true);
    if (lower.includes('shuffle') && lower.includes('deck')) add('Shuffle deck', text, true);
    if (lower.match(/look at.*(?:top|bottom)/)) add('Look at cards', text, true);
    if (lower.includes('quest') && lower.includes('all')) add('Quest restriction/benefit', text, true);
    if (lower.match(/\d+\s*⬡/)) add('Ink cost symbol', text, true);

    // RARE/COMPLEX (might need card-specific)
    if (lower.includes('sing this song for free')) add('Singer mechanic detail', text, false);
    if (lower.match(/instead of|rather than/)) add('Replacement effects', text, false);
    if (lower.includes('may not') || lower.includes('cannot')) add('Restriction effects', text, true);
    if (lower.includes('an additional')) add('Additional actions', text, false);

    analyzed++;
}

// Display results
console.log('ADDABLE PATTERNS (Can add regex):');
console.log('='.repeat(100));
const addable = Array.from(patterns.values())
    .filter(p => p.addable)
    .sort((a, b) => b.count - a.count);

for (const p of addable) {
    console.log(`${p.count.toString().padStart(3)}  ${p.name.padEnd(40)}`);
    for (const ex of p.examples) {
        console.log(`      • ${ex}`);
    }
    console.log();
}

console.log('\nCARD-SPECIFIC HANDLERS (Too complex for patterns):');
console.log('='.repeat(100));
const specific = Array.from(patterns.values())
    .filter(p => !p.addable)
    .sort((a, b) => b.count - a.count);

for (const p of specific) {
    console.log(`${p.count.toString().padStart(3)}  ${p.name}`);
}

console.log('\n💡 RECOMMENDATION:');
console.log('   • Add top 5-10 addable patterns → +30-50 tests → 77-80%');
console.log('   • Document card-specific handlers for future\n');
