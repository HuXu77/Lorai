import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - TARGET_CHARACTER
 * 
 * Tests the targeting modal for "chosen character" abilities.
 * Uses real cards: "Dragon Fire" (deals 3 damage to chosen character).
 */

test.describe('Modal: Target Character', () => {

    test('should show targeting modal with all valid characters', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Use Dragon Fire - a real card that targets any character
        await gamePage.injectState({
            player1: {
                hand: ['Dragon Fire'],
                inkwell: ['Generic Ink', 'Generic Ink', 'Generic Ink', 'Generic Ink', 'Generic Ink', 'Generic Ink'], // Cost 6
                deck: ['Mickey Mouse - Detective']
            },
            player2: {
                play: [{ name: 'Mickey Mouse - Brave Little Tailor', ready: true }],
                deck: ['Mickey Mouse - Detective']
            },
            turnPlayer: 'player1'
        });

        await gamePage.page.waitForTimeout(2000); // Let state settle

        // Play Dragon Fire
        await gamePage.clickCardInHand('Dragon Fire');

        // Wait for card detail modal and click Play Card
        const detailModal = gamePage.page.locator('[role="dialog"]').filter({ hasText: 'Dragon Fire' });
        await expect(detailModal).toBeVisible({ timeout: 5000 });
        const playBtn = detailModal.getByRole('button', { name: /Play Card/i });
        await playBtn.click();

        // Should see targeting modal - use getByRole for reliable detection
        await expect(gamePage.page.getByText(/choose|target|select/i).first()).toBeVisible({ timeout: 10000 });

        // Modal should show opponent's character
        await expect(gamePage.page.getByRole('button', { name: /Mickey Mouse/i })).toBeVisible();
    });

    test('should allow selecting a target character', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                hand: ['Dragon Fire'],
                inkwell: ['Generic Ink', 'Generic Ink', 'Generic Ink', 'Generic Ink', 'Generic Ink', 'Generic Ink'],
                deck: ['Mickey Mouse - Detective']
            },
            player2: {
                play: [{ name: 'Mickey Mouse - Brave Little Tailor', ready: true }],
                deck: ['Mickey Mouse - Detective']
            },
            turnPlayer: 'player1'
        });

        await gamePage.page.waitForTimeout(2000);

        // Play Dragon Fire
        await gamePage.clickCardInHand('Dragon Fire');

        const detailModal = gamePage.page.locator('[role="dialog"]').filter({ hasText: 'Dragon Fire' });
        await expect(detailModal).toBeVisible({ timeout: 5000 });
        await detailModal.getByRole('button', { name: /Play Card/i }).click();

        // Wait for targeting modal
        await expect(gamePage.page.getByRole('button', { name: /Mickey Mouse/i })).toBeVisible({ timeout: 10000 });

        // Select Mickey Mouse as target
        await gamePage.page.getByRole('button', { name: /Mickey Mouse/i }).click();

        // Wait for confirm button to be enabled and click it
        const confirmBtn = gamePage.page.getByRole('button', { name: /Confirm/i });
        await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
        await confirmBtn.click();

        // Modal should close
        await expect(gamePage.page.getByText('Choose a card')).toBeHidden({ timeout: 5000 });

        // Verify effect logged - Dragon Fire deals damage
        await gamePage.expectLogMessage(/Dragon Fire|dealt.*damage|Mickey/i);
    });

});
