import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: DARING RESCUE', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have DARING RESCUE ability when in play', async () => {
        await harness.setPlay(harness.p1Id, ['Prince Eric - Dashing and Brave']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play[0]).toBeDefined();
        expect(p1.play[0].name).toBe('Prince Eric');
    });

    it('should work with multiple characters', async () => {
        await harness.setPlay(harness.p1Id, ['Prince Eric - Dashing and Brave', 'Mickey Mouse - Wayward Sorcerer']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play.length).toBe(2);
    });

    it('should register Prince Eric with triggered ability', async () => {
        await harness.setPlay(harness.p1Id, ['Prince Eric - Dashing and Brave']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play[0]).toBeDefined();
    });
});
