import { describe, it, expect } from 'vitest';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Hades - Looking for a Deal Parsing', () => {
    it('should parse the deal ability correctly', () => {
        const card = {
            id: 'hades-deal',
            name: 'Hades',
            fullName: 'Hades - Looking for a Deal',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "When you play this character, you may choose an opposing character. If you do, draw 2 cards unless that character's player puts that card on the bottom of their deck."
                }
            ],
            cost: 5,
            type: 'Character' as CardType,
            inkwell: true,
            color: 'Amethyst'
        };

        const parsed = parseToAbilityDefinition(card as any);
        expect(parsed.length).toBeGreaterThan(0);

        const ability = parsed[0];
        console.log('Parsed Ability:', JSON.stringify(ability, null, 2));

        // Expectations
        expect(ability.type).toBe('triggered');
        // Check for specific "unless" or "opponent choice" logic
        // This log will reveal what we currently get.
    });
});
