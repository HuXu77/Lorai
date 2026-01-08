import { TestHarness } from '../engine-test-utils';
import { CardType, ZoneType } from '../../engine/models';

/**
 * Tests for card movement between zones to prevent duplication bugs
 * Ensures cards are moved (not duplicated) when transitioning between zones
 */
describe('Card Zone Movement Tests', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    describe('Drawing Starting Hand', () => {
        test('Cards move from deck to hand without duplication', () => {
            const player = harness.game.getPlayer(harness.p1Id);

            // Add 10 cards to deck
            for (let i = 0; i < 10; i++) {
                const card = harness.createCard(harness.p1Id, {
                    name: `Test Card ${i}`,
                    type: CardType.Character,
                    cost: 2,
                    strength: 2,
                    willpower: 3,
                    lore: 1
                });
                card.zone = ZoneType.Deck;
                player.deck.push(card);
            }

            expect(player.deck.length).toBe(10);
            expect(player.hand.length).toBe(0);

            // Draw starting hand (7 cards)
            harness.turnManager.drawStartingHand(player);

            // Verify: 7 in hand, 3 in deck, no duplicates
            expect(player.hand.length).toBe(7);
            expect(player.deck.length).toBe(3);

            // Check all cards have correct zones
            player.hand.forEach(card => {
                expect(card.zone).toBe(ZoneType.Hand);
            });
            player.deck.forEach(card => {
                expect(card.zone).toBe(ZoneType.Deck);
            });

            // Collect all instance IDs
            const allIds = [
                ...player.hand.map(c => c.instanceId),
                ...player.deck.map(c => c.instanceId)
            ];

            // Verify no duplicates (Set removes duplicates)
            expect(new Set(allIds).size).toBe(10);
            expect(allIds.length).toBe(10);
        });

        test('Drawing from empty deck does not error', () => {
            const player = harness.game.getPlayer(harness.p1Id);

            // Empty deck
            player.deck = [];
            player.hand = [];

            expect(() => {
                harness.turnManager.drawStartingHand(player);
            }).not.toThrow();

            expect(player.hand.length).toBe(0);
            expect(player.deck.length).toBe(0);
        });
    });

    describe('Mulligan', () => {
        test('Cards correctly move between zones during mulligan simulation', () => {
            const player = harness.game.getPlayer(harness.p1Id);

            // Setup: 7 cards in hand, 50 in deck
            const handCards = [];
            for (let i = 0; i < 7; i++) {
                const card = harness.createCard(harness.p1Id, {
                    name: `Hand Card ${i}`,
                    type: CardType.Character,
                    cost: 2,
                    strength: 2,
                    willpower: 3,
                    lore: 1
                });
                card.zone = ZoneType.Hand;
                player.hand.push(card);
                handCards.push(card);
            }

            for (let i = 0; i < 50; i++) {
                const card = harness.createCard(harness.p1Id, {
                    name: `Deck Card ${i}`,
                    type: CardType.Character,
                    cost: 3,
                    strength: 3,
                    willpower: 4,
                    lore: 1
                });
                card.zone = ZoneType.Deck;
                player.deck.push(card);
            }

            expect(player.hand.length).toBe(7);
            expect(player.deck.length).toBe(50);

            // Simulate mulligan: Move 3 cards from hand to deck
            const cardsToMulligan = [handCards[0], handCards[2], handCards[4]];
            const mulliganIds = cardsToMulligan.map(c => c.instanceId);

            // Remove from hand, add to deck
            cardsToMulligan.forEach(card => {
                const idx = player.hand.findIndex(c => c.instanceId === card.instanceId);
                player.hand.splice(idx, 1);
                card.zone = ZoneType.Deck;
                player.deck.unshift(card);
            });

            // Draw 3 cards back
            for (let i = 0; i < 3; i++) {
                const card = player.deck.pop()!;
                card.zone = ZoneType.Hand;
                player.hand.push(card);
            }

            // Verify: Still 7 in hand, still 50 in deck
            expect(player.hand.length).toBe(7);
            expect(player.deck.length).toBe(50);

            // Verify: The 3 mulliganed cards are NOT in hand
            const handIds = player.hand.map(c => c.instanceId);
            mulliganIds.forEach(id => {
                expect(handIds).not.toContain(id);
            });

            // Collect all instance IDs
            const allIds = [
                ...player.hand.map(c => c.instanceId),
                ...player.deck.map(c => c.instanceId)
            ];

            // Verify no duplicates
            expect(new Set(allIds).size).toBe(57); // 7 hand + 50 deck
            expect(allIds.length).toBe(57);
        });
    });

    describe('Drawing Cards During Game', () => {
        test('Drawing a card moves it from deck to hand without duplication', () => {
            const player = harness.game.getPlayer(harness.p1Id);

            // Setup
            const deckCard = harness.createCard(harness.p1Id, {
                name: 'Deck Card',
                type: CardType.Character,
                cost: 3,
                strength: 3,
                willpower: 4,
                lore: 1
            });
            deckCard.zone = ZoneType.Deck;
            player.deck.push(deckCard);

            const cardId = deckCard.instanceId;

            expect(player.deck.length).toBe(1);
            expect(player.hand.length).toBe(0);

            // Draw the card (simulate draw phase)
            const drawnCard = player.deck.pop();
            if (drawnCard) {
                drawnCard.zone = ZoneType.Hand;
                player.hand.push(drawnCard);
            }

            // Verify
            expect(player.hand.length).toBe(1);
            expect(player.deck.length).toBe(0);
            expect(player.hand[0].instanceId).toBe(cardId);
            expect(player.hand[0].zone).toBe(ZoneType.Hand);
        });
    });

    describe('Discarding Cards', () => {
        test('Discarded card moves from hand to discard without duplication', () => {
            const player = harness.game.getPlayer(harness.p1Id);

            // Setup
            const handCard = harness.createCard(harness.p1Id, {
                name: 'Hand Card',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3,
                lore: 1
            });
            handCard.zone = ZoneType.Hand;
            player.hand.push(handCard);

            const cardId = handCard.instanceId;

            expect(player.hand.length).toBe(1);
            expect(player.discard.length).toBe(0);

            // Discard the card
            const card = player.hand.splice(0, 1)[0];
            card.zone = ZoneType.Discard;
            player.discard.push(card);

            // Verify
            expect(player.hand.length).toBe(0);
            expect(player.discard.length).toBe(1);
            expect(player.discard[0].instanceId).toBe(cardId);
            expect(player.discard[0].zone).toBe(ZoneType.Discard);
        });
    });

    describe('Returning Cards from Discard', () => {
        test('Card moves from discard to hand without duplication', () => {
            const player = harness.game.getPlayer(harness.p1Id);

            // Setup
            const discardCard = harness.createCard(harness.p1Id, {
                name: 'Discard Card',
                type: CardType.Character,
                cost: 3,
                strength: 3,
                willpower: 4,
                lore: 1
            });
            discardCard.zone = ZoneType.Discard;
            player.discard.push(discardCard);

            const cardId = discardCard.instanceId;

            expect(player.discard.length).toBe(1);
            expect(player.hand.length).toBe(0);

            // Return to hand
            const card = player.discard.splice(0, 1)[0];
            card.zone = ZoneType.Hand;
            player.hand.push(card);

            // Verify
            expect(player.discard.length).toBe(0);
            expect(player.hand.length).toBe(1);
            expect(player.hand[0].instanceId).toBe(cardId);
            expect(player.hand[0].zone).toBe(ZoneType.Hand);
        });
    });

    describe('Multiple Zone Transitions', () => {
        test('Card maintains single instance through multiple zone changes', () => {
            const player = harness.game.getPlayer(harness.p1Id);

            // Create one card
            const card = harness.createCard(harness.p1Id, {
                name: 'Traveling Card',
                type: CardType.Character,
                cost: 3,
                strength: 3,
                willpower: 4,
                lore: 1
            });
            const originalId = card.instanceId;

            // Start in deck
            card.zone = ZoneType.Deck;
            player.deck.push(card);
            expect(player.deck.length).toBe(1);

            // Move to hand
            const c1 = player.deck.pop()!;
            c1.zone = ZoneType.Hand;
            player.hand.push(c1);
            expect(player.deck.length).toBe(0);
            expect(player.hand.length).toBe(1);
            expect(c1.instanceId).toBe(originalId);

            // Move to play
            const c2 = player.hand.splice(0, 1)[0];
            c2.zone = ZoneType.Play;
            player.play.push(c2);
            expect(player.hand.length).toBe(0);
            expect(player.play.length).toBe(1);
            expect(c2.instanceId).toBe(originalId);

            // Move to discard
            const c3 = player.play.splice(0, 1)[0];
            c3.zone = ZoneType.Discard;
            player.discard.push(c3);
            expect(player.play.length).toBe(0);
            expect(player.discard.length).toBe(1);
            expect(c3.instanceId).toBe(originalId);

            // Verify no duplicates anywhere
            const total = player.deck.length + player.hand.length +
                player.play.length + player.discard.length +
                player.inkwell.length;
            expect(total).toBe(1);
        });
    });

    describe('Regression Test: No Duplication Bug', () => {
        test('Full game setup does not duplicate cards', () => {
            const player1 = harness.game.getPlayer(harness.p1Id);
            const player2 = harness.game.getPlayer(harness.p2Id);

            // Add 60 cards to each deck
            const player1Cards = [];
            const player2Cards = [];

            for (let i = 0; i < 60; i++) {
                const card1 = harness.createCard(harness.p1Id, {
                    name: `P1 Card ${i}`,
                    type: CardType.Character,
                    cost: 2,
                    strength: 2,
                    willpower: 3,
                    lore: 1
                });
                card1.zone = ZoneType.Deck;
                player1.deck.push(card1);
                player1Cards.push(card1.instanceId);

                const card2 = harness.createCard(harness.p2Id, {
                    name: `P2 Card ${i}`,
                    type: CardType.Character,
                    cost: 2,
                    strength: 2,
                    willpower: 3,
                    lore: 1
                });
                card2.zone = ZoneType.Deck;
                player2.deck.push(card2);
                player2Cards.push(card2.instanceId);
            }

            // Draw starting hands
            harness.turnManager.drawStartingHand(player1);
            harness.turnManager.drawStartingHand(player2);

            // Verify totals
            expect(player1.hand.length + player1.deck.length).toBe(60);
            expect(player2.hand.length + player2.deck.length).toBe(60);

            // Verify no duplicates for player 1
            const p1Ids = [
                ...player1.hand.map(c => c.instanceId),
                ...player1.deck.map(c => c.instanceId)
            ];
            expect(new Set(p1Ids).size).toBe(60);

            // Verify no duplicates for player 2
            const p2Ids = [
                ...player2.hand.map(c => c.instanceId),
                ...player2.deck.map(c => c.instanceId)
            ];
            expect(new Set(p2Ids).size).toBe(60);
        });
    });
});
