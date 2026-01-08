import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { Card } from '../../engine/models';

describe('Batch 3: When Played & Conditionals', () => {

    // Stitch - Carefree Surfer
    // "When you play this character, if you have 2 or more other characters in play, you may draw 2 cards."
    it('should parse "if you have 2 or more other characters in play"', () => {
        const card: Card = {
            id: 'stitch-carefree-surfer',
            name: 'Stitch',
            fullName: 'Stitch - Carefree Surfer',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "When you play this character, if you have 2 or more other characters in play, you may draw 2 cards."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('card_played');

        // Effect should be wrapped in conditional
        const effect = (abilities[0] as any).effects[0];
        expect(effect.type).toBe('conditional');
        expect(effect.condition.type).toBe('min_other_characters');
        expect(effect.condition.amount).toBe(2);
        expect(effect.effect.type).toBe('draw');
        expect(effect.effect.amount).toBe(2);
    });

    // Anna - Heir to Arendelle
    // "When you play this character, if you have a character named Elsa in play, choose an opposing character. That character doesn't ready at the start of their next turn."
    it('should parse "if you have a character named X in play"', () => {
        const card: Card = {
            id: 'anna-heir-to-arendelle',
            name: 'Anna',
            fullName: 'Anna - Heir to Arendelle',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "When you play this character, if you have a character named Elsa in play, choose an opposing character. That character doesn't ready at the start of their next turn."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);

        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('card_played');

        // Effect should be wrapped in conditional
        const effect = (abilities[0] as any).effects[0];

        expect(effect.type).toBe('conditional');
        expect(effect.condition.type).toBe('presence');
        expect(effect.condition.filter.name).toBe('Elsa');

        // The wrapped effect should be a restriction
        expect(effect.effect.type).toBe('restriction');
        expect(effect.effect.restriction).toBe('cant_ready');
        expect(effect.effect.target.type).toBe('chosen_opposing_character');
    });

    // Maleficent - Sorceress
    // "When you play this character, you may draw a card."
    it('should parse simple "When you play this character, you may draw a card"', () => {
        const card: Card = {
            id: 'maleficent-sorceress',
            name: 'Maleficent',
            fullName: 'Maleficent - Sorceress',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "When you play this character, you may draw a card."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('card_played');
        expect((abilities[0] as any).effects[0].type).toBe('draw');
        expect((abilities[0] as any).effects[0].amount).toBe(1);
        expect((abilities[0] as any).effects[0].optional).toBe(true);
    });
});
