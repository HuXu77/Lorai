import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - MODAL_CHOICE (Choose One Effect)
 * 
 * Tests the modal for "Choose one:" abilities.
 * Example: "Choose one: Draw a card OR Deal 2 damage"
 */

test.describe('Modal: Choose Effect', () => {

    test('should show modal with multiple effect options', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Add a card with modal choice ability
        // Many action cards have "Choose one" patterns
        await gamePage.addCardToHand('Show Me More!', 1);

        // Add ink
        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            for (let i = 0; i < 5; i++) {
                debug?.addToInkwell(debug?.player1Id, 'Generic Ink');
            }
        });
        await gamePage.page.waitForTimeout(500);

        // Play the action
        await gamePage.clickCardInHand('Show Me More');
        await gamePage.clickAction('Play');

        // Should see modal with options
        const modal = await gamePage.expectModal();
        await expect(modal).toBeVisible();
    });

});
