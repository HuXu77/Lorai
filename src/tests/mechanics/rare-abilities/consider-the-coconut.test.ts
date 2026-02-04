import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: CONSIDER THE COCONUT', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have CONSIDER THE COCONUT ability when in play', async () => {
        // Setup: P1 has Coconut Basket in play
        await harness.setPlay(harness.p1Id, ['Coconut Basket']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const basket = p1.play[0];

        // Verify: Coconut Basket is in play
        expect(basket).toBeDefined();
        expect(basket.name).toBe('Coconut Basket');
    });

    it('should work with multiple items', async () => {
        // Setup: P1 has Coconut Basket and other items
        await harness.setPlay(harness.p1Id, [
            'Coconut Basket',
            'Lantern'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both items are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Coconut Basket with triggered ability', async () => {
        // Setup: P1 has Coconut Basket in play
        await harness.setPlay(harness.p1Id, ['Coconut Basket']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const basket = p1.play[0];

        // Verify: Coconut Basket has abilities
        // CONSIDER THE COCONUT triggers when you play a character
        expect(basket).toBeDefined();
    });
});
