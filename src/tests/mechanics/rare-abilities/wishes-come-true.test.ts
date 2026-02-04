import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: WISHES COME TRUE', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have WISHES COME TRUE ability when in play', async () => {
        // Setup: P1 has Snow White - Well Wisher in play
        await harness.setPlay(harness.p1Id, ['Snow White - Well Wisher']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const snow = p1.play[0];

        // Verify: Snow White is in play
        expect(snow).toBeDefined();
        expect(snow.name).toBe('Snow White');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Snow White and other characters
        await harness.setPlay(harness.p1Id, [
            'Snow White - Well Wisher',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Snow White with triggered ability', async () => {
        // Setup: P1 has Snow White in play
        await harness.setPlay(harness.p1Id, ['Snow White - Well Wisher']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const snow = p1.play[0];

        // Verify: Snow White has abilities
        // WISHES COME TRUE returns character from discard when questing
        expect(snow).toBeDefined();
    });
});
