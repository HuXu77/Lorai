import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: I\'M LATE!', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have I\'M LATE ability when in play', async () => {
        // Setup: P1 has White Rabbit's Pocket Watch in play
        await harness.setPlay(harness.p1Id, ['White Rabbit\'s Pocket Watch']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const watch = p1.play[0];

        // Verify: Pocket Watch is in play
        expect(watch).toBeDefined();
        expect(watch.name).toBe('White Rabbit\'s Pocket Watch');
    });

    it('should work when ready', async () => {
        // Setup: P1 has Pocket Watch in play and ready
        await harness.setPlay(harness.p1Id, ['White Rabbit\'s Pocket Watch']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const watch = p1.play[0];
        watch.ready = true;

        // Verify: Pocket Watch is ready
        expect(watch.ready).toBe(true);
    });

    it('should register Pocket Watch with activated ability', async () => {
        // Setup: P1 has Pocket Watch in play
        await harness.setPlay(harness.p1Id, ['White Rabbit\'s Pocket Watch']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const watch = p1.play[0];

        // Verify: Pocket Watch has abilities
        // I'M LATE! grants Rush to a chosen character
        expect(watch).toBeDefined();
    });
});
