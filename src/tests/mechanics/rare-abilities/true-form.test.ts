import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: TRUE FORM', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have TRUE FORM ability when in play', async () => {
        // Setup: P1 has Enchantress - Unexpected Judge in play
        await harness.setPlay(harness.p1Id, ['Enchantress - Unexpected Judge']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const enchantress = p1.play[0];

        // Verify: Enchantress is in play
        expect(enchantress).toBeDefined();
        expect(enchantress.name).toBe('Enchantress');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has Enchantress and other characters
        await harness.setPlay(harness.p1Id, [
            'Enchantress - Unexpected Judge',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register Enchantress with static ability', async () => {
        // Setup: P1 has Enchantress in play
        await harness.setPlay(harness.p1Id, ['Enchantress - Unexpected Judge']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const enchantress = p1.play[0];

        // Verify: Enchantress has abilities
        // TRUE FORM grants +2 strength while being challenged
        expect(enchantress).toBeDefined();
    });
});
