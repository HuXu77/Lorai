import { TestHarness } from '../engine-test-utils';

describe('Bodyguard Mechanic Reproduction', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initGame([], []);
    });

    it('should force challenges to target exerted Bodyguard characters', async () => {
        const player1 = harness.getPlayer(harness.p1Id);
        const player2 = harness.getPlayer(harness.p2Id);

        // Define cards
        const attackerDef = {
            name: 'Attacker',
            type: 'Character',
            cost: 1,
            strength: 3,
            willpower: 3,
            lore: 1
        };

        const bodyguardDef = {
            name: 'Baloo',
            type: 'Character',
            cost: 3,
            strength: 2,
            willpower: 4,
            lore: 1,
            parsedEffects: [{
                type: 'static',
                keyword: 'bodyguard',
                effects: [{ type: 'bodyguard' }]
            }],
            keywords: ['Bodyguard'], // Direct keyword assignment for test
            fullText: 'Bodyguard'
        };

        const otherCharDef = {
            name: 'Target Dummy',
            type: 'Character',
            cost: 2,
            strength: 2,
            willpower: 2,
            lore: 1
        };

        // Setup board state
        // P1 has attacker ready
        harness.setPlay(harness.p1Id, [attackerDef as any]);

        // P2 has exerted Bodyguard and exerted other character
        harness.setPlay(harness.p2Id, [bodyguardDef as any, otherCharDef as any]);

        const attacker = player1.play[0];
        const bodyguard = player2.play[0];
        const otherChar = player2.play[1];

        // Ensure everyone is dry (can challenge)
        attacker.turnPlayed = -1;
        bodyguard.turnPlayed = -1;
        otherChar.turnPlayed = -1;

        // Exert P2's characters
        bodyguard.ready = false;
        otherChar.ready = false;

        // Check canChallenge for Bodyguard (should be true)
        const canTargetBodyguard = harness.turnManager.canChallenge(attacker, bodyguard);
        expect(canTargetBodyguard).toBe(true);

        // Check canChallenge for non-Bodyguard (should be false)
        const canTargetOther = harness.turnManager.canChallenge(attacker, otherChar);
        expect(canTargetOther).toBe(false);

        // If we can't find the system, we can try to "Challenge" the wrong target and expect a throw or rejection.

        // However, `getValidChallengeTargets` is likely a utility function used by the UI/Engine.
        // Let's try to find it on the TurnManager or similar.

        // For now, let's assume valid targets are filtered during the action phase or we can check `canChallenge`.

        // Let's try to directly use the helper we are debugging if possible?
        // Wait, the user said "it said I had 2 available targets". This implies `getValidChallengeTargets` (or similar) is returning 2.

        // Let's try to find that specific function in the codebase first to call it in the test.
        // But since I'm writing the test now, I will use a placeholder check or try to perform the action.
    });
});
