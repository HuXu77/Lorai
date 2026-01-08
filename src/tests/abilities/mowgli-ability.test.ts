import { TestHarness } from '../engine-test-utils';
import { CardType } from '../../engine/models';

describe('Mowgli - Ability Triggering', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should trigger when owner plays Mowgli and opponent discards non-character', async () => {
        // Player 2 has cards in hand (mix of character and non-character)
        harness.setHand('Player 2', [
            { id: 101, name: 'Merlin', cost: 3, type: 'Character' as CardType, strength: 0, willpower: 3, lore: 2 },
            { id: 102, name: 'Blessed Bagpipes', cost: 3, type: 'Item' as CardType },
            { id: 103, name: 'Flynn Rider', cost: 1, type: 'Character' as CardType, strength: 3, willpower: 2, lore: 1 }
        ]);

        // Player 1 has Mowgli in hand
        harness.setHand('Player 1', [
            {
                id: 1,
                name: 'Mowgli', cost: 1, type: 'Character' as CardType, strength: 1, willpower: 2, lore: 2,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, chosen opponent reveals their hand and discards a non-character card of their choice.",
                    fullText: "JUNGLE CHALLENGE When you play this character, chosen opponent reveals their hand and discards a non-character card of their choice.",
                    name: "JUNGLE CHALLENGE"
                }]
            }
        ]);

        harness.setInk('Player 1', 1);

        const initialP2HandSize = harness.getPlayer('Player 2').hand.length;
        const initialP2DiscardSize = harness.getPlayer('Player 2').discard.length;

        // Player 1 plays Mowgli
        await harness.playCard('Player 1', 'Mowgli');

        // Player 2's hand should be reduced by 1 (discarded a non-character)
        expect(harness.getPlayer('Player 2').hand.length).toBe(initialP2HandSize - 1);
        expect(harness.getPlayer('Player 2').discard.length).toBe(initialP2DiscardSize + 1);

        // The discarded card should be non-character (Blessed Bagpipes)
        const discardedCard = harness.getPlayer('Player 2').discard[harness.getPlayer('Player 2').discard.length - 1];
        expect(discardedCard.type).not.toBe('Character');
    });

    it('should NOT trigger when owner plays other characters', async () => {
        // Player 1 has Mowgli already in play
        harness.setPlay('Player 1', [
            {
                id: 3,
                name: 'Mowgli', cost: 1, type: 'Character' as CardType, strength: 1, willpower: 2, lore: 2,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, chosen opponent reveals their hand and discards a non-character card of their choice.",
                    fullText: "JUNGLE CHALLENGE When you play this character, chosen opponent reveals their hand and discards a non-character card of their choice.",
                    name: "JUNGLE CHALLENGE"
                }]
            }
        ]);

        // Player 1 has Lady in hand
        harness.setHand('Player 1', [
            { id: 201, name: 'Lady', cost: 1, type: 'Character' as CardType, strength: 1, willpower: 2, lore: 1 }
        ]);

        // Player 2 has cards
        harness.setHand('Player 2', [
            { id: 202, name: 'Blessed Bagpipes', cost: 3, type: 'Item' as CardType }
        ]);

        harness.setInk('Player 1', 1);

        const initialP2HandSize = harness.getPlayer('Player 2').hand.length;

        // Player 1 plays Lady (NOT Mowgli) - Mowgli's ability should NOT trigger
        await harness.playCard('Player 1', 'Lady');

        // Player 2's hand should NOT change
        expect(harness.getPlayer('Player 2').hand.length).toBe(initialP2HandSize);
    });

    it('should NOT trigger when opponent plays a character', async () => {
        // Player 1 has Mowgli in play
        harness.setPlay('Player 1', [
            {
                id: 2,
                name: 'Mowgli', cost: 1, type: 'Character' as CardType, strength: 1, willpower: 2, lore: 2,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, chosen opponent reveals their hand and discards a non-character card of their choice.",
                    fullText: "JUNGLE CHALLENGE When you play this character, chosen opponent reveals their hand and discards a non-character card of their choice.",
                    name: "JUNGLE CHALLENGE"
                }]
            }
        ]);

        // Player 2 has cards
        harness.setHand('Player 2', [
            { id: 301, name: 'Merlin', cost: 3, type: 'Character' as CardType, strength: 0, willpower: 3, lore: 2 },
            { id: 302, name: 'Blessed Bagpipes', cost: 3, type: 'Item' as CardType }
        ]);

        harness.setInk('Player 2', 3);

        const initialP2HandSize = harness.getPlayer('Player 2').hand.length;

        // Make it Player 2's turn so they can play
        harness.turnManager.passTurn('Player 1');

        // Player 2 plays Merlin - Mowgli's ability should NOT trigger
        await harness.playCard('Player 2', 'Merlin');

        // Player 2's hand should only reduce by 1 (the card they played)
        expect(harness.getPlayer('Player 2').hand.length).toBe(initialP2HandSize - 1);
        // Should not have discarded anything (except playing Merlin)
        expect(harness.getPlayer('Player 2').discard.length).toBe(0);
    });

    it('should do nothing if opponent has no non-character cards', async () => {
        // Player 2 only has characters
        harness.setHand('Player 2', [
            { id: 401, name: 'Merlin', cost: 3, type: 'Character' as CardType, strength: 0, willpower: 3, lore: 2 },
            { id: 402, name: 'Flynn Rider', cost: 1, type: 'Character' as CardType, strength: 3, willpower: 2, lore: 1 }
        ]);

        // Player 1 has Mowgli
        harness.setHand('Player 1', [
            {
                id: 4,
                name: 'Mowgli', cost: 1, type: 'Character' as CardType, strength: 1, willpower: 2, lore: 2,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, chosen opponent reveals their hand and discards a non-character card of their choice.",
                    fullText: "JUNGLE CHALLENGE When you play this character, chosen opponent reveals their hand and discards a non-character card of their choice.",
                    name: "JUNGLE CHALLENGE"
                }]
            }
        ]);

        harness.setInk('Player 1', 1);

        const initialP2HandSize = harness.getPlayer('Player 2').hand.length;

        // Player 1 plays Mowgli
        await harness.playCard('Player 1', 'Mowgli');

        // Player 2's hand should NOT change (no non-character cards to discard)
        expect(harness.getPlayer('Player 2').hand.length).toBe(initialP2HandSize);
    });
});
