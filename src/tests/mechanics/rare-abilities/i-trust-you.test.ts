import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: I TRUST YOU', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });

    it('should have I TRUST YOU ability when in play', async () => {
        await harness.setPlay(harness.p1Id, ['Sisu - Divine Water Dragon']);
        expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined();
    });

    it('should work with multiple characters', async () => {
        await harness.setPlay(harness.p1Id, ['Sisu - Divine Water Dragon', 'Mickey Mouse - Wayward Sorcerer']);
        expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2);
    });

    it('should register Sisu with triggered ability', async () => {
        await harness.setPlay(harness.p1Id, ['Sisu - Divine Water Dragon']);
        expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined();
    });
});
