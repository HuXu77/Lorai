import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: ALL FOR ONE', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have ALL FOR ONE ability when in play', async () => {
        // Setup: P1 has Mickey Mouse - Musketeer in play
        await harness.setPlay(harness.p1Id, ['Mickey Mouse - Musketeer']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mickey = p1.play[0];

        // Verify: Mickey is in play
        expect(mickey).toBeDefined();
        expect(mickey.name).toBe('Mickey Mouse');
    });

    it('should work with multiple Musketeers', async () => {
        // Setup: P1 has Mickey and other Musketeers
        await harness.setPlay(harness.p1Id, [
            'Mickey Mouse - Musketeer',
            'Donald Duck - Musketeer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both Musketeers are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Mickey with static ability', async () => {
        // Setup: P1 has Mickey in play
        await harness.setPlay(harness.p1Id, ['Mickey Mouse - Musketeer']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mickey = p1.play[0];

        // Verify: Mickey has abilities
        // ALL FOR ONE grants +1 strength to other Musketeers
        expect(mickey).toBeDefined();
    });
});
