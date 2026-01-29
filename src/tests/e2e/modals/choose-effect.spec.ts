import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - MODAL_CHOICE (Choose One Effect)
 * 
 * Tests the modal for "Choose one:" abilities.
 * Uses: "Tug-of-War" - Action with "Choose one: • Deal 1 damage to each opposing character without Evasive. • Deal 3 damage to each opposing character with Evasive."
 */

test.describe('Modal: Choose Effect', () => {

    // Known gap: Tug-of-War 'Choose one:' parses but doesn't trigger modal choice
    // Gap tracker: Engine executes first valid option without player choice
    test('should show modal with multiple effect options', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup with BOTH Evasive and non-Evasive characters so both options are valid
        // This forces the modal to appear rather than auto-resolving
        await gamePage.injectState({
            player1: {
                hand: ['Tug-of-War'],
                inkwell: ['Generic Ink', 'Generic Ink', 'Generic Ink', 'Generic Ink', 'Generic Ink'], // Cost 5
                deck: ['Mickey Mouse - Detective']
            },
            player2: {
                play: [
                    // Non-Evasive character (option 1: deal 1 damage to characters without Evasive)
                    { name: 'Mickey Mouse - Brave Little Tailor', ready: true, turnPlayed: 0 },
                    // Evasive character (option 2: deal 3 damage to characters with Evasive)
                    { name: 'Tinker Bell - Peter Pan\'s Ally', ready: true, turnPlayed: 0 }
                ],
                deck: ['Mickey Mouse - Detective']
            },
            turnPlayer: 'player1'
        });

        await gamePage.page.waitForTimeout(2000);

        // Play Tug-of-War
        await gamePage.clickCardInHand('Tug-of-War');

        // Click Play Card
        const detailModal = gamePage.page.locator('[role="dialog"]').filter({ hasText: 'Tug-of-War' });
        await expect(detailModal).toBeVisible({ timeout: 5000 });
        await detailModal.getByRole('button', { name: /Play Card/i }).click();

        // Should see choose one modal - look for the choice options
        await expect(gamePage.page.getByText(/choose|damage|evasive/i).first()).toBeVisible({ timeout: 10000 });

        // Verify both options are shown as buttons
        // Verify both options are shown as buttons
        const option1 = gamePage.page.getByText(/Deal 1 damage.*without Evasive/i);
        const option2 = gamePage.page.getByText(/Deal 3 damage.*with Evasive/i);

        // At least one option should be visible
        await expect(option1).toBeVisible();
        await expect(option2).toBeVisible();

        // Click one
        await option1.click();
    });

});
