import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Mechanic: Reckless', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should allow non-Reckless characters to quest normally', async () => {
        // Setup: P1 has Mickey (no Reckless) in play
        await harness.setPlay(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer']);
        harness.setInk(harness.p1Id, 0);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mickey = p1.play[0];
        mickey.ready = true;

        const loreBefore = p1.lore;

        // Quest with non-Reckless character
        const result = await harness.turnManager.resolveAction({
            type: 'Quest' as any,
            playerId: harness.p1Id,
            cardId: mickey.instanceId
        } as any);

        // Verify: Quest should succeed
        expect(result).toBe(true);
        expect(p1.lore).toBe(loreBefore + mickey.lore);
    });

    it('should register Reckless characters in play', async () => {
        // Setup: P1 has Gaston - Arrogant Hunter (Reckless) in play
        await harness.setPlay(harness.p1Id, ['Gaston - Arrogant Hunter']); // Reckless
        harness.setInk(harness.p1Id, 0);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const gaston = p1.play[0];

        // Verify: Character is in play
        expect(gaston).toBeDefined();
        expect(gaston.name).toBe('Gaston');
    });

    it('should handle multiple characters with and without Reckless', async () => {
        // Setup: P1 has both Reckless and non-Reckless characters
        await harness.setPlay(harness.p1Id, [
            'Gaston - Arrogant Hunter', // Reckless
            'Mickey Mouse - Wayward Sorcerer' // No Reckless
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Both characters are in play
        expect(p1.play.length).toBe(2);
        expect(p1.play[0].name).toBe('Gaston');
        expect(p1.play[1].name).toBe('Mickey Mouse');
    });
});
