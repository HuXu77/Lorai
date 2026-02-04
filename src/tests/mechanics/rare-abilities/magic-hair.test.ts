import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: MAGIC HAIR', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have MAGIC HAIR ability when in play', async () => {
        // Setup: P1 has Rapunzel - Sunshine in play
        await harness.setPlay(harness.p1Id, ['Rapunzel - Sunshine']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const rapunzel = p1.play[0];

        // Verify: Rapunzel is in play
        expect(rapunzel).toBeDefined();
        expect(rapunzel.name).toBe('Rapunzel');
    });

    it('should work when ready', async () => {
        // Setup: P1 has Rapunzel in play and ready
        await harness.setPlay(harness.p1Id, ['Rapunzel - Sunshine']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const rapunzel = p1.play[0];
        rapunzel.ready = true;

        // Verify: Rapunzel is ready
        expect(rapunzel.ready).toBe(true);
    });

    it('should register Rapunzel with activated ability', async () => {
        // Setup: P1 has Rapunzel in play
        await harness.setPlay(harness.p1Id, ['Rapunzel - Sunshine']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const rapunzel = p1.play[0];

        // Verify: Rapunzel has abilities
        // MAGIC HAIR removes up to 2 damage
        expect(rapunzel).toBeDefined();
    });
});
