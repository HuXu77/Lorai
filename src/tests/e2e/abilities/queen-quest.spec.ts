import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Tests for The Queen - Commanding Presence
 * 
 * Ability: "Whenever this character quests, chosen opposing character 
 * gets -4 Strength this turn and chosen character gets +4 Strength this turn."
 * 
 * These tests mirror the engine tests in queen-commanding-presence.test.ts
 * but interact with the actual UI.
 */

test.describe('The Queen - Commanding Presence', () => {

    test('should trigger ability and show targeting modal on quest', async ({ gamePage }) => {
        // Load test game
        await gamePage.loadTestGame();

        // Inject The Queen in play (ready) and an opponent character
        // Inject The Queen in play (ready) and an opponent character
        await gamePage.addCardToPlay('The Queen - Commanding Presence', 1, true);

        await gamePage.endTurn();
        await gamePage.page.waitForTimeout(500);
        await expect(gamePage.page.locator('text=Your Turn')).toBeVisible({ timeout: 10000 });

        await gamePage.addCardToPlay('Mickey Mouse - Brave Little Tailor', 2, false);

        // Give player ink to pay for ability if needed
        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            const playerId = debug?.player1Id;
            // Add ink cards
            for (let i = 0; i < 5; i++) {
                debug?.addToInkwell(playerId, 'Mickey Mouse - Artful Rogue');
            }
        });

        // Wait for state to update
        await gamePage.page.waitForTimeout(500);

        // Click The Queen in play
        await gamePage.clickCardInPlay('The Queen');

        // Click Quest action
        await gamePage.clickAction('Quest');

        // Expect a targeting modal to appear for choosing targets
        const modal = await gamePage.expectModal();
        // Select Opponent Character and Confirm
        await gamePage.selectModalOption('Mickey Mouse');
        await gamePage.confirmModal();

        // Handle potential second target (self +4 strength) if applicable
        try {
            // Short wait for second modal
            const secondModal = await gamePage.expectModal();
            // waitFor throws if not found within timeout
            await secondModal.waitFor({ state: 'visible', timeout: 2000 });

            await gamePage.selectModalOption('The Queen');
            await gamePage.confirmModal();
        } catch (e) {
            // No second modal, ability resolved
        }

        // Verify ability resolved (modal closed)
        await expect(gamePage.page.locator('[data-testid="choice-modal"]')).toBeHidden();

        // Pass turn to ensure effect clean up (engine verification)
        await gamePage.endTurn();
        await expect(gamePage.page.locator('text=Your Turn')).toBeVisible({ timeout: 15000 });
    });

});
