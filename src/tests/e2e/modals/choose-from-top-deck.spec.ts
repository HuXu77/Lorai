import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - CHOOSE_CARD_FROM_ZONE
 * 
 * Tests the modal for selecting cards from top of deck (Look at N, pick M).
 * Example: Develop Your Brain "Look at the top 2 cards... Put one into your hand..."
 */

test.describe('Modal: Choose From Top Deck', () => {

    test('should allow reordering cards', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                hand: ['Develop Your Brain'],
                inkwell: ['Generic Ink'],
                deck: ['Mickey Mouse - Detective', 'Donald Duck - Boisterous Fowl']
            },
            player2: {
                deck: ['Mickey Mouse - Detective']
            },
            turnPlayer: 'player1'
        });

        // Wait for game state to settle (Turn banners, animations)
        await gamePage.page.waitForTimeout(3000);

        // Play Develop Your Brain
        await gamePage.clickCardInHand('Develop Your Brain');

        // Wait for detail modal (robust)
        const detailModal = gamePage.page.locator('[role="dialog"]').filter({ hasText: 'Develop Your Brain' });
        await expect(detailModal).toBeVisible();

        // Check for alerts masking interaction
        const alert = gamePage.page.locator('[role="alert"]').first();
        if (await alert.isVisible()) {
            console.log('ALERT VISIBLE:', await alert.innerText());
        }

        const playBtn = detailModal.locator('button').filter({ hasText: /Play Card/i });
        await expect(playBtn).toBeVisible();
        await playBtn.click({ force: true });

        // Verify detail modal closes
        await expect(detailModal).toBeHidden();

        // Wait for Order Modal
        // "Look at the top 2 cards of your deck. Put them back in any order."
        const modal = await gamePage.expectModal();
        await expect(modal).toBeVisible();
        await expect(modal).toContainText(/Look at the top 2 cards of your deck/i);

        // Verify cards are shown - use getByRole for accessibility-based selection
        const mickeyBtn = gamePage.page.getByRole('button', { name: /Mickey Mouse - Detective/i });
        const donaldBtn = gamePage.page.getByRole('button', { name: /Donald Duck - Boisterous Fowl/i });
        await expect(mickeyBtn).toBeVisible({ timeout: 10000 });
        await expect(donaldBtn).toBeVisible();

        // Select Mickey Mouse to put into hand (required before confirm is enabled)
        await mickeyBtn.click();

        // Wait for confirm button to become enabled
        const confirmBtn = gamePage.page.getByRole('button', { name: /Confirm/i });
        await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
        await confirmBtn.click();

        // Modal closed - verify no more choice modal visible
        await expect(gamePage.page.getByText('Choose a card to put into your hand')).toBeHidden();

        // Verify Log
        await gamePage.expectLogMessage(/played.*Develop Your Brain/i);
    });

});
