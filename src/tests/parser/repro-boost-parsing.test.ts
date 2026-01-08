import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Boost Parsing Reproduction', () => {
    it('should parse Boost keyword correctly', () => {
        const card: any = {
            id: 1,
            name: "Sebastian - Loyal Crab",
            abilities: [
                {
                    fullText: "Boost 1 \u2b21 (Once during your turn, you may pay\n1 \u2b21 to put the top card of your deck facedown\nunder this character.)",
                    keyword: "Boost",
                    keywordValue: "1",
                    keywordValueNumber: 1,
                    type: "keyword"
                }
            ],
            keywordAbilities: ["Boost"]
        };

        const effects = parseToAbilityDefinition(card);
        console.log('PARSED EFFECTS:', JSON.stringify(effects, null, 2));

        const boostEffect = effects.find((e: any) => e.keyword === 'boost' || e.action === 'keyword_ability');
        expect(boostEffect).toBeDefined();

        // precise check
        if (boostEffect) {
            console.log('Has cost?', boostEffect.cost);
            console.log('Has type?', boostEffect.type);
        }
    });
});
