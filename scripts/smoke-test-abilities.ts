
import * as fs from 'fs';
import * as path from 'path';
import { TestHarness } from '../src/tests/engine-test-utils';
import { ZoneType } from '../src/engine/models';
import { GameEvent } from '../src/engine/abilities/events';

// Load all cards
const allCardsPath = path.join(process.cwd(), 'allCards.json');
const allCardsData = JSON.parse(fs.readFileSync(allCardsPath, 'utf-8'));

let allCards: any[] = [];

// Handle different JSON structures
if (Array.isArray(allCardsData.cards)) {
    allCards = allCardsData.cards;
} else if (allCardsData.sets) {
    Object.values(allCardsData.sets).forEach((set: any) => {
        if (Array.isArray(set.cards)) {
            allCards.push(...set.cards);
        }
    });
}

console.log(`Loaded ${allCards.length} cards for smoke testing.`);

async function runSmokeTest() {
    let passed = 0;
    let failed = 0;
    const failures: any[] = [];

    // Batch processing to avoid memory issues
    const BATCH_SIZE = 50;

    for (let i = 0; i < allCards.length; i += BATCH_SIZE) {
        const batch = allCards.slice(i, i + BATCH_SIZE);
        const harness = new TestHarness();
        await harness.initialize();

        const p1 = harness.game.getPlayer(harness.p1Id);
        harness.turnManager.startGame(p1.id);

        for (const card of batch) {
            try {
                // Skip if no name (shouldn't happen but safe guard)
                if (!card.name) continue;

                // Create mock card with abilities
                // We need to ensure the card loader or addCardToZone handles the parsing
                // addCardToZone uses createCard which uses parseToAbilityDefinition

                // We need to map the JSON card format to what addCardToZone expects
                const cardDef = {
                    ...card,
                    id: `card-${i}-${card.name.replace(/\s+/g, '-')}`,
                    fullName: card.fullName || card.name,
                    // Ensure abilities are passed correctly
                    abilities: card.abilities || [],
                    fullTextSections: card.fullTextSections || []
                };

                const instance = p1.addCardToZone(cardDef, ZoneType.Play);

                // Explicitly register (normally handled by playCard, but we are adding directly)
                // Access private abilitySystem via any cast
                (harness.turnManager as any).abilitySystem.registerCard(instance);

                passed++;
            } catch (e) {
                failed++;
                failures.push({ name: card.name, reason: `Registration Crash: ${e.message}` });
            }
        }

        // Emit events to trigger things
        try {
            (harness.turnManager as any).abilitySystem.emitEvent(GameEvent.TURN_START, { player: p1 });
            (harness.turnManager as any).abilitySystem.emitEvent(GameEvent.CARD_PLAYED, { player: p1, card: p1.play[0] }); // Just use first card as dummy
        } catch (e) {
            console.error(`Batch ${i / BATCH_SIZE} event emission failed: ${e.message}`);
            // This is a general failure for the batch, hard to attribute to single card
        }

        if (i % 500 === 0) {
            console.log(`Processed ${i} cards...`);
        }
    }

    console.log('\n=== Smoke Test Results ===');
    console.log(`Total Cards: ${allCards.length}`);
    console.log(`Passed Registration: ${passed}`);
    console.log(`Failed Registration: ${failed}`);

    if (failed > 0) {
        console.log('\n=== Failures ===');
        failures.slice(0, 20).forEach(f => {
            console.log(`- ${f.name}: ${f.reason}`);
        });
        fs.writeFileSync('smoke-test-failures.json', JSON.stringify(failures, null, 2));
        console.log('\nFull failures list written to smoke-test-failures.json');
    }
}

runSmokeTest().catch(e => console.error(e));
