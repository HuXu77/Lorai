import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Batch 45: Remaining High-Frequency Patterns', () => {
    // Conditional Stat Buffs
    it('should parse "while challenging a location" buff', () => {
        const mockCard = {
            id: 1,
            name: 'Olympus Would Be That Way',
            abilities: ['your characters get +3 ¤ while challenging a location\nthis turn.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static');
    });

    it('should parse "your hero characters get +X" buff', () => {
        const mockCard = {
            id: 2,
            name: 'Full of Spirit',
            abilities: ['full of spirit your hero characters get +1 ¤.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static');
    });

    // Opponent Choice Effects
    it('should parse "opposing players together choose" (opponent items)', () => {
        const mockCard = {
            id: 3,
            name: 'Pick One!',
            abilities: ['pick one! when you play this character, the\nopposing players together choose an item or\nlocation of theirs and banish it.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');
    });

    it('should parse "opposing players together choose" (your items)', () => {
        const mockCard = {
            id: 4,
            name: 'The Opposing Effect',
            abilities: ['the opposing players together choose one of your\nitems and banish it.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
    });

    it('should parse "highest cost character" damage', () => {
        const mockCard = {
            id: 5,
            name: 'Highest Cost Damage',
            abilities: ['deal 2 damage to the highest cost character each\nopposing player has in play. (if there\'s a tie, the\nopposing player chooses from the tied characters.)']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
    });

    // Play Restrictions
    it('should parse "can\'t play unless" restriction', () => {
        const mockCard = {
            id: 6,
            name: 'Not Without My Family',
            abilities: ['not without my family you can\'t play this\ncharacter unless you have 5 or more characters in\nplay.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static');
    });

    it('should parse "can\'t challenge" restriction', () => {
        const mockCard = {
            id: 7,
            name: 'Under Arrest',
            abilities: ['under arrest characters with cost 2 or less\ncan\'t challenge your characters.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static');
    });

    // Mass Banish
    it('should parse "banish all opposing characters"', () => {
        const mockCard = {
            id: 8,
            name: 'Mass Banish',
            abilities: ['banish all opposing characters.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
    });

    it('should parse "banish all opposing X with cost Y or less"', () => {
        const mockCard = {
            id: 9,
            name: 'Conditional Mass Banish',
            abilities: ['banish all opposing characters, items, and locations\nwith cost 2 or less.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
    });
});
