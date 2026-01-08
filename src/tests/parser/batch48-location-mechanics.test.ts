import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Batch 48: Complex Location & Character Mechanics', () => {
    // Pattern 1: Location-based character restriction
    it('should parse location-based character restriction', () => {
        const mockCard = {
            id: 1,
            name: 'Elsa\'s Ice Palace',
            abilities: ['eternal winter when you play this location, choose an exerted\ncharacter. while this location is in play, that character can\'t ready at the\nstart of their turn.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');
        expect((abilities[0] as any).event).toBe('card_played');
    });

    // Pattern 2: Damaged characters can't challenge
    it('should parse damaged characters can\'t challenge', () => {
        const mockCard = {
            id: 2,
            name: 'Ed',
            abilities: ['rowdy guest damaged characters can\'t\nchallenge this character.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static');
    });

    // Pattern 3: Conditional card draw
    it('should parse conditional card draw', () => {
        const mockCard = {
            id: 3,
            name: 'Remember Who You Are',
            abilities: ['if chosen opponent has more cards in their hand than\nyou, draw cards until you have the same number.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('activated');
    });

    // Pattern 4: Once per turn exert-move-damage
    it('should parse once per turn exert-move-damage', () => {
        const mockCard = {
            id: 4,
            name: 'Sugar Rush Speedway',
            abilities: ['on your marks! once per turn, you may ⟳ chosen character here and\ndeal them 1 damage to move them to another location for free.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('activated');
    });
});
