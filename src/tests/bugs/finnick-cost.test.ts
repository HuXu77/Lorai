import { TestHarness } from '../engine-test-utils';
import { ZoneType } from '../../engine/models';

describe('Bug Reproduction: Finnick - Tiny Terror Cost', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should NOT allow paying for ability if insufficient ink available', async () => {
        // Setup: Player 1 has 1 ink left (insufficient for 2 cost ability)
        // Finnick costs 1.

        await harness.setInk(harness.p1Id, 1);
        await harness.setInk(harness.p2Id, 2);

        // Add Finnick to hand
        const finnick = harness.createCard(harness.p1Id, {
            name: 'Finnick - Tiny Terror',
            type: 'Character',
            cost: 1,
            abilities: [
                {
                    type: 'triggered',
                    name: 'YOU BETTER RUN',
                    fullText: 'When you play this character, you may pay 2 Ink to return chosen opposing character with 2 Strength or less to their player\'s hand.',
                    effect: 'When you play this character, you may pay 2 Ink to return chosen opposing character with 2 Strength or less to their player\'s hand.',
                    rawText: 'When you play this character, you may pay 2 Ink to return chosen opposing character with 2 Strength or less to their player\'s hand.',
                    // Crucially, does the current parser add 'cost' field? 
                    // The bug report implies it triggers, so we should test with the card definition likely used.
                    // I will trust the loader to parse it if I use real name, OR manually define it as current parser does.
                    // The harness.createCard calls parseToAbilityDefinition if I don't provide parsedEffects.
                    // But I want to use the REAL card from the loader if possible to match reality.
                    // Harness.setHand handles strings.
                }
            ]
        } as any);

        // BETTER: Use real card loader
        await harness.setHand(harness.p1Id, ['Finnick - Tiny Terror']);
        const finnickCard = harness.getPlayer(harness.p1Id).hand[0];

        // Add opponent target
        await harness.setPlay(harness.p2Id, ['Mickey Mouse - Detective']);

        // Play Finnick
        // 2 Ink start. Cost 1.
        // Remaining Ink: 1.
        // Ability Cost: 2.
        // Should NOT prompt for target/payment.

        await harness.playCard(harness.getPlayer(harness.p1Id), finnickCard);

        // Assertions
        const pendingChoice = (harness.turnManager.game.state as any).pendingChoice;

        // Expect NO pending choice because we can't pay.
        // If bug exists, pendingChoice will be defined.
        expect(pendingChoice).toBeUndefined();
    });

    it('should prompt for payment if sufficient ink matches cost', async () => {
        // Control: 2 Ink start. Cost 1 (ignored in harness). Remaining 2. Ability Cost 2. OK.
        await harness.setInk(harness.p1Id, 2);
        await harness.setInk(harness.p2Id, 2);

        await harness.setHand(harness.p1Id, ['Finnick - Tiny Terror']);
        const finnickCard = harness.getPlayer(harness.p1Id).hand[0];

        await harness.setPlay(harness.p2Id, ['Mickey Mouse - Detective']);

        await harness.playCard(harness.getPlayer(harness.p1Id), finnickCard);

        const pendingChoice = (harness.turnManager.game.state as any).pendingChoice;
        expect(pendingChoice).toBeDefined();
    });
});
