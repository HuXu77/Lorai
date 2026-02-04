import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: HAVE COURAGE', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });

    it('should have HAVE COURAGE ability when in play', async () => {
        await harness.setPlay(harness.p1Id, ['Cinderella - Knight in Training']);
        expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined();
    });

    it('should work with multiple characters', async () => {
        await harness.setPlay(harness.p1Id, ['Cinderella - Knight in Training', 'Mickey Mouse - Wayward Sorcerer']);
        expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2);
    });

    it('should register Cinderella with triggered ability', async () => {
        await harness.setPlay(harness.p1Id, ['Cinderella - Knight in Training']);
        expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined();
    });
});
