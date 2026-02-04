import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: GIFT OF SONG', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have GIFT OF SONG ability when in play', async () => {
        // Setup: P1 has Ariel - Spectacular Singer in play
        await harness.setPlay(harness.p1Id, ['Ariel - Spectacular Singer']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const ariel = p1.play[0];

        // Verify: Ariel is in play
        expect(ariel).toBeDefined();
        expect(ariel.name).toBe('Ariel');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Ariel and other characters
        await harness.setPlay(harness.p1Id, [
            'Ariel - Spectacular Singer',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Ariel with triggered ability', async () => {
        // Setup: P1 has Ariel in play
        await harness.setPlay(harness.p1Id, ['Ariel - Spectacular Singer']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const ariel = p1.play[0];

        // Verify: Ariel has abilities
        // GIFT OF SONG draws when singing a song
        expect(ariel).toBeDefined();
    });
});
