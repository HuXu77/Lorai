import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../engine-test-utils';

describe('Bug: Lady - Decisive Dog (Opponent Buff)', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should NOT trigger Opponent\'s Lady when YOU play a character', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        // Setup: P2 (Opponent) has Lady - Decisive Dog in play
        await harness.setPlay(harness.p2Id, ['Lady - Decisive Dog']);
        const opponentLady = p2.play[0];

        // Verify initial state
        expect(opponentLady.name).toBe('Lady');
        expect(opponentLady.strength).toBe(0);

        // P1 (You) plays a character
        await harness.setInk(harness.p1Id, 10);
        await harness.setHand(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer']);
        const mickey = p1.hand[0];

        await harness.playCard(p1, mickey);
        harness.turnManager.recalculateEffects();

        // Opponent's Lady should NOT get +1 strength (because YOU played, not Opponent)
        expect(opponentLady.strength).toBe(0);
    });
});
