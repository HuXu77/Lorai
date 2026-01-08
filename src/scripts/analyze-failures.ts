/**
 * Analyze failing test patterns
 * Samples failed tests to identify most common missing patterns
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Run tests and capture failures
console.log('🔍 Analyzing failed test patterns...\n');

const testDir = path.join(__dirname, '../tests/abilities/auto');
const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.ts'));

// Sample 50 failed tests
const failedPatterns: Map<string, number> = new Map();

let sampleCount = 0;
for (const file of testFiles) {
    if (sampleCount >= 100) break;

    const content = fs.readFileSync(path.join(testDir, file), 'utf-8');

    // Extract ability text from comment
    const abilityMatch = content.match(/\/\/ Ability Text: (.+)/);
    if (!abilityMatch) continue;

    const abilityText = abilityMatch[1];
    if (!abilityText || abilityText === 'undefined') continue;

    const lower = abilityText.toLowerCase();

    // Categorize by pattern type
    if (lower.includes('whenever you play') && lower.includes('character')) {
        increment('Whenever you play a character');
    }
    if (lower.includes('your') && lower.includes('characters') && lower.includes('cost')) {
        increment('Cost reduction (Your characters cost X less)');
    }
    if (lower.includes('your') && lower.includes('characters') && lower.includes('get')) {
        increment('Static aura (Your characters get +X)');
    }
    if (lower.includes('for each')) {
        increment('For each (scaling)');
    }
    if (lower.match(/whenever.*is banished/)) {
        increment('When banished trigger');
    }
    if (lower.includes('chosen') && lower.includes('gains')) {
        increment('Chosen gains keyword/ability');
    }
    if (lower.includes('exert')) {
        increment('Exert effects');
    }
    if (lower.includes('at the start of your turn')) {
        increment('Start of turn trigger');
    }
    if (lower.includes('at the end of your turn')) {
        increment('End of turn trigger');
    }
    if (lower.includes('during your turn')) {
        increment('During your turn restriction');
    }
    if (lower.match(/\d+\s*◊/)) {
        increment('Lore value');
    }
    if (lower.includes('while') && lower.includes('at a location')) {
        increment('Location conditional');
    }
    if (lower.includes('you may choose')) {
        increment('Optional choice');
    }

    sampleCount++;
}

function increment(pattern: string) {
    failedPatterns.set(pattern, (failedPatterns.get(pattern) || 0) + 1);
}

// Sort and display
const sorted = Array.from(failedPatterns.entries())
    .sort((a, b) => b[1] - a[1]);

console.log('Top Missing Patterns (from sample):');
console.log('='.repeat(60));
for (const [pattern, count] of sorted) {
    console.log(`${count.toString().padStart(3)}  ${pattern}`);
}

console.log('\n💡 Add these patterns to improve coverage!\n');
