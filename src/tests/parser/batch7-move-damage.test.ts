import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { Card } from '../../engine/models';

describe('Batch 7: Move Damage & Prevention', () => {

    // "When you play this character, move up to X damage from chosen character to chosen opposing character"
    // Example: Mama Odie - Mystical Maven
    // "When you play this character, move up to 2 damage counters from chosen character to chosen opposing character."
    it('should parse "When you play this character, move up to X damage..."', () => {
        const card: Card = {
            id: 'mama-odie-mystical-maven',
            name: 'Mama Odie',
            fullName: 'Mama Odie - Mystical Maven',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "When you play this character, move up to 2 damage counters from chosen character to chosen opposing character."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('card_played');

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('move_damage');
        expect(effects[0].amount).toBe(2);
        expect(effects[0].from.type).toBe('chosen_character');
        expect(effects[0].to.type).toBe('chosen_opposing_character');
    });

    // "Whenever this character challenges a damaged character, she takes no damage from the challenge"
    // Example: Raya - Warrior of Kumandra
    it('should parse "Whenever this character challenges a damaged character, she takes no damage..."', () => {
        const card: Card = {
            id: 'raya-warrior-of-kumandra',
            name: 'Raya',
            fullName: 'Raya - Warrior of Kumandra',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "Whenever this character challenges a damaged character, she takes no damage from the challenge."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('card_challenges');
        expect((abilities[0] as any).triggerFilter.target.damaged).toBe(true);

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('prevent_damage');
        expect(effects[0].source).toBe('challenge');
    });

    // "Prevent the next X damage that would be dealt to chosen character this turn"
    // Example: Healing Glow (Action)
    // "Remove up to 2 damage from chosen character. OR Prevent the next 2 damage that would be dealt to chosen character this turn."
    // We will focus on the prevention part here, assuming split logic works or testing just that string.
    it('should parse "Prevent the next X damage..."', () => {
        const card: Card = {
            id: 'healing-glow',
            name: 'Healing Glow',
            fullName: 'Healing Glow',
            abilities: [
                {
                    type: 'static', // Action effect
                    fullText: "Prevent the next 2 damage that would be dealt to chosen character this turn."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('prevent_damage');
        expect(effects[0].amount).toBe(2);
        expect(effects[0].target.type).toBe('chosen_character');
        expect(effects[0].duration).toBe('turn');
    });
});
