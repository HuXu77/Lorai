/// <reference types="node" />

import * as fs from 'fs';
import * as path from 'path';
import { Card } from '../engine/models';
import { parseToAbilityDefinition } from '../engine/ability-parser';
import { AbilityDefinition, TriggeredAbility } from '../engine/abilities/types';
import { GameEvent } from '../engine/abilities/events';
import { EffectAST } from '../engine/abilities/effect-ast';

// Configuration
const BATCH_SIZE = 50;
const OUTPUT_DIR = path.join(__dirname, '../tests/abilities/generated');

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


function cardToSlug(card: CardData): string {
    const fullName = card.fullName || (card.subtitle ? `${card.name} ${card.subtitle}` : card.name);
    return fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// PATTERN MATCHERS

type TestGenerator = (card: CardData, ability: AbilityDefinition, index: number) => string | null;

const patterns: TestGenerator[] = [
    // Pattern 1: On Play -> Gain Lore (Self)
    (card, ability, index) => {
        if (ability.type !== 'triggered') return null;
        const triggered = ability as TriggeredAbility;

        // check trigger is on_play - use correct Enum
        if (triggered.event !== GameEvent.CARD_PLAYED) return null;

        // Check for filters (excludes "Whenever you play a song", etc.)
        if (triggered.triggerFilter && JSON.stringify(triggered.triggerFilter) !== JSON.stringify({ target: 'self' })) return null;
        if (triggered.eventConditions && triggered.eventConditions.length > 0) return null;
        if (triggered.condition) return null; // Exclude conditional abilities for now

        // Check effects
        if (triggered.effects.length !== 1) return null;
        const effect = triggered.effects[0];

        if (effect.type === 'gain_lore' && typeof effect.amount === 'number') {
            // We found a match!
            return generateGainLoreTest(card, effect.amount);
        }

        return null;
    }
];

function generateGainLoreTest(card: CardData, amount: number): string {
    const fullName = card.fullName || card.name;
    const safeName = fullName.replace(/'/g, "\\'");

    return `
    describe('${safeName} - Gain Lore', () => {
        it('should gain ${amount} lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['${safeName}']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', '${safeName}');
            
            // Verify
            expect(player.lore).toBe(initialLore + ${amount});
        });
    });`;
}


function generateBatchContent(batchNum: number, tests: string[]): string {
    return `import { TestHarness } from '../../engine-test-utils';

describe('Generated Execution Tests Batch ${batchNum}', () => {
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

    // Create output directory
    if (fs.existsSync(OUTPUT_DIR)) {
        // Only clean up generated files, don't wipe directory if other stuff exists
        // actually let's just wipe it to be safe and clean
        // fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    let collectedTests: string[] = [];

    for (const card of cards) {
        // Mock card for parser
        const mockCard = {
            ...card,
            abilities: card.abilities || [],
            fullTextSections: card.fullTextSections || []
        } as any;

        try {
            const abilities = parseToAbilityDefinition(mockCard);

            abilities.forEach((ability, index) => {
                for (const pattern of patterns) {
                    const testCode = pattern(card, ability, index);
                    if (testCode) {
                        collectedTests.push(testCode);
                        break; // Only one test per ability for now
                    }
                }
            });
        } catch (e) {
            // Parser error, skip
        }
    }

    console.log(`✓ Generated ${collectedTests.length} tests`);

    // Write batches
    let batchNum = 1;
    for (let i = 0; i < collectedTests.length; i += BATCH_SIZE) {
        const batchTests = collectedTests.slice(i, i + BATCH_SIZE);
        const content = generateBatchContent(batchNum, batchTests);
        const fileName = `execution-batch-${String(batchNum).padStart(2, '0')}.test.ts`;
        fs.writeFileSync(path.join(OUTPUT_DIR, fileName), content);
        console.log(`  Wrote ${fileName}`);
        batchNum++;
    }
}

generateTests();
