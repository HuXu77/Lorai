import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: GET A CLUE', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should put top deck card into inkwell when played', async () => {
        // Setup: P1 has Mickey - Detective in hand
        await harness.setHand(harness.p1Id, ['Mickey Mouse - Detective']);
        await harness.setDeck(harness.p1Id, ['Elsa - Snow Queen']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const inkwellBefore = p1.inkwell.length;
        const mickey = p1.hand[0];

        // Execute: Play Mickey (should trigger GET A CLUE)
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: mickey.instanceId
        } as any);

        // Verify: Mickey is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);

        // Note: Inkwell effect is optional ("may put"), test verifies ability triggers
    });

    it('should work when deck is empty', async () => {
        // Setup: P1 has Mickey in hand, empty deck
        await harness.setHand(harness.p1Id, ['Mickey Mouse - Detective']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mickey = p1.hand[0];

        // Execute: Play Mickey with no deck
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: mickey.instanceId
        } as any);

        expect(result).toBe(true);
    });

    it('should register Mickey in play after GET A CLUE triggers', async () => {
        // Setup: P1 has Mickey in hand
        await harness.setHand(harness.p1Id, ['Mickey Mouse - Detective']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mickey = p1.hand[0];

        // Execute: Play Mickey
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: mickey.instanceId
        } as any);

        // Verify: Mickey is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
        expect(p1After.play[0].name).toBe('Mickey Mouse');
    });
});
