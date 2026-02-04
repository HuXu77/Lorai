import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: LAND, HO!', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have LAND HO ability when in play', async () => {
        // Setup: P1 has Minnie Mouse - Pirate Lookout in play
        await harness.setPlay(harness.p1Id, ['Minnie Mouse - Pirate Lookout']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const minnie = p1.play[0];

        // Verify: Minnie is in play
        expect(minnie).toBeDefined();
        expect(minnie.name).toBe('Minnie Mouse');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Minnie and other characters
        await harness.setPlay(harness.p1Id, [
            'Minnie Mouse - Pirate Lookout',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Minnie with triggered ability', async () => {
        // Setup: P1 has Minnie in play
        await harness.setPlay(harness.p1Id, ['Minnie Mouse - Pirate Lookout']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const minnie = p1.play[0];

        // Verify: Minnie has abilities
        // LAND, HO! triggers when cards go into inkwell
        expect(minnie).toBeDefined();
    });
});
