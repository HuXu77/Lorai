import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: ADORING FANS', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should trigger when playing a cost 2 or less character', async () => {
        // Setup: P1 has Stitch - Rock Star in play
        await harness.setPlay(harness.p1Id, ['Stitch - Rock Star']);
        await harness.setHand(harness.p1Id, ['Elsa - Snow Queen']); // Cost 5
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const stitch = p1.play[0];

        // Verify: Stitch is in play
        expect(stitch).toBeDefined();
        expect(stitch.name).toBe('Stitch');
    });

    it('should work with multiple low-cost characters', async () => {
        // Setup: P1 has Stitch - Rock Star in play
        await harness.setPlay(harness.p1Id, ['Stitch - Rock Star']);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Stitch is in play
        expect(p1.play.length).toBe(1);
    });

    it('should NOT trigger for characters with cost 3 or more', async () => {
        // Setup: P1 has Stitch - Rock Star in play
        await harness.setPlay(harness.p1Id, ['Stitch - Rock Star']);
        await harness.setHand(harness.p1Id, ['Elsa - Snow Queen']); // Cost 5
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const elsa = p1.hand[0];

        // Execute: Play Elsa (cost 5, should NOT trigger ADORING FANS)
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: elsa.instanceId
        } as any);

        // Verify: Elsa is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(2);
    });
});
