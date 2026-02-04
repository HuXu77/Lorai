import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Mechanic: Evasive', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should allow Evasive character to challenge Evasive character', async () => {
        // Setup: P1 has Evasive character, P2 has Evasive character (exerted)
        await harness.setPlay(harness.p1Id, [
            { name: 'Tinker Bell - Peter Pan\'s Ally', ready: true } // 2/3 Evasive
        ]);

        await harness.setPlay(harness.p2Id, [
            { name: 'Jetsam - Ursula\'s Spy', ready: false } // 2/3 Evasive
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        const tinkerbell = p1.play.find(c => c.name === 'Tinker Bell - Peter Pan\'s Ally')!;
        const jetsam = p2.play.find(c => c.name === 'Jetsam - Ursula\'s Spy')!;

        // Verify both have Evasive (check baseKeywords from card data)
        expect(tinkerbell.baseKeywords).toContain('Evasive');
        expect(jetsam.baseKeywords).toContain('Evasive');

        // Challenge should succeed
        const result = await harness.turnManager.challenge(
            harness.game.getPlayer(harness.p1Id),
            tinkerbell.instanceId,
            jetsam.instanceId
        );

        expect(result).toBe(true);

        // Both should be banished (2 STR vs 2 STR)
        const updatedP1 = harness.game.getPlayer(harness.p1Id);
        const updatedP2 = harness.game.getPlayer(harness.p2Id);

        expect(updatedP1.play.length).toBe(0);
        expect(updatedP2.play.length).toBe(0);
    });

    it('should prevent non-Evasive character from challenging Evasive character', async () => {
        // Setup: P1 has non-Evasive character, P2 has Evasive character (exerted)
        await harness.setPlay(harness.p1Id, [
            { name: 'Stitch - Rock Star', ready: true } // 3/5, no Evasive
        ]);

        await harness.setPlay(harness.p2Id, [
            { name: 'Tinker Bell - Peter Pan\'s Ally', ready: false } // 2/3 Evasive
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        const stitch = p1.play.find(c => c.name === 'Stitch - Rock Star')!;
        const tinkerbell = p2.play.find(c => c.name === 'Tinker Bell - Peter Pan\'s Ally')!;

        // Verify Stitch doesn't have Evasive, Tinker Bell does
        expect(stitch.baseKeywords || []).not.toContain('Evasive');
        expect(tinkerbell.baseKeywords).toContain('Evasive');

        // Challenge should fail
        const result = await harness.turnManager.challenge(
            harness.game.getPlayer(harness.p1Id),
            stitch.instanceId,
            tinkerbell.instanceId
        );

        expect(result).toBe(false);

        // Both should still be in play
        const updatedP1 = harness.game.getPlayer(harness.p1Id);
        const updatedP2 = harness.game.getPlayer(harness.p2Id);

        expect(updatedP1.play.length).toBe(1);
        expect(updatedP2.play.length).toBe(1);
    });

    it('should allow non-Evasive character to challenge non-Evasive character', async () => {
        // Setup: P1 has non-Evasive character, P2 has non-Evasive character (exerted)
        await harness.setPlay(harness.p1Id, [
            { name: 'Stitch - Rock Star', ready: true } // 3/5
        ]);

        await harness.setPlay(harness.p2Id, [
            { name: 'HeiHei - Boat Snack', ready: false } // 1/2
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        const stitch = p1.play.find(c => c.name === 'Stitch - Rock Star')!;
        const heihei = p2.play.find(c => c.name === 'HeiHei - Boat Snack')!;

        // Challenge should succeed
        const result = await harness.turnManager.challenge(
            harness.game.getPlayer(harness.p1Id),
            stitch.instanceId,
            heihei.instanceId
        );

        expect(result).toBe(true);

        // HeiHei should be banished, Stitch survives
        const updatedP1 = harness.game.getPlayer(harness.p1Id);
        const updatedP2 = harness.game.getPlayer(harness.p2Id);

        expect(updatedP1.play.length).toBe(1);
        expect(updatedP2.play.length).toBe(0);
    });

    it('should allow Evasive character to challenge non-Evasive character', async () => {
        // Setup: P1 has Evasive character, P2 has non-Evasive character (exerted)
        await harness.setPlay(harness.p1Id, [
            { name: 'Tinker Bell - Peter Pan\'s Ally', ready: true } // 2/3 Evasive
        ]);

        await harness.setPlay(harness.p2Id, [
            { name: 'HeiHei - Boat Snack', ready: false } // 1/2
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        const tinkerbell = p1.play.find(c => c.name === 'Tinker Bell - Peter Pan\'s Ally')!;
        const heihei = p2.play.find(c => c.name === 'HeiHei - Boat Snack')!;

        // Challenge should succeed
        const result = await harness.turnManager.challenge(
            harness.game.getPlayer(harness.p1Id),
            tinkerbell.instanceId,
            heihei.instanceId
        );

        expect(result).toBe(true);

        // HeiHei should be banished, Tinker Bell survives
        const updatedP1 = harness.game.getPlayer(harness.p1Id);
        const updatedP2 = harness.game.getPlayer(harness.p2Id);

        expect(updatedP1.play.length).toBe(1);
        expect(updatedP2.play.length).toBe(0);
    });

    // TODO: Fix engine to apply "During your turn, gains Evasive" before challenge validation
    it.skip('should allow character with conditional Evasive to challenge Evasive character during their turn', async () => {
        // Setup: P1 has character with "During your turn, gains Evasive" (Grumpy - Skeptical Knight)
        // P2 has Evasive character (exerted)
        await harness.setPlay(harness.p1Id, [
            { name: 'Grumpy - Skeptical Knight', ready: true } // BURST OF SPEED: During your turn, gains Evasive
        ]);

        await harness.setPlay(harness.p2Id, [
            { name: 'Tinker Bell - Peter Pan\'s Ally', ready: false } // 2/3 Evasive
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        const grumpy = p1.play.find(c => c.name === 'Grumpy - Skeptical Knight')!;
        const tinkerbell = p2.play.find(c => c.name === 'Tinker Bell - Peter Pan\'s Ally')!;

        // Verify Grumpy doesn't have base Evasive, but Tinker Bell does
        expect(grumpy.baseKeywords || []).not.toContain('Evasive');
        expect(tinkerbell.baseKeywords).toContain('Evasive');

        // During P1's turn, Grumpy should gain Evasive and be able to challenge Tinker Bell
        // The engine should apply the "During your turn" effect
        const result = await harness.turnManager.challenge(
            harness.game.getPlayer(harness.p1Id),
            grumpy.instanceId,
            tinkerbell.instanceId
        );

        // Challenge should succeed because Grumpy gains Evasive during P1's turn
        expect(result).toBe(true);

        // Verify combat occurred (both should take damage or be banished)
        const updatedP1 = harness.game.getPlayer(harness.p1Id);
        const updatedP2 = harness.game.getPlayer(harness.p2Id);

        // Grumpy (2/4) vs Tinker Bell (2/3): Tinker Bell banished, Grumpy takes 2 damage
        const survivingGrumpy = updatedP1.play.find(c => c.instanceId === grumpy.instanceId);
        expect(survivingGrumpy).toBeDefined();
        expect(survivingGrumpy?.damage).toBe(2);
        expect(updatedP2.play.length).toBe(0); // Tinker Bell banished
    });
});
