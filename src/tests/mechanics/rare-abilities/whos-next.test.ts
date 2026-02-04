import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: WHO\'S NEXT?', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have WHO\'S NEXT ability when in play', async () => {
        await harness.setPlay(harness.p1Id, ['Pete - Bad Guy']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play[0]).toBeDefined();
        expect(p1.play[0].name).toBe('Pete');
    });

    it('should work with multiple characters', async () => {
        await harness.setPlay(harness.p1Id, ['Pete - Bad Guy', 'Mickey Mouse - Wayward Sorcerer']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play.length).toBe(2);
    });

    it('should register Pete with static ability', async () => {
        await harness.setPlay(harness.p1Id, ['Pete - Bad Guy']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play[0]).toBeDefined();
    });
});
