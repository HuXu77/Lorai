import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Batch 44: Simple Action Card Parsers', () => {
    it('should parse "banish chosen character" (Dragon Fire)', () => {
        const mockCard = {
            id: 1,
            name: 'Dragon Fire',
            abilities: ['banish chosen character.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('activated');
        expect((abilities[0] as any).effects).toBeDefined();
        expect((abilities[0] as any).effects[0].type).toBe('banish');
    });

    it('should parse "banish chosen item" (Break)', () => {
        const mockCard = {
            id: 2,
            name: 'Break',
            abilities: ['banish chosen item.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('activated');
        expect((abilities[0] as any).effects[0].type).toBe('banish');
    });

    it('should parse "banish chosen character with cost filter" (Brawl)', () => {
        const mockCard = {
            id: 3,
            name: 'Brawl',
            abilities: ['banish chosen character with 2 ¤ or less.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('activated');
        expect((abilities[0] as any).effects[0].type).toBe('banish');
        // Should have cost filter
    });

    it('should parse "banish chosen character with condition" (Last Stand)', () => {
        const mockCard = {
            id: 4,
            name: 'Last Stand',
            abilities: ['banish chosen character who was challenged this turn.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('activated');
        expect((abilities[0] as any).effects[0].type).toBe('banish');
    });

    it('should parse "banish chosen location or item" (Rise of the Titans)', () => {
        const mockCard = {
            id: 5,
            name: 'Rise of the Titans',
            abilities: ['banish chosen location or item.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('activated');
        expect((abilities[0] as any).effects[0].type).toBe('banish');
    });

    it('should parse "remove damage" (Repair)', () => {
        const mockCard = {
            id: 6,
            name: 'Repair',
            abilities: ['remove up to 3 damage from one of your locations or\ncharacters.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('activated');
        expect((abilities[0] as any).effects[0].type).toBe('heal');
    });

    it('should parse "chosen character can\'t ready" (I\'m Stuck!)', () => {
        const mockCard = {
            id: 7,
            name: "I'm Stuck!",
            abilities: ['Chosen exerted character can\'t ready at the start of\ntheir next turn.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('activated'); // Action cards are activated abilities
        // Should have status effect
    });

    it('should parse compound effect (On Your Feet! Now!)', () => {
        const mockCard = {
            id: 8,
            name: 'On Your Feet! Now!',
            abilities: ['ready all your characters and deal 1 damage to each of them. they can\'t quest for the rest of this turn.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('activated'); // Action cards without cost separator are activated
        // Should have multiple effects
        expect((abilities[0] as any).effects.length).toBeGreaterThan(1);
    });
});
