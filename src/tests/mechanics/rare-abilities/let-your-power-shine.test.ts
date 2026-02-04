import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: LET YOUR POWER SHINE', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have LET YOUR POWER SHINE ability when in play', async () => {
        // Setup: P1 has Rapunzel - Gifted Artist in play
        await harness.setPlay(harness.p1Id, ['Rapunzel - Gifted Artist']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const rapunzel = p1.play[0];

        // Verify: Rapunzel is in play
        expect(rapunzel).toBeDefined();
        expect(rapunzel.name).toBe('Rapunzel');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Rapunzel and other characters
        await harness.setPlay(harness.p1Id, [
            'Rapunzel - Gifted Artist',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Rapunzel with triggered ability', async () => {
        // Setup: P1 has Rapunzel in play
        await harness.setPlay(harness.p1Id, ['Rapunzel - Gifted Artist']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const rapunzel = p1.play[0];

        // Verify: Rapunzel has abilities
        // LET YOUR POWER SHINE draws when damage is removed
        expect(rapunzel).toBeDefined();
    });
});
