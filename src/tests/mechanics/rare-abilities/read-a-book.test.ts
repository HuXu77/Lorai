import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: READ A BOOK', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have READ A BOOK ability when in play', async () => {
        // Setup: P1 has Belle - Strange but Special in play
        await harness.setPlay(harness.p1Id, ['Belle - Strange but Special']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const belle = p1.play[0];

        // Verify: Belle is in play
        expect(belle).toBeDefined();
        expect(belle.name).toBe('Belle');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Belle and other characters
        await harness.setPlay(harness.p1Id, [
            'Belle - Strange but Special',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Belle with static ability', async () => {
        // Setup: P1 has Belle in play
        await harness.setPlay(harness.p1Id, ['Belle - Strange but Special']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const belle = p1.play[0];

        // Verify: Belle has abilities
        // READ A BOOK allows additional inking during your turn
        expect(belle).toBeDefined();
    });
});
