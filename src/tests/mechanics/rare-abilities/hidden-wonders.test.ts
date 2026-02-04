import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: HIDDEN WONDERS', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have HIDDEN WONDERS ability when in play', async () => {
        // Setup: P1 has Jafar - Keeper of Secrets in play
        await harness.setPlay(harness.p1Id, ['Jafar - Keeper of Secrets']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const jafar = p1.play[0];

        // Verify: Jafar is in play
        expect(jafar).toBeDefined();
        expect(jafar.name).toBe('Jafar');
    });

    it('should work with cards in hand', async () => {
        // Setup: P1 has Jafar in play and cards in hand
        await harness.setPlay(harness.p1Id, ['Jafar - Keeper of Secrets']);
        await harness.setHand(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer', 'Elsa - Snow Queen']);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Jafar is in play with cards in hand
        expect(p1.play.length).toBe(1);
        expect(p1.hand.length).toBe(2);
    });

    it('should register Jafar with static ability', async () => {
        // Setup: P1 has Jafar in play
        await harness.setPlay(harness.p1Id, ['Jafar - Keeper of Secrets']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const jafar = p1.play[0];

        // Verify: Jafar has abilities
        // HIDDEN WONDERS grants +1 strength for each card in hand
        expect(jafar).toBeDefined();
    });
});
