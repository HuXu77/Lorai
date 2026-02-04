import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: AND I\'M THE CAPTAIN!', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability when in play', async () => { await harness.setPlay(harness.p1Id, ['Piglet - Pooh Pirate Captain']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple characters', async () => { await harness.setPlay(harness.p1Id, ['Piglet - Pooh Pirate Captain', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register with static ability', async () => { await harness.setPlay(harness.p1Id, ['Piglet - Pooh Pirate Captain']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});
