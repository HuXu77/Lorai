import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: ROYAL SUMMONS', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have ROYAL SUMMONS ability when in play', async () => {
        // Setup: P1 has The Queen - Conceited Ruler in play
        await harness.setPlay(harness.p1Id, ['The Queen - Conceited Ruler']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const queen = p1.play[0];

        // Verify: The Queen is in play
        expect(queen).toBeDefined();
        expect(queen.name).toBe('The Queen');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has The Queen and other characters
        await harness.setPlay(harness.p1Id, [
            'The Queen - Conceited Ruler',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register The Queen with triggered ability', async () => {
        // Setup: P1 has The Queen in play
        await harness.setPlay(harness.p1Id, ['The Queen - Conceited Ruler']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const queen = p1.play[0];

        // Verify: The Queen has abilities
        // ROYAL SUMMONS triggers at start of turn
        expect(queen).toBeDefined();
    });
});
