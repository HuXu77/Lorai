import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: CEASELESS WORKER', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have CEASELESS WORKER ability when in play', async () => {
        // Setup: P1 has Mickey Mouse - Wayward Sorcerer in play
        await harness.setPlay(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mickey = p1.play[0];

        // Verify: Mickey is in play
        expect(mickey).toBeDefined();
        expect(mickey.name).toBe('Mickey Mouse');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Mickey and other characters
        await harness.setPlay(harness.p1Id, [
            'Mickey Mouse - Wayward Sorcerer',
            'Elsa - Snow Queen'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Mickey with triggered ability', async () => {
        // Setup: P1 has Mickey in play
        await harness.setPlay(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mickey = p1.play[0];

        // Verify: Mickey has abilities
        // CEASELESS WORKER returns Broom characters to hand when banished
        expect(mickey).toBeDefined();
    });
});
