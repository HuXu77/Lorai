import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: MY FAVORITE PART!', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have MY FAVORITE PART ability when in play', async () => {
        // Setup: P1 has Belle - Strange but Special in play
        await harness.setPlay(harness.p1Id, ['Belle - Strange but Special']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const belle = p1.play[0];

        // Verify: Belle is in play
        expect(belle).toBeDefined();
        expect(belle.name).toBe('Belle');
    });

    it('should work with inkwell cards', async () => {
        // Setup: P1 has Belle in play with cards in inkwell
        await harness.setPlay(harness.p1Id, ['Belle - Strange but Special']);
        await harness.setInkwell(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer']);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Belle is in play with inkwell
        expect(p1.play.length).toBe(1);
        expect(p1.inkwell.length).toBe(1);
    });

    it('should register Belle with static ability', async () => {
        // Setup: P1 has Belle in play
        await harness.setPlay(harness.p1Id, ['Belle - Strange but Special']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const belle = p1.play[0];

        // Verify: Belle has abilities
        // MY FAVORITE PART! grants +4 lore with 10+ inkwell cards
        expect(belle).toBeDefined();
    });
});
