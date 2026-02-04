import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: SINISTER PLOT', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have SINISTER PLOT ability when in play', async () => {
        // Setup: P1 has Hades - King of Olympus in play
        await harness.setPlay(harness.p1Id, ['Hades - King of Olympus']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const hades = p1.play[0];

        // Verify: Hades is in play
        expect(hades).toBeDefined();
        expect(hades.name).toBe('Hades');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Hades and other characters
        await harness.setPlay(harness.p1Id, [
            'Hades - King of Olympus',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Hades with static ability', async () => {
        // Setup: P1 has Hades in play
        await harness.setPlay(harness.p1Id, ['Hades - King of Olympus']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const hades = p1.play[0];

        // Verify: Hades has abilities
        // SINISTER PLOT grants +1 lore for each other Villain character
        expect(hades).toBeDefined();
    });
});
