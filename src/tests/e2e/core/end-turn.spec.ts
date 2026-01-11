import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Core Flow - End Turn
 * 
 * Tests ending the turn and passing to opponent.
 */

test.describe('Core Flow: End Turn', () => {

    test('should end turn and pass to opponent', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Verify it's player 1's turn initially
        await gamePage.page.waitForSelector('text=/Your Turn/i');

        // Click End Turn
        await gamePage.endTurn();

        // Wait for turn to pass
        await gamePage.page.waitForTimeout(2000);

        // Turn should now be opponent's (or back to player after bot turn)
        await gamePage.expectLogMessage(/end.*turn|pass/i);
    });

    test('should ready characters at start of next turn', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Add a character and exert it via questing
        await gamePage.addCardToPlay('Mickey Mouse - Brave Little Tailor', 1, true);
        await gamePage.page.waitForTimeout(500);

        // Quest to exert
        await gamePage.clickCardInPlay('Mickey Mouse');
        await gamePage.clickAction('Quest');
        await gamePage.page.waitForTimeout(500);

        // End turn
        await gamePage.endTurn();

        // Wait for bot turn to complete
        await gamePage.page.waitForTimeout(3000);

        // On our next turn, character should be ready again
        // Click character - Quest should now be available
        await gamePage.clickCardInPlay('Mickey Mouse');

        const questButton = gamePage.page.locator('button:has-text("Quest")');
        await expect(questButton).toBeVisible();
        await expect(questButton).toBeEnabled();
    });

});
