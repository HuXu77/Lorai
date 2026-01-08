import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { Card } from '../../engine/models';

describe('Batch 8: Complex Targeting & Edge Cases', () => {

    // "Chosen character gets +2 ¤ and gains Challenger +2 this turn."
    // Example: Philoctetes - No-Nonsense Instructor
    it('should parse "Chosen character gets +X [stat] and gains [Keyword] this turn"', () => {
        const card: Card = {
            id: 'philoctetes-no-nonsense-instructor',
            name: 'Philoctetes',
            fullName: 'Philoctetes - No-Nonsense Instructor',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "When you play this character, chosen character gets +1 ¤ and gains Support this turn."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(2);

        // Effect 1: +1 Strength
        expect(effects[0].type).toBe('modify_stats');
        expect(effects[0].stat).toBe('strength');
        expect(effects[0].amount).toBe(1);
        expect(effects[0].target.type).toBe('chosen_character');

        // Effect 2: Gains Support
        expect(effects[1].type).toBe('grant_keyword'); // Updated from gain_ability
        expect(effects[1].keyword).toBe('Support'); // Updated from ability
        expect(effects[1].target.type).toBe('chosen_character');
    });

    // "Exert chosen opposing character. They can't ready at the start of their next turn."
    // Example: Elsa - Spirit of Winter
    it('should parse "Exert chosen opposing character. They can\'t ready..."', () => {
        const card: Card = {
            id: 'elsa-spirit-of-winter',
            name: 'Elsa',
            fullName: 'Elsa - Spirit of Winter',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "When you play this character, exert up to 2 chosen opposing characters. They can't ready at the start of their next turn."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(2);

        // Effect 1: Exert
        expect(effects[0].type).toBe('exert');
        expect(effects[0].target.type).toBe('chosen_opposing_character');
        expect(effects[0].amount).toBe(2); // up to 2

        // Effect 2: Can't ready
        expect(effects[1].type).toBe('cant_ready');
        expect(effects[1].target.type).toBe('chosen_opposing_character'); // Should target the same characters
        expect(effects[1].duration).toBe('next_turn_start');
    });

    // "Chosen character gains Rush and Evasive this turn."
    // Example: White Rabbit's Pocket Watch (Action/Item ability)
    it('should parse "Chosen character gains [Keyword] and [Keyword]"', () => {
        const card: Card = {
            id: 'white-rabbits-pocket-watch',
            name: 'White Rabbit\'s Pocket Watch',
            fullName: 'White Rabbit\'s Pocket Watch',
            abilities: [
                {
                    type: 'activated',
                    fullText: "1 ⬡, ⟳ - Chosen character gains Rush and Evasive this turn."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        const effects = (abilities[0] as any).effects;

        // Should produce 2 effects or 1 effect with multiple keywords?
        // Usually we split into multiple effects for simplicity in the engine.
        expect(effects.length).toBe(2);
        expect(effects[0].type).toBe('grant_keyword');
        expect(effects[0].keyword).toBe('Rush');
        expect(effects[1].type).toBe('grant_keyword');
        expect(effects[1].keyword).toBe('Evasive');
    });

    // "When you play this character, you may return a character card from your discard to your hand."
    // Example: Hades - Lord of the Underworld
    it('should parse "Return a character card from your discard to your hand"', () => {
        const card: Card = {
            id: 'hades-lord-of-the-underworld',
            name: 'Hades',
            fullName: 'Hades - Lord of the Underworld',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "When you play this character, you may return a character card from your discard to your hand."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('return_from_discard');
        expect(effects[0].target.type).toBe('card_in_discard'); // Updated from card_from_discard
        expect(effects[0].target.filter.cardType).toBe('character');
        expect(effects[0].destination).toBe('hand');
    });
});
