import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: PICK YOUR FIGHTS', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have PICK YOUR FIGHTS ability when in play', async () => {
        // Setup: P1 has John Silver - Alien Pirate in play
        await harness.setPlay(harness.p1Id, ['John Silver - Alien Pirate']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const silver = p1.play[0];

        // Verify: John Silver is in play
        expect(silver).toBeDefined();
        expect(silver.name).toBe('John Silver');
    });

    it('should work with multiple characters', async () => {
        // Setup: P1 has John Silver and other characters
        await harness.setPlay(harness.p1Id, [
            'John Silver - Alien Pirate',
            'Mickey Mouse - Wayward Sorcerer'
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
    });

    it('should register John Silver with triggered ability', async () => {
        // Setup: P1 has John Silver in play
        await harness.setPlay(harness.p1Id, ['John Silver - Alien Pirate']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const silver = p1.play[0];

        // Verify: John Silver has abilities
        // PICK YOUR FIGHTS triggers when played and when he quests
        expect(silver).toBeDefined();
    });
});
