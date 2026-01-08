#!/usr/bin/env ts-node
/**
 * Audit script to verify that reproduction tests use real card data from allCards.json
 * 
 * This script:
 * 1. Loads allCards.json
 * 2. Scans all reproduction test files in src/tests/abilities/repro/
 * 3. Extracts card IDs and ability texts from test files
 * 4. Compares against allCards.json to find mismatches
 *  5. Reports fabricated test data
 */

import * as fs from 'fs';
import * as path from 'path';

interface Card {
    id: number;
    name: string;
    fullName: string;
    abilities?: any[];
    fullTextSections?: string[];
}

interface AuditResult {
    fileName: string;
    cardName: string;
    cardId: number;
    issues: string[];
}

const REPO_ROOT = path.join(__dirname, '..', '..');
const REPRO_TEST_DIR = path.join(REPO_ROOT, 'src', 'tests', 'abilities', 'repro');
const ALL_CARDS_PATH = path.join(REPO_ROOT, 'allCards.json');

async function loadAllCards(): Promise<Card[]> {
    const data = fs.readFileSync(ALL_CARDS_PATH, 'utf-8');
    const allCardsData = JSON.parse(data);

    // allCards.json has structure: { metadata: {...}, sets: {...}, cards: [...] }
    if (allCardsData.cards && Array.isArray(allCardsData.cards)) {
        return allCardsData.cards;
    }

    // Fallback: if it's just an array
    if (Array.isArray(allCardsData)) {
        return allCardsData;
    }

    console.error('Unexpected allCards.json structure');
    return [];
}

function findCardById(cards: Card[], id: number): Card | undefined {
    return cards.find(c => c.id === id);
}

function findCardByName(cards: Card[], fullName: string): Card | undefined {
    return cards.find(c => c.fullName === fullName);
}

function extractTestData(fileContent: string): { cardId: number; cardName: string; abilityTexts: string[] }[] {
    const results: { cardId: number; cardName: string; abilityTexts: string[] }[] = [];

    // Match card objects in test files - handle escaped quotes in names
    const cardObjectRegex = /const card = \{[^}]*id:\s*(\d+)[^}]*(?:fullName|name):\s*['"]([^'"\\]+(?:\\.[^'"\\]*)*)['"][^}]*abilities:\s*\[([^\]]+)\]/gs;

    let match;
    while ((match = cardObjectRegex.exec(fileContent)) !== null) {
        const cardId = parseInt(match[1]);
        // Remove escape slashes from card name
        const cardName = match[2].replace(/\\'/g, "'").replace(/\\"/g, '"');
        const abilitiesBlock = match[3];

        // Extract ability effect texts
        const effectRegex = /"effect":\s*"([^"]+)"/g;
        const abilityTexts: string[] = [];
        let effectMatch;
        while ((effectMatch = effectRegex.exec(abilitiesBlock)) !== null) {
            abilityTexts.push(effectMatch[1]);
        }

        results.push({ cardId, cardName, abilityTexts });
    }

    return results;
}

async function auditReproTests(): Promise<AuditResult[]> {
    const allCards = await loadAllCards();
    const results: AuditResult[] = [];

    // Get all repro test files
    if (!fs.existsSync(REPRO_TEST_DIR)) {
        console.error(`Repro test directory not found: ${REPRO_TEST_DIR}`);
        return results;
    }

    const testFiles = fs.readdirSync(REPRO_TEST_DIR).filter(f => f.endsWith('.test.ts'));

    for (const testFile of testFiles) {
        const filePath = path.join(REPRO_TEST_DIR, testFile);
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        const testCards = extractTestData(fileContent);

        for (const testCard of testCards) {
            const issues: string[] = [];

            // Check 1: Does the card ID exist in allCards.json?
            const realCard = findCardById(allCards, testCard.cardId);

            if (!realCard) {
                issues.push(`Card ID ${testCard.cardId} not found in allCards.json`);
            } else {
                // Check 2: Does the full name match?
                if (realCard.fullName !== testCard.cardName) {
                    issues.push(`Name mismatch: test has "${testCard.cardName}", allCards has "${realCard.fullName}"`);
                }

                // Check 3: Do the abilities match?
                const realAbilityTexts: string[] = [];
                if (realCard.abilities) {
                    realCard.abilities.forEach((ability: any) => {
                        if (ability.effect) {
                            realAbilityTexts.push(ability.effect);
                        }
                    });
                }

                // Check if test abilities exist in real card
                for (const testAbilityText of testCard.abilityTexts) {
                    const cleanTestText = testAbilityText.replace(/\\n/g, '\n').trim();
                    const matchFound = realAbilityTexts.some(realText =>
                        realText.replace(/\\n/g, '\n').trim() === cleanTestText
                    );

                    if (!matchFound) {
                        issues.push(`FABRICATED ABILITY: "${testAbilityText.substring(0, 60)}..."`);
                    }
                }

                // Check if real card has more abilities than test
                if (realAbilityTexts.length !== testCard.abilityTexts.length) {
                    issues.push(`Ability count mismatch: test has ${testCard.abilityTexts.length}, real card has ${realAbilityTexts.length}`);
                }
            }

            if (issues.length > 0) {
                results.push({
                    fileName: testFile,
                    cardName: testCard.cardName,
                    cardId: testCard.cardId,
                    issues
                });
            }
        }
    }

    return results;
}

async function main() {
    console.log('🔍 Auditing reproduction tests against allCards.json...\n');

    const results = await auditReproTests();

    if (results.length === 0) {
        console.log('✅ All reproduction tests use valid card data from allCards.json!\n');
        process.exit(0);
    }

    console.log(`❌ Found ${results.length} reproduction test(s) with issues:\n`);

    for (const result of results) {
        console.log(`📄 ${result.fileName}`);
        console.log(`   Card: ${result.cardName} (ID: ${result.cardId})`);
        result.issues.forEach(issue => {
            console.log(`   ⚠️  ${issue}`);
        });
        console.log('');
    }

    console.log(`\n🔧 Fix these issues by updating the test data to match allCards.json\n`);
    process.exit(1);
}

main().catch(err => {
    console.error('Error running audit:', err);
    process.exit(1);
});
