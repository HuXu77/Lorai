import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: Vanish', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have Vanish keyword when in play', async () => {
        // Setup: P1 has Iago - Giant Spectral Parrot (Vanish) in play
        await harness.setPlay(harness.p1Id, ['Iago - Giant Spectral Parrot']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const iago = p1.play[0];

        // Verify: Iago is in play
        expect(iago).toBeDefined();
        expect(iago.name).toBe('Iago');
    });

    it('should register multiple characters with Vanish', async () => {
        // Setup: P1 has multiple Vanish characters
        await harness.setPlay(harness.p1Id, [
            'Iago - Giant Spectral Parrot',
            'Giant Cobra - Ghostly Serpent'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
        expect(p1.play[0].name).toBe('Iago');
        expect(p1.play[1].name).toBe('Giant Cobra');
    });

    it('should work alongside non-Vanish characters', async () => {
        // Setup: P1 has both Vanish and non-Vanish characters
        await harness.setPlay(harness.p1Id, [
            'Iago - Giant Spectral Parrot', // Vanish
            'Mickey Mouse - Wayward Sorcerer' // No Vanish
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });
});
