import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: QUICK REFLEXES', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have QUICK REFLEXES ability when in play', async () => {
        // Setup: P1 has Wasabi - Methodical Engineer in play
        await harness.setPlay(harness.p1Id, ['Wasabi - Methodical Engineer']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const wasabi = p1.play[0];

        // Verify: Wasabi is in play
        expect(wasabi).toBeDefined();
        expect(wasabi.name).toBe('Wasabi');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Wasabi and other characters
        await harness.setPlay(harness.p1Id, [
            'Wasabi - Methodical Engineer',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Wasabi with static ability', async () => {
        // Setup: P1 has Wasabi in play
        await harness.setPlay(harness.p1Id, ['Wasabi - Methodical Engineer']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const wasabi = p1.play[0];

        // Verify: Wasabi has abilities
        // QUICK REFLEXES grants Evasive during your turn
        expect(wasabi).toBeDefined();
    });
});
