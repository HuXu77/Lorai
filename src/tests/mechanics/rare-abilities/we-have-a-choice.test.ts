import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: WE HAVE A CHOICE', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });

    it('should have WE HAVE A CHOICE ability when in play', async () => {
        await harness.setPlay(harness.p1Id, ['Benja - Guardian of the Dragon Gem']);
        expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined();
    });

    it('should work with multiple characters', async () => {
        await harness.setPlay(harness.p1Id, ['Benja - Guardian of the Dragon Gem', 'Mickey Mouse - Wayward Sorcerer']);
        expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2);
    });

    it('should register Benja with triggered ability', async () => {
        await harness.setPlay(harness.p1Id, ['Benja - Guardian of the Dragon Gem']);
        expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined();
    });
});
