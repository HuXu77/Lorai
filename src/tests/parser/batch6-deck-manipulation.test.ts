import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { Card } from '../../engine/models';

describe('Batch 6: Deck Manipulation & Information', () => {

    // "Look at the top X cards of your deck. Put Y on the top... and the rest on the bottom"
    // Example: Dr. Facilier - Remarkable Gentleman
    // "Whenever you play a song, you may look at the top 2 cards of your deck. Put one on the top of your deck and the rest on the bottom in any order."
    it('should parse "Look at the top X cards... put Y on top..."', () => {
        const card: Card = {
            id: 'dr-facilier-remarkable-gentleman',
            name: 'Dr. Facilier',
            fullName: 'Dr. Facilier - Remarkable Gentleman',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "Whenever you play a song, you may look at the top 2 cards of your deck. Put one on the top of your deck and the rest on the bottom in any order."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        // The trigger "Whenever you play a song" might need to be implemented if not already
        // But we are focusing on the effect parsing here.
        // If the trigger isn't parsed, we might get 0 abilities.
        // Let's assume the trigger is parsed or we are testing the effect via a static/resolution context if possible.
        // Actually, "Whenever you play a song" is a missing trigger pattern from the gap analysis!
        // So this test might fail on the trigger first.
    });

    // "Shuffle a card from any discard into its player's deck"
    // Example: Magic Broom - Bucket Brigade
    // "When you play this character, you may shuffle a card from any discard into its player's deck."
    it('should parse "Shuffle a card from any discard into its player\'s deck"', () => {
        const card: Card = {
            id: 'magic-broom-bucket-brigade',
            name: 'Magic Broom',
            fullName: 'Magic Broom - Bucket Brigade',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "When you play this character, you may shuffle a card from any discard into its player's deck."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('card_played'); // "When you play this character"

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('shuffle_from_discard_to_deck');
        expect(effects[0].optional).toBe(true);
    });

    // "Look at the top 2 cards of your deck. Put one into your hand and the rest on the bottom of your deck."
    // Example: Develop Your Brain (Action)
    it('should parse "Look at top X, put Y in hand, rest on bottom"', () => {
        const card = {
            id: 'test-look-draw',
            name: 'Test Action',
            type: 'Action',
            abilities: [{
                fullText: 'Look at the top 5 cards of your deck. Put 2 of them into your hand and the rest on the bottom of your deck in any order.'
            }]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('activated'); // Action cards produce activated abilities

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);

        // Main effect: look, take some, bottom the rest
        // Parser may use different property names (lookAmount, amount, count)
        expect(effects[0].type).toBe('look_and_move');
        expect(effects[0].lookAmount || effects[0].amount || effects[0].count).toBeDefined();
    });
});
