import { parseToAbilityDefinition } from '../engine/ability-parser';

// Direct card data from analyze output
const testCards = [
    {
        id: 443,
        fullName: 'Kida - Protector of Atlantis',
        fullTextSections: [
            "Shift 3 (You may pay 3 ⬡ to play this on top of one of your\ncharacters named Kida.)",
            "PERHAPS WE CAN SAVE OUR FUTURE When you play this\ncharacter, all characters get -3 ¤ until the start of your\nnext turn."
        ],
        cost: 5, type: 'Character', inkwell: true, color: 'Amber'
    },
    {
        id: 999,
        fullName: 'Lythos - Rock Titan',
        fullTextSections: [
            "Resist +2 (Damage dealt to this character is reduced by 2.)"
        ],
        keywordAbilities: ["Resist"],
        cost: 7, type: 'Character', inkwell: false, color: 'Amber'
    }
] as any[];

console.log('Testing specific failing patterns:\n');

testCards.forEach(card => {
    const expected = card.fullTextSections?.length || 0;
    const abilities = parseToAbilityDefinition(card);

    console.log(`${card.fullName}:`);
    console.log(`  Expected: ${expected} | Parsed: ${abilities.length}`);

    if (abilities.length < expected) {
        console.log(`  ❌ MISSING ${expected - abilities.length}`);
        card.fullTextSections.forEach((section: string) => {
            const found = abilities.some(a => a.rawText && section.includes(a.rawText.substring(0, 20)));
            if (!found) {
                console.log(`    - "${section.substring(0, 80).replace(/\n/g, ' ')}..."`);
            }
        });
    } else {
        console.log(`  ✅ ALL PARSED`);
    }
    console.log('');
});
