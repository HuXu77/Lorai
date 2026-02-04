import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: Freeze', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should exert opposing character using Freeze ability', async () => {
        // Setup: P1 has Elsa - Snow Queen (Freeze ability) ready
        await harness.setPlay(harness.p1Id, ['Elsa - Snow Queen']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        const elsa = p1.play[0];
        elsa.ready = true;

        // Setup: P2 has Mickey ready
        await harness.setPlay(harness.p2Id, ['Mickey Mouse - Wayward Sorcerer']);
        const p2 = harness.game.getPlayer(harness.p2Id);
        const mickey = p2.play[0];
        mickey.ready = true;

        // Execute: Use Freeze ability on Mickey
        const result = await harness.turnManager.resolveAction({
            type: 'UseAbility' as any,
            playerId: harness.p1Id,
            cardId: elsa.instanceId,
            abilityIndex: 0
        } as any);

        expect(result).toBe(true);

        // Verify: Mickey should be exerted
        expect(mickey.ready).toBe(false);
        // Verify: Elsa should be exerted (used ability)
        expect(elsa.ready).toBe(false);
    });

    it('should NOT allow Freeze on own characters', async () => {
        // Setup: P1 has Elsa and Mickey
        await harness.setPlay(harness.p1Id, ['Elsa - Snow Queen', 'Mickey Mouse - Wayward Sorcerer']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        const elsa = p1.play[0];
        const mickey = p1.play[1];
        elsa.ready = true;
        mickey.ready = true;

        // Execute: Try to use Freeze on own character (should fail or not target)
        const result = await harness.turnManager.resolveAction({
            type: 'UseAbility' as any,
            playerId: harness.p1Id,
            cardId: elsa.instanceId,
            abilityIndex: 0
        } as any);

        // The ability should either fail or require opponent targeting
        // This test verifies the targeting restriction
        expect(mickey.ready).toBe(true); // Mickey should still be ready
    });

    it('should require Elsa to be ready to use Freeze', async () => {
        // Setup: P1 has Elsa (exerted)
        await harness.setPlay(harness.p1Id, ['Elsa - Snow Queen']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        const elsa = p1.play[0];
        elsa.ready = false; // Already exerted

        // Setup: P2 has Mickey
        await harness.setPlay(harness.p2Id, ['Mickey Mouse - Wayward Sorcerer']);
        const p2 = harness.game.getPlayer(harness.p2Id);
        const mickey = p2.play[0];
        mickey.ready = true;

        // Execute: Try to use Freeze while exerted
        const result = await harness.turnManager.resolveAction({
            type: 'UseAbility' as any,
            playerId: harness.p1Id,
            cardId: elsa.instanceId,
            abilityIndex: 0
        } as any);

        expect(result).toBe(false);
        // Verify: Mickey should still be ready
        expect(mickey.ready).toBe(true);
    });
});
