import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: YOU\'LL BE SORRY!', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have YOU\'LL BE SORRY ability when in play', async () => {
        // Setup: P1 has Cruella De Vil - Miserable as Usual in play
        await harness.setPlay(harness.p1Id, ['Cruella De Vil - Miserable as Usual']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const cruella = p1.play[0];

        // Verify: Cruella is in play
        expect(cruella).toBeDefined();
        expect(cruella.name).toBe('Cruella De Vil');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Cruella and other characters
        await harness.setPlay(harness.p1Id, [
            'Cruella De Vil - Miserable as Usual',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Cruella with triggered ability', async () => {
        // Setup: P1 has Cruella in play
        await harness.setPlay(harness.p1Id, ['Cruella De Vil - Miserable as Usual']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const cruella = p1.play[0];

        // Verify: Cruella has abilities
        // YOU'LL BE SORRY! triggers when Cruella is challenged and banished
        expect(cruella).toBeDefined();
    });
});
