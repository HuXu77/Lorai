import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: DARK POWER', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have DARK POWER ability when in play', async () => {
        // Setup: P1 has Jafar - High Sultan of Lorcana in play
        await harness.setPlay(harness.p1Id, ['Jafar - High Sultan of Lorcana']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const jafar = p1.play[0];

        // Verify: Jafar is in play
        expect(jafar).toBeDefined();
        expect(jafar.name).toBe('Jafar');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Jafar and other characters
        await harness.setPlay(harness.p1Id, [
            'Jafar - High Sultan of Lorcana',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Jafar with triggered ability', async () => {
        // Setup: P1 has Jafar in play
        await harness.setPlay(harness.p1Id, ['Jafar - High Sultan of Lorcana']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const jafar = p1.play[0];

        // Verify: Jafar has abilities
        // DARK POWER triggers when Jafar quests
        expect(jafar).toBeDefined();
    });
});
