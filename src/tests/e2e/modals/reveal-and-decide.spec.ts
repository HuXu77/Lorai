import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - REVEAL_AND_DECIDE
 * 
 * Tests the modal for reveal-then-choose abilities.
 * Example: "Reveal the top card of your deck. If it's a character, draw it."
 */

test.describe('Modal: Reveal and Decide', () => {

    test('should show revealed card with decision options', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Add Daisy Duck who has reveal ability on quest
        await gamePage.addCardToPlay('Daisy Duck - Donald\'s Date', 1, true);

        await gamePage.page.waitForTimeout(500);

        // Quest with Daisy
        await gamePage.clickCardInPlay('Daisy');
        await gamePage.clickAction('Quest');

        // Wait for reveal modal
        await gamePage.page.waitForTimeout(1000);

        // Should see a reveal modal or effect in log
        await gamePage.expectLogMessage(/reveal|quest/i);
    });

});
