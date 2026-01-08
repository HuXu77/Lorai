/**
 * Batch 3 Failure Analysis
 * Deep dive into remaining 317 failures
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

console.log('🔍 Batch 3 Analysis - 317 Remaining Failures\n');

const testDir = path.join(__dirname, '../tests/abilities/auto');
const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.ts'));

const patterns: Map<string, { count: number; examples: string[] }> = new Map();

function addPattern(key: string, example: string) {
    if (!patterns.has(key)) {
        patterns.set(key, { count: 0, examples: [] });
    }
    const p = patterns.get(key)!;
    p.count++;
    if (p.examples.length < 2) {
        p.examples.push(example.substring(0, 80));
    }
}

// Sample heavily from remaining failures
let analyzed = 0;
for (const file of testFiles.slice(0, 300)) {
    const content = fs.readFileSync(path.join(testDir, file), 'utf-8');

    const abilityMatch = content.match(/\/\/ Ability Text: (.+)/);
    if (!abilityMatch) continue;

    const text = abilityMatch[1];
    if (!text || text === 'undefined') continue;

    const lower = text.toLowerCase();

    // Look or search effects
    if (lower.match(/look at.*top \d+/)) addPattern('Look at top X cards', text);
    if (lower.includes('search your deck')) addPattern('Search deck', text);
    if (lower.includes('reveal')) addPattern('Reveal cards', text);

    // Put cards places
    if (lower.includes('put') && lower.includes('into play')) addPattern('Put into play', text);
    if (lower.includes('put') && lower.includes('hand')) addPattern('Put into hand', text);
    if (lower.includes('put') && lower.includes('top of your deck')) addPattern('Put on top of deck', text);
    if (lower.includes('put') && lower.includes('bottom')) addPattern('Put on bottom', text);

    // Opponent effects
    if (lower.match(/opponent (?:discards?|draws?|loses?)/)) addPattern('Opponent effects', text);

    // Remove from game
    if (lower.includes('remove from') || lower.includes('out of play')) addPattern('Remove from game', text);

    // Item/song specifics
    if (lower.match(/when you play this (?:item|song)/)) addPattern('Item/Song play trigger', text);

    // For each scaling
    if (lower.includes('for each character')) addPattern('For each character', text);
    if (lower.includes('for each card')) addPattern('For each card', text);

    // Choice effects
    if (lower.includes('choose one') || lower.includes('choose up to')) addPattern('Choose one/up to', text);

    // Ongoing effects
    if (lower.includes('until ') && lower.includes('turn')) addPattern('Until X turn', text);

    // Damage counters
    if (lower.match(/\d+ damage/)) addPattern('X damage (numeric)', text);

    // Prevent
    if (lower.includes('prevent')) addPattern('Prevent damage/effects', text);

    analyzed++;
}

const sorted = Array.from(patterns.entries())
    .sort((a, b) => b[1].count - a[1].count);

console.log('Top Patterns in Remaining 317 Failures:');
console.log('='.repeat(90));
console.log('Count  Pattern                              Example');
console.log('='.repeat(90));

for (const [pattern, data] of sorted.slice(0, 15)) {
    console.log(
        data.count.toString().padStart(5) + '  ' +
        pattern.padEnd(40) +
        (data.examples[0] || '')
    );
}

console.log('\n📊 Analysis Complete:');
console.log(`   Analyzed: ${analyzed} cards`);
console.log(`   Unique patterns found: ${patterns.size}`);
console.log('\n💡 Next: Write TDD tests for top 10 patterns\n');
