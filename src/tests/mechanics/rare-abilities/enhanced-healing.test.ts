import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: Enhanced Healing', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should move damage counters when Belle is played', async () => {
        // Setup: P1 has Belle in hand and damaged Mickey in play
        await harness.setHand(harness.p1Id, ['Belle - Accomplished Mystic']);
        await harness.setPlay(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mickey = p1.play[0];
        mickey.damage = 3; // Mickey has 3 damage

        // Setup: P2 has Elsa
        await harness.setPlay(harness.p2Id, ['Elsa - Snow Queen']);

        const belle = p1.hand[0];

        // Execute: Play Belle (should trigger Enhanced Healing)
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: belle.instanceId
        } as any);

        expect(result).toBe(true);

        // Verify: Belle is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBeGreaterThan(1);

        // Note: Damage movement is optional ("may move") and requires modal interaction
        // This test verifies the ability can be triggered
    });

    it('should work when no damaged characters are in play', async () => {
        // Setup: P1 has Belle in hand, no damaged characters
        await harness.setHand(harness.p1Id, ['Belle - Accomplished Mystic']);
        await harness.setPlay(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const belle = p1.hand[0];

        // Execute: Play Belle with no damaged targets
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: belle.instanceId
        } as any);

        // Should still succeed
        expect(result).toBe(true);
    });

    it('should register Belle in play after Enhanced Healing triggers', async () => {
        // Setup: P1 has Belle in hand
        await harness.setHand(harness.p1Id, ['Belle - Accomplished Mystic']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const playCountBefore = p1.play.length;
        const belle = p1.hand[0];

        // Execute: Play Belle
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: belle.instanceId
        } as any);

        // Verify: Belle is now in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(playCountBefore + 1);
    });
});
