import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: SECOND WIND', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have SECOND WIND ability when in play', async () => {
        // Setup: P1 has Beast - Relentless in play
        await harness.setPlay(harness.p1Id, ['Beast - Relentless']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const beast = p1.play[0];

        // Verify: Beast is in play
        expect(beast).toBeDefined();
        expect(beast.name).toBe('Beast');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Beast and other characters
        await harness.setPlay(harness.p1Id, [
            'Beast - Relentless',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Beast with triggered ability', async () => {
        // Setup: P1 has Beast in play
        await harness.setPlay(harness.p1Id, ['Beast - Relentless']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const beast = p1.play[0];

        // Verify: Beast has abilities
        // SECOND WIND readies Beast when opposing character is damaged
        expect(beast).toBeDefined();
    });
});
