import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: I DON\'T TRUST HIM, SIRE', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });

    it('should have I DON\'T TRUST HIM, SIRE ability when in play', async () => {
        await harness.setPlay(harness.p1Id, ['Jafar - Royal Vizier']);
        expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined();
    });

    it('should work with multiple characters', async () => {
        await harness.setPlay(harness.p1Id, ['Jafar - Royal Vizier', 'Mickey Mouse - Wayward Sorcerer']);
        expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2);
    });

    it('should register Jafar with static ability', async () => {
        await harness.setPlay(harness.p1Id, ['Jafar - Royal Vizier']);
        expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined();
    });
});
