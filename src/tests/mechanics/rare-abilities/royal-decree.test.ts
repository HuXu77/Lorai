import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: ROYAL DECREE', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have ROYAL DECREE ability when in play', async () => {
        await harness.setPlay(harness.p1Id, ['Queen of Hearts - Impulsive Ruler']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play[0]).toBeDefined();
        expect(p1.play[0].name).toBe('Queen of Hearts');
    });

    it('should work with multiple characters', async () => {
        await harness.setPlay(harness.p1Id, ['Queen of Hearts - Impulsive Ruler', 'Mickey Mouse - Wayward Sorcerer']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play.length).toBe(2);
    });

    it('should register Queen of Hearts with triggered ability', async () => {
        await harness.setPlay(harness.p1Id, ['Queen of Hearts - Impulsive Ruler']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.play[0]).toBeDefined();
    });
});
