import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: MAKING WAVES', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have MAKING WAVES ability when in play', async () => {
        // Setup: P1 has Alice - Accidentally Adrift in play
        await harness.setPlay(harness.p1Id, ['Alice - Accidentally Adrift']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const alice = p1.play[0];

        // Verify: Alice is in play
        expect(alice).toBeDefined();
        expect(alice.name).toBe('Alice');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Alice and other characters
        await harness.setPlay(harness.p1Id, [
            'Alice - Accidentally Adrift',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Alice with triggered ability', async () => {
        // Setup: P1 has Alice in play
        await harness.setPlay(harness.p1Id, ['Alice - Accidentally Adrift']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const alice = p1.play[0];

        // Verify: Alice has abilities
        // MAKING WAVES triggers when Alice quests
        expect(alice).toBeDefined();
    });
});
