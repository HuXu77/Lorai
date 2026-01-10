import { TestHarness } from '../engine-test-utils';

describe('Bug: Sudden Chill Opponent Choice', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should prompt the opponent to choose which card to discard', async () => {
        // Setup: P1 has Sudden Chill in hand, P2 has cards in hand
        await harness.initGame(['Sudden Chill'], ['Mickey Mouse - Brave Little Tailor', 'Minnie Mouse - Beloved Princess']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        // P2 should start with 2 cards in hand (from initGame setup)
        expect(p2.hand.length).toBeGreaterThanOrEqual(1);
        const p2InitialHandSize = p2.hand.length;
        const expectedCard = p2.hand[0]; // Track which card we expect to be chosen

        harness.setInk(harness.p1Id, 2);

        // Track choice requests
        let opponentChoiceRequest: any = null;
        const originalRequestChoice = harness.turnManager.requestChoice;
        (harness.turnManager as any).requestChoice = async (request: any) => {
            if (request.playerId === harness.p2Id && request.prompt?.includes('discard')) {
                opponentChoiceRequest = request;
                // Simulate opponent choosing the first card
                return { selectedIds: [expectedCard.instanceId] };
            }
            return originalRequestChoice.call(harness.turnManager, request);
        };

        // P1 plays Sudden Chill
        const suddenChill = p1.hand.find(c => c.name === 'Sudden Chill');
        expect(suddenChill).toBeDefined();

        await harness.playCard(p1, suddenChill!);

        // Verify: The choice request was sent to the opponent (P2)
        expect(opponentChoiceRequest).not.toBeNull();
        expect(opponentChoiceRequest.playerId).toBe(harness.p2Id); // Key assertion!

        // Verify: P2's hand decreased by 1
        expect(p2.hand.length).toBe(p2InitialHandSize - 1);

        // Verify: The expected card is now in discard
        expect(p2.discard.some(c => c.instanceId === expectedCard.instanceId)).toBe(true);
    });
});
