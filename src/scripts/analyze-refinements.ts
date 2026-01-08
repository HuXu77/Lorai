/**
 * Pattern Refinement Analysis
 * Identify what existing patterns miss and how to improve them
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('🔬 Pattern Refinement Analysis\n');
console.log('Goal: Identify how to improve existing 49 patterns\n');

const testDir = path.join(__dirname, '../tests/abilities/auto');
const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.ts'));

interface RefinementOpportunity {
    category: string;
    examples: string[];
    count: number;
}

const refinements: Map<string, RefinementOpportunity> = new Map();

function addRefinement(category: string, example: string) {
    if (!refinements.has(category)) {
        refinements.set(category, { category, examples: [], count: 0 });
    }
    const r = refinements.get(category)!;
    r.count++;
    if (r.examples.length < 3) {
        r.examples.push(example.substring(0, 100));
    }
}

// Sample failures to identify patterns
let analyzed = 0;
for (const file of testFiles.slice(0, 303)) {
    const content = fs.readFileSync(path.join(testDir, file), 'utf-8');

    const abilityMatch = content.match(/\/\/ Ability Text: (.+)/);
    if (!abilityMatch) continue;

    const text = abilityMatch[1];
    if (!text || text === 'undefined') continue;

    const lower = text.toLowerCase();

    // REFINEMENT CATEGORIES

    // 1. Trigger variations we might miss
    if (lower.includes('whenever') && !lower.match(/whenever (?:this character|you play)/)) {
        addRefinement('Trigger Variations', text);
    }

    // 2. Optional "you may" that we don't handle consistently
    if (lower.includes('you may') && !lower.match(/you may draw|you may pay/)) {
        addRefinement('Optional Effects (you may)', text);
    }

    // 3. Compound effects (multiple effects in one ability)
    if (text.split('.').length > 2 || text.includes(', then ')) {
        addRefinement('Compound/Sequential Effects', text);
    }

    // 4. Numeric variations (X vs numbers)
    if (text.match(/\bX\b/) || text.includes('equal to')) {
        addRefinement('Variable X / Equal to', text);
    }

    // 5. Target variations
    if (lower.includes('named ') || lower.includes('with cost')) {
        addRefinement('Specific Target Filters', text);
    }

    // 6. Duration/timing we may miss
    if (lower.includes('this turn') || lower.includes('rest of')) {
        addRefinement('Duration (this turn/rest of)', text);
    }

    // 7. Reminder text in parentheses
    if (text.includes('(') && text.includes(')')) {
        addRefinement('Has Reminder Text', text);
    }

    // 8. Multiple abilities on one card (might only catch first)
    const abilityCount = (text.match(/\./g) || []).length;
    if (abilityCount > 2) {
        addRefinement('Multiple Abilities', text);
    }

    analyzed++;
}

console.log('='.repeat(100));
console.log('REFINEMENT OPPORTUNITIES');
console.log('='.repeat(100));

const sorted = Array.from(refinements.values()).sort((a, b) => b.count - a.count);

for (const r of sorted) {
    console.log(`\n${r.category} (${r.count} occurrences)`);
    console.log('-'.repeat(100));
    for (const example of r.examples) {
        console.log(`  • ${example}`);
    }
}

console.log('\n' + '='.repeat(100));
console.log('RECOMMENDATIONS');
console.log('='.repeat(100));
console.log('1. Add "you may" handling to all effect patterns');
console.log('2. Strip reminder text before parsing');
console.log('3. Split compound effects and parse separately');
console.log('4. Handle variable X in numeric contexts');
console.log('5. Make patterns more flexible with optional groups');
console.log('6. Add duration markers to effects');
console.log('7. Ensure all abilities on a card are processed\n');
