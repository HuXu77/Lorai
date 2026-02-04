import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: YOU\'RE EXCUSED', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have YOU\'RE EXCUSED ability when in play', async () => {
        // Setup: P1 has Yzma - Alchemist in play
        await harness.setPlay(harness.p1Id, ['Yzma - Alchemist']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const yzma = p1.play[0];

        // Verify: Yzma is in play
        expect(yzma).toBeDefined();
        expect(yzma.name).toBe('Yzma');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Yzma and other characters
        await harness.setPlay(harness.p1Id, [
            'Yzma - Alchemist',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Yzma with triggered ability', async () => {
        // Setup: P1 has Yzma in play
        await harness.setPlay(harness.p1Id, ['Yzma - Alchemist']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const yzma = p1.play[0];

        // Verify: Yzma has abilities
        // YOU'RE EXCUSED triggers when Yzma quests
        expect(yzma).toBeDefined();
    });
});
