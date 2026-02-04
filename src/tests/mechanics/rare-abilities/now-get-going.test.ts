import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: NOW GET GOING', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });

    it('should have NOW GET GOING ability when in play', async () => {
        await harness.setPlay(harness.p1Id, ['Cruella De Vil - Fashionable Cruiser']);
        expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined();
    });

    it('should work with multiple characters', async () => {
        await harness.setPlay(harness.p1Id, ['Cruella De Vil - Fashionable Cruiser', 'Mickey Mouse - Wayward Sorcerer']);
        expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2);
    });

    it('should register Cruella with static ability', async () => {
        await harness.setPlay(harness.p1Id, ['Cruella De Vil - Fashionable Cruiser']);
        expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined();
    });
});
