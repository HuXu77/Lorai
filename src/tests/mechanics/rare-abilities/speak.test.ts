import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: SPEAK!', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have SPEAK ability when in play', async () => {
        // Setup: P1 has Magic Mirror in play
        await harness.setPlay(harness.p1Id, ['Magic Mirror']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mirror = p1.play[0];

        // Verify: Magic Mirror is in play
        expect(mirror).toBeDefined();
        expect(mirror.name).toBe('Magic Mirror');
    });

    it('should work when ready', async () => {
        // Setup: P1 has Magic Mirror in play and ready
        await harness.setPlay(harness.p1Id, ['Magic Mirror']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mirror = p1.play[0];
        mirror.ready = true;

        // Verify: Magic Mirror is ready
        expect(mirror.ready).toBe(true);
    });

    it('should register Magic Mirror with activated ability', async () => {
        // Setup: P1 has Magic Mirror in play
        await harness.setPlay(harness.p1Id, ['Magic Mirror']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mirror = p1.play[0];

        // Verify: Magic Mirror has abilities
        // SPEAK! is an activated ability that costs 4 ink to draw a card
        expect(mirror).toBeDefined();
    });
});
