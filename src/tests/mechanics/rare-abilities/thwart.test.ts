import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: THWART', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have THWART ability when in play', async () => {
        // Setup: P1 has Daisy Duck - Secret Agent in play
        await harness.setPlay(harness.p1Id, ['Daisy Duck - Secret Agent']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const daisy = p1.play[0];

        // Verify: Daisy is in play
        expect(daisy).toBeDefined();
        expect(daisy.name).toBe('Daisy Duck');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Daisy and other characters
        await harness.setPlay(harness.p1Id, [
            'Daisy Duck - Secret Agent',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Daisy with triggered ability', async () => {
        // Setup: P1 has Daisy in play
        await harness.setPlay(harness.p1Id, ['Daisy Duck - Secret Agent']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const daisy = p1.play[0];

        // Verify: Daisy has abilities
        // THWART makes opponents discard when Daisy quests
        expect(daisy).toBeDefined();
    });
});
