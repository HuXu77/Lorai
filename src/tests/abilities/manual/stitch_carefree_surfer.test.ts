
import { TestHarness } from '../../engine-test-utils';
import { CardType } from '../../../engine/models';

describe('Ability: Stitch - Carefree Surfer (Ohana)', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should draw 2 cards if player has 2 or more other characters in play', async () => {
        const player = harness.game.getPlayer(harness.p1Id);

        // 1. Setup Stitch - Carefree Surfer
        const stitch = harness.createCard(player, {
            id: 21,
            name: 'Stitch - Carefree Surfer',
            type: CardType.Character,
            cost: 7,
            abilities: [
                {
                    type: 'triggered',
                    fullText: "OHANA When you play this character, if you have 2 or more other characters in play, you may draw 2 cards.",
                    effect: "When you play this character, if you have 2 or more other characters in play, you may draw 2 cards."
                }
            ]
        });
        player.hand.push(stitch);

        // 2. Setup 2 other characters
        const char1 = harness.createCard(player, { name: 'Other 1', type: CardType.Character, cost: 1 });
        const char2 = harness.createCard(player, { name: 'Other 2', type: CardType.Character, cost: 1 });
        player.play.push(char1, char2);

        harness.setInk(harness.p1Id, 10);

        // 3. Register Choice Handler (for optional draw)
        harness.turnManager.registerChoiceHandler(harness.p1Id, (choice: any) => {
            if (choice.type === 'optional_trigger' || choice.type === 'optional' || choice.type === 'yes_no') {
                return { requestId: choice.id, selectedIds: ['yes'], playerId: harness.p1Id };
            }
            return { requestId: choice.id, selectedIds: [], playerId: harness.p1Id };
        });

        // Add cards to deck for drawing
        const deckCards = [
            harness.createCard(player, { name: 'Deck Card 1', type: CardType.Character, cost: 1 }),
            harness.createCard(player, { name: 'Deck Card 2', type: CardType.Character, cost: 1 }),
            harness.createCard(player, { name: 'Deck Card 3', type: CardType.Character, cost: 1 }),
        ];
        deckCards.forEach(c => {
            c.zone = 'deck';
            player.deck.push(c);
        });

        // 4. Play Stitch
        const initialHandSize = player.hand.length; // 0 (Stitch in hand being played...) -> Wait, played card leaves hand.
        // Actually, harness.playCard removes it from hand.
        // Hand size before play (with Stitch): 1.
        // Hand size after play (without Stitch, before draw): 0.
        // Expected hand size after draw: 2.

        await harness.playCard(player, stitch);

        expect(player.hand.length).toBe(2);
    });

    it('should NOT draw cards if player has fewer than 2 other characters', async () => {
        const player = harness.game.getPlayer(harness.p1Id);

        // 1. Setup Stitch
        const stitch = harness.createCard(player, {
            id: 21,
            name: 'Stitch - Carefree Surfer',
            type: CardType.Character,
            cost: 7,
            abilities: [
                {
                    type: 'triggered',
                    fullText: "OHANA When you play this character, if you have 2 or more other characters in play, you may draw 2 cards.",
                    effect: "When you play this character, if you have 2 or more other characters in play, you may draw 2 cards."
                }
            ]
        });
        player.hand.push(stitch);

        // 2. Setup only 1 other character
        const char1 = harness.createCard(player, { name: 'Other 1', type: CardType.Character, cost: 1 });
        player.play.push(char1);

        harness.setInk(harness.p1Id, 10);

        await harness.playCard(player, stitch);

        expect(player.hand.length).toBe(0);
    });
});
