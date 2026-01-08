/**
 * Draw Effect Execution Tests
 * 
 * Tests that draw effects parse correctly and execute in gameplay.
 * Uses real cards from allCards.json.
 */

import { SharedTestFixture } from '../../test-fixtures';
import { GameEvent } from '../../../engine/abilities/events';
import { TestHarness } from '../../engine-test-utils';
import { ActionType } from '../../../engine/actions';
import { ZoneType, CardType } from '../../../engine/models';

describe('Draw Effect Execution', () => {
    let fixture: SharedTestFixture;

    beforeAll(async () => {
        fixture = await SharedTestFixture.getInstance();
    });

    describe('Parser Tests - Draw Abilities', () => {
        it('should parse Maleficent - Sorceress draw ability', async () => {
            const maleficent = fixture.getAllCards().find(c =>
                c.name === 'Maleficent' && c.fullName?.includes('Sorceress')
            );

            expect(maleficent).toBeDefined();
            expect(maleficent?.type).toBe('Character');

            const abilities = fixture.parseAbilities(maleficent!);
            expect(abilities.length).toBeGreaterThan(0);

            const drawTrigger = abilities.find(a =>
                a.type === 'triggered' &&
                a.event === GameEvent.CARD_PLAYED
            );

            expect(drawTrigger).toBeDefined();

            const hasDrawEffect = drawTrigger?.effects?.some((e: any) =>
                e.type === 'draw'
            );

            expect(hasDrawEffect).toBe(true);
            console.log('✓ Maleficent - Sorceress: "When you play this character, you may draw a card."');
        });

        it('should parse Simba - Future King draw ability', async () => {
            const simba = fixture.getAllCards().find(c =>
                c.name === 'Simba' && c.fullName?.includes('Future King')
            );

            expect(simba).toBeDefined();
            const abilities = fixture.parseAbilities(simba!);
            expect(abilities.length).toBeGreaterThan(0);

            const drawTrigger = abilities.find(a =>
                a.type === 'triggered' &&
                a.event === GameEvent.CARD_PLAYED
            );

            expect(drawTrigger).toBeDefined();
            expect(drawTrigger?.effects?.some((e: any) => e.type === 'draw')).toBe(true);

            console.log('✓ Simba - Future King: "When you play this character, you may draw a card, then choose and discard a card."');
        });

        it('should find and parse multiple draw cards', async () => {
            const allCards = fixture.getAllCards();

            const drawCards = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a =>
                    a.effects?.some((e: any) => e.type === 'draw')
                );
            });

            console.log(`\n✓ Found ${drawCards.length} cards with draw abilities`);
            console.log('  Examples:');
            drawCards.slice(0, 5).forEach(card => {
                console.log(`    - ${card.fullName || card.name}`);
            });

            expect(drawCards.length).toBeGreaterThan(10);
        });
    });

    describe('Execution Tests - Draw Effects', () => {
        let harness: TestHarness;

        beforeEach(async () => {
            harness = new TestHarness();
            await harness.initialize();
        });

        it('should draw 1 card using mock card with draw effect', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Create mock character with draw ability
            const drawChar = p1.addCardToZone({
                id: 'draw-char-1',
                name: 'Draw Tester',
                type: 'Character' as CardType,
                cost: 2,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, draw a card."
                }]
            } as any, ZoneType.Hand);

            // Setup deck and ink
            p1.addCardToZone({ name: 'Deck Card 1' } as any, ZoneType.Deck);
            p1.addCardToZone({ name: 'Deck Card 2' } as any, ZoneType.Deck);
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;

            harness.turnManager.startGame(p1.id);

            const initialHandSize = p1.hand.length;
            const initialDeckSize = p1.deck.length;

            // Play the character
            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: drawChar.instanceId
            });

            // Verify draw happened
            expect(p1.hand.length).toBe(initialHandSize); // -1 played, +1 drew = same
            expect(p1.deck.length).toBe(initialDeckSize - 1); // Drew 1 card
        });

        it('should handle drawing from empty deck', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            const drawChar = p1.addCardToZone({
                id: 'draw-char-2',
                name: 'Draw Tester',
                type: 'Character' as CardType,
                cost: 2,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, draw a card."
                }]
            } as any, ZoneType.Hand);

            // NO cards in deck
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;

            harness.turnManager.startGame(p1.id);

            const initialHandSize = p1.hand.length;

            // Should not crash when drawing from empty deck
            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: drawChar.instanceId
            });

            // Hand decreased by 1 (played card, couldn't draw)
            expect(p1.hand.length).toBe(initialHandSize - 1);
            expect(p1.deck.length).toBe(0);
        });

        it('should draw multiple cards', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            const multiDrawChar = p1.addCardToZone({
                id: 'multi-draw-1',
                name: 'Multi Draw',
                type: 'Character' as CardType,
                cost: 3,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, draw 2 cards."
                }]
            } as any, ZoneType.Hand);

            // Setup deck
            for (let i = 0; i < 5; i++) {
                p1.addCardToZone({ name: `Deck Card ${i}` } as any, ZoneType.Deck);
            }
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;

            harness.turnManager.startGame(p1.id);

            const initialDeckSize = p1.deck.length;

            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: multiDrawChar.instanceId
            });

            // Should have drawn 2 cards
            expect(p1.deck.length).toBe(initialDeckSize - 2);
        });
    });
});
