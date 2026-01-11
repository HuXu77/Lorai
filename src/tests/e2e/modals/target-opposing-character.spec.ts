import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - TARGET_OPPOSING_CHARACTER
 * 
 * Tests the targeting modal for "chosen opposing character" abilities.
 * Example: "Deal 2 damage to chosen opposing character"
 */

test.describe('Modal: Target Opposing Character', () => {

    test('should show modal with only opponent characters as options', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Add opponent character (exerted so can be targeted)
        await gamePage.addCardToPlay('Mickey Mouse - Brave Little Tailor', 2, false);

        // Add own character (should NOT appear in opposing targeting)
        await gamePage.addCardToPlay('Stitch - Carefree Surfer', 1, true);

        // Add The Queen who has targeting ability on quest
        // "Whenever this character quests, chosen opposing character gets -4 Strength"
        await gamePage.addCardToPlay('The Queen - Commanding Presence', 1, true);

        await gamePage.page.waitForTimeout(500);

        // Quest with The Queen to trigger opposing target
        await gamePage.clickCardInPlay('The Queen');
        await gamePage.clickAction('Quest');

        // Modal should appear
        const modal = await gamePage.expectModal();
        await expect(modal).toBeVisible();

        // Should show opponent's Mickey, NOT our Stitch
        await expect(modal).toContainText(/Mickey/i);
    });

    test('should only allow selecting opposing characters', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup
        await gamePage.addCardToPlay('Mickey Mouse - Brave Little Tailor', 2, false);
        await gamePage.addCardToPlay('The Queen - Commanding Presence', 1, true);
        await gamePage.page.waitForTimeout(500);

        // Trigger ability
        await gamePage.clickCardInPlay('The Queen');
        await gamePage.clickAction('Quest');

        // Wait for modal
        await gamePage.expectModal();

        // Select opposing character
        await gamePage.selectModalOption('Mickey');

        // Wait for effect
        await gamePage.page.waitForTimeout(1000);

        // Verify effect applied
        await gamePage.expectLogMessage(/-4|strength|Mickey/i);
    });

});
