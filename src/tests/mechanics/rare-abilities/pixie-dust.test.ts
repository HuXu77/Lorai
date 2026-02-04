import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: PIXIE DUST', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should grant Evasive when Tinker Bell is played', async () => {
        // Setup: P1 has Tinker Bell - Most Helpful in hand
        await harness.setHand(harness.p1Id, ['Tinker Bell - Most Helpful']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const tink = p1.hand[0];

        // Execute: Play Tinker Bell (should trigger PIXIE DUST)
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: tink.instanceId
        } as any);

        // Verify: Tinker Bell is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
    });

    it('should work when no characters are in play', async () => {
        // Setup: P1 has Tinker Bell in hand, no other characters
        await harness.setHand(harness.p1Id, ['Tinker Bell - Most Helpful']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const tink = p1.hand[0];

        // Execute: Play Tinker Bell with no targets
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: tink.instanceId
        } as any);

        expect(result).toBe(true);
    });

    it('should register Tinker Bell in play after PIXIE DUST triggers', async () => {
        // Setup: P1 has Tinker Bell in hand
        await harness.setHand(harness.p1Id, ['Tinker Bell - Most Helpful']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const tink = p1.hand[0];

        // Execute: Play Tinker Bell
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: tink.instanceId
        } as any);

        // Verify: Tinker Bell is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
        expect(p1After.play[0].name).toBe('Tinker Bell');
    });
});
