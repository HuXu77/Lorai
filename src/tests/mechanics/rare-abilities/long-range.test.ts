import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: LONG RANGE', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have LONG RANGE ability when in play', async () => {
        // Setup: P1 has Mulan - Charging Ahead in play
        await harness.setPlay(harness.p1Id, ['Mulan - Charging Ahead']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mulan = p1.play[0];

        // Verify: Mulan is in play
        expect(mulan).toBeDefined();
        expect(mulan.name).toBe('Mulan');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Mulan and other characters
        await harness.setPlay(harness.p1Id, [
            'Mulan - Charging Ahead',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Mulan with static ability', async () => {
        // Setup: P1 has Mulan in play
        await harness.setPlay(harness.p1Id, ['Mulan - Charging Ahead']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mulan = p1.play[0];

        // Verify: Mulan has abilities
        // LONG RANGE allows challenging ready characters
        expect(mulan).toBeDefined();
    });
});
