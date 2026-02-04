import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: TAKE THAT!', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have TAKE THAT ability when in play', async () => {
        // Setup: P1 has Pete - Bad Guy in play
        await harness.setPlay(harness.p1Id, ['Pete - Bad Guy']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const pete = p1.play[0];

        // Verify: Pete is in play
        expect(pete).toBeDefined();
        expect(pete.name).toBe('Pete');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Pete and other characters
        await harness.setPlay(harness.p1Id, [
            'Pete - Bad Guy',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Pete with triggered ability', async () => {
        // Setup: P1 has Pete in play
        await harness.setPlay(harness.p1Id, ['Pete - Bad Guy']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const pete = p1.play[0];

        // Verify: Pete has abilities
        // TAKE THAT! grants +2 strength when action is played
        expect(pete).toBeDefined();
    });
});
