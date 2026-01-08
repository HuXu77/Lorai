import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Webby Mystery Enthusiast Parsing', () => {
    it('should parse Contagious Energy correctly', () => {
        const card: any = {
            id: 1,
            name: "Webby Vanderquack",
            fullName: "Webby Vanderquack - Mystery Enthusiast",
            abilities: [
                {
                    fullText: "CONTAGIOUS ENERGY When you play this character, chosen character gets +1 strength this turn.",
                    name: "CONTAGIOUS ENERGY",
                    effect: "When you play this character, chosen character gets +1 strength this turn.",
                    type: "triggered"
                }
            ]
        };

        const effects = parseToAbilityDefinition(card);
        console.log('PARSED EFFECTS:', JSON.stringify(effects, null, 2));

        const effect = effects[0];
        expect(effect.type).toBe('triggered');
        // Check triggers
        if (effect.type === 'triggered') {
            console.log('Trigger:', effect.trigger);
        }
    });
});
