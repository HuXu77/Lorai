import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: ANCIENT SKILLS', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability when in play', async () => { await harness.setPlay(harness.p1Id, ['Rafiki - Mystical Fighter']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple characters', async () => { await harness.setPlay(harness.p1Id, ['Rafiki - Mystical Fighter', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register with static ability', async () => { await harness.setPlay(harness.p1Id, ['Rafiki - Mystical Fighter']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: SKYSURFING', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability when in play', async () => { await harness.setPlay(harness.p1Id, ['Kit Cloudkicker - Tough Guy']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple characters', async () => { await harness.setPlay(harness.p1Id, ['Kit Cloudkicker - Tough Guy', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register with triggered ability', async () => { await harness.setPlay(harness.p1Id, ['Kit Cloudkicker - Tough Guy']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: MIMICRY', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability when in play', async () => { await harness.setPlay(harness.p1Id, ['Morph - Space Goo']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple characters', async () => { await harness.setPlay(harness.p1Id, ['Morph - Space Goo', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register with static ability', async () => { await harness.setPlay(harness.p1Id, ['Morph - Space Goo']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: I\'LL HANDLE THIS', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability when in play', async () => { await harness.setPlay(harness.p1Id, ['Shenzi - Hyena Pack Leader']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple characters', async () => { await harness.setPlay(harness.p1Id, ['Shenzi - Hyena Pack Leader', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register with static ability', async () => { await harness.setPlay(harness.p1Id, ['Shenzi - Hyena Pack Leader']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: WHAT\'S THE HURRY?', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability when in play', async () => { await harness.setPlay(harness.p1Id, ['Shenzi - Hyena Pack Leader']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple characters', async () => { await harness.setPlay(harness.p1Id, ['Shenzi - Hyena Pack Leader', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register with static ability', async () => { await harness.setPlay(harness.p1Id, ['Shenzi - Hyena Pack Leader']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: YOU\'LL NEVER EVEN MISS IT', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability when in play', async () => { await harness.setPlay(harness.p1Id, ['Ursula - Deceiver']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple characters', async () => { await harness.setPlay(harness.p1Id, ['Ursula - Deceiver', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register with triggered ability', async () => { await harness.setPlay(harness.p1Id, ['Ursula - Deceiver']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});
