import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Batch 47: Complex Triggered Abilities', () => {
    // Pattern 1: Opponent reveal with conditional
    it('should parse opponent reveal with conditional', () => {
        const mockCard = {
            id: 1,
            name: 'Daisy Duck',
            abilities: ['big prize whenever this character quests, each\nopponent reveals the top card of their deck. if it\'s\na character card, they may put it into their hand.\notherwise, they put it on the bottom of their\ndeck.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');
        expect((abilities[0] as any).event).toBe('card_quested');
    });

    // Pattern 2: While exerted opposing ready prevention
    it('should parse while exerted opposing ready prevention', () => {
        const mockCard = {
            id: 2,
            name: 'Genie',
            abilities: ['phenomenal showman while this character is\nexerted, opposing characters can\'t ready at the\nstart of their turn.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static');
        expect((abilities[0] as any).condition.type).toBe('self_exerted');
    });

    // Pattern 3: Discard protection during opponents' turns
    it('should parse discard protection during opponents\' turns', () => {
        const mockCard = {
            id: 3,
            name: 'Magica De Spell',
            abilities: ['playing with power during opponents\' turns,\nif an effect would cause you to discard one or\nmore cards from your hand, you don\'t discard.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static');
    });

    // Pattern 4: Quest with lore gain and return
    it('should parse quest with lore gain and return', () => {
        const mockCard = {
            id: 4,
            name: 'Camilo Madrigal',
            abilities: ['imitate whenever this character quests, you\nmay gain lore equal to the ◊ of chosen other\ncharacter of yours. return that character to your\nhand.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');
        expect((abilities[0] as any).event).toBe('card_quested');
        expect((abilities[0] as any).effects.length).toBe(2);
    });
});
