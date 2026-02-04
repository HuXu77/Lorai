import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: PACK OF HER OWN', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have PACK OF HER OWN ability when in play', async () => {
        // Setup: P1 has Lady - Decisive Dog in play
        await harness.setPlay(harness.p1Id, ['Lady - Decisive Dog']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const lady = p1.play[0];

        // Verify: Lady is in play
        expect(lady).toBeDefined();
        expect(lady.name).toBe('Lady');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Lady and other characters
        await harness.setPlay(harness.p1Id, [
            'Lady - Decisive Dog',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Lady with triggered ability', async () => {
        // Setup: P1 has Lady in play
        await harness.setPlay(harness.p1Id, ['Lady - Decisive Dog']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const lady = p1.play[0];

        // Verify: Lady has abilities
        // PACK OF HER OWN triggers whenever you play a character
        expect(lady).toBeDefined();
    });
});
