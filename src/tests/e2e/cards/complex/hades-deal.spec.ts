import { test, expect } from '../../fixtures/game-fixture';

test.describe('Hades - Looking for a Deal [Complex]', () => {

    test.beforeEach(async ({ gamePage }) => {
        await gamePage.loadTestGame();
        // Wait for auto-mulligan
        await gamePage.page.waitForTimeout(5000);
    });

    test('Ability: Deal with the Devil - Opponent chooses to bottom character', async ({ gamePage }) => {
        // Setup:
        // P1: Hades in hand, 6 ink.
        // P2: Mickey Mouse in play.

        await gamePage.page.evaluate(async () => {
            const debug = (window as any).lorcanaDebug;
            // Clear P1 Hand
            debug.clearHand(debug.player1Id);
            // Add Hades
            debug.addToHand(debug.player1Id, 'Hades - Looking for a Deal');
            // Add Ink
            for (let i = 0; i < 6; i++) {
                debug.addToInkwell(debug.player1Id, 'Minnie Mouse - Always Classy');
            }

            // Setup Opponent
            debug.addToPlay(debug.player2Id, 'Mickey Mouse - Steamboat Pilot');
        });

        // 1. Play Hades
        await gamePage.clickCardInHand('Hades - Looking for a Deal');
        await gamePage.clickAction('Play Card');

        // 2. Choice Prompt (Choose opposing character)
        // Wait for prompt (Modal should be visible - blocking click on board if we tried)
        await expect(gamePage.page.locator('.modal-title')).toBeVisible();
        await expect(gamePage.page.locator('.modal-title')).toContainText('Choose');

        // Interact with the modal content
        // The modal likely presents a list of valid targets or a grid.
        // Assuming Standard Choice Modal structure:
        // Try clicking the card element INSIDE the modal first.
        const cardInModal = gamePage.page.locator('.modal-content [data-card-name="Mickey Mouse - Steamboat Pilot"]');
        if (await cardInModal.count() > 0) {
            await cardInModal.first().click();
        } else {
            // Fallback: Try list item
            const listItem = gamePage.page.locator('li', { hasText: 'Mickey Mouse - Steamboat Pilot' });
            await listItem.first().click();
        }

        // Confirm choice if "Confirm" button is visible
        const confirmBtn = gamePage.page.locator('button', { hasText: 'Confirm' });
        if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
        }

        // 3. Opponent Choice (Bot)
        // Opponent is Bot (Player 2).
        // Triggered ability continues.
        // Bot logic in `OpponentInteractionFamilyHandler` defaults to Option 0 ("Put character on bottom").

        await gamePage.page.waitForTimeout(2000);

        // 4. Verify Outcome
        // Mickey Mouse should be gone from play.
        const mickey = gamePage.page.locator('[data-card-name="Mickey Mouse - Steamboat Pilot"]');
        await expect(mickey).not.toBeVisible();

        // Verify Log
        await gamePage.expectLogMessage(/Opponent chose: Put character on bottom/i);
    });

});
