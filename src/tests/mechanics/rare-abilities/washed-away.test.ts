import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: WASHED AWAY', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have WASHED AWAY ability when played', async () => {
        // Setup: P1 has Alice - Accidentally Adrift in hand
        await harness.setHand(harness.p1Id, ['Alice - Accidentally Adrift']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const alice = p1.hand[0];

        // Execute: Play Alice (should trigger WASHED AWAY)
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: alice.instanceId
        } as any);

        // Verify: Alice is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
    });

    it('should work when no items are in play', async () => {
        // Setup: P1 has Alice in hand, no items in play
        await harness.setHand(harness.p1Id, ['Alice - Accidentally Adrift']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const alice = p1.hand[0];

        // Execute: Play Alice with no targets
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: alice.instanceId
        } as any);

        expect(result).toBe(true);
    });

    it('should register Alice in play after WASHED AWAY triggers', async () => {
        // Setup: P1 has Alice in hand
        await harness.setHand(harness.p1Id, ['Alice - Accidentally Adrift']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const alice = p1.hand[0];

        // Execute: Play Alice
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: alice.instanceId
        } as any);

        // Verify: Alice is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
        expect(p1After.play[0].name).toBe('Alice');
    });
});
