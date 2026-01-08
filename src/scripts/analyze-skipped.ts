#!/usr/bin/env ts-node
/**
 * Extract skipped test details from auto-generated test files
 * Outputs card names and ability texts for pattern analysis
 */

import * as fs from 'fs';
import * as path from 'path';

const AUTO_TEST_DIR = path.join(__dirname, '..', '..', 'tests', 'abilities', 'auto');

interface SkippedTest {
    file: string;
    cardName: string;
    cardId: number;
    abilityTexts: string[];
}

function extractSkippedTests(): SkippedTest[] {
    const results: SkippedTest[] = [];

    const testFiles = fs.readdirSync(AUTO_TEST_DIR).filter(f => f.endsWith('.test.ts'));

    for (const testFile of testFiles) {
        const filePath = path.join(AUTO_TEST_DIR, testFile);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Find all describe.skip blocks
        const skipRegex = /describe\.skip\('([^']+)',\s*\(\)\s*=>\s*\{[\s\S]*?id:\s*(\d+),[\s\S]*?fullTextSections:\s*\[([\s\S]*?)\]/g;

        let match;
        while ((match = skipRegex.exec(content)) !== null) {
            const cardName = match[1];
            const cardId = parseInt(match[2]);
            const sectionsBlock = match[3];

            // Extract ability text sections
            const abilityTexts: string[] = [];
            const textRegex = /"([^"]+)"/g;
            let textMatch;
            while ((textMatch = textRegex.exec(sectionsBlock)) !== null) {
                abilityTexts.push(textMatch[1].replace(/\\n/g, ' ').trim());
            }

            results.push({
                file: testFile,
                cardName,
                cardId,
                abilityTexts
            });
        }
    }

    return results;
}

function main() {
    console.log('📊 Extracting skipped test details...\n');

    const skipped = extractSkippedTests();

    console.log(`Found ${skipped.length} skipped tests:\n`);

    for (const test of skipped) {
        console.log(`📌 ${test.cardName} (ID: ${test.cardId})`);
        console.log(`   File: ${test.file}`);
        if (test.abilityTexts.length > 0) {
            test.abilityTexts.forEach((ability, idx) => {
                console.log(`   Ability ${idx + 1}: ${ability.substring(0, 80)}${ability.length > 80 ? '...' : ''}`);
            });
        } else {
            console.log('   ⚠️  No abilities found');
        }
        console.log('');
    }

    // Group by common patterns
    console.log('\n📋 Pattern Analysis:');
    const patternCounts = new Map<string, number>();

    for (const test of skipped) {
        for (const ability of test.abilityTexts) {
            const lower = ability.toLowerCase();
            if (lower.includes('whenever')) patternCounts.set('whenever', (patternCounts.get('whenever') || 0) + 1);
            if (lower.includes('when you play')) patternCounts.set('when you play', (patternCounts.get('when you play') || 0) + 1);
            if (lower.includes('at the start')) patternCounts.set('at the start', (patternCounts.get('at the start') || 0) + 1);
            if (lower.includes('choose')) patternCounts.set('choose', (patternCounts.get('choose') || 0) + 1);
        }
    }

    for (const [pattern, count] of Array.from(patternCounts.entries()).sort((a, b) => b[1] - a[1])) {
        console.log(`   ${pattern}: ${count} occurrences`);
    }
}

main();
