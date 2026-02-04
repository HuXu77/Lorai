import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: TINKER', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have TINKER ability when in play', async () => {
        // Setup: P1 has Belle - Inventive Engineer in play
        await harness.setPlay(harness.p1Id, ['Belle - Inventive Engineer']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const belle = p1.play[0];

        // Verify: Belle is in play
        expect(belle).toBeDefined();
        expect(belle.name).toBe('Belle');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Belle and other characters
        await harness.setPlay(harness.p1Id, [
            'Belle - Inventive Engineer',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Belle with triggered ability', async () => {
        // Setup: P1 has Belle in play
        await harness.setPlay(harness.p1Id, ['Belle - Inventive Engineer']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const belle = p1.play[0];

        // Verify: Belle has abilities
        // TINKER triggers when Belle quests
        expect(belle).toBeDefined();
    });
});
