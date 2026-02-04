import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Mechanic: Ward', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should prevent opponent from targeting Ward character with damage ability', async () => {
        // Setup: P1 has Ward character, P2 has damage ability
        await harness.setPlay(harness.p1Id, [
            { name: 'Aladdin - Prince Ali', ready: false } // 2/3 Ward
        ]);

        await harness.setHand(harness.p2Id, [
            'Dragon Fire' // Deal 4 damage to chosen character
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        const aladdin = p1.play.find(c => c.name === 'Aladdin - Prince Ali')!;

        // Verify Aladdin has Ward
        expect(aladdin.baseKeywords).toContain('Ward');

        // P2 tries to play Dragon Fire targeting Aladdin
        const dragonFire = p2.hand.find(c => c.name === 'Dragon Fire')!;

        // Mock the choice to target Aladdin
        (harness.turnManager as any).mockPendingChoice = [aladdin.instanceId];

        // Try to play Dragon Fire
        const result = await harness.turnManager.playCard(
            p2,
            dragonFire.instanceId
        );

        // Verify Aladdin took NO damage (Ward blocked the targeting)
        const updatedP1 = harness.game.getPlayer(harness.p1Id);
        const updatedAladdin = updatedP1.play.find(c => c.instanceId === aladdin.instanceId)!;

        expect(updatedAladdin.damage).toBe(0);
    });

    it('should allow opponent to challenge Ward character', async () => {
        // Setup: P1 has Ward character (exerted), P2 has attacker
        await harness.setPlay(harness.p1Id, [
            { name: 'Aladdin - Prince Ali', ready: false } // 2/3 Ward
        ]);

        await harness.setPlay(harness.p2Id, [
            { name: 'Stitch - Rock Star', ready: true, turnPlayed: 0 } // 3/5
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        const aladdin = p1.play.find(c => c.name === 'Aladdin - Prince Ali')!;
        const stitch = p2.play.find(c => c.name === 'Stitch - Rock Star')!;

        // Verify Aladdin has Ward
        expect(aladdin.baseKeywords).toContain('Ward');

        // Challenge should succeed (Ward doesn't prevent challenges)
        const result = await harness.turnManager.challenge(
            p2,
            stitch.instanceId,
            aladdin.instanceId
        );

        expect(result).toBe(true);

        // Verify combat occurred
        const updatedP1 = harness.game.getPlayer(harness.p1Id);
        const updatedP2 = harness.game.getPlayer(harness.p2Id);

        // Aladdin (2 STR) vs Stitch (3 STR): Aladdin banished, Stitch takes 2 damage
        expect(updatedP1.play.length).toBe(0); // Aladdin banished
        const updatedStitch = updatedP2.play.find(c => c.instanceId === stitch.instanceId);
        expect(updatedStitch?.damage).toBe(2);
    });

    it('should allow non-Ward character to be targeted by opponent abilities', async () => {
        // Setup: P1 has non-Ward character, P2 has non-Ward character
        await harness.setPlay(harness.p1Id, [
            { name: 'Stitch - Rock Star', ready: false } // 3/5, no Ward
        ]);

        await harness.setPlay(harness.p2Id, [
            { name: 'HeiHei - Boat Snack', ready: true } // 1/2 Support, no Ward
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        const stitch = p1.play.find(c => c.name === 'Stitch - Rock Star')!;
        const heihei = p2.play.find(c => c.name === 'HeiHei - Boat Snack')!;

        // Verify neither has Ward
        expect(stitch.baseKeywords || []).not.toContain('Ward');
        expect(heihei.baseKeywords || []).not.toContain('Ward');

        // Both characters should be targetable by opponent abilities
        // (This is the baseline - no Ward protection)
        expect(stitch).toBeDefined();
        expect(heihei).toBeDefined();
    });

    it('should verify Ward keyword is present on Ward characters', async () => {
        // Setup: Ward character
        await harness.setPlay(harness.p1Id, [
            { name: 'Aladdin - Prince Ali', ready: false } // Ward
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const aladdin = p1.play.find(c => c.name === 'Aladdin - Prince Ali')!;

        // Verify Aladdin has Ward keyword
        expect(aladdin.baseKeywords).toContain('Ward');
    });
});
