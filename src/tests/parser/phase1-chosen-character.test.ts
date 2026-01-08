/**
 * Phase 1 - Chosen Character Pattern Tests
 * 
 * TDD: Write tests FIRST for chosen character effects
 * Target: +57 cards
 */

import { CardLoader } from '../../engine/card-loader';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameEvent } from '../../engine/abilities/events';
import { CardType } from '../../engine/models';

describe('Phase 1: Chosen Character Pattern', () => {
    let cardLoader: CardLoader;

    beforeAll(async () => {
        cardLoader = new CardLoader();
        await cardLoader.loadCards();
    });

    describe('Pattern: "Chosen character gets +X/-X"', () => {
        it('should parse Maximus - Relentless Pursuer', () => {
            // "When you play this character, chosen character gets -2 ¤ this turn."
            const card = cardLoader.getAllCards().find(c =>
                c.fullName?.includes('Maximus') && c.fullName?.includes('Relentless')
            );

            expect(card).toBeDefined();

            const abilities = parseToAbilityDefinition(card!);

            // Should parse triggered ability
            expect(abilities.length).toBeGreaterThan(0);

            const triggered = abilities.find(a => a.type === 'triggered');
            expect(triggered).toBeDefined();
            expect(triggered?.event).toBe(GameEvent.CARD_PLAYED);

            // Should have buff effect targeting chosen character
            const buffEffect = triggered?.effects?.find((e: any) => e.type === 'modify_stats');
            expect(buffEffect).toBeDefined();
            expect(buffEffect).toMatchObject({
                type: 'modify_stats',
                target: expect.objectContaining({ type: 'chosen_character' }),
                stat: 'strength',
                amount: -2,
                duration: 'this_turn'
            });
        });

        it('should parse "chosen character gets +X strength"', () => {
            // Generic pattern test
            const testCard = {
                id: 999,
                name: 'Test Card',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'triggered',
                    effect: 'When you play this character, chosen character gets +3 ※ this turn.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);

            expect(abilities.length).toBeGreaterThan(0);
            const triggered = abilities[0];
            expect(triggered.event).toBe(GameEvent.CARD_PLAYED);

            const buffEffect = triggered.effects?.[0];
            expect(buffEffect).toMatchObject({
                type: 'modify_stats',
                target: { type: 'chosen_character' },
                stat: 'strength',
                amount: 3,
                duration: 'turn'
            });
        });

        it('should parse permanent buffs without "this turn"', () => {
            const testCard = {
                id: 998,
                name: 'Test Card 2',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'triggered',
                    effect: 'When you play this character, chosen character gets +2 ※.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);
            const buffEffect = abilities[0]?.effects?.[0];

            expect(buffEffect).toMatchObject({
                type: 'modify_stats',
                amount: 2,
                duration: undefined
            });
        });
    });

    describe('Pattern: "Chosen opposing character"', () => {
        it('should parse chosen opposing character effects', () => {
            const testCard = {
                id: 997,
                name: 'Test Card 3',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'triggered',
                    effect: 'When you play this character, chosen opposing character gets -3 ※ this turn.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);
            const buffEffect = abilities[0]?.effects?.[0];

            expect(buffEffect).toMatchObject({
                type: 'modify_stats',
                target: { type: 'chosen_opposing_character' },
                amount: -3
            });
        });
    });

    describe('Pattern: Multiple stat modifications', () => {
        it('should parse "+X strength and +Y willpower"', () => {
            const testCard = {
                id: 996,
                name: 'Test Card 4',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'triggered',
                    effect: 'When you play this character, chosen character gets +2 ※ and +2 ⛨.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);
            const effects = abilities[0]?.effects;

            // Should have 2 buff effects or 1 combined
            expect(effects).toBeDefined();
            expect(effects!.length).toBeGreaterThan(0);

            // Check for strength buff
            const strBuff = effects!.find((e: any) => e.stat === 'strength');
            expect(strBuff).toBeDefined();
            expect((strBuff as any).amount).toBe(2);

            // Check for willpower buff
            const willBuff = effects!.find((e: any) => e.stat === 'willpower');
            expect(willBuff).toBeDefined();
            expect((willBuff as any).amount).toBe(2);
        });
    });
});
