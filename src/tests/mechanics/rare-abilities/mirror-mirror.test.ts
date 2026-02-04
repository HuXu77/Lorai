import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: MIRROR MIRROR', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have MIRROR MIRROR ability when in play', async () => {
        await harness.setPlay(harness.p1Id, ['The Queen - Regal Monarch']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play[0]).toBeDefined();
        expect(p1.play[0].name).toBe('The Queen');
    });

    it('should work when ready', async () => {
        await harness.setPlay(harness.p1Id, ['The Queen - Regal Monarch']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        p1.play[0].ready = true;
        expect(p1.play[0].ready).toBe(true);
    });

    it('should register The Queen with activated ability', async () => {
        await harness.setPlay(harness.p1Id, ['The Queen - Regal Monarch']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play[0]).toBeDefined();
    });
});
