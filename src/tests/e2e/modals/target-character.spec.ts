import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - TARGET_CHARACTER
 * 
 * Tests the targeting modal for "chosen character" abilities.
 * Example: "Chosen character gets +1 Strength this turn"
 */

test.describe('Modal: Target Character', () => {

    test('should show targeting modal with all valid characters', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup: Card with "chosen character" targeting in play
        // Webby has "When you play this character, chosen character gets +1 ◊ this turn"
        await gamePage.addCardToHand('Webby Vanderquack - Trick or Treater', 1);

        // Add a target character in play
        await gamePage.addCardToPlay('Mickey Mouse - Brave Little Tailor', 1, true);

        // Add ink
        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            const playerId = debug?.player1Id;
            for (let i = 0; i < 3; i++) {
                debug?.addToInkwell(playerId, 'Generic Ink');
            }
        });
        await gamePage.page.waitForTimeout(500);

        // Play Webby to trigger on-play targeting
        await gamePage.clickCardInHand('Webby');
        await gamePage.clickAction('Play');

        // Should see targeting modal
        const modal = await gamePage.expectModal();
        await expect(modal).toBeVisible();

        // Modal should show available characters
        await expect(modal).toContainText(/Mickey|choose|target/i);
    });

    test('should allow selecting a target character', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup targeting scenario
        await gamePage.addCardToHand('Webby Vanderquack - Trick or Treater', 1);
        await gamePage.addCardToPlay('Mickey Mouse - Brave Little Tailor', 1, true);

        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            for (let i = 0; i < 3; i++) {
                debug?.addToInkwell(debug?.player1Id, 'Generic Ink');
            }
        });
        await gamePage.page.waitForTimeout(500);

        // Play Webby
        await gamePage.clickCardInHand('Webby');
        await gamePage.clickAction('Play');

        // Wait for modal
        await gamePage.expectModal();

        // Select a target
        await gamePage.selectModalOption('Mickey');

        // Modal should close and effect should resolve
        await gamePage.page.waitForTimeout(1000);

        // Verify effect logged
        await gamePage.expectLogMessage(/Mickey|Webby/i);
    });

});
