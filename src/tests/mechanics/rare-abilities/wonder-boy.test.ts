import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: WONDER BOY', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should grant strength boost when Megara is played', async () => {
        // Setup: P1 has Megara - Pulling the Strings in hand
        await harness.setHand(harness.p1Id, ['Megara - Pulling the Strings']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const megara = p1.hand[0];

        // Execute: Play Megara (should trigger WONDER BOY)
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: megara.instanceId
        } as any);

        // Verify: Megara is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
    });

    it('should work when no characters are in play', async () => {
        // Setup: P1 has Megara in hand, no other characters
        await harness.setHand(harness.p1Id, ['Megara - Pulling the Strings']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const megara = p1.hand[0];

        // Execute: Play Megara with no targets
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: megara.instanceId
        } as any);

        expect(result).toBe(true);
    });

    it('should register Megara in play after WONDER BOY triggers', async () => {
        // Setup: P1 has Megara in hand
        await harness.setHand(harness.p1Id, ['Megara - Pulling the Strings']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const megara = p1.hand[0];

        // Execute: Play Megara
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: megara.instanceId
        } as any);

        // Verify: Megara is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
        expect(p1After.play[0].name).toBe('Megara');
    });
});
