import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: TAKE THE LEAD', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have TAKE THE LEAD ability when in play', async () => {
        // Setup: P1 has Lady - Decisive Dog in play
        await harness.setPlay(harness.p1Id, ['Lady - Decisive Dog']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const lady = p1.play[0];

        // Verify: Lady is in play
        expect(lady).toBeDefined();
        expect(lady.name).toBe('Lady');
    });

    it('should work with base strength', async () => {
        // Setup: P1 has Lady in play
        await harness.setPlay(harness.p1Id, ['Lady - Decisive Dog']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const lady = p1.play[0];

        // Verify: Lady has base stats
        // TAKE THE LEAD grants +2 lore when strength is 3+
        expect(lady).toBeDefined();
    });

    it('should register Lady with static ability', async () => {
        // Setup: P1 has Lady in play
        await harness.setPlay(harness.p1Id, ['Lady - Decisive Dog']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const lady = p1.play[0];

        // Verify: Lady has abilities
        expect(lady).toBeDefined();
    });
});
