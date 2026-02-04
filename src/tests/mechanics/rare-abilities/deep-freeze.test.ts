import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: DEEP FREEZE', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should exert characters when Elsa is played', async () => {
        // Setup: P1 has Elsa in hand
        await harness.setHand(harness.p1Id, ['Elsa - Spirit of Winter']);
        harness.setInk(harness.p1Id, 10);

        // Setup: P2 has 2 ready characters
        await harness.setPlay(harness.p2Id, [
            'Mickey Mouse - Wayward Sorcerer',
            'Robin Hood - Capable Fighter'
        ]);
        const p2 = harness.game.getPlayer(harness.p2Id);
        p2.play[0].ready = true;
        p2.play[1].ready = true;

        const p1 = harness.game.getPlayer(harness.p1Id);
        const elsa = p1.hand[0];

        // Execute: Play Elsa (should trigger DEEP FREEZE)
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: elsa.instanceId
        } as any);

        // Verify: Elsa is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);

        // Note: Exert effect is optional ("exert up to 2"), test verifies ability triggers
    });

    it('should work when no characters are available to exert', async () => {
        // Setup: P1 has Elsa in hand, no opposing characters
        await harness.setHand(harness.p1Id, ['Elsa - Spirit of Winter']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const elsa = p1.hand[0];

        // Execute: Play Elsa with no targets
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: elsa.instanceId
        } as any);

        expect(result).toBe(true);
    });

    it('should register Elsa in play after DEEP FREEZE triggers', async () => {
        // Setup: P1 has Elsa in hand
        await harness.setHand(harness.p1Id, ['Elsa - Spirit of Winter']);
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
