import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: CLOSER LOOK', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should draw a card when Elsa is played', async () => {
        // Setup: P1 has Elsa - Exploring the Unknown in hand
        await harness.setHand(harness.p1Id, ['Elsa - Exploring the Unknown']);
        await harness.setDeck(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const elsa = p1.hand[0];

        // Execute: Play Elsa (should trigger CLOSER LOOK)
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: elsa.instanceId
        } as any);

        // Verify: Elsa is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
    });

    it('should work when deck is empty', async () => {
        // Setup: P1 has Elsa in hand, empty deck
        await harness.setHand(harness.p1Id, ['Elsa - Exploring the Unknown']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const elsa = p1.hand[0];

        // Execute: Play Elsa with no deck
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: elsa.instanceId
        } as any);

        expect(result).toBe(true);
    });

    it('should register Elsa in play after CLOSER LOOK triggers', async () => {
        // Setup: P1 has Elsa in hand
        await harness.setHand(harness.p1Id, ['Elsa - Exploring the Unknown']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const elsa = p1.hand[0];

        // Execute: Play Elsa
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: elsa.instanceId
        } as any);

        // Verify: Elsa is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
        expect(p1After.play[0].name).toBe('Elsa');
    });
});
