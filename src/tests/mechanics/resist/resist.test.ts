import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Mechanic: Resist', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should reduce damage by Resist value', async () => {
        // Setup: P1 has Hercules - Divine Hero (Resist +2) in play
        await harness.setPlay(harness.p1Id, ['Hercules - Divine Hero']); // Resist +2
        harness.setInk(harness.p1Id, 0);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const hercules = p1.play[0];

        // Apply 5 damage to Hercules
        harness.turnManager.applyDamage(p1, hercules, 5);

        // Verify: Only 3 damage applied (5 - 2 = 3)
        expect(hercules.damage).toBe(3);
    });

    it('should reduce damage to 0 if Resist is higher than damage', async () => {
        // Setup: P1 has Hercules - Divine Hero (Resist +2) in play
        await harness.setPlay(harness.p1Id, ['Hercules - Divine Hero']); // Resist +2
        harness.setInk(harness.p1Id, 0);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const hercules = p1.play[0];

        // Apply only 1 damage to Hercules
        harness.turnManager.applyDamage(p1, hercules, 1);

        // Verify: No damage applied (1 - 2 = 0, capped at 0)
        expect(hercules.damage).toBe(0);
    });

    it('should stack multiple Resist sources', async () => {
        // Setup: P1 has Hercules - Divine Hero (Resist +2)
        await harness.setPlay(harness.p1Id, ['Hercules - Divine Hero']); // Resist +2
        harness.setInk(harness.p1Id, 0);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const hercules = p1.play[0];

        // Manually add additional Resist (simulating a buff like "I'm Still Here")
        hercules.meta = hercules.meta || {};
        hercules.meta.resist = (hercules.meta.resist || 0) + 1; // Total Resist +3

        // Apply 5 damage
        harness.turnManager.applyDamage(p1, hercules, 5);

        // Verify: Only 2 damage applied (5 - 3 = 2)
        expect(hercules.damage).toBe(2);
    });

    it('should NOT reduce damage if character has no Resist', async () => {
        // Setup: P1 has Mickey (no Resist) in play
        await harness.setPlay(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer']);
        harness.setInk(harness.p1Id, 0);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mickey = p1.play[0];

        // Apply 3 damage
        harness.turnManager.applyDamage(p1, mickey, 3);

        // Verify: Full 3 damage applied
        expect(mickey.damage).toBe(3);
    });

    it('should apply Resist to ability damage', async () => {
        // Setup: P1 has Hercules (Resist +2) in play
        await harness.setPlay(harness.p1Id, ['Hercules - Divine Hero']); // Resist +2
        harness.setInk(harness.p1Id, 0);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const hercules = p1.play[0];

        // Simulate ability damage (e.g., from "Dragon Fire")
        harness.turnManager.applyDamage(p1, hercules, 4);

        // Verify: Only 2 damage applied (4 - 2 = 2)
        expect(hercules.damage).toBe(2);
    });

    it('should prevent banishment if Resist reduces damage below willpower', async () => {
        // Setup: P1 has Hercules - Divine Hero (Resist +2, 5 willpower)
        await harness.setPlay(harness.p1Id, ['Hercules - Divine Hero']); // Resist +2, 4/5
        harness.setInk(harness.p1Id, 0);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const hercules = p1.play[0];

        // Apply 5 damage (would normally banish, but Resist reduces to 3)
        harness.turnManager.applyDamage(p1, hercules, 5);

        // Verify: Hercules survives with 3 damage
        const herculesAfter = harness.game.getPlayer(harness.p1Id).play.find(c => c.instanceId === hercules.instanceId);
        expect(herculesAfter).toBeDefined();
        expect(herculesAfter?.damage).toBe(3);
    });
});
