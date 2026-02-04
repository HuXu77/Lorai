import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: TELLING LIES', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should exert opponent when Pinocchio is played', async () => {
        // Setup: P1 has Pinocchio - Talkative Puppet in hand
        await harness.setHand(harness.p1Id, ['Pinocchio - Talkative Puppet']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const pinocchio = p1.hand[0];

        // Execute: Play Pinocchio (should trigger TELLING LIES)
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: pinocchio.instanceId
        } as any);

        // Verify: Pinocchio is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
    });

    it('should work when no opposing characters are in play', async () => {
        // Setup: P1 has Pinocchio in hand, no opposing characters
        await harness.setHand(harness.p1Id, ['Pinocchio - Talkative Puppet']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const pinocchio = p1.hand[0];

        // Execute: Play Pinocchio
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: pinocchio.instanceId
        } as any);

        expect(result).toBe(true);
    });

    it('should register Pinocchio in play after TELLING LIES triggers', async () => {
        // Setup: P1 has Pinocchio in hand
        await harness.setHand(harness.p1Id, ['Pinocchio - Talkative Puppet']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const pinocchio = p1.hand[0];

        // Execute: Play Pinocchio
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: pinocchio.instanceId
        } as any);

        // Verify: Pinocchio is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
        expect(p1After.play[0].name).toBe('Pinocchio');
    });
});
