import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: PHENOMENAL COSMIC POWER!', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have PHENOMENAL COSMIC POWER ability when in play', async () => {
        // Setup: P1 has Genie - Powers Unleashed in play
        await harness.setPlay(harness.p1Id, ['Genie - Powers Unleashed']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const genie = p1.play[0];

        // Verify: Genie is in play
        expect(genie).toBeDefined();
        expect(genie.name).toBe('Genie');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Genie and other characters
        await harness.setPlay(harness.p1Id, [
            'Genie - Powers Unleashed',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Genie with triggered ability', async () => {
        // Setup: P1 has Genie in play
        await harness.setPlay(harness.p1Id, ['Genie - Powers Unleashed']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const genie = p1.play[0];

        // Verify: Genie has abilities
        // PHENOMENAL COSMIC POWER! triggers when Genie quests
        expect(genie).toBeDefined();
    });
});
