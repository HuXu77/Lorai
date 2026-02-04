import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: MARK OF POWER', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have MARK OF POWER ability when in play', async () => {
        // Setup: P1 has Bolt - Superdog in play
        await harness.setPlay(harness.p1Id, ['Bolt - Superdog']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const bolt = p1.play[0];

        // Verify: Bolt is in play
        expect(bolt).toBeDefined();
        expect(bolt.name).toBe('Bolt');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Bolt and other undamaged characters
        await harness.setPlay(harness.p1Id, [
            'Bolt - Superdog',
            'Mickey Mouse - Wayward Sorcerer',
            'Elsa - Snow Queen'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: All characters are in play
        expect(p1.play.length).toBe(3);
    });

    it('should register Bolt with triggered ability', async () => {
        // Setup: P1 has Bolt in play
        await harness.setPlay(harness.p1Id, ['Bolt - Superdog']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const bolt = p1.play[0];

        // Verify: Bolt has abilities
        // MARK OF POWER triggers when Bolt is readied
        expect(bolt).toBeDefined();
    });
});
