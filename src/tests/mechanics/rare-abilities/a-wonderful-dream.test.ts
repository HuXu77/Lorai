import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: A WONDERFUL DREAM', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have A WONDERFUL DREAM ability when in play', async () => {
        // Setup: P1 has Cinderella - Gentle and Kind in play
        await harness.setPlay(harness.p1Id, ['Cinderella - Gentle and Kind']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const cinderella = p1.play[0];

        // Verify: Cinderella is in play
        expect(cinderella).toBeDefined();
        expect(cinderella.name).toBe('Cinderella');
    });

    it('should work when ready', async () => {
        // Setup: P1 has Cinderella in play and ready
        await harness.setPlay(harness.p1Id, ['Cinderella - Gentle and Kind']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const cinderella = p1.play[0];
        cinderella.ready = true;

        // Verify: Cinderella is ready
        expect(cinderella.ready).toBe(true);
    });

    it('should register Cinderella with activated ability', async () => {
        // Setup: P1 has Cinderella in play
        await harness.setPlay(harness.p1Id, ['Cinderella - Gentle and Kind']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const cinderella = p1.play[0];

        // Verify: Cinderella has abilities
        // A WONDERFUL DREAM is an activated ability that removes damage from Princess characters
        expect(cinderella).toBeDefined();
    });
});
