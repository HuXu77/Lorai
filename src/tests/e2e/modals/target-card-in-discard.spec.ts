import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - TARGET_CARD_IN_DISCARD
 * 
 * Tests the modal for selecting cards from discard pile.
 * Example: "Return a character from your discard to your hand"
 */

test.describe('Modal: Target Card in Discard', () => {

    // GAP: Part of Your World (Return from discard) not triggering modal
    test('should allow selecting a character from discard to return to hand', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup:
        // Hand: Part of Your World (3 cost)
        // Ink: 3 cards
        // Discard: Mickey Mouse - Brave Little Tailor
        await gamePage.injectState({
            player1: {
                hand: ['Part of Your World'],
                inkwell: ['Mickey Mouse - Detective', 'Mickey Mouse - Detective', 'Mickey Mouse - Detective'],
                discard: ['Mickey Mouse - Brave Little Tailor', 'Elsa - Spirit of Winter'],
                play: [],
                deck: []
            },
            turnPlayer: 'player1'
        });

        // Play Part of Your World
        await gamePage.clickCardInHand('Part of Your World');
        await gamePage.clickAction('Play');

        // Expect Modal showing Discard cards
        const modal = await gamePage.expectModal();
        await expect(modal).toBeVisible();
        await expect(modal).toContainText(/Return a character/i);

        // Select Mickey Mouse from the modal
        const mickeyBtn = gamePage.page.locator('[role="dialog"] button').filter({ hasText: 'Mickey Mouse' });
        await expect(mickeyBtn).toBeVisible();
        await mickeyBtn.click();

        // Modal should close
        await expect(modal).toBeHidden();

        // Verify Mickey is now in hand
        await expect(gamePage.page.locator('[data-testid="player-hand"]')).toContainText('Mickey Mouse - Brave Little Tailor');

        // Verify Log
        await gamePage.expectLogMessage(/returned.*Mickey Mouse/i);
    });

});
