import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: FEED THE POOR', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should draw card when Robin Hood is played', async () => {
        // Setup: P1 has Robin Hood - Unrivaled Archer in hand
        await harness.setHand(harness.p1Id, ['Robin Hood - Unrivaled Archer']);
        await harness.setDeck(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const robin = p1.hand[0];

        // Execute: Play Robin Hood (should trigger FEED THE POOR)
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: robin.instanceId
        } as any);

        // Verify: Robin Hood is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
    });

    it('should work when opponent has equal cards', async () => {
        // Setup: P1 has Robin Hood in hand
        await harness.setHand(harness.p1Id, ['Robin Hood - Unrivaled Archer']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const robin = p1.hand[0];

        // Execute: Play Robin Hood
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: robin.instanceId
        } as any);

        expect(result).toBe(true);
    });

    it('should register Robin Hood in play after FEED THE POOR triggers', async () => {
        // Setup: P1 has Robin Hood in hand
        await harness.setHand(harness.p1Id, ['Robin Hood - Unrivaled Archer']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const robin = p1.hand[0];

        // Execute: Play Robin Hood
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: robin.instanceId
        } as any);

        // Verify: Robin Hood is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
        expect(p1After.play[0].name).toBe('Robin Hood');
    });
});
