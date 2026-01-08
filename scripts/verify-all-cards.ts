
import * as fs from 'fs';
import * as path from 'path';
import { parseToAbilityDefinition } from '../src/engine/ability-parser';

// Load all cards
const allCardsPath = path.join(process.cwd(), 'allCards.json');
const allCardsData = JSON.parse(fs.readFileSync(allCardsPath, 'utf-8'));

let allCards: any[] = [];

// Handle different JSON structures
if (Array.isArray(allCardsData.cards)) {
    allCards = allCardsData.cards;
} else if (allCardsData.sets) {
    // Aggregate cards from all sets
    Object.values(allCardsData.sets).forEach((set: any) => {
        if (Array.isArray(set.cards)) {
            allCards.push(...set.cards);
        }
    });
} else {
    console.error('Unknown allCards.json structure');
    process.exit(1);
}

console.log(`Loaded ${allCards.length} cards.`);

let passed = 0;
let failed = 0;
const failures: any[] = [];
const unparsedAbilities: string[] = [];

allCards.forEach(card => {
    try {
        // Mock Card interface
        const mockCard: any = {
            ...card,
            id: 'test-id',
            // Ensure abilities is an array if present
            abilities: card.abilities || [],
            // Ensure fullTextSections is present for songs if needed
            fullTextSections: card.fullTextSections || []
        };

        const abilities = parseToAbilityDefinition(mockCard);

        // Check if parsing was successful
        // We consider it a failure if the card has text but 0 abilities were parsed
        // UNLESS it's a vanilla card (no abilities text)

        const hasAbilityText = (mockCard.abilities && mockCard.abilities.length > 0) ||
            (mockCard.fullTextSections && mockCard.fullTextSections.length > 0);

        if (hasAbilityText && abilities.length === 0) {
            // Check if it's truly vanilla or just unparsed
            // Some cards have "abilities" but they are just keywords which might be parsed?
            // Actually parseToAbilityDefinition should return keywords too.

            // Let's check if the text implies an ability
            const text = (mockCard.abilities?.[0]?.fullText || mockCard.fullTextSections?.[0] || "").toLowerCase();
            const normalizedText = text.replace(/\s+/g, ' ').trim();

            if (text && !text.includes('reminder text') &&
                !normalizedText.match(/^\(a character with cost \d+ or more can ⟳ to sing this song for free\.?\)$/i)) { // Skip pure reminder text if any
                failed++;
                failures.push({ name: card.name, reason: 'No abilities parsed from text', text });
                unparsedAbilities.push(text);
                return;
            }
        }

        passed++;
    } catch (e) {
        failed++;
        failures.push({ name: card.name, reason: `Crash: ${e.message}` });
    }
});

console.log('\n=== Verification Results ===');
console.log(`Total Cards: ${allCards.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Success Rate: ${((passed / allCards.length) * 100).toFixed(2)}%`);

if (failed > 0) {
    console.log('\n=== Failures ===');
    failures.slice(0, 20).forEach(f => {
        console.log(`- ${f.name}: ${f.reason}`);
        if (f.text) console.log(`  Text: "${f.text}"`);
    });
    if (failures.length > 20) console.log(`... and ${failures.length - 20} more.`);

    // Write failures to file
    fs.writeFileSync('parser-failures.json', JSON.stringify(failures, null, 2));
    console.log('\nFull failures list written to parser-failures.json');
}
