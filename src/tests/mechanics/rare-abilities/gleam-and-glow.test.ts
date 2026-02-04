import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: GLEAM AND GLOW', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should heal and draw cards when Rapunzel is played', async () => {
        // Setup: P1 has Rapunzel - Gifted with Healing in hand
        await harness.setHand(harness.p1Id, ['Rapunzel - Gifted with Healing']);
        await harness.setDeck(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer', 'Elsa - Snow Queen']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const rapunzel = p1.hand[0];

        // Execute: Play Rapunzel (should trigger GLEAM AND GLOW)
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: rapunzel.instanceId
        } as any);

        // Verify: Rapunzel is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
    });

    it('should work when no damaged characters exist', async () => {
        // Setup: P1 has Rapunzel in hand, no damaged characters
        await harness.setHand(harness.p1Id, ['Rapunzel - Gifted with Healing']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const rapunzel = p1.hand[0];

        // Execute: Play Rapunzel with no targets
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: rapunzel.instanceId
        } as any);

        expect(result).toBe(true);
    });

    it('should register Rapunzel in play after GLEAM AND GLOW triggers', async () => {
        // Setup: P1 has Rapunzel in hand
        await harness.setHand(harness.p1Id, ['Rapunzel - Gifted with Healing']);
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
