/**
 * Phase 2 - Discard Manipulation Pattern Tests
 * 
 * TDD: Write tests FIRST for discard-to-deck/hand effects
 * Target: Cards like Gazelle - Ballad Singer
 */

import { CardLoader } from '../../engine/card-loader';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameEvent } from '../../engine/abilities/events';
import { CardType } from '../../engine/models';

describe('Phase 2: Discard Manipulation Pattern', () => {
    let cardLoader: CardLoader;

    beforeAll(async () => {
        cardLoader = new CardLoader();
        await cardLoader.loadCards();
    });

    describe('Pattern: "Put [type] card from discard to top/bottom of deck"', () => {
        it('should parse Gazelle - Ballad Singer (song to top of deck)', () => {
            // "When you play this character, you may put a song card from your discard on the top of your deck."
            const card = cardLoader.getAllCards().find(c =>
                c.fullName?.includes('Gazelle') && c.fullName?.includes('Ballad')
            );

            expect(card).toBeDefined();

            const abilities = parseToAbilityDefinition(card!);

            console.log('Gazelle parsed:', JSON.stringify(abilities, null, 2));

            expect(abilities.length).toBeGreaterThan(0);

            const triggered = abilities.find(a => a.type === 'triggered');
            expect(triggered).toBeDefined();
            expect(triggered?.event).toBe(GameEvent.CARD_PLAYED);

            // Should have "put from discard" effect
            const putEffect = triggered?.effects?.find((e: any) =>
                e.type === 'put_from_discard' || e.type === 'return_from_discard_to_deck'
            );
            expect(putEffect).toBeDefined();
            if (putEffect) {
                expect(putEffect).toMatchObject({
                    filter: expect.objectContaining({ cardType: 'song' }),
                    destination: 'top_deck'
                });
            }
        });

        it('should parse generic "put card from discard on top of deck"', () => {
            const testCard = {
                id: 2001,
                name: 'Test Discard Card',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'triggered',
                    effect: 'When you play this character, you may put a song card from your discard on the top of your deck.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);

            expect(abilities.length).toBeGreaterThan(0);
            const effect = abilities[0]?.effects?.[0];

            expect(effect).toMatchObject({
                type: 'put_from_discard',
                filter: { cardType: 'song' },
                destination: 'top_deck'
            });
        });

        it('should parse "put card from discard on bottom of deck"', () => {
            const testCard = {
                id: 2002,
                name: 'Test Bottom Deck',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'triggered',
                    effect: 'When you play this character, put an action card from your discard on the bottom of your deck.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);
            const effect = abilities[0]?.effects?.[0];

            expect(effect).toMatchObject({
                type: 'put_from_discard',
                filter: { cardType: 'action' },
                destination: 'bottom_deck'
            });
        });
    });

    describe('Pattern: "Put card from discard into hand"', () => {
        it('should parse "put card from discard into your hand"', () => {
            const testCard = {
                id: 2003,
                name: 'Test Hand Return',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'triggered',
                    effect: 'When you play this character, you may put a character card from your discard into your hand.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);
            const effect = abilities[0]?.effects?.[0];

            expect(effect).toMatchObject({
                type: 'put_from_discard',
                filter: { cardType: 'character' },
                destination: 'hand'
            });
        });

        it('should parse generic "put any card from discard"', () => {
            const testCard = {
                id: 2004,
                name: 'Test Any Card',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'triggered',
                    effect: 'When you play this character, you may put a card from your discard into your hand.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(testCard);
            const effect = abilities[0]?.effects?.[0];

            expect(effect).toMatchObject({
                type: 'put_from_discard',
                destination: 'hand'
            });
            // filter should be undefined or not present for "any card"
            if (effect && 'filter' in effect) {
                expect(effect.filter).toBeUndefined();
            }
        });
    });

    describe('Pattern: Optional vs Required', () => {
        it('should detect optional "may put" vs required "put"', () => {
            const optionalCard = {
                id: 2005,
                name: 'Optional Test',
                type: 'Character' as CardType,
                abilities: [{
                    type: 'triggered',
                    effect: 'When you play this character, you may put a song card from your discard on top of your deck.'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(optionalCard);
            const effect = abilities[0]?.effects?.[0];

            // Optional effects should be marked
            expect(effect).toMatchObject({
                type: 'put_from_discard',
                optional: true
            });
        });
    });
});
