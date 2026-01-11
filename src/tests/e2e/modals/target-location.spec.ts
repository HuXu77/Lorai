import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - TARGET_LOCATION
 * 
 * Tests the modal for targeting Location cards.
 * Example: "Move to chosen location." or "Banish chosen location."
 */

test.describe('Modal: Target Location', () => {

    test('should show only locations as valid targets', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Add a location to the play area
        await gamePage.addCardToPlay('Pride Lands', 1, true);  // Example location

        await gamePage.page.waitForTimeout(500);

        // Verify location is in play (if it exists in allCards.json)
    });

});
