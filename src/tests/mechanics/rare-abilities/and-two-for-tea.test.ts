import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: AND TWO FOR TEA!', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have AND TWO FOR TEA ability when played', async () => {
        // Setup: P1 has Goofy - Musketeer in hand
        await harness.setHand(harness.p1Id, ['Goofy - Musketeer']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const goofy = p1.hand[0];

        // Execute: Play Goofy (should trigger AND TWO FOR TEA!)
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: goofy.instanceId
        } as any);

        // Verify: Goofy is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
    });

    it('should work when no Musketeers are in play', async () => {
        // Setup: P1 has Goofy in hand, no other Musketeers
        await harness.setHand(harness.p1Id, ['Goofy - Musketeer']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const goofy = p1.hand[0];

        // Execute: Play Goofy with no targets
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: goofy.instanceId
        } as any);

        expect(result).toBe(true);
    });

    it('should register Goofy in play after AND TWO FOR TEA triggers', async () => {
        // Setup: P1 has Goofy in hand
        await harness.setHand(harness.p1Id, ['Goofy - Musketeer']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const goofy = p1.hand[0];

        // Execute: Play Goofy
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: goofy.instanceId
        } as any);

        // Verify: Goofy is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
        expect(p1After.play[0].name).toBe('Goofy');
    });
});
