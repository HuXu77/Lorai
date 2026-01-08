/**
 * Test to verify why Evasive, Shift, and Song patterns aren't matching
 */

import { CardLoader } from '../../engine/card-loader';
import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Pattern Matching Investigation', () => {
    let cardLoader: CardLoader;

    beforeAll(async () => {
        cardLoader = new CardLoader();
        await cardLoader.loadCards();
    });

    it('should parse Evasive keyword from real card', () => {
        const card = cardLoader.getAllCards().find(c =>
            c.fullName?.includes('Madam Mim') && c.fullName?.includes('Purple Dragon')
        );

        expect(card).toBeDefined();
        console.log('Card abilities:', JSON.stringify(card?.abilities, null, 2));

        if (card) {
            const abilities = parseToAbilityDefinition(card);
            console.log('Parsed abilities:', JSON.stringify(abilities, null, 2));

            const evasive = abilities.find(a =>
                a.type === 'static' && (a as any).keyword === 'evasive'
            );
            expect(evasive).toBeDefined();
        }
    });

    it('should parse Shift keyword from real card', () => {
        const card = cardLoader.getAllCards().find(c =>
            c.fullName?.includes('Tinker Bell') && c.fullName?.includes('Giant Fairy')
        );

        expect(card).toBeDefined();

        if (card) {
            const abilities = parseToAbilityDefinition(card);
            console.log('Tinker Bell abilities:', JSON.stringify(abilities, null, 2));

            const shift = abilities.find(a =>
                a.type === 'static' && (a as any).keyword === 'shift'
            );
            expect(shift).toBeDefined();
        }
    });

    it('should parse Song singing cost from real song', () => {
        const card = cardLoader.getAllCards().find(c =>
            c.name === 'Part of Your World'
        );

        expect(card).toBeDefined();

        if (card) {
            console.log('Part of Your World raw abilities:', JSON.stringify(card.abilities, null, 2));
            const abilities = parseToAbilityDefinition(card);
            console.log('Part of Your World abilities:', JSON.stringify(abilities, null, 2));

            // Song abilities are parsed as activated abilities with alternate_sing_cost
            const singCost = abilities.find(a =>
                a.type === 'activated' && a.effects?.some((e: any) => e.type === 'alternate_sing_cost')
            );
            expect(singCost).toBeDefined();
        }
    });
});
