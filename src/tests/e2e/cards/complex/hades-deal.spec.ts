import { test, expect } from '../../fixtures/game-fixture';

test.describe('Hades - Looking for a Deal [Complex]', () => {

    test.beforeEach(async ({ gamePage }) => {
        gamePage.page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
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

        // 2. Choice Prompt (Optional: "You may choose...")
        // The first modal is the "You May" prompt because the ability is optional.
        const mayModal = gamePage.page.locator('[data-testid="choice-modal"]');
        await expect(mayModal).toBeVisible();
        await expect(mayModal).toContainText(/you may choose/i);

        // Click "Yes!"
        await gamePage.page.locator('button', { hasText: 'Yes!' }).click();

        // 3. Choice Prompt (Choose opposing character)
        // Now we expect the target selection modal.
        // The modal might reuse the same container, so we wait for the text to change or the "Opponent's Cards" header.
        const targetModal = gamePage.page.locator('[data-testid="choice-modal"]');
        await expect(targetModal).toContainText('Opponent\'s Cards');

        // Interact with the modal content
        const cardInModal = gamePage.page.locator('[data-testid="choice-option"][aria-label="Mickey Mouse - Steamboat Pilot"]');
        await cardInModal.click();

        // Confirm choice if "Confirm" button is visible
        const confirmBtn = gamePage.page.locator('button', { hasText: 'Confirm' });
        if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
        }

        // 3. Opponent Choice (Bot)
        // Opponent is Bot (Player 2).
        // Triggered ability continues.
        // Bot logic in `OpponentInteractionFamilyHandler` defaults to Option 0 ("Put character on bottom").

        // 4. Verify Outcome
        // Wait for Opponent to choose/animation
        await gamePage.page.waitForTimeout(3000);

        // Mickey Mouse should be gone from play.
        const mickey = gamePage.page.locator('[data-card-name="Mickey Mouse - Steamboat Pilot"]');
        await expect(mickey).not.toBeVisible();
    });
});


