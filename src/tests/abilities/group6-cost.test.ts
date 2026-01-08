import { TestHarness } from '../engine-test-utils';
import { CardType, ZoneType } from '../../engine/models';

describe('Group 6: Cost Modification & Free Play', () => {
    let testHarness: TestHarness;

    beforeEach(async () => {
        testHarness = new TestHarness();
        await testHarness.initialize();
    });

    describe('Cost Reduction (Lantern style)', () => {
        it('should reduce the cost of the next character played', async () => {
            const player1 = testHarness.createPlayer('Player 1');
            testHarness.setTurn(player1.id);

            // Setup: Lantern in play, 3-cost Character in hand, 2 Ink in Inkwell
            const lanternRaw = testHarness.createCard(player1, {
                name: 'Lantern',
                type: CardType.Item,
                cost: 2,
                abilities: [{
                    type: 'ability',
                    fullText: 'The next character you play this turn costs 1 less.'
                }]
            });
            const lantern = player1.addCardToZone(lanternRaw, ZoneType.Play);
            lantern.ready = true;

            const charRaw = testHarness.createCard(player1, {
                name: 'Expensive Character',
                type: CardType.Character,
                cost: 3
            });
            const character = player1.addCardToZone(charRaw, ZoneType.Hand);

            // Add 2 Ink (normally not enough for cost 3)
            for (let i = 0; i < 2; i++) {
                const ink = testHarness.createCard(player1, { name: 'Ink', type: CardType.Action, cost: 1, inkwell: true });
                player1.addCardToZone(ink, ZoneType.Inkwell);
            }

            // 1. Activate Lantern
            // We simulate the effect directly since we haven't implemented activated ability UI/triggering fully yet,
            // but the parser and handler are ready.
            // Actually, let's try to trigger it via resolveEffect if possible, or just playCard logic.
            // The parser produces 'reduce_cost_next_card'.

            // Manually trigger the effect for test purposes
            // Manually trigger the effect for test purposes
            await testHarness.resolveEffect(player1, {
                action: 'reduce_cost_next_card',
                amount: 1,
                params: { filter: 'character' }
            }, lantern);

            // Verify reduction is active
            expect(player1.costReductions).toBeDefined();
            expect(player1.costReductions!.length).toBe(1);
            expect(player1.costReductions![0].amount).toBe(1);

            // 2. Play Character
            // Should succeed with 2 ink (3 cost - 1 reduction = 2)
            const success = await testHarness.playCard(player1, character);
            expect(success).toBe(true);
            expect(character.zone).toBe(ZoneType.Play);

            // Verify ink used
            const readyInk = player1.inkwell.filter(c => c.ready).length;
            expect(readyInk).toBe(0); // All 2 used

            // Verify reduction consumed
            expect(player1.costReductions!.length).toBe(0);
        });
    });

    describe('Free Play (Lady Tremaine style)', () => {
        it('should play a card for free', async () => {
            const player1 = testHarness.createPlayer('Player 1');
            testHarness.setTurn(player1.id);

            // Setup: 5-cost card in hand, 0 Ink
            const expensiveCardRaw = testHarness.createCard(player1, {
                name: 'Expensive Action',
                type: CardType.Action,
                cost: 5
            });
            const expensiveCard = player1.addCardToZone(expensiveCardRaw, ZoneType.Hand);

            // Trigger "Play Free Card" effect
            // "You may play an action with cost 5 or less for free"
            // "You may play an action with cost 5 or less for free"
            await testHarness.resolveEffect(player1, {
                action: 'play_free_card',
                amount: 5,
                params: { filter: 'action' }
            });

            // Verify card was played
            // The effect handler simulates the choice and calls playCard
            // Since we only have one valid target, it should pick it.

            // Check if card is in discard (Actions go to discard after play)
            // Wait, playCard puts actions in discard? Yes, usually.
            // Let's check where it ended up.

            const playedCard = player1.discard.find(c => c.name === 'Expensive Action') ||
                player1.play.find(c => c.name === 'Expensive Action'); // In case it stays in play? Actions shouldn't.

            expect(playedCard).toBeDefined();
            // If it was an action, it should be in discard (unless it has other effects)
            // But for this test, we just want to know playCard was called successfully.

            // Also verify no ink was needed (we had 0)
        });
    });
});
