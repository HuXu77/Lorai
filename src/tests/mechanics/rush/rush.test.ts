import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Mechanic: Rush', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    // TODO: Engine doesn't currently implement Rush mechanic for challenges
    // Rush should allow characters to challenge the turn they're played
    // This test is skipped until the engine implements Rush
    it.skip('should allow Rush character to challenge immediately when played', async () => {
        // Setup: P2 has exerted character to challenge
        await harness.setPlay(harness.p2Id, [
            { name: 'HeiHei - Boat Snack', ready: false } // 1/2, exerted target
        ]);

        // P1 has Rush character played this turn
        await harness.setPlay(harness.p1Id, [
            { name: 'Flotsam - Ursula\'s Spy', ready: true, turnPlayed: harness.game.state.turnCount } // 2/3 Rush, just played
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        const flotsam = p1.play.find(c => c.name === 'Flotsam - Ursula\'s Spy')!;
        const heihei = p2.play.find(c => c.name === 'HeiHei - Boat Snack')!;

        // Verify Flotsam has Rush
        expect(flotsam.baseKeywords).toContain('Rush');

        // Flotsam should be able to challenge immediately despite being played this turn
        const canChallenge = harness.turnManager.canChallenge(flotsam, heihei);
        expect(canChallenge).toBe(true);
    });

    it('should verify Rush keyword is present on Rush characters', async () => {
        // Setup: Rush character
        await harness.setPlay(harness.p1Id, [
            { name: 'Flotsam - Ursula\'s Spy', ready: true } // Rush
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const flotsam = p1.play.find(c => c.name === 'Flotsam - Ursula\'s Spy')!;

        // Verify Flotsam has Rush keyword
        expect(flotsam.baseKeywords).toContain('Rush');
    });
});
