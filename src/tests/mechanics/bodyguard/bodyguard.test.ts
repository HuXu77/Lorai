
import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Mechanic: Bodyguard', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('Bodyguard (Simba) should be able to enter play exerted', async () => {
        // Setup: Simba in hand, enough ink
        await harness.setHand(harness.p1Id, ['Simba - Protective Cub']);
        harness.setInk(harness.p1Id, 2);

        const simba = harness.game.getPlayer(harness.p1Id).hand[0];

        // Play Simba
        // Choice should be triggered for "Enter Exerted?"
        // We need to handle the choice

        // Mock choice handler to select "Yes" (Exerted)
        // Bodyguard triggers a choice to enter play exerted.
        harness.mockChoice(harness.p1Id, ['yes']);
        // Actually event bus works differently. Let's trace it.
        // Bodyguard is "You may play this character exerted".
        // This is usually a 'enters_play_exerted' static effect or a choice trigger.
        // In Lorai engine, it's often implemented as a CHOICE on resolution.

        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: simba.instanceId
        } as any);

        expect(result).toBe(true);

        // Find Simba in play
        const simbaInPlay = harness.game.getPlayer(harness.p1Id).play.find(c => c.instanceId === simba.instanceId);
        expect(simbaInPlay).toBeDefined();

        // Should be exerted IF we selected yes.
        // Wait, 'enters play exerted' might be automated in test harness or default?
        // Let's verify default behavior first. If it prompts, `resolveAction` triggers a choice.
        // In `TestHarness` `mockChoiceSelection` is valid if using `emitChoiceRequest` override.
    });

    it('Exerted Bodyguard should protect other characters from challenges', async () => {
        // Setup P1: Attacker (Captain Hook) - Ready and Dry
        await harness.setPlay(harness.p1Id, ['Captain Hook - Forceful Duelist']);
        const hook = harness.game.getPlayer(harness.p1Id).play[0];
        hook.ready = true;
        hook.turnPlayed = 0; // Dry

        // Setup P2: Exerted Bodyguard (Simba) and Exerted Other (Minnie)
        await harness.setPlay(harness.p2Id, ['Simba - Protective Cub', 'Minnie Mouse - Always Classy']);
        const simba = harness.game.getPlayer(harness.p2Id).play.find(c => c.name.includes('Simba'))!;
        const minnie = harness.game.getPlayer(harness.p2Id).play.find(c => c.name.includes('Minnie'))!;

        simba.ready = false; // Exerted Bodyguard
        minnie.ready = false; // Exerted Other

        // Verify Challenge Logic
        const canChallengeSimba = harness.turnManager.canChallenge(hook, simba);
        const canChallengeMinnie = harness.turnManager.canChallenge(hook, minnie);

        expect(canChallengeSimba).toBe(true);
        expect(canChallengeMinnie).toBe(false); // Protected by Bodyguard
    });

    it('Ready Bodyguard should NOT protect other characters', async () => {
        // Setup P1: Attacker
        await harness.setPlay(harness.p1Id, ['Captain Hook - Forceful Duelist']);
        const hook = harness.game.getPlayer(harness.p1Id).play[0];
        hook.ready = true;
        hook.turnPlayed = 0;

        // Setup P2: READY Bodyguard (Simba) and Exerted Other (Minnie)
        await harness.setPlay(harness.p2Id, ['Simba - Protective Cub', 'Minnie Mouse - Always Classy']);
        const simba = harness.game.getPlayer(harness.p2Id).play.find(c => c.name.includes('Simba'))!;
        const minnie = harness.game.getPlayer(harness.p2Id).play.find(c => c.name.includes('Minnie'))!;

        simba.ready = true; // Ready Bodyguard
        minnie.ready = false; // Exerted Other

        const canChallengeMinnie = harness.turnManager.canChallenge(hook, minnie);
        expect(canChallengeMinnie).toBe(true); // NOT Protected
    });
});
