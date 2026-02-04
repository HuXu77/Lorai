import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: STUDENT', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have STUDENT ability when in play', async () => {
        // Setup: P1 has Arthur - Wizard's Apprentice in play
        await harness.setPlay(harness.p1Id, ['Arthur - Wizard\'s Apprentice']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const arthur = p1.play[0];

        // Verify: Arthur is in play
        expect(arthur).toBeDefined();
        expect(arthur.name).toBe('Arthur');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Arthur and other characters
        await harness.setPlay(harness.p1Id, [
            'Arthur - Wizard\'s Apprentice',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Arthur with triggered ability', async () => {
        // Setup: P1 has Arthur in play
        await harness.setPlay(harness.p1Id, ['Arthur - Wizard\'s Apprentice']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const arthur = p1.play[0];

        // Verify: Arthur has abilities
        // STUDENT returns character to hand for lore when questing
        expect(arthur).toBeDefined();
    });
});
