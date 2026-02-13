import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../engine-test-utils';

describe('Bug: Lady - Decisive Dog (PACK OF HER OWN)', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should only trigger when YOU play a character, not when opponent plays', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        // Setup: P1 has Lady - Decisive Dog in play
        await harness.setPlay(harness.p1Id, ['Lady - Decisive Dog']);
        const lady = p1.play[0];

        // Verify initial state
        expect(lady.name).toBe('Lady');
        expect(lady.strength).toBe(0); // Base strength is 0

        // P1 plays a character - should trigger Lady's ability
        await harness.setInk(harness.p1Id, 10);
        await harness.setHand(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer']);
        const mickey = p1.hand[0];

        await harness.playCard(p1, mickey);
        harness.turnManager.recalculateEffects();

        // Lady should now have +1 strength this turn
        expect(lady.strength).toBe(1); // 0 base + 1 from ability

        // Effects are temporary and last until end of turn
        // For this test, we'll just verify the ability triggered correctly
        // In a real game, effects would be cleared at end of turn

        // Now P2's turn - opponent plays a character
        await harness.setInk(harness.p2Id, 10);
        await harness.setHand(harness.p2Id, ['Pongo - Determined Father']);
        const pongo = p2.hand[0];

        // Record Lady's strength before opponent plays
        const ladyStrengthBeforeOpponentPlay = lady.strength; // Should be 1

        await harness.playCard(p2, pongo);
        harness.turnManager.recalculateEffects();

        // BUG FIX: Lady should NOT get an additional +1 strength when opponent plays
        // Lady's ability says "Whenever YOU play a character"
        // She should still have the same strength as before (1 from P1's play)
        expect(lady.strength).toBe(ladyStrengthBeforeOpponentPlay); // Should remain at 1, not increase to 2
    });

    it('should trigger multiple times when you play multiple characters', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Setup: P1 has Lady in play
        await harness.setPlay(harness.p1Id, ['Lady - Decisive Dog']);
        const lady = p1.play[0];

        expect(lady.strength).toBe(0);

        // Play first character
        await harness.setInk(harness.p1Id, 10);
        await harness.setHand(harness.p1Id, [
            'Mickey Mouse - Wayward Sorcerer',
            'Pongo - Determined Father'
        ]);

        await harness.playCard(p1, p1.hand[0]);
        harness.turnManager.recalculateEffects();
        expect(lady.strength).toBe(1); // +1 from first character

        // Play second character
        await harness.playCard(p1, p1.hand[0]);
        harness.turnManager.recalculateEffects();
        expect(lady.strength).toBe(2); // +1 from first, +1 from second
    });

    it('should apply +1 strength to Lady herself, not other characters', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Setup: P1 has Lady and another character in play
        await harness.setPlay(harness.p1Id, [
            'Lady - Decisive Dog',
            'Mickey Mouse - Wayward Sorcerer'
        ]);
        const lady = p1.play[0];
        const mickey = p1.play[1];

        const ladyInitialStrength = lady.strength;
        const mickeyInitialStrength = mickey.strength;

        // Play a third character
        await harness.setInk(harness.p1Id, 10);
        await harness.setHand(harness.p1Id, ['Pongo - Determined Father']);

        await harness.playCard(p1, p1.hand[0]);
        harness.turnManager.recalculateEffects();

        // Only Lady should get +1 strength
        expect(lady.strength).toBe(ladyInitialStrength + 1);
        expect(mickey.strength).toBe(mickeyInitialStrength); // No change
    });
});
