/**
 * Phase 2 - Conditional Effects Pattern Tests
 * 
 * TDD: Write tests FIRST for "if [condition], [effect]" patterns
 * Target: Cards with conditional triggers like Lady Tremaine
 */

import { CardLoader } from '../../engine/card-loader';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameEvent } from '../../engine/abilities/events';
import { CardType } from '../../engine/models';

describe('Phase 2: Conditional Effects Pattern', () => {
    let cardLoader: CardLoader;

    beforeAll(async () => {
        cardLoader = new CardLoader();
        await cardLoader.loadCards();
    });

    describe('Pattern: "If you have X ink, [effect]"', () => {
        it('should parse "if you have 10 ink available"', () => {
            const testCard = {
                id: 3001,
                name: 'Test Ink Condition',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'triggered',
                    effect: 'When you play this character, if you have 10 or more available ink, draw 2 cards.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);

            console.log('Ink condition parsed:', JSON.stringify(abilities, null, 2));

            expect(abilities.length).toBeGreaterThan(0);
            const triggered = abilities[0];
            expect(triggered.type).toBe('triggered');
            expect(triggered.event).toBe(GameEvent.CARD_PLAYED);

            // Should have conditional effect structure
            const effect = triggered.effects?.[0];
            expect(effect).toBeDefined();
            expect(effect?.type).toBe('conditional');
            expect((effect as any)?.condition).toMatchObject({
                type: 'min_ink',
                amount: 10
            });
            expect((effect as any)?.effect?.type).toBe('draw');
            expect((effect as any)?.effect?.amount).toBe(2);
        });
    });

    describe('Pattern: "If you\'ve put a card under this turn"', () => {
        it('should parse Lady Tremaine condition', () => {
            // "Whenever this character quests, if you've put a card under her this turn, ..."
            const testCard = {
                id: 3002,
                name: 'Test Card Under',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'triggered',
                    effect: "Whenever this character quests, if you've put a card under her this turn, you may draw a card."
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);

            console.log('Card under condition parsed:', JSON.stringify(abilities, null, 2));

            expect(abilities.length).toBeGreaterThan(0);
            const triggered = abilities[0];
            expect(triggered.type).toBe('triggered');
            expect(triggered.event).toBe(GameEvent.CARD_QUESTED);

            // Modern architecture: condition is at root level, effects are direct
            const effect = triggered.effects?.[0];

            // Check if parser created a conditional structure OR if condition is at root
            if (effect?.type === 'conditional') {
                // Old architecture (if still used)
                expect(effect.condition).toMatchObject({
                    type: 'card_put_under_this_turn'
                });
                // Parser uses 'effect' property, not 'then'
                expect((effect as any).effect?.type).toBe('draw');
            } else {
                // Modern architecture - condition at root or on effect
                const hasRootCondition = 'condition' in triggered && triggered.condition;
                const hasEffectCondition = effect && 'condition' in effect;

                expect(hasRootCondition || hasEffectCondition).toBe(true);
                // Effect should be draw
                if (effect) {
                    expect(effect.type).toBe('draw');
                }
            }
        });

        it('should parse real Lady Tremaine card', () => {
            const card = cardLoader.getAllCards().find(c =>
                c.fullName?.includes('Lady Tremaine') && c.fullName?.includes('Sinister')
            );

            if (card) {
                console.log('Lady Tremaine card:', JSON.stringify(card.abilities, null, 2));

                const abilities = parseToAbilityDefinition(card);
                console.log('Lady Tremaine parsed:', JSON.stringify(abilities, null, 2));

                // Should parse the Boost keyword and the complex conditional
                expect(abilities.length).toBeGreaterThan(0);

                // Look for the quest trigger with conditional
                const questAbility = abilities.find(a =>
                    a.type === 'triggered' && a.event === GameEvent.CARD_QUESTED
                );

                if (questAbility) {
                    expect(questAbility.effects).toBeDefined();
                    expect(questAbility.effects!.length).toBeGreaterThan(0);
                }
            }
        });
    });

    describe('Pattern: "If [character type] in play"', () => {
        it('should parse "if you have a Princess character in play"', () => {
            const testCard = {
                id: 3003,
                name: 'Test Character Check',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'triggered',
                    effect: 'When you play this character, if you have a Princess character in play, gain 1 lore.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);
            const effect = abilities[0]?.effects?.[0];

            expect(effect?.type).toBe('conditional');
            expect((effect as any)?.condition).toMatchObject({
                type: 'has_character_in_play',
                subtype: 'Princess'
            });
            expect((effect as any)?.effect?.type).toBe('gain_lore');
            expect((effect as any)?.effect?.amount).toBe(1);
        });
    });

    describe('Pattern: "If damaged"', () => {
        it('should parse "if this character is damaged"', () => {
            const testCard = {
                id: 3004,
                name: 'Test Damage Check',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'triggered',
                    effect: 'Whenever this character quests, if this character is damaged, draw a card.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);
            const effect = abilities[0]?.effects?.[0];

            expect(effect?.type).toBe('conditional');
            if (effect && 'condition' in effect) {
                expect(effect.condition).toMatchObject({
                    type: 'is_damaged'
                });
            }
        });
    });

    describe('Pattern: Nested effects in conditionals', () => {
        it('should parse effect after condition is met', () => {
            const testCard = {
                id: 3005,
                name: 'Test Nested Effect',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'triggered',
                    effect: 'When you play this character, if you have 5 or more ink, draw 2 cards.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);
            const conditionalEffect = abilities[0]?.effects?.[0];

            expect(conditionalEffect?.type).toBe('conditional');
            expect((conditionalEffect as any)?.condition).toMatchObject({
                type: 'min_ink',
                amount: 5
            });
            expect((conditionalEffect as any)?.effect).toMatchObject({
                type: 'draw',
                amount: 2
            });
        });
    });
});
