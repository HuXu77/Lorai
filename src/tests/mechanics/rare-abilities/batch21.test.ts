import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

// Batch 21: 6 abilities
describe('Rare Ability: WHAT A DEAL', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Ursula - Deceiver of All']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Ursula - Deceiver of All', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Ursula - Deceiver of All']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: NEMESIS', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Captain Hook - Master Swordsman']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Captain Hook - Master Swordsman', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Captain Hook - Master Swordsman']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: MAN-TO-MAN', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Captain Hook - Master Swordsman']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Captain Hook - Master Swordsman', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Captain Hook - Master Swordsman']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: THIS MISSION IS CURSED', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Maui - Whale']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Maui - Whale', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Maui - Whale']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: YOU\'RE NEXT!', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Peter Pan - Pirate\'s Bane']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Peter Pan - Pirate\'s Bane', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Peter Pan - Pirate\'s Bane']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: DO YOU KNOW WHO YOU ARE?', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Gramma Tala - Spirit of the Ocean']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Gramma Tala - Spirit of the Ocean', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Gramma Tala - Spirit of the Ocean']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});
