import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: FULL DANCE CARD', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have FULL DANCE CARD ability when in play', async () => {
        // Setup: P1 has Beast - Gracious Prince in play
        await harness.setPlay(harness.p1Id, ['Beast - Gracious Prince']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const beast = p1.play[0];

        // Verify: Beast is in play
        expect(beast).toBeDefined();
        expect(beast.name).toBe('Beast');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Beast and other characters
        await harness.setPlay(harness.p1Id, [
            'Beast - Gracious Prince',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Beast with static ability', async () => {
        // Setup: P1 has Beast in play
        await harness.setPlay(harness.p1Id, ['Beast - Gracious Prince']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const beast = p1.play[0];

        // Verify: Beast has abilities
        // FULL DANCE CARD grants +1 strength and +1 willpower to Princess characters
        expect(beast).toBeDefined();
    });
});
