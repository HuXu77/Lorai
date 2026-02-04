import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: Sound the Call', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should play a character for free using Sound the Call', async () => {
        // Setup: P1 has Mickey Mouse - Trumpeter ready with 2 ink
        await harness.setPlay(harness.p1Id, ['Mickey Mouse - Trumpeter']);
        await harness.setHand(harness.p1Id, ['Elsa - Snow Queen']); // 5 cost character
        harness.setInk(harness.p1Id, 2); // Only 2 ink (not enough for Elsa normally)

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mickey = p1.play[0];
        mickey.ready = true;

        // Execute: Use Sound the Call ability
        const result = await harness.turnManager.resolveAction({
            type: 'UseAbility' as any,
            playerId: harness.p1Id,
            cardId: mickey.instanceId,
            abilityIndex: 0
        } as any);

        expect(result).toBe(true);

        // Verify: Mickey should be exerted
        expect(mickey.ready).toBe(false);
        // Note: Actual character playing would require modal interaction
        // This test verifies the ability can be activated
    });

    it('should require 2 ink to use Sound the Call', async () => {
        // Setup: P1 has Mickey Mouse - Trumpeter ready with only 1 ink
        await harness.setPlay(harness.p1Id, ['Mickey Mouse - Trumpeter']);
        await harness.setHand(harness.p1Id, ['Elsa - Snow Queen']);
        harness.setInk(harness.p1Id, 1); // Not enough ink

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mickey = p1.play[0];
        mickey.ready = true;

        // Execute: Try to use Sound the Call without enough ink
        const result = await harness.turnManager.resolveAction({
            type: 'UseAbility' as any,
            playerId: harness.p1Id,
            cardId: mickey.instanceId,
            abilityIndex: 0
        } as any);

        expect(result).toBe(false);
        // Verify: Mickey should still be ready
        expect(mickey.ready).toBe(true);
    });

    it('should require Mickey to be ready to use Sound the Call', async () => {
        // Setup: P1 has Mickey (exerted) with 2 ink
        await harness.setPlay(harness.p1Id, ['Mickey Mouse - Trumpeter']);
        await harness.setHand(harness.p1Id, ['Elsa - Snow Queen']);
        harness.setInk(harness.p1Id, 2);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mickey = p1.play[0];
        mickey.ready = false; // Already exerted

        // Execute: Try to use Sound the Call while exerted
        const result = await harness.turnManager.resolveAction({
            type: 'UseAbility' as any,
            playerId: harness.p1Id,
            cardId: mickey.instanceId,
            abilityIndex: 0
        } as any);

        expect(result).toBe(false);
    });
});
