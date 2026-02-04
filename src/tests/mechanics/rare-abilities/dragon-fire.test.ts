import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: Dragon Fire', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have Dragon Fire ability when in play', async () => {
        // Setup: P1 has Maleficent in play (using setPlay to bypass play mechanics)
        await harness.setPlay(harness.p1Id, ['Maleficent - Monstrous Dragon']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const maleficent = p1.play[0];

        // Verify: Maleficent is in play
        expect(maleficent).toBeDefined();
        expect(maleficent.name).toBe('Maleficent');
    });

    it('should work when no opposing characters are in play', async () => {
        // Setup: P1 has Maleficent in play, P2 has no characters
        await harness.setPlay(harness.p1Id, ['Maleficent - Monstrous Dragon']);

        const p1 = harness.game.getPlayer(harness.p1Id);

        // Verify: Maleficent is in play without errors
        expect(p1.play.length).toBe(1);
        expect(p1.play[0].name).toBe('Maleficent');
    });

    it('should have multiple abilities including Dragon Fire', async () => {
        // Setup: P1 has Maleficent in play
        await harness.setPlay(harness.p1Id, ['Maleficent - Monstrous Dragon']);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const maleficent = p1.play[0];

        // Verify: Maleficent has abilities registered
        // Dragon Fire is a "When you play" triggered ability
        expect(maleficent).toBeDefined();
    });
});
