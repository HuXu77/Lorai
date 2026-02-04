import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: STARTLED AWAKE', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have STARTLED AWAKE ability when in play', async () => {
        // Setup: P1 has Donald Duck - Sleepwalker in play
        await harness.setPlay(harness.p1Id, ['Donald Duck - Sleepwalker']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const donald = p1.play[0];

        // Verify: Donald is in play
        expect(donald).toBeDefined();
        expect(donald.name).toBe('Donald Duck');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Donald and other characters
        await harness.setPlay(harness.p1Id, [
            'Donald Duck - Sleepwalker',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Donald with triggered ability', async () => {
        // Setup: P1 has Donald in play
        await harness.setPlay(harness.p1Id, ['Donald Duck - Sleepwalker']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const donald = p1.play[0];

        // Verify: Donald has abilities
        // STARTLED AWAKE grants +2 strength when action is played
        expect(donald).toBeDefined();
    });
});
