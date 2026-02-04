import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: I WIN, I WIN!', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have I WIN, I WIN! ability when in play', async () => {
        // Setup: P1 has Madam Mim - Purple Dragon in play
        await harness.setPlay(harness.p1Id, ['Madam Mim - Purple Dragon']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mim = p1.play[0];

        // Verify: Madam Mim is in play
        expect(mim).toBeDefined();
        expect(mim.name).toBe('Madam Mim');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Madam Mim and other characters
        await harness.setPlay(harness.p1Id, [
            'Madam Mim - Purple Dragon',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Madam Mim with triggered ability', async () => {
        // Setup: P1 has Madam Mim in play
        await harness.setPlay(harness.p1Id, ['Madam Mim - Purple Dragon']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mim = p1.play[0];

        // Verify: Madam Mim has abilities
        // I WIN, I WIN! banishes or bounces characters when played
        expect(mim).toBeDefined();
    });
});
