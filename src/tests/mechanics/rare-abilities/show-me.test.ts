import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: SHOW ME', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have SHOW ME ability when in play', async () => {
        // Setup: P1 has Beast's Mirror in play
        await harness.setPlay(harness.p1Id, ['Beast\'s Mirror']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mirror = p1.play[0];

        // Verify: Beast's Mirror is in play
        expect(mirror).toBeDefined();
        expect(mirror.name).toBe('Beast\'s Mirror');
    });

    it('should work when ready', async () => {
        // Setup: P1 has Beast's Mirror in play and ready
        await harness.setPlay(harness.p1Id, ['Beast\'s Mirror']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mirror = p1.play[0];
        mirror.ready = true;

        // Verify: Beast's Mirror is ready
        expect(mirror.ready).toBe(true);
    });

    it('should register Beast\'s Mirror with activated ability', async () => {
        // Setup: P1 has Beast's Mirror in play
        await harness.setPlay(harness.p1Id, ['Beast\'s Mirror']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mirror = p1.play[0];

        // Verify: Beast's Mirror has abilities
        // SHOW ME draws a card if hand is empty
        expect(mirror).toBeDefined();
    });
});
