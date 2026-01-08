import { expectKeyword, expectHasAbilities, createTestCardWithAbility } from '../test-utils/ability-assertions';
import { CardType } from '../../engine/models';

describe('Singer Keyword', () => {
    it('should parse Singer 4 keyword', () => {
        const card = createTestCardWithAbility('Singer 4', {
            name: 'Ariel',
            cost: 4,
            type: CardType.Character
        });

        const singerAbility = expectKeyword(card, 'singer');
        expect(singerAbility.rawText).toContain('Singer');
    });

    it('should parse Singer 5 keyword', () => {
        const card = createTestCardWithAbility('Singer 5', {
            name: 'Elsa',
            cost: 5,
            type: CardType.Character
        });

        const abilities = expectHasAbilities(card);
        expect(abilities.length).toBeGreaterThan(0);

        const singerAbility = expectKeyword(card, 'singer');
        expect(singerAbility).toBeDefined();
    });

    it('should parse Singer keyword from real card data', () => {
        const ariel = {
            id: 101,
            name: 'Ariel - Spectacular Singer',
            fullName: 'Ariel - Spectacular Singer',
            cost: 4,
            inkwell: true,
            color: 'Sapphire',
            type: 'character',
            strength: 3,
            willpower: 4,
            lore: 2,
            subtypes: ['Storyborn', 'Hero', 'Princess'],
            abilities: [{
                fullText: 'Singer 4',
                type: 'static',
                keyword: 'Singer'
            }],
            parsedEffects: []
        } as any;

        const abilities = expectHasAbilities(ariel);
        expect(abilities.length).toBe(1);

        const singerAbility = expectKeyword(ariel, 'singer');
        expect(singerAbility).toBeDefined();
    });
});
