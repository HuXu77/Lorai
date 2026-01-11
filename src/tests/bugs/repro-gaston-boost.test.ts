
// Jest globals are automatically available
import { parseToAbilityDefinition } from '../../engine/ability-parser';

// Mock card data based on assumed issue
const gastonCard = {
    fullName: "Gaston - Frightful Bully",
    id: 12345, // Fix ID crash
    type: "Character",
    cost: 6,
    inkwell: true,
    abilities: [
        {
            fullText: "Boost 2 ⬡ (Pay 2 ⬡ to put the top card of your deck facedown under this character.)"
        },
        {
            fullText: "INTIMIDATE When you play this character, you may banish chosen opposing character with 3 strength or less."
        }
    ]
};

describe('Gaston Boost Parsing', () => {
    it('should parse Boost parsing into effects', () => {
        const effects = parseToAbilityDefinition(gastonCard as any);
        console.log('Parsed Effects:', JSON.stringify(effects, null, 2));

        const hasBoost = effects.some(current =>
            current.effects && current.effects.some((e: any) => e.type === 'boost')
        );

        expect(hasBoost).toBe(true);
    });
});
