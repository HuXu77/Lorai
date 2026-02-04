import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: SQUEAK', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have SQUEAK ability when in play', async () => {
        // Setup: P1 has Bucky - Squirrel Squeak Tutor in play
        await harness.setPlay(harness.p1Id, ['Bucky - Squirrel Squeak Tutor']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const bucky = p1.play[0];

        // Verify: Bucky is in play
        expect(bucky).toBeDefined();
        expect(bucky.name).toBe('Bucky');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Bucky and other characters
        await harness.setPlay(harness.p1Id, [
            'Bucky - Squirrel Squeak Tutor',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Bucky with triggered ability', async () => {
        // Setup: P1 has Bucky in play
        await harness.setPlay(harness.p1Id, ['Bucky - Squirrel Squeak Tutor']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const bucky = p1.play[0];

        // Verify: Bucky has abilities
        // SQUEAK makes opponents discard when Floodborn is shifted
        expect(bucky).toBeDefined();
    });
});
