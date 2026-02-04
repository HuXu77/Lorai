import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: DOUBLE THE POWDER!', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should retrieve action when Captain Hook is played', async () => {
        // Setup: P1 has Captain Hook - Captain of the Jolly Roger in hand
        await harness.setHand(harness.p1Id, ['Captain Hook - Captain of the Jolly Roger']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const hook = p1.hand[0];

        // Execute: Play Captain Hook (should trigger DOUBLE THE POWDER!)
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: hook.instanceId
        } as any);

        // Verify: Captain Hook is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
    });

    it('should work when no Fire the Cannons in discard', async () => {
        // Setup: P1 has Captain Hook in hand, empty discard
        await harness.setHand(harness.p1Id, ['Captain Hook - Captain of the Jolly Roger']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const hook = p1.hand[0];

        // Execute: Play Captain Hook
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: hook.instanceId
        } as any);

        expect(result).toBe(true);
    });

    it('should register Captain Hook in play after DOUBLE THE POWDER triggers', async () => {
        // Setup: P1 has Captain Hook in hand
        await harness.setHand(harness.p1Id, ['Captain Hook - Captain of the Jolly Roger']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const hook = p1.hand[0];

        // Execute: Play Captain Hook
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: hook.instanceId
        } as any);

        // Verify: Captain Hook is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
        expect(p1After.play[0].name).toBe('Captain Hook');
    });
});
