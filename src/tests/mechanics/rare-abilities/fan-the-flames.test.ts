import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: FAN THE FLAMES', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should ready a character when LeFou is played', async () => {
        // Setup: P1 has LeFou - Instigator in hand
        await harness.setHand(harness.p1Id, ['LeFou - Instigator']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const lefou = p1.hand[0];

        // Execute: Play LeFou (should trigger FAN THE FLAMES)
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: lefou.instanceId
        } as any);

        // Verify: LeFou is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
    });

    it('should work when no characters are in play', async () => {
        // Setup: P1 has LeFou in hand, no other characters
        await harness.setHand(harness.p1Id, ['LeFou - Instigator']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const lefou = p1.hand[0];

        // Execute: Play LeFou with no targets
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: lefou.instanceId
        } as any);

        expect(result).toBe(true);
    });

    it('should register LeFou in play after FAN THE FLAMES triggers', async () => {
        // Setup: P1 has LeFou in hand
        await harness.setHand(harness.p1Id, ['LeFou - Instigator']);
        harness.setInk(harness.p1Id, 10);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const lefou = p1.hand[0];

        // Execute: Play LeFou
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: lefou.instanceId
        } as any);

        // Verify: LeFou is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play.length).toBe(1);
        expect(p1After.play[0].name).toBe('LeFou');
    });
});
