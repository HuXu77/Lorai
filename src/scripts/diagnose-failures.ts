import { parseToAbilityDefinition } from '../engine/ability-parser';
import allCardsData from '../../allCards.json';

const allCards = (allCardsData as any).cards as any[];

// Sample failing cards from each category
const testCards = [
    allCards.find(c => c.fullName === 'Kida - Protector of Atlantis'),
    allCards.find(c => c.fullName === 'Little John - Resourceful Outlaw'),
    allCards.find(c => c.fullName === 'Lythos - Rock Titan'),
    allCards.find(c => c.fullName === 'Pride Lands - Pride Rock'),
    allCards.find(c => c.fullName === 'The Sultan - Royal Apparition'),
].filter(Boolean);

console.log(`Testing ${testCards.length} sample cards:\n`);

testCards.forEach((card: any) => {
    const expected = card.fullTextSections?.length || 0;
    const abilities = parseToAbilityDefinition(card);
    const status = abilities.length >= expected ? '✅' : '❌';

    console.log(`${status} ${card.fullName} (${abilities.length}/${expected})`);

    if (abilities.length < expected) {
        card.fullTextSections.forEach((section: string, i: number) => {
            const found = abilities.some((a: any) => a.rawText && section.includes(a.rawText.substring(0, 20)));
            if (!found) {
                const preview = section.replace(/\n/g, ' ').substring(0, 100);
                console.log(`  MISSING: ${preview}...`);
            }
        });
    }
    console.log('');
});
