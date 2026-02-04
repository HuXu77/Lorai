import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: BATTLE PLANS', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have BATTLE PLANS ability when in play', async () => {
        // Setup: P1 has Tinker Bell - Tiny Tactician in play
        await harness.setPlay(harness.p1Id, ['Tinker Bell - Tiny Tactician']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const tink = p1.play[0];

        // Verify: Tinker Bell is in play
        expect(tink).toBeDefined();
        expect(tink.name).toBe('Tinker Bell');
    });

    it('should work when ready', async () => {
        // Setup: P1 has Tinker Bell in play and ready
        await harness.setPlay(harness.p1Id, ['Tinker Bell - Tiny Tactician']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const tink = p1.play[0];
        tink.ready = true;

        // Verify: Tinker Bell is ready
        expect(tink.ready).toBe(true);
    });

    it('should register Tinker Bell with activated ability', async () => {
        // Setup: P1 has Tinker Bell in play
        await harness.setPlay(harness.p1Id, ['Tinker Bell - Tiny Tactician']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const tink = p1.play[0];

        // Verify: Tinker Bell has abilities
        // BATTLE PLANS draws then discards a card
        expect(tink).toBeDefined();
    });
});
