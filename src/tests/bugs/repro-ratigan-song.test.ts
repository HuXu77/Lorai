
import { TestHarness } from '../engine-test-utils';

describe('Bug: World\'s Greatest Criminal Mind Targeting', () => {
    it('should NOT be able to banish a Location or weak Character', async () => {
        const harness = new TestHarness();
        await harness.initialize();

        const p1 = harness.getPlayer(harness.p1Id);
        const p2 = harness.getPlayer(harness.p2Id);

        // Setup Player 1: Has Song
        // Note: Using exact simple name matches usually safest if full name unknown
        harness.setHand(harness.p1Id, ["World's Greatest Criminal Mind"]);
        harness.setInk(harness.p1Id, 10);

        // Setup Player 2: Has Location and Weak Character
        harness.setPlay(harness.p2Id, [
            "Forbidden Mountain - Maleficent's Castle",
            "Maleficent - Biding Her Time",
            "Maui - Hero to All"
        ]);

        const song = p1.hand[0];

        // Mock choice request to inspect options
        let choiceRequest: any = null;
        harness.turnManager.emitChoiceRequest = async (choice: any) => {
            choiceRequest = choice;
            return {
                requestId: choice.id,
                playerId: choice.playerId,
                selectedIds: [], // Cancel/Empty
                timestamp: Date.now()
            };
        };

        // Attempt to play song
        await harness.playCard(p1, song);

        expect(choiceRequest).toBeDefined();

        // Get target instances
        const location = p2.play.find(c => c.type === 'Location');
        const weakChar = p2.play.find(c => c.fullName.toLowerCase().includes('biding'));

        expect(location).toBeDefined();
        expect(weakChar).toBeDefined();

        const options = choiceRequest.options || [];

        // Check if they are valid options
        // Assertion: Location should NOT be a valid target
        // If the bug exists, valid will be true.
        const locOption = options.find((o: any) => o.id === location?.instanceId);
        if (locOption && locOption.valid) {
            console.log('BUG: Location is a valid target!');
        }
        expect(locOption ? locOption.valid : false).toBe(false);

        // Assertion: Weak character should NOT be a valid target
        const weakOption = options.find((o: any) => o.id === weakChar?.instanceId);
        if (weakOption && weakOption.valid) {
            console.log('BUG: Weak character is a valid target!');
        }
        expect(weakOption ? weakOption.valid : false).toBe(false);

        // Assertion: Strong character SHOULD be a valid target
        const strongChar = p2.play.find(c => c.fullName.includes('Maui'));
        expect(strongChar).toBeDefined();
        const strongOption = options.find((o: any) => o.id === strongChar?.instanceId);
        expect(strongOption).toBeDefined();
        expect(strongOption.valid).toBe(true);
    });
});
