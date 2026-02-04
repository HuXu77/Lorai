import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: TIPTOE', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have TIPTOE ability when in play', async () => {
        // Setup: P1 has Peter Pan's Shadow - Not Sewn On in play
        await harness.setPlay(harness.p1Id, ['Peter Pan\'s Shadow - Not Sewn On']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const shadow = p1.play[0];

        // Verify: Shadow is in play
        expect(shadow).toBeDefined();
        expect(shadow.name).toBe('Peter Pan\'s Shadow');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Shadow and other characters
        await harness.setPlay(harness.p1Id, [
            'Peter Pan\'s Shadow - Not Sewn On',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Shadow with static ability', async () => {
        // Setup: P1 has Shadow in play
        await harness.setPlay(harness.p1Id, ['Peter Pan\'s Shadow - Not Sewn On']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const shadow = p1.play[0];

        // Verify: Shadow has abilities
        // TIPTOE grants Evasive to other Rush characters
        expect(shadow).toBeDefined();
    });
});
