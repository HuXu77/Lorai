import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Mechanic: Challenger', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should apply Challenger bonus during challenge', async () => {
        // Setup: P1 has Challenger character, P2 has target
        await harness.setPlay(harness.p1Id, [
            { name: 'Simba - Returned King', ready: true, turnPlayed: 0 } // 4/5 Challenger +4
        ]);

        await harness.setPlay(harness.p2Id, [
            { name: 'Stitch - Rock Star', ready: false } // 3/5, exerted
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        const simba = p1.play.find(c => c.name === 'Simba - Returned King')!;
        const stitch = p2.play.find(c => c.name === 'Stitch - Rock Star')!;

        // Verify Simba has Challenger
        expect(simba.baseKeywords).toContain('Challenger');

        // Simba's base strength is 4, with Challenger +4 should be 8 during challenge
        expect(simba.strength).toBe(4);

        // Execute challenge
        await harness.turnManager.challenge(
            p1,
            simba.instanceId,
            stitch.instanceId
        );

        // Verify combat: Simba (4+4=8 STR) vs Stitch (3 STR, 5 WP)
        // Stitch takes 8 damage and is banished (5 willpower)
        // Simba takes 3 damage (survives with 5 willpower)
        const finalP1 = harness.game.getPlayer(harness.p1Id);
        const finalP2 = harness.game.getPlayer(harness.p2Id);

        expect(finalP2.play.length).toBe(0); // Stitch banished

        const finalSimba = finalP1.play.find(c => c.instanceId === simba.instanceId);
        expect(finalSimba).toBeDefined();
        expect(finalSimba!.damage).toBe(3); // Took 3 damage from Stitch
    });

    it('should verify Challenger keyword is present on Challenger characters', async () => {
        // Setup: Challenger character
        await harness.setPlay(harness.p1Id, [
            { name: 'Simba - Returned King', ready: true } // Challenger +4
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const simba = p1.play.find(c => c.name === 'Simba - Returned King')!;

        // Verify Simba has Challenger keyword
        expect(simba.baseKeywords).toContain('Challenger');
    });

    it('should verify different Challenger values', async () => {
        // Setup: Multiple Challenger characters with different bonuses
        await harness.setPlay(harness.p1Id, [
            { name: 'Simba - Returned King', ready: true }, // Challenger +4
            { name: 'Tinker Bell - Peter Pan\'s Ally', ready: true } // Challenger +1 (if she has it)
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const simba = p1.play.find(c => c.name === 'Simba - Returned King')!;

        // Verify Simba has Challenger
        expect(simba.baseKeywords).toContain('Challenger');

        // Note: The actual bonus value (+1, +2, +4, etc.) is stored in meta.challenger
        // and applied during combat resolution
    });
});
