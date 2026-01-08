
import { TestHarness } from '../engine-test-utils';
import { CardLoader } from '../../engine/card-loader';
import { AbilityType } from '../../engine/models';

describe('The Bare Necessities Real Parsing', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initGame(['The Bare Necessities'], ['Dinglehopper']);
    });

    it('should be parsed correctly', async () => {
        const cardLoader = new CardLoader();
        // The Bare Necessities is in set 3? The grep showed set 3. 
        // We can just find it by name if the loader supports it, or use the harness to get the instance which has the definition.

        const player1 = harness.getPlayer(harness.p1Id);
        const bareNecessities = player1.hand.find(c => c.name === 'The Bare Necessities');

        if (!bareNecessities) {
            throw new Error('Card not found in hand');
        }

        console.log(JSON.stringify(bareNecessities.parsedEffects, null, 2));

        const effects = bareNecessities.parsedEffects || [];
        expect(effects.length).toBeGreaterThan(0);

        // It's an action, so likely part of the main effects, but it could be parsed as an ability if it has a cost/condition 
        // (but it's an Action card, so effects are usually direct).
        // Wait, Action cards have "effects" in their definition if specifically parsed, 
        // or they might be in a "resolution" block. 
        // Let's check how the engine stores them.
        // Usually `parsedEffects` on the definition.

        // Now verify execution logic
        // We will simulate playing the card and checking the choice request
        // @ts-ignore - Accessing private for testing
        const interactionHandler = harness.turnManager.abilitySystem.executor.familyHandlers.get('opponent_interaction');

        // Mock opponent hand
        const opponent = harness.getPlayer(harness.p2Id);

        // Add a mix of cards to opponent hand
        // We need cards with types. We can trust the harness or manually define them if needed.
        // Dinglehopper is Item (Non-character) - Should be valid
        // Stitch is Character - Should be invalid

        // Let's ensure we have these cards
        // Clearing hand and adding specific test instances
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

        const stitchInstance: any = {
            instanceId: 'i_stitch',
            name: 'Stitch',
            fullName: 'Stitch',
            type: 'Character',
            cost: 1,
            zone: 'hand',
            ownerId: opponent.id
        };

        opponent.hand.push(dingleInstance, stitchInstance);

        // Mock turnManager.requestChoice
        let capturedRequest: any = undefined;
        harness.turnManager.requestChoice = async (req: any) => {
            capturedRequest = req;
            return {
                requestId: req.id,
                playerId: req.playerId,
                selectedIds: [req.options[0].id],
                timestamp: Date.now()
            };
        };

        // Manually execute the effect handler
        // properties.effects is an array of CardEffect, parsedEffects is array of AbilityDefinition (which has effects array)
        // effects[0] is the Activated Ability. properties.effects of that ability is what we want?
        // Wait, parseToAbilityDefinition returns an array of Abilitydefinitions.
        // index 0 is sing, index 1 is the triggered effect?
        // Let's inspect the console log output again.
        // [0] type: activated (Sing)
        // [1] type: triggered (The effect)

        const mainAbility = effects.find((e: any) => e.type === 'triggered');
        if (!mainAbility) throw new Error('Main ability not found');
        const parsedEffect = mainAbility.effects[0]; // The opponent_play_reveal_and_discard effect

        // @ts-ignore
        interactionHandler.execute(parsedEffect, {
            player: player1,
            card: bareNecessities
        }).then(() => {
            // Assertions inside or after
        });

        // Wait a tick for async execution
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(capturedRequest).toBeDefined();
        if (capturedRequest) {
            console.log('Captured Options:', capturedRequest.options);

            const dingleOption = capturedRequest.options.find((o: any) => o.id === 'i_dingle');
            const stitchOption = capturedRequest.options.find((o: any) => o.id === 'i_stitch');

            expect(dingleOption).toBeDefined();
            expect(stitchOption).toBeUndefined(); // Should be filtered out!
        }
    }); // Close test
}); // Close describe
