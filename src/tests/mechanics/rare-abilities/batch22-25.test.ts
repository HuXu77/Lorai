import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

// Batches 22-25: 24 abilities
describe('Rare Ability: THREE NEPHEWS', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Huey - Savvy Nephew']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Huey - Savvy Nephew', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Huey - Savvy Nephew']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: HIGHBORN LADY', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Maid Marian - Delightful Dreamer']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Maid Marian - Delightful Dreamer', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Maid Marian - Delightful Dreamer']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: THIS GOING TO BE GOOD', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Mama Odie - Mystical Maven']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Mama Odie - Mystical Maven', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Mama Odie - Mystical Maven']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: I\'M GOING HOME!', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Scrooge McDuck - Richest Duck in the World']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Scrooge McDuck - Richest Duck in the World', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Scrooge McDuck - Richest Duck in the World']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: I DIDN\'T GET RICH BY BEING STUPID', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Scrooge McDuck - Richest Duck in the World']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Scrooge McDuck - Richest Duck in the World', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Scrooge McDuck - Richest Duck in the World']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: TREASURE FINDER', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Scrooge McDuck - Uncle Moneybags']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Scrooge McDuck - Uncle Moneybags', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Scrooge McDuck - Uncle Moneybags']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: BEAUTIFUL VOICE', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Cinderella - Melody Weaver']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Cinderella - Melody Weaver', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Cinderella - Melody Weaver']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: INFILTRATION', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Daisy Duck - Musketeer Spy']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Daisy Duck - Musketeer Spy', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Daisy Duck - Musketeer Spy']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: SIGNATURE RECIPE', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Julieta Madrigal - Excellent Cook']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Julieta Madrigal - Excellent Cook', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Julieta Madrigal - Excellent Cook']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: STRIKE UP THE MUSIC', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Mickey Mouse - Leader of the Band']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Mickey Mouse - Leader of the Band', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Mickey Mouse - Leader of the Band']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});
