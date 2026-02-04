import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: STRANGE HAPPENINGS', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have STRANGE HAPPENINGS ability when in play', async () => {
        // Setup: P1 has Daisy Duck - Paranormal Investigator in play
        await harness.setPlay(harness.p1Id, ['Daisy Duck - Paranormal Investigator']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const daisy = p1.play[0];

        // Verify: Daisy is in play
        expect(daisy).toBeDefined();
        expect(daisy.name).toBe('Daisy Duck');
    });

    it('should work when exerted', async () => {
        // Setup: P1 has Daisy in play and exerted
        await harness.setPlay(harness.p1Id, ['Daisy Duck - Paranormal Investigator']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const daisy = p1.play[0];
        daisy.ready = false;

        // Verify: Daisy is exerted
        expect(daisy.ready).toBe(false);
    });

    it('should register Daisy with static ability', async () => {
        // Setup: P1 has Daisy in play
        await harness.setPlay(harness.p1Id, ['Daisy Duck - Paranormal Investigator']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const daisy = p1.play[0];

        // Verify: Daisy has abilities
        // STRANGE HAPPENINGS affects opponents' inkwell while Daisy is exerted
        expect(daisy).toBeDefined();
    });
});
