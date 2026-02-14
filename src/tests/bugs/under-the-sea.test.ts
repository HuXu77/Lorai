import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../engine-test-utils';

describe('Bug: Under The Sea Sing Together', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should be able to sing Under The Sea with cost 8', async () => {
        // Setup: P1 has singers with total cost 8
        // Using common cards for setup
        await harness.setPlay(harness.p1Id, [
            'Elsa - Queen Regent', // Cost 4
            'Elsa - Queen Regent'  // Cost 4
        ]);
        harness.setInk(harness.p1Id, 0); // No ink needed

        const p1 = harness.game.getPlayer(harness.p1Id);
        const singer1 = p1.play[0];
        const singer2 = p1.play[1];
        singer1.ready = true;
        singer2.ready = true;

        // Give Under the Sea
        // We use the exact name from JSON
        await harness.setHand(harness.p1Id, ['Under the Sea']);

        const underTheSea = p1.hand.find(c => c.name === 'Under the Sea');
        if (!underTheSea) throw new Error('Under the Sea card not found');

        // Ensure cost is > 8 to prove Sing Together is working (if cost <= 8, it would work anyway)
        // Card cost is 8, so we need singers with total cost 8
        expect(underTheSea.cost).toBe(8);

        // Execute: Sing with cost 8
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: underTheSea.instanceId,
            singerIds: [singer1.instanceId, singer2.instanceId]
        } as any);

        expect(result).toBe(true);

        // Verify singers exerted
        expect(singer1.ready).toBe(false);
        expect(singer2.ready).toBe(false);

        // Verify card played
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.hand.length).toBe(0);
        expect(p1After.discard.find(c => c.instanceId === underTheSea.instanceId)).toBeDefined();
    });
});
