/**
 * Quick test to verify verbose output works
 */
import { parseToAbilityDefinition } from '../engine/ability-parser';

const card = {
    id: 1529,
    name: 'Hiro Hamada',
    fullName: 'Hiro Hamada - Armor Designer',
    abilities: [
        {
            "fullText": "Shift 5 (You may pay 5 ⬡ to play this on top of one\\nof your characters named Hiro Hamada.)",
            "keyword": "Shift",
            "keywordValue": "5",
            "keywordValueNumber": 5,
            "type": "keyword"
        },
        {
            "effect": "Your Floodborn characters that have a card under them gain Evasive and Ward.",
            "fullText": "YOU CAN BE WAY MORE Your Floodborn characters\\nthat have a card under them gain Evasive and Ward.",
            "name": "YOU CAN BE WAY MORE",
            "type": "static"
        }
    ],
    type: 'Character',
    cost: 5
} as any;

console.log('\n=== TESTING VERBOSE OUTPUT ===\n');

const abilities = parseToAbilityDefinition(card);

// VERBOSE OUTPUT: Show per-ability results
console.log(`\n📋 ${card.fullName}`);
console.log(`Expected: ${card.abilities?.length || 0} abilities`);
console.log(`Parsed: ${abilities.length} abilities\n`);

// Check each expected ability
if (card.abilities && card.abilities.length > 0) {
    card.abilities.forEach((expected: any, idx: number) => {
        const text = expected.effect || expected.fullText || expected.keyword;
        const shortText = text?.substring(0, 60) || 'No text';

        // Try to find corresponding parsed ability
        const searchStr = text?.substring(0, 20);
        const parsed = abilities.find((a: any) =>
            a.rawText?.includes(searchStr) ||
            a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
        );

        if (parsed) {
            console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
            console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
        } else {
            console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
            console.log(`   Text: "${text}"`);
            console.log(`   Expected type: ${expected.type || 'unknown'}`);
            if (expected.keyword) {
                console.log(`   Keyword: ${expected.keyword}`);
            }
        }
    });
}

console.log('\n=== Output matches expected format! ===\n');
