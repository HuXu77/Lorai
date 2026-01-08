import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Batch 46: Dynamic Activated Abilities', () => {
    // Pattern 1: Draw equal to damage
    it('should parse draw equal to damage pattern', () => {
        const mockCard = {
            id: 1,
            name: 'Dinner Bell',
            abilities: ['you know what happens ⟳, 2 ⬡ — draw cards\nequal to the damage on chosen character of yours,\nthen banish them.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('activated');
        expect((abilities[0] as any).effects.length).toBe(2);
        expect((abilities[0] as any).effects[0].type).toBe('draw_equal_to_damage');
        expect((abilities[0] as any).effects[1].type).toBe('banish');
    });

    // Pattern 2: Gain lore equal to stat
    it('should parse gain lore equal to stat pattern', () => {
        const mockCard = {
            id: 2,
            name: 'Lucky Dime',
            abilities: ['number one ⟳, 2 ⬡ — choose a character of yours\nand gain lore equal to their ◊.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('activated');
        expect((abilities[0] as any).effects[0].type).toBe('gain_lore');
    });

    // Pattern 3: Ready at location with restriction
    it('should parse ready at location with restriction', () => {
        const mockCard = {
            id: 3,
            name: 'Raya',
            abilities: ['we have to come together when you play this\ncharacter, ready chosen character of yours at a\nlocation. they can\'t quest for the rest of this turn.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');
        expect((abilities[0] as any).effects.length).toBe(2);
        expect((abilities[0] as any).effects[0].type).toBe('ready');
    });

    // Pattern 4: Conditional end-of-turn banish
    it('should parse conditional end-of-turn banish', () => {
        const mockCard = {
            id: 4,
            name: 'Golden Harp',
            abilities: ['stolen away at the end of your turn, if you\ndidn\'t play a song this turn, banish this character.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');
        expect((abilities[0] as any).event).toBe('turn_end'); // GameEvent.END_OF_TURN resolves to 'turn_end'
        expect((abilities[0] as any).effects[0].type).toBe('banish');
    });
});
