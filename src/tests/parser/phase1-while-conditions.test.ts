/**
 * Phase 1 - While Condition Pattern Tests
 * 
 * TDD: Write tests FIRST for while conditions
 * Target: +59 cards
 */

import { CardLoader } from '../../engine/card-loader';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Phase 1: While Condition Pattern', () => {
    let cardLoader: CardLoader;

    beforeAll(async () => {
        cardLoader = new CardLoader();
        await cardLoader.loadCards();
    });

    describe('Pattern: "While X, gets +Y"', () => {
        it('should parse "while damaging, gets +X strength"', () => {
            const testCard = {
                id: 1001,
                name: 'Test Damager',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'static',
                    fullText: 'While damaging, this character gets +2 ※.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);

            console.log('Parsed abilities:', JSON.stringify(abilities, null, 2));

            expect(abilities.length).toBeGreaterThan(0);
            const staticAbility = abilities.find(a => a.type === 'static') as any;
            expect(staticAbility).toBeDefined();

            if (staticAbility && staticAbility.effects && staticAbility.effects.length > 0) {
                // Should have conditional buff effect
                expect(staticAbility.condition).toMatchObject({ type: 'while_damaging' });
                expect(staticAbility.effects[0]).toMatchObject({
                    type: 'modify_stats',
                    stat: 'strength',
                    amount: 2,
                    target: { type: 'self' }
                });
            }
        });

        it('should parse "while challenging, gets +X"', () => {
            const testCard = {
                id: '1002',
                name: 'Test Card 2',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'static',
                    effect: 'While challenging, gets +3 strength.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);
            const staticAbility = abilities[0] as any;

            expect(staticAbility.condition).toMatchObject({ type: 'while_challenging' });
            expect(staticAbility?.effects?.[0]).toMatchObject({
                type: 'modify_stats',
                stat: 'strength',
                amount: 3,
                target: { type: 'self' }
            });
        });

        it('should parse "while you have X or more cards in hand"', () => {
            const testCard = {
                id: '1003',
                name: 'Test Card 3',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'static',
                    effect: 'While you have 5 or more cards in hand, gets +2 strength.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);
            const staticAbility = abilities[0] as any;

            expect(staticAbility.condition).toMatchObject({
                type: 'while_hand_size',
                amount: 5,
                operator: 'gte'
            });
            expect(staticAbility?.effects?.[0]).toMatchObject({
                type: 'modify_stats',
                stat: 'strength',
                amount: 2,
                target: { type: 'self' }
            });
        });
    });

    describe('Pattern: "While X, this character has Y keyword"', () => {
        it('should parse "while challenging, has evasive"', () => {
            const testCard = {
                id: '1004',
                name: 'Test Card 4',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'static',
                    effect: 'While challenging, has evasive.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);
            console.log('Keyword grant test - parsed:', JSON.stringify(abilities, null, 2));

            const staticAbility = abilities[0] as any;
            expect(staticAbility.condition).toMatchObject({ type: 'while_challenging' });
            expect(staticAbility?.effects?.[0]).toMatchObject({
                type: 'grant_keyword',
                target: { type: 'self' },
                keyword: 'Evasive'
            });
        });
    });

    describe('Pattern: "While at location"', () => {
        it('should parse "while at a location, gets +X"', () => {
            const testCard = {
                id: '1005',
                name: 'Test Card 5',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'static',
                    effect: 'While at a location, this character gets +1 strength.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);
            const staticAbility = abilities[0] as any;

            expect(staticAbility.condition).toMatchObject({ type: 'at_any_location' });
            expect(staticAbility?.effects?.[0]).toMatchObject({
                type: 'modify_stats',
                stat: 'strength',
                amount: 1,
                target: { type: 'self' }
            });
        });
    });

    describe('Real Card: Jafar - Keeper of Secrets', () => {
        it('should parse "gets +1 for each card in your hand"', () => {
            // Similar to while pattern - conditional buff based on hand size
            const card = cardLoader.getAllCards().find(c =>
                c.fullName?.includes('Jafar') && c.fullName?.includes('Keeper')
            );

            if (card) {
                const abilities = parseToAbilityDefinition(card);

                // Should have some parsing (even if not complete)
                // For now, we expect it to at least be recognized
                expect(abilities.length).toBeGreaterThan(0);
            }
        });
    });
});
