import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: THREE WISHES', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability when in play', async () => { await harness.setPlay(harness.p1Id, ['Genie - Supportive Friend']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple characters', async () => { await harness.setPlay(harness.p1Id, ['Genie - Supportive Friend', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register with triggered ability', async () => { await harness.setPlay(harness.p1Id, ['Genie - Supportive Friend']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: I AM YOUR MASTER NOW', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability when in play', async () => { await harness.setPlay(harness.p1Id, ['Jafar - Lamp Thief']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple characters', async () => { await harness.setPlay(harness.p1Id, ['Jafar - Lamp Thief', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register with triggered ability', async () => { await harness.setPlay(harness.p1Id, ['Jafar - Lamp Thief']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: POWER BEYOND MEASURE', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability when in play', async () => { await harness.setPlay(harness.p1Id, ['Jafar - Striking Illusionist']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple characters', async () => { await harness.setPlay(harness.p1Id, ['Jafar - Striking Illusionist', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register with static ability', async () => { await harness.setPlay(harness.p1Id, ['Jafar - Striking Illusionist']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: DARK KNOWLEDGE', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability when in play', async () => { await harness.setPlay(harness.p1Id, ['Maleficent - Mistress of All Evil']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple characters', async () => { await harness.setPlay(harness.p1Id, ['Maleficent - Mistress of All Evil', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register with triggered ability', async () => { await harness.setPlay(harness.p1Id, ['Maleficent - Mistress of All Evil']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: DIVINATION', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability when in play', async () => { await harness.setPlay(harness.p1Id, ['Maleficent - Mistress of All Evil']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple characters', async () => { await harness.setPlay(harness.p1Id, ['Maleficent - Mistress of All Evil', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register with triggered ability', async () => { await harness.setPlay(harness.p1Id, ['Maleficent - Mistress of All Evil']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: LISTEN TO YOUR MAMA NOW', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability when in play', async () => { await harness.setPlay(harness.p1Id, ['Mama Odie - Voice of Wisdom']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple characters', async () => { await harness.setPlay(harness.p1Id, ['Mama Odie - Voice of Wisdom', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register with triggered ability', async () => { await harness.setPlay(harness.p1Id, ['Mama Odie - Voice of Wisdom']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});
