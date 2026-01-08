
import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Fix Batch Locations', () => {
    describe('Fiery Basin', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1921,
                name: 'Fiery Basin',
                fullName: 'Fiery Basin',
                abilities: [
                    {
                        "effect": "At the start of Jafar's turn, he banishes this item to have each Illumineer choose one of their characters and deal 4 damage to them.",
                        "fullText": "FACE THE FLAMES At the start of Jafar's turn, he banishes\\nthis item to have each Illumineer choose one of their\\ncharacters and deal 4 damage to them.",
                        "name": "FACE THE FLAMES",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "FACE THE FLAMES At the start of Jafar's turn, he banishes\\nthis item to have each Illumineer choose one of their\\ncharacters and deal 4 damage to them."
                ],
                cost: 2,
                type: 'Item',
                inkwell: true,
                color: ''
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Cobra Pit - Seething Serpents', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1923,
                name: 'Cobra Pit',
                fullName: 'Cobra Pit - Seething Serpents',
                abilities: [
                    {
                        "effect": "When Jafar plays this location, he deals 1 damage to each opposing character.",
                        "fullText": "SNAKEBITE When Jafar plays this location, he deals 1 damage to each\\nopposing character.",
                        "name": "SNAKEBITE",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "SNAKEBITE When Jafar plays this location, he deals 1 damage to each\\nopposing character."
                ],
                cost: 2,
                type: 'Location',
                inkwell: true,
                color: ''
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Endless Staircase - Perilous Ascent', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1924,
                name: 'Endless Staircase',
                fullName: 'Endless Staircase - Perilous Ascent',
                abilities: [
                    {
                        "effect": "When Jafar plays this location, he deals 3 damage to the character with the highest cost each Illumineer has in play. (If there's a tie, the Illumineers choose from the tied characters.)",
                        "fullText": "VERTIGO When Jafar plays this location, he deals 3 damage to the\\ncharacter with the highest cost each Illumineer has in play. (If there's a\\ntie, the Illumineers choose from the tied characters.)",
                        "name": "VERTIGO",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "VERTIGO When Jafar plays this location, he deals 3 damage to the\\ncharacter with the highest cost each Illumineer has in play. (If there's a\\ntie, the Illumineers choose from the tied characters.)"
                ],
                cost: 4,
                type: 'Location',
                inkwell: true,
                color: ''
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });
});
