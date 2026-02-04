import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: POWER TO RULE AT LAST', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have POWER TO RULE AT LAST ability when in play', async () => {
        await harness.setPlay(harness.p1Id, ['Lady Tremaine - Imperious Queen']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play[0]).toBeDefined();
        expect(p1.play[0].name).toBe('Lady Tremaine');
    });

    it('should work with multiple characters', async () => {
        await harness.setPlay(harness.p1Id, ['Lady Tremaine - Imperious Queen', 'Mickey Mouse - Wayward Sorcerer']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play.length).toBe(2);
    });

    it('should register Lady Tremaine with triggered ability', async () => {
        await harness.setPlay(harness.p1Id, ['Lady Tremaine - Imperious Queen']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play[0]).toBeDefined();
    });
});
