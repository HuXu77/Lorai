import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardInstance } from '../../engine/models';

describe('Shift Parsing - Webby Vanderquack', () => {
    it('should parse Shift 2 keyword correctly', () => {
        const card: any = {
            id: 1, // Added ID
            name: "Webby Vanderquack",
            fullName: "Webby Vanderquack - Junior Prospector",
            abilities: [
                {
                    type: "static", // Usually Shift comes as fullText section, handled by ability-parser splitting?
                    // But in allCards.json, it might be separate?
                    // Let's use the structure from allCards.json derived from snippet
                    fullText: "Shift 2 \u2b21 (You may pay 2 \u2b21 to play this on top of one of\nyour characters named Webby Vanderquack.)"
                }
            ],
            // In the real app, we might rely on text extraction.
            // Let's emulate what CardLoader does?
            // Actually, let's use the full text from the snippet
            fullTextSections: [
                "Shift 2 \u2b21 (You may pay 2 \u2b21 to play this on top of one of\nyour characters named Webby Vanderquack.)",
                "Ward",
                "WORK SMARTER Whenever this character quests, if an\nopponent has more cards in their inkwell than you, you may\nput the top card of your deck into your inkwell facedown\nand exerted."
            ],
            // And keywordAbilities usually listed
            keywordAbilities: ["Shift", "Ward"]
        };

        const effects = parseToAbilityDefinition(card);
        console.log('PARSED EFFECTS:', JSON.stringify(effects, null, 2));

        // Should find Shift
        // Check what we actually get
        const shiftEffect = effects.find((e: any) => e.keyword === 'shift' || e.action === 'keyword_shift');
        expect(shiftEffect).toBeDefined();
        expect(shiftEffect.value).toBe(2);
    });
});
