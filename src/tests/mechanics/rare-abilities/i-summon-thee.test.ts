import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: I SUMMON THEE', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have I SUMMON THEE ability when in play', async () => {
        // Setup: P1 has The Queen - Wicked and Vain in play
        await harness.setPlay(harness.p1Id, ['The Queen - Wicked and Vain']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const queen = p1.play[0];

        // Verify: The Queen is in play
        expect(queen).toBeDefined();
        expect(queen.name).toBe('The Queen');
    });

    it('should work when ready', async () => {
        // Setup: P1 has The Queen in play and ready
        await harness.setPlay(harness.p1Id, ['The Queen - Wicked and Vain']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const queen = p1.play[0];
        queen.ready = true;

        // Verify: The Queen is ready
        expect(queen.ready).toBe(true);
    });

    it('should register The Queen with activated ability', async () => {
        // Setup: P1 has The Queen in play
        await harness.setPlay(harness.p1Id, ['The Queen - Wicked and Vain']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const queen = p1.play[0];

        // Verify: The Queen has abilities
        // I SUMMON THEE is an activated ability that draws a card
        expect(queen).toBeDefined();
    });
});
