import * as fs from 'fs';
import * as path from 'path';
import { parseToAbilityDefinition } from '../engine/ability-parser';

// Load allCards.json
const cardsPath = path.join(__dirname, '../../allCards.json');
const cardsData = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
const cards = cardsData.cards;

// Find all cards with Shift keyword
const shiftCards = cards.filter((card: any) => {
    return card.abilities?.some((a: any) => a.keyword === 'Shift');
});

console.log(`Found ${shiftCards.length} cards with Shift keyword in allCards.json\n`);

// Test parsing each one
let successCount = 0;
let failureCount = 0;
const failures: any[] = [];

for (const card of shiftCards.slice(0, 10)) {  // Test first 10
    const abilities = parseToAbilityDefinition(card);

    // Check if shift was parsed
    const hasShiftAbility = abilities.some((a: any) => a.keyword === 'shift');

    if (hasShiftAbility) {
        successCount++;
        console.log(`✅ ${card.fullName}: Shift parsed correctly`);
    } else {
        failureCount++;
        failures.push(card.fullName);
        console.log(`❌ ${card.fullName}: Shift NOT parsed`);
    }
}

console.log(`\n=== Summary ===`);
console.log(`✅ Success: ${successCount}/${shiftCards.slice(0, 10).length}`);
console.log(`❌ Failures: ${failureCount}/${shiftCards.slice(0, 10).length}`);

if (failures.length > 0) {
    console.log(`\nFailed cards:`, failures);
}
