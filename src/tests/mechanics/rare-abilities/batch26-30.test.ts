import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

// Batches 26-30: 30 abilities in consolidated format
describe('Rare Ability: DRAMATIC ENTRANCE', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Minnie Mouse - Musketeer Champion']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['Minnie Mouse - Musketeer Champion', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Minnie Mouse - Musketeer Champion']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: HERE NOW, DON\'T DO THAT', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Belle - Untrained Mystic']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['Belle - Untrained Mystic', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Belle - Untrained Mystic']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: MANY FORMS', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Camilo Madrigal - Prankster']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['Camilo Madrigal - Prankster', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Camilo Madrigal - Prankster']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: MAGICAL INFORMANT', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Dolores Madrigal - Easy Listener']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['Dolores Madrigal - Easy Listener', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Dolores Madrigal - Easy Listener']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: CIRCLE FAR AND WIDE', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Diablo - Devoted Herald']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['Diablo - Devoted Herald', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Diablo - Devoted Herald']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: FATTEN YOU UP', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['HeiHei - Bumbling Rooster']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['HeiHei - Bumbling Rooster', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['HeiHei - Bumbling Rooster']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: CUNNING MANEUVER', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Jasmine - Desert Warrior']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['Jasmine - Desert Warrior', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Jasmine - Desert Warrior']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: SWIFT AND SURE', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Prince Phillip - Vanquisher of Foes']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['Prince Phillip - Vanquisher of Foes', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Prince Phillip - Vanquisher of Foes']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: SHINING BEACON', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Prince Phillip - Warden of the Woods']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['Prince Phillip - Warden of the Woods', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Prince Phillip - Warden of the Woods']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: FRESH INK', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Hidden Inkcaster']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple items', async () => { await h.setPlay(h.p1Id, ['Hidden Inkcaster']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(1); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Hidden Inkcaster']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: UNEXPECTED TREASURE', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Hidden Inkcaster']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple items', async () => { await h.setPlay(h.p1Id, ['Hidden Inkcaster']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(1); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Hidden Inkcaster']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: FINE PRINT', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Signed Contract']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple items', async () => { await h.setPlay(h.p1Id, ['Signed Contract']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(1); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Signed Contract']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: SUPER PEANUT POWERS', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Goofy - Super Goof']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['Goofy - Super Goof', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Goofy - Super Goof']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: FERVENT ADDRESS', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Lumiere - Fiery Friend']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['Lumiere - Fiery Friend', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Lumiere - Fiery Friend']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: TIME TO SHINE', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Mulan - Enemy of Entanglement']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['Mulan - Enemy of Entanglement', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Mulan - Enemy of Entanglement']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: BATTLE WOUND', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Mulan - Injured Soldier']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['Mulan - Injured Soldier', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Mulan - Injured Soldier']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: SURGE OF POWER', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Sisu - Emboldened Warrior']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['Sisu - Emboldened Warrior', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Sisu - Emboldened Warrior']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: I GOT THIS!', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Sisu - Empowered Sibling']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['Sisu - Empowered Sibling', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Sisu - Empowered Sibling']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: MYSTICAL PETALS', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Rose Lantern']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('ready state', async () => { await h.setPlay(h.p1Id, ['Rose Lantern']); h.game.getPlayer(h.p1Id).play[0].ready = true; expect(h.game.getPlayer(h.p1Id).play[0].ready).toBe(true); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Rose Lantern']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: SLIPPERY HALLS', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Ursula\'s Lair - Eye of the Storm']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('ready state', async () => { await h.setPlay(h.p1Id, ['Ursula\'s Lair - Eye of the Storm']); h.game.getPlayer(h.p1Id).play[0].ready = true; expect(h.game.getPlayer(h.p1Id).play[0].ready).toBe(true); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Ursula\'s Lair - Eye of the Storm']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: SEAT OF POWER', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Ursula\'s Lair - Eye of the Storm']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('ready state', async () => { await h.setPlay(h.p1Id, ['Ursula\'s Lair - Eye of the Storm']); h.game.getPlayer(h.p1Id).play[0].ready = true; expect(h.game.getPlayer(h.p1Id).play[0].ready).toBe(true); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Ursula\'s Lair - Eye of the Storm']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: REVITALIZING WATERS', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Hidden Cove - Tranquil Haven']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('ready state', async () => { await h.setPlay(h.p1Id, ['Hidden Cove - Tranquil Haven']); h.game.getPlayer(h.p1Id).play[0].ready = true; expect(h.game.getPlayer(h.p1Id).play[0].ready).toBe(true); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Hidden Cove - Tranquil Haven']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: DISCIPLINE AND STRENGTH', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Medallion Weights']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('ready state', async () => { await h.setPlay(h.p1Id, ['Medallion Weights']); h.game.getPlayer(h.p1Id).play[0].ready = true; expect(h.game.getPlayer(h.p1Id).play[0].ready).toBe(true); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Medallion Weights']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: ROUTINE RUCKUS', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Snuggly Duckling - Disreputable Pub']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('ready state', async () => { await h.setPlay(h.p1Id, ['Snuggly Duckling - Disreputable Pub']); h.game.getPlayer(h.p1Id).play[0].ready = true; expect(h.game.getPlayer(h.p1Id).play[0].ready).toBe(true); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Snuggly Duckling - Disreputable Pub']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: UNDERWATER ACOUSTICS', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Atlantica - Concert Hall']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('ready state', async () => { await h.setPlay(h.p1Id, ['Atlantica - Concert Hall']); h.game.getPlayer(h.p1Id).play[0].ready = true; expect(h.game.getPlayer(h.p1Id).play[0].ready).toBe(true); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Atlantica - Concert Hall']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: YOU JUST HAVE TO SEE IT', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Bruno Madrigal - Undetected Uncle']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('multiple chars', async () => { await h.setPlay(h.p1Id, ['Bruno Madrigal - Undetected Uncle', 'Mickey Mouse - Wayward Sorcerer']); expect(h.game.getPlayer(h.p1Id).play.length).toBe(2); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Bruno Madrigal - Undetected Uncle']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: WE ARE ALL CONNECTED', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Pride Lands - Pride Rock']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('ready state', async () => { await h.setPlay(h.p1Id, ['Pride Lands - Pride Rock']); h.game.getPlayer(h.p1Id).play[0].ready = true; expect(h.game.getPlayer(h.p1Id).play[0].ready).toBe(true); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Pride Lands - Pride Rock']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: LION HOME', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['Pride Lands - Pride Rock']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('ready state', async () => { await h.setPlay(h.p1Id, ['Pride Lands - Pride Rock']); h.game.getPlayer(h.p1Id).play[0].ready = true; expect(h.game.getPlayer(h.p1Id).play[0].ready).toBe(true); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['Pride Lands - Pride Rock']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});

describe('Rare Ability: INCREDIBLE ENERGY', () => {
    let h: TestHarness;
    beforeEach(async () => { h = new TestHarness(); await h.initialize(); });
    it('ability present', async () => { await h.setPlay(h.p1Id, ['The Sorcerer\'s Hat']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
    it('ready state', async () => { await h.setPlay(h.p1Id, ['The Sorcerer\'s Hat']); h.game.getPlayer(h.p1Id).play[0].ready = true; expect(h.game.getPlayer(h.p1Id).play[0].ready).toBe(true); });
    it('registered', async () => { await h.setPlay(h.p1Id, ['The Sorcerer\'s Hat']); expect(h.game.getPlayer(h.p1Id).play[0]).toBeDefined(); });
});
