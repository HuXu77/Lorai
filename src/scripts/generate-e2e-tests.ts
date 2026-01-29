
/// <reference types="node" />

import * as fs from 'fs';
import * as path from 'path';
import { Card } from '../engine/models';
import { parseToAbilityDefinition } from '../engine/ability-parser';
import { AbilityDefinition, TriggeredAbility } from '../engine/abilities/types';
import { GameEvent } from '../engine/abilities/events';
import { EffectAST } from '../engine/abilities/effect-ast';

// Configuration
const BATCH_SIZE = 20; // Smaller batch for E2E
const OUTPUT_DIR = path.join(__dirname, '../tests/e2e/generated');

interface CardData {
    id: number;
    name: string;
    subtitle?: string;
    fullName?: string;
    type: string;
    cost: number;
    inkwell: boolean;
    color: string;
    abilities?: Array<{ type: string; keyword?: string; fullText?: string; effect?: string }>;
    text?: string;
    fullTextSections?: string[];
    strength?: number;
    willpower?: number;
    lore?: number;
}

type TestGenerator = (card: CardData, ability: AbilityDefinition, index: number, rawText: string) => string | null;

// Helper: Check if raw ability text contains complex requirements we can't easily test
function hasComplexRequirements(text: string): boolean {
    const complexPatterns = [
        /\b\d+\s*[\u00a4◆]\s+or\s+(more|less)\b/i,  // "5 ◆ or more" cost filter
        /\bif you have\b/i,                          // conditional "if you have X"
        /\bwhenever you put a card under\b/i,        // Non-play triggers
        /\bwith \d+/i,                               // "with 5" cost filter
        /\bwith cost\b/i,                            // cost filter
    ];
    return complexPatterns.some(p => p.test(text));
}

// Known card IDs that have complex conditions not caught by text filters
// (usually due to rawText index mismatch or tricky modal flows)
const BLOCKLISTED_CARD_IDS = [
    663,   // Maleficent - Monstrous Dragon: optional banish modal flow
    1072,  // Pete - Steamboat Rival: "if you have another Pete" condition
    2381,  // Fairy Godmother - Magical Benefactor: triggers on Boost, not play
];


// ==========================================
// PATTERN: Deal Damage to Chosen Opposing Character
// ==========================================
// e.g. "When you play this character, deal 2 damage to chosen opposing character."
const damagePattern: TestGenerator = (card, ability, index, rawText) => {
    // Skip blocklisted cards
    if (BLOCKLISTED_CARD_IDS.includes(card.id)) return null;

    if (ability.type !== 'triggered') return null;
    const triggered = ability as TriggeredAbility;

    // Skip complex abilities with target filters we can't test
    if (hasComplexRequirements(rawText)) return null;

    // Trigger: On Play
    if (triggered.event !== GameEvent.CARD_PLAYED) return null;
    if (triggered.triggerFilter && JSON.stringify(triggered.triggerFilter) !== JSON.stringify({ target: 'self' })) return null;
    if (triggered.eventConditions && triggered.eventConditions.length > 0) return null;
    if (triggered.condition) return null;

    // Effect: Damage Chosen Opposing
    if (triggered.effects.length !== 1) return null;
    const effect = triggered.effects[0];

    // Check for damage effect targeting chosen opposing character
    // The parser might output target: { type: 'chosen_character', opposing: true } OR { type: 'chosen_opposing_character' }
    // We need to be flexible
    if (effect.type !== 'damage') return null;

    const target = effect.target;
    // Check if target is chosen opposing
    const isChosenOpposing =
        target.type === 'chosen_opposing_character' ||
        (target.type === 'chosen_character' && (target as any).opposing === true);

    if (!isChosenOpposing) return null;

    // FILTER: Skip if target has complex conditions that require specific test setup
    const blocklistedKeys = ['cost', 'costCondition', 'name', 'subtype', 'strength', 'willpower', 'damaged', 'characteristics', 'ink', 'lore'];
    const targetKeys = Object.keys(target);
    const hasComplexFilter = targetKeys.some(k => blocklistedKeys.includes(k));
    if (hasComplexFilter) return null;

    const amount = typeof effect.amount === 'number' ? effect.amount : null;
    if (amount === null) return null; // Only numeric damage for now

    return generateDamageTest(card, amount, index, !!(effect as any).optional);
};

function generateDamageTest(card: CardData, amount: number, index: number, isOptional: boolean): string {
    const fullName = card.fullName || card.name;
    const safeName = fullName.replace(/'/g, "\\'");
    // Use a target that can survive the damage to verify the counter
    // Mickey Mouse - Brave Little Tailor has 5 HP
    const targetName = 'Mickey Mouse - Brave Little Tailor';

    return `
    test('${safeName} (${card.id}) - Deal ${amount} Damage (Ability ${index})', async ({ gamePage }) => {
        // Setup
        await gamePage.loadTestGame();
        await gamePage.injectState({
            player1: {
                hand: ['${safeName}'],
                inkwell: Array(${card.cost}).fill('Ink'), // Sufficient ink
                play: []
            },
            player2: {
                play: [{ name: '${targetName}', ready: true, damage: 0 }]
            },
            turnPlayer: 'player1'
        });

        // Action: Play Card
        await gamePage.clickCardInHand('${safeName}');
        await gamePage.clickAction('Play Card');
        
        // Target: Opponent's Mickey
        // E2E infrastructure handles targeting via "selectModalOption" for reliability
        ${isOptional ? "await gamePage.confirmModal(); // Optional effect confirmation" : ""}
        await gamePage.selectModalOption('${targetName}'); 
        await gamePage.confirmModal(); // If confirmation is needed
        
        // Wait for update
        await gamePage.page.waitForTimeout(1000);
        
        // Verify: Check damage counter on target
        // Locator strategy: Find card by name, then look for text"${amount}" inside it
        const targetCard = gamePage.page.locator('[data-card-name="${targetName}"]');
        
        // If damage >= 5 (Mickey's HP), he gets banished, so check discard instead
        if (${amount} >= 5) {
             await expect(gamePage.page.locator('text=Opponent Discard').locator('..').locator('img[alt*="${targetName}"]')).toBeVisible();
        } else {
             await expect(targetCard.locator('text="${amount}"')).toBeVisible();
        }
    });`;
}


// ==========================================
// PATTERN: Banish Chosen Opposing Character
// ==========================================
// e.g. "When you play this character, banish chosen opposing character." (Dragon Fire logic)
const banishPattern: TestGenerator = (card, ability, index, rawText) => {
    // Skip blocklisted cards
    if (BLOCKLISTED_CARD_IDS.includes(card.id)) return null;

    if (ability.type !== 'triggered') return null;
    const triggered = ability as TriggeredAbility;

    // Skip complex abilities with target filters we can't test
    if (hasComplexRequirements(rawText)) return null;

    if (triggered.event !== GameEvent.CARD_PLAYED) return null;
    if (triggered.triggerFilter && JSON.stringify(triggered.triggerFilter) !== JSON.stringify({ target: 'self' })) return null;
    if (triggered.condition) return null;

    if (triggered.effects.length !== 1) return null;
    const effect = triggered.effects[0];

    if (effect.type !== 'banish') return null;

    const target = effect.target;
    // Check if target is chosen opposing
    const isChosenOpposing =
        target.type === 'chosen_opposing_character' ||
        (target.type === 'chosen_character' && (target as any).opposing === true);

    if (!isChosenOpposing) return null;

    // FILTER: Skip if target has complex conditions that require specific test setup
    const blocklistedKeys = ['cost', 'costCondition', 'name', 'subtype', 'strength', 'willpower', 'damaged', 'characteristics', 'ink', 'lore'];
    const targetKeys = Object.keys(target);
    const hasComplexFilter = targetKeys.some(k => blocklistedKeys.includes(k));
    if (hasComplexFilter) return null;

    return generateBanishTest(card, index, !!(effect as any).optional);
};

function generateBanishTest(card: CardData, index: number, isOptional: boolean): string {
    const fullName = card.fullName || card.name;
    const safeName = fullName.replace(/'/g, "\\'");
    const targetName = 'Mickey Mouse - Brave Little Tailor';

    return `
    test('${safeName} (${card.id}) - Banish Opponent (Ability ${index})', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        await gamePage.injectState({
            player1: {
                hand: ['${safeName}'],
                inkwell: Array(${card.cost}).fill('Ink'),
                play: []
            },
            player2: {
                play: [{ name: '${targetName}', ready: true }]
            },
            turnPlayer: 'player1'
        });

        // Play
        await gamePage.clickCardInHand('${safeName}');
        await gamePage.clickAction('Play Card');
        
        // Target
        ${isOptional ? "await gamePage.confirmModal(); // Optional effect confirmation" : ""}
        await gamePage.selectModalOption('${targetName}');
        await gamePage.confirmModal();
        
        await gamePage.page.waitForTimeout(1000);
        
        // Verify: Check Discard
        await expect(gamePage.page.locator('text=Opponent Discard').locator('..').locator('img[alt*="${targetName}"]')).toBeVisible();
    });`;
}

// ==========================================
// MAIN GENERATOR
// ==========================================

const patterns: TestGenerator[] = [
    damagePattern,
    banishPattern
];

function generateBatchContent(batchNum: number, tests: string[]): string {
    return `import { test, expect } from '../fixtures/game-fixture';

test.describe('Generated E2E Tests Batch ${batchNum} - Damage/Banish', () => {
    // Increase timeout for E2E tests
    test.setTimeout(60000); 

${tests.join('\n')}
});
`;
}

function generateTests() {
    console.log('📋 Loading cards from allCards.json...');

    const cardsPath = path.join(__dirname, '../../allCards.json');
    if (!fs.existsSync(cardsPath)) {
        console.error(`❌ Could not find allCards.json at ${cardsPath}`);
        process.exit(1);
    }

    const cardsData = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
    const cards: CardData[] = cardsData.cards;
    console.log(`✓ Loaded ${cards.length} cards`);

    // Clean output
    if (fs.existsSync(OUTPUT_DIR)) {
        // fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    let collectedTests: string[] = [];

    for (const card of cards) {
        const mockCard = { ...card, abilities: card.abilities || [], fullTextSections: card.fullTextSections || [] } as any;

        try {
            const abilities = parseToAbilityDefinition(mockCard);
            abilities.forEach((ability, index) => {
                // Get raw text from the original card ability
                const rawAbility = card.abilities?.[index];
                const rawText = rawAbility?.fullText || rawAbility?.effect || '';

                for (const pattern of patterns) {
                    const testCode = pattern(card, ability, index, rawText);
                    if (testCode) {
                        collectedTests.push(testCode);
                        break;
                    }
                }
            });
        } catch (e) { }
    }

    console.log(`✓ Generated ${collectedTests.length} tests`);

    // Write batches
    let batchNum = 1;
    for (let i = 0; i < collectedTests.length; i += BATCH_SIZE) {
        const batchTests = collectedTests.slice(i, i + BATCH_SIZE);
        const content = generateBatchContent(batchNum, batchTests);
        const fileName = `e2e-batch-${String(batchNum).padStart(2, '0')}.spec.ts`;
        fs.writeFileSync(path.join(OUTPUT_DIR, fileName), content);
        console.log(`  Wrote ${fileName}`);
        batchNum++;
    }
}

generateTests();
