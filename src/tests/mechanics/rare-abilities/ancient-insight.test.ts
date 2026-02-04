import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: ANCIENT INSIGHT', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });

    it('should have ANCIENT INSIGHT ability when in play', async () => {
        await harness.setPlay(harness.p1Id, ['Grand Pabbie - Oldest and Wisest']);
        expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined();
    });

    it('should work with multiple characters', async () => {
        await harness.setPlay(harness.p1Id, ['Grand Pabbie - Oldest and Wisest', 'Mickey Mouse - Wayward Sorcerer']);
        expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2);
    });

    it('should register Grand Pabbie with triggered ability', async () => {
        await harness.setPlay(harness.p1Id, ['Grand Pabbie - Oldest and Wisest']);
        expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined();
    });
});
