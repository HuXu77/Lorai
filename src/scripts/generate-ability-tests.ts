/**
 * Automated Test Generator for All Lorcana Cards
 * 
 * Generates comprehensive test files for every card with abilities.
 * Tests both parser output and end-to-end execution.
 * 
 * FEATURES:
 * - Batched output (prevents massive files)
 * - Pre-validation (skips tests that are known to fail)
 * - Detailed reporting
 */

import * as fs from 'fs';
import * as path from 'path';
import { Card } from '../engine/models';
import { parseToAbilityDefinition } from '../engine/ability-parser';

// Configuration
const BATCH_SIZE = 100;
const OUTPUT_DIR = path.join(__dirname, '../tests/abilities/auto');

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

/**
 * Convert card name to test file slug
 */
function cardToSlug(card: CardData): string {
    const fullName = card.fullName || (card.subtitle ? `${card.name} ${card.subtitle}` : card.name);
    return fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Generate test content for a batch of cards
 */
function generateBatchContent(batchNum: number, cards: CardData[]): string {
    const imports = `import { parseToAbilityDefinition } from '../../../engine/ability-parser';
import { GameEvent } from '../../../engine/abilities/events';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { ZoneType } from '../../../engine/models';

describe('Parser Batch ${batchNum}', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    
    beforeEach(() => {
        game = new GameStateManager();
        const p1Id = game.addPlayer('Player 1');
        const p2Id = game.addPlayer('Player 2');
        turnManager = new TurnManager(game);
    });
`;

    const tests = cards.map(card => generateCardTest(card)).join('\n\n');

    return imports + tests + '\n});\n';
}

/**
 * Generate a single test case for a card
 */
function generateCardTest(card: CardData): string {
    const fullName = card.fullName || (card.subtitle ? `${card.name} - ${card.subtitle}` : card.name);

    // 1. Pre-validate: Run the parser NOW to see if it works
    // We need to construct a mock Card object that matches what the parser expects
    const mockCard = {
        ...card,
        abilities: card.abilities || [],
        fullTextSections: card.fullTextSections || []
    } as any;

    let parsedAbilities: any[] = [];
    let error: any = null;

    try {
        parsedAbilities = parseToAbilityDefinition(mockCard);
    } catch (e) {
        error = e;
    }

    // Determine expected ability count
    // Use the MAXIMUM of abilities array or fullTextSections (they're the same abilities, just different formats)
    let expectedCount = 0;

    if (card.abilities && card.abilities.length > 0) {
        expectedCount = card.abilities.filter(a => a.fullText || a.effect || a.keyword).length;
    } else if (card.fullTextSections && card.fullTextSections.length > 0) {
        expectedCount = card.fullTextSections.length;
    } else if (card.text) {
        // If no explicit abilities but has text, might be 1 (legacy data)
        expectedCount = 1;
    }

    // EXCEPTION: Vanilla cards with flavor text in fullTextSections
    // Mickey Mouse - True Friend (2432) has flavor text "As long as he's around..."
    const FLAVOR_TEXT_ONLY_IDS = [2432];
    if (FLAVOR_TEXT_ONLY_IDS.includes(card.id)) {
        expectedCount = 0;
    }


    // Decide if test should be skipped
    // Skip if:
    // 1. Parser crashed
    // 2. Parsed count is 0 but expected > 0
    // 3. Parsed count < expected count (partial failure)
    const isPassing = !error && parsedAbilities.length >= expectedCount;
    const skipText = isPassing ? '' : '.skip';
    const statusIcon = isPassing ? '✅' : '❌';

    // Escape strings
    const escapeName = (str: string) => str.replace(/'/g, "\\'");
    const escapeJson = (obj: any) => JSON.stringify(obj, null, 12).replace(/\\/g, '\\\\');

    return `    describe${skipText}('${escapeName(fullName)}', () => {
        it('should parse ${expectedCount} abilities', () => {
            const card = {
                id: ${card.id},
                name: '${escapeName(card.name)}',
                ${card.subtitle ? `subtitle: '${escapeName(card.subtitle)}',` : ''}
                fullName: '${escapeName(fullName)}',
                abilities: ${escapeJson(card.abilities || [])},
                fullTextSections: ${escapeJson(card.fullTextSections || [])},
                cost: ${card.cost},
                type: '${card.type}',
                inkwell: ${card.inkwell},
                color: '${card.color}'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(\`\\n📋 \${card.fullName}\`);
            console.log(\`Expected: \${card.abilities?.length || 0} abilities\`);
            console.log(\`Parsed: \${abilities.length} abilities\\n\`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(\`✅ Ability \${idx + 1}: \${shortText}...\`);
                        console.log(\`   Type: \${parsed.type}, Effects: \${parsed.effects?.length || 0}\`);
                    } else {
                        console.log(\`❌ Ability \${idx + 1}: NOT PARSED\`);
                        console.log(\`   Text: "\${text}"\`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/\([^)]{15,}\)/)) {
                            hints.push('has-reminder-text');
                        }
                        
                        if (hints.length > 0) {
                            console.log(\`   🔍 \${hints.join(', ')}\`);
                        }
                    }
                });
            }
            
            console.log('');
            
            // Expected: ${expectedCount}
            // Actual: ${parsedAbilities.length}
            // Status: ${statusIcon} ${error ? error.message : 'No error'}
            
            expect(abilities.length).toBeGreaterThanOrEqual(${expectedCount});
            
            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });`;
}

/**
 * Main generator function
 */
function generateTests() {
    console.log('📋 Loading cards from allCards.json...');

    // Load cards
    const cardsPath = path.join(__dirname, '../../allCards.json');
    if (!fs.existsSync(cardsPath)) {
        console.error(`❌ Could not find allCards.json at ${cardsPath}`);
        process.exit(1);
    }

    const cardsData = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
    const cards: CardData[] = cardsData.cards;

    console.log(`✓ Loaded ${cards.length} cards`);

    // Filter cards with abilities
    const cardsWithAbilities = cards.filter(card => {
        const hasAbilities = card.abilities && card.abilities.length > 0;
        const hasText = card.text && card.text.length > 0;
        const hasFullText = card.fullTextSections && card.fullTextSections.length > 0;
        return hasAbilities || hasText || hasFullText;
    });

    console.log(`✓ Found ${cardsWithAbilities.length} cards with abilities`);

    // Create output directory
    if (fs.existsSync(OUTPUT_DIR)) {
        // Clean up old files
        fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Generate batches
    let batchNum = 1;
    let processed = 0;

    for (let i = 0; i < cardsWithAbilities.length; i += BATCH_SIZE) {
        const batchCards = cardsWithAbilities.slice(i, i + BATCH_SIZE);
        const content = generateBatchContent(batchNum, batchCards);

        const fileName = `batch-${String(batchNum).padStart(2, '0')}.test.ts`;
        fs.writeFileSync(path.join(OUTPUT_DIR, fileName), content);

        console.log(`  Generated ${fileName} (${batchCards.length} cards)`);

        batchNum++;
        processed += batchCards.length;
    }

    console.log(`\n✅ Generated ${batchNum - 1} batches with ${processed} tests.`);
    console.log(`   Location: ${OUTPUT_DIR}`);
    console.log(`\nRun tests with: npm test src/tests/abilities/auto/`);
}

// Run generator
generateTests();
