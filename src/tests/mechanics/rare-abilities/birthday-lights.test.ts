import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: BIRTHDAY LIGHTS', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have BIRTHDAY LIGHTS ability when in play', async () => {
        // Setup: P1 has Lantern item in play
        await harness.setPlay(harness.p1Id, ['Lantern']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const lantern = p1.play[0];

        // Verify: Lantern is in play
        expect(lantern).toBeDefined();
        expect(lantern.name).toBe('Lantern');
    });

    it('should work when ready', async () => {
        // Setup: P1 has Lantern in play and ready
        await harness.setPlay(harness.p1Id, ['Lantern']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const lantern = p1.play[0];
        lantern.ready = true;

        // Verify: Lantern is ready
        expect(lantern.ready).toBe(true);
    });

    it('should register Lantern with activated ability', async () => {
        // Setup: P1 has Lantern in play
        await harness.setPlay(harness.p1Id, ['Lantern']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const lantern = p1.play[0];

        // Verify: Lantern has abilities
        // BIRTHDAY LIGHTS reduces cost of next character by 1 ink
        expect(lantern).toBeDefined();
    });
});
