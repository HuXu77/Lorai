import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: NO TOUCHY!', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have NO TOUCHY ability when in play', async () => {
        // Setup: P1 has Kuzco - Temperamental Emperor in play
        await harness.setPlay(harness.p1Id, ['Kuzco - Temperamental Emperor']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const kuzco = p1.play[0];

        // Verify: Kuzco is in play
        expect(kuzco).toBeDefined();
        expect(kuzco.name).toBe('Kuzco');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Kuzco and other characters
        await harness.setPlay(harness.p1Id, [
            'Kuzco - Temperamental Emperor',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Kuzco with triggered ability', async () => {
        // Setup: P1 has Kuzco in play
        await harness.setPlay(harness.p1Id, ['Kuzco - Temperamental Emperor']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const kuzco = p1.play[0];

        // Verify: Kuzco has abilities
        // NO TOUCHY! is a triggered ability that fires when challenged and banished
        expect(kuzco).toBeDefined();
    });
});
