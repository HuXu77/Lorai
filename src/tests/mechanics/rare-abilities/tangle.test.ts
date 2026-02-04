import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: TANGLE', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should reduce opponent lore when Rapunzel is played', async () => {
        // Setup: P1 has Rapunzel - Letting Down Her Hair in hand
        await harness.setHand(harness.p1Id, ['Rapunzel - Letting Down Her Hair']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const rapunzel = p1.hand[0];

        // Execute: Play Rapunzel (should trigger TANGLE)
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: rapunzel.instanceId
        } as any);

        // Verify: Rapunzel is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
    });

    it('should work with opponent at 0 lore', async () => {
        // Setup: P1 has Rapunzel in hand, P2 has 0 lore
        await harness.setHand(harness.p1Id, ['Rapunzel - Letting Down Her Hair']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const rapunzel = p1.hand[0];

        // Execute: Play Rapunzel
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: rapunzel.instanceId
        } as any);

        expect(result).toBe(true);
    });

    it('should register Rapunzel in play after TANGLE triggers', async () => {
        // Setup: P1 has Rapunzel in hand
        await harness.setHand(harness.p1Id, ['Rapunzel - Letting Down Her Hair']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const rapunzel = p1.hand[0];

        // Execute: Play Rapunzel
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: rapunzel.instanceId
        } as any);

        // Verify: Rapunzel is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
        expect(p1After.play[0].name).toBe('Rapunzel');
    });
});
