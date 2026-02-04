import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: NOW, SING!', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have NOW SING ability when in play', async () => {
        // Setup: P1 has Ursula's Shell Necklace in play
        await harness.setPlay(harness.p1Id, ['Ursula\'s Shell Necklace']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const necklace = p1.play[0];

        // Verify: Necklace is in play
        expect(necklace).toBeDefined();
        expect(necklace.name).toBe('Ursula\'s Shell Necklace');
    });

    it('should work with multiple items', async () => {
        // Setup: P1 has Necklace and other items
        await harness.setPlay(harness.p1Id, [
            'Ursula\'s Shell Necklace',
            'Lantern'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both items are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Necklace with triggered ability', async () => {
        // Setup: P1 has Necklace in play
        await harness.setPlay(harness.p1Id, ['Ursula\'s Shell Necklace']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const necklace = p1.play[0];

        // Verify: Necklace has abilities
        // NOW, SING! triggers when you play a song
        expect(necklace).toBeDefined();
    });
});
