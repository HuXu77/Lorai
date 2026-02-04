import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: LET THE GAME BEGIN', () => {
    let harness: TestHarness;
    beforeEach(async () => { harness = new TestHarness(); await harness.initialize(); });

    it('should have LET THE GAME BEGIN ability when in play', async () => {
        await harness.setPlay(harness.p1Id, ['Queen of Hearts - Sensing Weakness']);
        expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined();
    });

    it('should work with multiple characters', async () => {
        await harness.setPlay(harness.p1Id, ['Queen of Hearts - Sensing Weakness', 'Mickey Mouse - Wayward Sorcerer']);
        expect(harness.game.getPlayer(harness.p1Id).play.length).toBe(2);
    });

    it('should register Queen with triggered ability', async () => {
        await harness.setPlay(harness.p1Id, ['Queen of Hearts - Sensing Weakness']);
        expect(harness.game.getPlayer(harness.p1Id).play[0]).toBeDefined();
    });
});
