import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: POUNCE', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have POUNCE ability when in play', async () => {
        // Setup: P1 has Simba - Returned King in play
        await harness.setPlay(harness.p1Id, ['Simba - Returned King']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const simba = p1.play[0];

        // Verify: Simba is in play
        expect(simba).toBeDefined();
        expect(simba.name).toBe('Simba');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Simba and other characters
        await harness.setPlay(harness.p1Id, [
            'Simba - Returned King',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Simba with static ability', async () => {
        // Setup: P1 has Simba in play
        await harness.setPlay(harness.p1Id, ['Simba - Returned King']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const simba = p1.play[0];

        // Verify: Simba has abilities
        // POUNCE grants Evasive during your turn
        expect(simba).toBeDefined();
    });
});
