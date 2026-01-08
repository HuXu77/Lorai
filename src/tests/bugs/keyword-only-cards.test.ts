/**
 * Test for parsing cards that have keywordAbilities but no abilities array.
 * This covers the bug fix where Flynn Rider's Boost wasn't being parsed
 * because the card only has fullTextSections and keywordAbilities.
 */
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { getBoostCost, hasAbilityKeyword } from '../../utils/ability-helpers';

describe('Keyword-only cards parsing', () => {
    describe('Flynn Rider - Spectral Scoundrel (keywordAbilities without abilities array)', () => {
        const flynnRider = {
            id: 2270,
            name: 'Flynn Rider',
            fullName: 'Flynn Rider - Spectral Scoundrel',
            type: 'Character',
            // NOTE: No 'abilities' array - this is the actual allCards.json format
            keywordAbilities: ['Boost'],
            fullTextSections: [
                'Boost 2 ⬡ (Once during your turn, you may pay 2 ⬡ to put the top card of your deck facedown under this character.)',
                "I'LL TAKE THAT While there's a card under this character, he gets +2 ¤ and +1 ◊."
            ],
            strength: 1,
            willpower: 2,
            lore: 1
        };

        it('should parse Boost keyword from fullTextSections', () => {
            const abilities = parseToAbilityDefinition(flynnRider);
            expect(abilities.length).toBeGreaterThanOrEqual(1);

            // Find the boost ability
            const boostAbility = abilities.find((a: any) =>
                a.keyword === 'boost' ||
                a.effects?.some((e: any) => e.type === 'boost')
            );
            expect(boostAbility).toBeDefined();
        });

        it('should return correct Boost cost from getBoostCost', () => {
            const abilities = parseToAbilityDefinition(flynnRider);
            const cardWithEffects = { ...flynnRider, parsedEffects: abilities };

            const cost = getBoostCost(cardWithEffects as any);
            expect(cost).toBe(2);
        });

        it('should detect Boost keyword with hasAbilityKeyword', () => {
            const abilities = parseToAbilityDefinition(flynnRider);
            const cardWithEffects = {
                ...flynnRider,
                parsedEffects: abilities,
                baseKeywords: []
            };

            const hasBoost = hasAbilityKeyword(cardWithEffects as any, 'boost');
            expect(hasBoost).toBe(true);
        });
    });

    describe('Megara - Unexpected Hero (with abilities array)', () => {
        // For comparison - a card that HAS an abilities array
        const megara = {
            id: 2260,
            name: 'Megara',
            fullName: 'Megara - Unexpected Hero',
            type: 'Character',
            abilities: [
                {
                    type: 'keyword',
                    keyword: 'Boost',
                    fullText: 'Boost 1 ⬡ (Once during your turn, you may pay 1 ⬡ to put the top card of your deck facedown under this character.)'
                }
            ],
            strength: 2,
            willpower: 3,
            lore: 1
        };

        it('should parse Boost from abilities array', () => {
            const abilities = parseToAbilityDefinition(megara);
            expect(abilities.length).toBeGreaterThanOrEqual(1);

            const boostAbility = abilities.find((a: any) =>
                a.keyword === 'boost' ||
                a.effects?.some((e: any) => e.type === 'boost')
            );
            expect(boostAbility).toBeDefined();
        });

        it('should return correct Boost cost', () => {
            const abilities = parseToAbilityDefinition(megara);
            const cardWithEffects = { ...megara, parsedEffects: abilities };

            const cost = getBoostCost(cardWithEffects as any);
            expect(cost).toBe(1);
        });
    });

    describe('Cheshire Cat - Always Smiling (mixed format)', () => {
        const cheshireCat = {
            id: 2261,
            name: 'Cheshire Cat',
            fullName: 'Cheshire Cat - Always Smiling',
            type: 'Character',
            keywordAbilities: ['Boost'],
            fullTextSections: [
                'Boost 2 ⬡ (Once during your turn, you may pay 2 ⬡ to put the top card of your deck facedown under this character.)',
                'For each card under this character, this character gets +1 ¤.'
            ],
            strength: 0,
            willpower: 3,
            lore: 2
        };

        it('should parse Boost from fullTextSections when no abilities array', () => {
            const abilities = parseToAbilityDefinition(cheshireCat);
            const boostAbility = abilities.find((a: any) =>
                a.keyword === 'boost' ||
                a.effects?.some((e: any) => e.type === 'boost')
            );
            expect(boostAbility).toBeDefined();
        });

        it('should parse the static ability too', () => {
            const abilities = parseToAbilityDefinition(cheshireCat);
            // Should have at least 2 abilities (Boost + static)
            expect(abilities.length).toBeGreaterThanOrEqual(2);
        });
    });
});
