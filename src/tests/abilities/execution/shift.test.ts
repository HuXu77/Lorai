/**
 * Shift Execution Tests
 * 
 * Tests the execution of the Shift mechanic (Chapter 1 rules).
 * Shift allows playing a character on top of another character with the same name
 * for an alternative cost.
 */

import { SharedTestFixture } from '../../test-fixtures';
import { TestHarness } from '../../engine-test-utils';
import { ActionType } from '../../../engine/models';

describe('Shift Execution', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should shift a character onto a valid target', async () => {
        await harness.initGame(['Aladdin - Heroic Outlaw', 'Aladdin - Street Rat'], []);
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Setup: Base Aladdin in Play
        harness.setPlay(harness.p1Id, ['Aladdin - Street Rat'], false);
        const streetRat = p1.play[0];

        // Setup: Shift Aladdin in Hand
        harness.setHand(harness.p1Id, ['Aladdin - Heroic Outlaw']);
        const heroicOutlaw = p1.hand[0];

        // Set Ink to 5 (Shift cost) vs 7 (Normal cost)
        harness.setInk(harness.p1Id, 5);

        // MOCK: Ensure 'Shift 5' is recognized if parser fails
        // Providing the logic structure expected by PlayCard
        if (!heroicOutlaw.parsedEffects) heroicOutlaw.parsedEffects = [];
        heroicOutlaw.parsedEffects.push({
            action: 'keyword_shift', // REQUIRED by PlayCard logic
            amount: 5,               // REQUIRED by PlayCard logic
            type: 'static',
            keyword: 'Shift',
            value: 5,
            rawText: "Shift 5 (You may pay 5 ⬡ to play this on top of one of your characters named Aladdin.)"
        } as any);

        const result = await harness.turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: harness.p1Id,
            cardId: heroicOutlaw.instanceId,
            shiftTargetId: streetRat.instanceId
        });

        expect(result).toBe(true);

        // Verify Board State
        // Should have 1 card in play (Heroic Outlaw)
        expect(p1.play.length).toBe(1);
        const shiftedChar = p1.play[0];

        expect(shiftedChar.fullName).toBe('Aladdin - Heroic Outlaw');
        expect(shiftedChar.instanceId).toBe(heroicOutlaw.instanceId); // Instance ID updates to new card? Or wrapper?
        // In Lorcana engine, usually the top card replaces the bottom card object in the array?
        // Or PlayCard removes bottom and adds top?
        // Let's verify instance ID match.

        // Verify Ink Used (5)
        const readyInk = p1.inkwell.filter(c => c.ready).length;
        expect(readyInk).toBe(0); // 5 - 5 = 0
    });

    it('should inherit state from the shifted-on character', async () => {
        await harness.initGame(['Aladdin - Heroic Outlaw', 'Aladdin - Street Rat'], []);
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Setup: Base Aladdin (Exerted, Damaged, Dry?)
        harness.setPlay(harness.p1Id, ['Aladdin - Street Rat'], false);
        const streetRat = p1.play[0];

        // Modify state
        streetRat.ready = false; // Exerted
        streetRat.damage = 2;    // Damaged
        streetRat.turnPlayed = 0; // Can quest (not dry) - Shifted char should also be able to quest

        harness.setHand(harness.p1Id, ['Aladdin - Heroic Outlaw']);
        const heroicOutlaw = p1.hand[0];
        harness.setInk(harness.p1Id, 5);

        // MOCK Shift
        if (!heroicOutlaw.parsedEffects) heroicOutlaw.parsedEffects = [];
        heroicOutlaw.parsedEffects.push({
            action: 'keyword_shift',
            amount: 5,
            type: 'static',
            keyword: 'Shift',
            value: 5
        } as any);

        // Shift
        const result = await harness.turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: harness.p1Id,
            cardId: heroicOutlaw.instanceId,
            shiftTargetId: streetRat.instanceId
        });

        expect(result).toBe(true); // Must succeed

        const shiftedChar = p1.play[0];
        expect(shiftedChar.fullName).toBe('Aladdin - Heroic Outlaw'); // Ensure it actually shifted

        // Verify Inheritance
        expect(shiftedChar.ready).toBe(false); // Validated Exerted inheritance
        expect(shiftedChar.damage).toBe(2);    // Validated Damage inheritance
        expect(shiftedChar.turnPlayed).toBe(0); // Validated TurnPlayed (no summoning sickness)
    });
});
