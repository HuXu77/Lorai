
import { TestHarness } from '../engine-test-utils';
import { CardLoader } from '../../engine/card-loader';

describe('The Bare Necessities Targeting Bug', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initGame(['The Bare Necessities'], ['Dinglehopper']);
    });

    it('should NOT allow choosing a Character card (Baloo)', async () => {
        const player1 = harness.getPlayer(harness.p1Id);
        const bareNecessities = player1.hand.find(c => c.name === 'The Bare Necessities');
        if (!bareNecessities) throw new Error('Card not found in hand');

        const opponent = harness.getPlayer(harness.p2Id);

        // Setup opponent hand with a mix of valid and invalid targets
        // Dinglehopper (Item) - VALID
        // Baloo (Character) - INVALID
        opponent.hand = [];

        const dingleInstance: any = {
            instanceId: 'i_dingle',
            name: 'Dinglehopper',
            fullName: 'Dinglehopper',
            type: 'Item',
            cost: 1,
            zone: 'hand',
            ownerId: opponent.id
        };

        const balooInstance: any = {
            instanceId: 'i_baloo',
            name: 'Baloo',
            fullName: 'Baloo',
            type: 'Character', // This should disqualify it
            cost: 1,
            zone: 'hand',
            ownerId: opponent.id
        };

        opponent.hand.push(dingleInstance, balooInstance);

        // Mock choice request to inspect options
        let capturedOptions: any[] = [];
        harness.turnManager.requestChoice = async (req: any) => {
            capturedOptions = req.options;
            // Select valid option to continue execution if needed, or just return empty
            return {
                requestId: req.id,
                playerId: req.playerId,
                selectedIds: [req.options[0].id],
                timestamp: Date.now()
            };
        };

        // Execute the card
        // We need to properly trigger the effect. 
        // Using `resolveAction` with PlayCard action is the most integration-test-like way
        // But we can also execute the handler directly like in the previous test.
        // Let's use the handler invocation for speed/precision as we know it worked before.

        const effects = bareNecessities.parsedEffects || [];
        const mainAbility = effects.find((e: any) => e.type === 'triggered');
        if (!mainAbility) throw new Error('Main ability not found');
        const parsedEffect = mainAbility.effects[0];

        // @ts-ignore
        const interactionHandler = harness.turnManager.abilitySystem.executor.familyHandlers.get('opponent_interaction');

        // @ts-ignore
        await interactionHandler.execute(parsedEffect, {
            player: player1,
            card: bareNecessities
        });

        // Debug output
        console.log('Captured Options:', capturedOptions.map(o => `${o.card?.name} (${o.card?.type})`));

        // Assertions
        const balooOption = capturedOptions.find(o => o.id === 'i_baloo');
        const dingleOption = capturedOptions.find(o => o.id === 'i_dingle');

        expect(dingleOption).toBeDefined();
        expect(dingleOption.valid).toBe(true);

        // BUG FIX VERIFIED: Baloo IS present in options, but correctly marked as invalid
        // The UI should show both options, but only allow selecting valid ones
        expect(balooOption).toBeDefined();
        expect(balooOption.valid).toBe(false);
        expect(balooOption.invalidReason).toBe('Cannot select Character');
    });
});
