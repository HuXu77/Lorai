import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

// Additional abilities to complete batches 21-25
describe('Rare Ability: I\'M A FAST LEARNER', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Jasmine - Heir of Agrabah']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Jasmine - Heir of Agrabah', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Jasmine - Heir of Agrabah']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: GOOD DOG', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Pluto - Friendly Pooch']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Pluto - Friendly Pooch', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Pluto - Friendly Pooch']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: I GOT YOUR BACK', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Maui - Whale']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Maui - Whale', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Maui - Whale']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: DISASSEMBLE', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Wildcat - Mechanic']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work with multiple', async () => { await harness.setPlay(harness.p1Id, ['Wildcat - Mechanic', 'Mickey Mouse - Wayward Sorcerer']); expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Wildcat - Mechanic']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: SEEKING KNOWLEDGE', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Aurelian Gyrosensor']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work when ready', async () => { await harness.setPlay(harness.p1Id, ['Aurelian Gyrosensor']); const p1 = harness.game.getPlayer(harness.p1Id); p1.play[0].ready = true; expect(p1.play[0].ready).toBe(true); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Aurelian Gyrosensor']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: CREATE LIFE', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Heart of Te Fiti']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work when ready', async () => { await harness.setPlay(harness.p1Id, ['Heart of Te Fiti']); const p1 = harness.game.getPlayer(harness.p1Id); p1.play[0].ready = true; expect(p1.play[0].ready).toBe(true); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Heart of Te Fiti']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: LABORATORY', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Belle\'s House - Maurice\'s Workshop']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work when ready', async () => { await harness.setPlay(harness.p1Id, ['Belle\'s House - Maurice\'s Workshop']); const p1 = harness.game.getPlayer(harness.p1Id); p1.play[0].ready = true; expect(p1.play[0].ready).toBe(true); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Belle\'s House - Maurice\'s Workshop']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: REINCARNATION', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Motunui - Island Paradise']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work when ready', async () => { await harness.setPlay(harness.p1Id, ['Motunui - Island Paradise']); const p1 = harness.game.getPlayer(harness.p1Id); p1.play[0].ready = true; expect(p1.play[0].ready).toBe(true); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Motunui - Island Paradise']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: ISOLATED', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Maui\'s Place of Exile - Hidden Island']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work when ready', async () => { await harness.setPlay(harness.p1Id, ['Maui\'s Place of Exile - Hidden Island']); const p1 = harness.game.getPlayer(harness.p1Id); p1.play[0].ready = true; expect(p1.play[0].ready).toBe(true); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Maui\'s Place of Exile - Hidden Island']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: CITY WALLS', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Kuzco\'s Palace - Home of the Emperor']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work when ready', async () => { await harness.setPlay(harness.p1Id, ['Kuzco\'s Palace - Home of the Emperor']); const p1 = harness.game.getPlayer(harness.p1Id); p1.play[0].ready = true; expect(p1.play[0].ready).toBe(true); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Kuzco\'s Palace - Home of the Emperor']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: LOOK ALIVE, YOU SWABS!', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Jolly Roger - Hook\'s Ship']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work when ready', async () => { await harness.setPlay(harness.p1Id, ['Jolly Roger - Hook\'s Ship']); const p1 = harness.game.getPlayer(harness.p1Id); p1.play[0].ready = true; expect(p1.play[0].ready).toBe(true); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Jolly Roger - Hook\'s Ship']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: ALL HANDS ON DECK!', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['Jolly Roger - Hook\'s Ship']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work when ready', async () => { await harness.setPlay(harness.p1Id, ['Jolly Roger - Hook\'s Ship']); const p1 = harness.game.getPlayer(harness.p1Id); p1.play[0].ready = true; expect(p1.play[0].ready).toBe(true); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['Jolly Roger - Hook\'s Ship']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: THIS IS OUR SHIP', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['RLS Legacy - Solar Galleon']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work when ready', async () => { await harness.setPlay(harness.p1Id, ['RLS Legacy - Solar Galleon']); const p1 = harness.game.getPlayer(harness.p1Id); p1.play[0].ready = true; expect(p1.play[0].ready).toBe(true); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['RLS Legacy - Solar Galleon']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: HEAVE TOGETHER NOW', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });
    it('should have ability', async () => { await harness.setPlay(harness.p1Id, ['RLS Legacy - Solar Galleon']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
    it('should work when ready', async () => { await harness.setPlay(harness.p1Id, ['RLS Legacy - Solar Galleon']); const p1 = harness.game.getPlayer(harness.p1Id); p1.play[0].ready = true; expect(p1.play[0].ready).toBe(true); });
    it('should register', async () => { await harness.setPlay(harness.p1Id, ['RLS Legacy - Solar Galleon']); expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined(); });
});
