// import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../engine-test-utils';
import { ZoneType } from '../../engine/models';

describe('Location Lore Mechanics', () => {
    let testHarness: TestHarness;

    beforeEach(async () => {
        testHarness = new TestHarness();
        await testHarness.initGame([], []);
    });

    it('should grant lore from locations at start of turn', () => {
        const p1 = testHarness.getPlayer(testHarness.p1Id);

        // Create a Location with 1 Lore
        const location = testHarness.createCard(p1, {
            name: 'The Queen\'s Castle',
            cost: 4,
            inkable: true,
            type: 'Location',
            lore: 1, // Base lore
            willpower: 4,
            moveCost: 1
        });

        // Put in play
        p1.play.push(location);
        location.zone = ZoneType.Play;

        // Initial lore
        p1.lore = 0;

        // Start turn (Set Phase triggers)
        // We'll manually invoke the start turn logic or setPhase logic using turnManager
        // Since setPhase is private/protected or part of startTurn, let's call startTurn
        // But passTurn calls startTurn for next player.

        // Simulate start of P1 turn
        testHarness.turnManager.startTurn(p1.id);

        // Verify lore gain
        expect(p1.lore).toBe(1);

        // Verify log (optional, but good for debugging)
        // expect(testHarness.logger.logs).toContain... 
    });

    it('should use modified lore for locations', () => {
        const p1 = testHarness.getPlayer(testHarness.p1Id);

        // Create a Location with 1 Lore
        const location = testHarness.createCard(p1, {
            name: 'Generic Location',
            cost: 4,
            inkable: true,
            type: 'Location',
            lore: 1,
            willpower: 4,
            moveCost: 1,
            parsedEffects: [
                {
                    type: 'static',
                    effects: [
                        { type: 'modify_stats', stat: 'lore', amount: 1, target: 'self' }
                    ]
                }
            ]
        });

        p1.play.push(location);
        location.zone = ZoneType.Play;
        p1.lore = 0;

        // Ensure static effects are calculated
        testHarness.turnManager.recalculateEffects();

        // Start turn
        expect(location.lore).toBe(2);
        testHarness.turnManager.startTurn(p1.id);

        // Verify lore gain (1 base + 1 buff = 2)
        expect(p1.lore).toBe(2);
    });
});
