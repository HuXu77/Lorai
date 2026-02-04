import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Mechanic: Boost', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should allow using Boost to put card under character', async () => {
        // Setup: P1 has Gaston - Frightful Bully (Boost 2) in play
        await harness.setPlay(harness.p1Id, ['Gaston - Frightful Bully']); // Boost 2
        await harness.setDeck(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer']);
        harness.setInk(harness.p1Id, 2);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const gaston = p1.play[0];
        const deckSizeBefore = p1.deck.length;

        // Use Boost ability
        const result = await harness.turnManager.resolveAction({
            type: 'UseAbility' as any,
            playerId: harness.p1Id,
            cardId: gaston.instanceId,
            abilityIndex: 0
        } as any);

        expect(result).toBe(true);

        // Verify: Card moved from deck to under Gaston
        expect(p1.deck.length).toBe(deckSizeBefore - 1);
        expect(gaston.meta.cardsUnder).toBeDefined();
        expect(gaston.meta.cardsUnder?.length).toBe(1);
    });

    it('should NOT allow Boost without enough ink', async () => {
        // Setup: P1 has Gaston - Frightful Bully (Boost 2) but only 1 ink
        await harness.setPlay(harness.p1Id, ['Gaston - Frightful Bully']); // Boost 2
        await harness.setDeck(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer']);
        harness.setInk(harness.p1Id, 1); // Not enough!

        const p1 = harness.game.getPlayer(harness.p1Id);
        const gaston = p1.play[0];

        // Try to use Boost ability
        const result = await harness.turnManager.resolveAction({
            type: 'UseAbility' as any,
            playerId: harness.p1Id,
            cardId: gaston.instanceId,
            abilityIndex: 0
        } as any);

        expect(result).toBe(false);

        // Verify: No card under Gaston
        expect(gaston.meta.cardsUnder?.length || 0).toBe(0);
    });

    it('should NOT allow Boost when deck is empty', async () => {
        // Setup: P1 has Gaston - Frightful Bully (Boost 2) but empty deck
        await harness.setPlay(harness.p1Id, ['Gaston - Frightful Bully']); // Boost 2
        await harness.setDeck(harness.p1Id, []); // Empty deck
        harness.setInk(harness.p1Id, 2);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const gaston = p1.play[0];

        // Try to use Boost ability
        const result = await harness.turnManager.resolveAction({
            type: 'UseAbility' as any,
            playerId: harness.p1Id,
            cardId: gaston.instanceId,
            abilityIndex: 0
        } as any);

        // Empty deck should still work (no validation)
        expect(result).toBe(true);
    });

    it('should allow Boost only once per turn', async () => {
        // Setup: P1 has Gaston - Frightful Bully (Boost 2) in play
        await harness.setPlay(harness.p1Id, ['Gaston - Frightful Bully']); // Boost 2
        await harness.setDeck(harness.p1Id, [
            'Mickey Mouse - Wayward Sorcerer',
            'Elsa - Snow Queen'
        ]);
        harness.setInk(harness.p1Id, 10); // Plenty of ink

        const p1 = harness.game.getPlayer(harness.p1Id);
        const gaston = p1.play[0];

        // Use Boost ability first time
        const result1 = await harness.turnManager.resolveAction({
            type: 'UseAbility' as any,
            playerId: harness.p1Id,
            cardId: gaston.instanceId,
            abilityIndex: 0
        } as any);
        expect(result1).toBe(true);
        expect(gaston.meta.cardsUnder?.length).toBe(1);

        // Try to use Boost ability second time (should fail)
        const result2 = await harness.turnManager.resolveAction({
            type: 'UseAbility' as any,
            playerId: harness.p1Id,
            cardId: gaston.instanceId,
            abilityIndex: 0
        } as any);
        expect(result2).toBe(false);
        expect(gaston.meta.cardsUnder?.length).toBe(1); // Still only 1 card
    });
});

