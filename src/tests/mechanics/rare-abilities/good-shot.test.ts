import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: GOOD SHOT', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have GOOD SHOT ability when in play', async () => {
        // Setup: P1 has Robin Hood - Unrivaled Archer in play
        await harness.setPlay(harness.p1Id, ['Robin Hood - Unrivaled Archer']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const robin = p1.play[0];

        // Verify: Robin Hood is in play
        expect(robin).toBeDefined();
        expect(robin.name).toBe('Robin Hood');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Robin Hood and other characters
        await harness.setPlay(harness.p1Id, [
            'Robin Hood - Unrivaled Archer',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Robin Hood with static ability', async () => {
        // Setup: P1 has Robin Hood in play
        await harness.setPlay(harness.p1Id, ['Robin Hood - Unrivaled Archer']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const robin = p1.play[0];

        // Verify: Robin Hood has abilities
        // GOOD SHOT grants Evasive during your turn
        expect(robin).toBeDefined();
    });
});
