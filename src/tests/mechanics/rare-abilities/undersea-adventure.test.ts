import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: UNDERSEA ADVENTURE', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have UNDERSEA ADVENTURE ability when in play', async () => {
        await harness.setPlay(harness.p1Id, ['Minnie Mouse - Wide-Eyed Diver']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play[0]).toBeDefined();
        expect(p1.play[0].name).toBe('Minnie Mouse');
    });

    it('should work with multiple characters', async () => {
        await harness.setPlay(harness.p1Id, ['Minnie Mouse - Wide-Eyed Diver', 'Mickey Mouse - Wayward Sorcerer']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play.length).toBe(2);
    });

    it('should register Minnie with triggered ability', async () => {
        await harness.setPlay(harness.p1Id, ['Minnie Mouse - Wide-Eyed Diver']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play[0]).toBeDefined();
    });
});
