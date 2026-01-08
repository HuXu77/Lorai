import { TestHarness } from '../engine-test-utils';
import { CardInstance, ZoneType } from '../../../src/engine/models';

describe('The Bare Necessities Reproduction', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initGame([], []); // Start with empty hands
    });

    it('should prompt opponent to discard a non-character card', async () => {
        const player1 = harness.getPlayer(harness.p1Id);
        const player2 = harness.getPlayer(harness.p2Id);

        // Capture emitted choices
        let capturedChoice: any = undefined;
        const originalEmit = harness.turnManager.emitChoiceRequest.bind(harness.turnManager);
        harness.turnManager.emitChoiceRequest = async (choice: any) => {
            capturedChoice = choice;
            return originalEmit(choice);
        };

        // Define card objects
        const bareNecessitiesDef = {
            name: 'The Bare Necessities',
            fullName: 'The Bare Necessities',
            type: 'Action',
            cost: 2,
            parsedEffects: [{
                type: 'activated',
                fullText: 'Each opponent chooses a non-character card from their hand and discards it.',
                effects: [{
                    type: 'discard_chosen',
                    target: { type: 'opponent' },
                    amount: 1,
                    filter: { type: 'not', filter: { type: 'character' } },
                    chooser: 'opponent' // Adding chooser explicitly to match my code expectation
                }]
            }]
        };

        const dinglehopperDef = {
            name: 'Dinglehopper',
            fullName: 'Dinglehopper',
            type: 'Item',
            cost: 1
        };

        const stitchDef = {
            name: 'Stitch',
            fullName: 'Stitch',
            type: 'Character',
            cost: 1
        };

        // Setup hands using harness helper
        harness.setHand(harness.p1Id, [bareNecessitiesDef as any]);
        harness.setHand(harness.p2Id, [dinglehopperDef as any, stitchDef as any]);

        // Add ink for Player 1 (Cost 2)
        harness.setInkwell(harness.p1Id, ['Dinglehopper', 'Dinglehopper']);

        // Get the instances created by setHand
        const bareNecessities = player1.hand[0];
        const dinglehopper = player2.hand[0];
        const stitch = player2.hand[1];

        // Play Bare Necessities
        await harness.playCard(player1, bareNecessities);

        // Verify choice was requested
        expect(capturedChoice).toBeDefined();
        if (capturedChoice) {
            expect(capturedChoice.playerId).toBe(player2.id); // Should be opponent choice
            expect(capturedChoice.min).toBe(1);
            expect(capturedChoice.max).toBe(1);

            // Check options
            const dingleOption = capturedChoice.options.find((o: any) => o.value === dinglehopper.instanceId);
            const stitchOption = capturedChoice.options.find((o: any) => o.value === stitch.instanceId);

            expect(dingleOption).toBeDefined();
            // Should verify stitch is NOT an option (because only non-characters are allowed)
            expect(stitchOption).toBeUndefined();
        }
    });
});
