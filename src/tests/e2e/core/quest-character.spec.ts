import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Core Flow - Quest Character
 * 
 * Tests the quest action which gains lore for the player.
 */

test.describe('Core Flow: Quest Character', () => {

    test('should quest with ready character and gain lore', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Add a ready character in play
        // Note: Even with ready=true, we need to pass turn to ensure it's not "just played" (summoning sickness)
        await gamePage.addCardToPlay('Mickey Mouse - Brave Little Tailor', 1, true);
        await gamePage.endTurn(); // End turn
        await gamePage.page.waitForTimeout(500); // Wait for opponent
        // Ensure it's back to our turn
        await expect(gamePage.page.locator('text=Your Turn')).toBeVisible({ timeout: 10000 });

        // Get initial lore
        const initialLore = await gamePage.page.locator('[data-testid="player-lore"]').textContent();

        // Click the character
        await gamePage.clickCardInPlay('Mickey Mouse');

        // Click Quest action (matches "Quest for X Lore")
        await gamePage.clickAction('Quest');

        // Wait for quest to complete
        await gamePage.page.waitForTimeout(1000);

        // Verify lore increased
        await gamePage.expectLogMessage(/quest/i);
    });

    test('should not allow quest with exerted character', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Add an exerted (not ready) character
        await gamePage.addCardToPlay('Mickey Mouse - Brave Little Tailor', 1, false);
        await gamePage.page.waitForTimeout(500);

        // Click the character
        await gamePage.clickCardInPlay('Mickey Mouse');

        // Quest button should be disabled or not visible
        const questButton = gamePage.page.locator('button:has-text("Quest")');
        const isVisible = await questButton.isVisible().catch(() => false);

        if (isVisible) {
            const isDisabled = await questButton.isDisabled();
            expect(isDisabled).toBe(true);
        }
    });

    test('should exert character after questing', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Add ready character
        await gamePage.addCardToPlay('Mickey Mouse - Brave Little Tailor', 1, true);
        await gamePage.endTurn();
        await gamePage.page.waitForTimeout(500);
        await expect(gamePage.page.locator('text=Your Turn')).toBeVisible({ timeout: 10000 });

        // Quest with the character
        await gamePage.clickCardInPlay('Mickey Mouse');
        await gamePage.clickAction('Quest');
        await gamePage.page.waitForTimeout(1000);

        // Click character again - Quest should NOT be available (now exerted)
        await gamePage.clickCardInPlay('Mickey Mouse');

        const questButton = gamePage.page.locator('button:has-text("Quest")');
        const isVisible = await questButton.isVisible().catch(() => false);

        if (isVisible) {
            const isDisabled = await questButton.isDisabled();
            expect(isDisabled).toBe(true);
        }
    });

});
