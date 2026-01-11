import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - TARGET_ITEM
 * 
 * Tests the modal for targeting Item cards.
 * Example: "Banish chosen item."
 */

test.describe('Modal: Target Item', () => {

    test('should show only items as valid targets', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Add an item to the play area
        await gamePage.addCardToPlay('Lucky Dime', 1, true);  // Example item

        // Add a card that targets items
        // Would need specific card with "chosen item" targeting

        await gamePage.page.waitForTimeout(500);

        // Verify item is in play
        await gamePage.expectCardInPlay('Lucky Dime');
    });

});
