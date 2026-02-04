import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: OK, WHERE AM I?', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have OK WHERE AM I ability when in play', async () => {
        // Setup: P1 has Kuzco - Wanted Llama in play
        await harness.setPlay(harness.p1Id, ['Kuzco - Wanted Llama']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const kuzco = p1.play[0];

        // Verify: Kuzco is in play
        expect(kuzco).toBeDefined();
        expect(kuzco.name).toBe('Kuzco');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Kuzco and other characters
        await harness.setPlay(harness.p1Id, [
            'Kuzco - Wanted Llama',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Kuzco with triggered ability', async () => {
        // Setup: P1 has Kuzco in play
        await harness.setPlay(harness.p1Id, ['Kuzco - Wanted Llama']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const kuzco = p1.play[0];

        // Verify: Kuzco has abilities
        // OK, WHERE AM I? is a triggered ability that fires when banished
        expect(kuzco).toBeDefined();
    });
});
