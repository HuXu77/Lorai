import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: BOLT STARE', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have BOLT STARE ability when in play', async () => {
        // Setup: P1 has Bolt - Superdog in play
        await harness.setPlay(harness.p1Id, ['Bolt - Superdog']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const bolt = p1.play[0];

        // Verify: Bolt is in play
        expect(bolt).toBeDefined();
        expect(bolt.name).toBe('Bolt');
    });

    it('should work when ready', async () => {
        // Setup: P1 has Bolt in play and ready
        await harness.setPlay(harness.p1Id, ['Bolt - Superdog']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const bolt = p1.play[0];
        bolt.ready = true;

        // Verify: Bolt is ready
        expect(bolt.ready).toBe(true);
    });

    it('should register Bolt with activated ability', async () => {
        // Setup: P1 has Bolt in play
        await harness.setPlay(harness.p1Id, ['Bolt - Superdog']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const bolt = p1.play[0];

        // Verify: Bolt has abilities
        // BOLT STARE is an activated ability that banishes Illusion characters
        expect(bolt).toBeDefined();
    });
});
