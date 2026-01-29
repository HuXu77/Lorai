import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - YES_NO (Optional Abilities)
 * 
 * Tests the yes/no modal for "you may" optional abilities.
 * Example: Bodyguard "may enter play exerted"
 */

test.describe('Modal: Yes/No Optional', () => {

    test('should show yes/no modal for "you may" abilities', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Add ink
        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            for (let i = 0; i < 5; i++) {
                debug?.addToInkwell(debug?.player1Id, 'Generic Ink');
            }
        });

        // Add a Bodyguard character to hand
        // Bodyguard characters can optionally enter exerted
        await gamePage.addCardToHand('Simba - Protective Cub', 1);
        await gamePage.page.waitForTimeout(500);

        // Play the bodyguard character
        await gamePage.clickCardInHand('Simba');
        await gamePage.clickAction('Play Card');

        // Should see yes/no modal for Bodyguard
        const modal = await gamePage.expectModal();
        await expect(modal).toBeVisible();

        // Modal should have Yes/No options
        const yesButton = gamePage.page.locator('button', { hasText: /Yes|Exerted/i }).first();
        const noButton = gamePage.page.locator('button', { hasText: /No|Ready/i }).first();

        // At least one should be visible
        // Wait for visibility implicitly via assertion or explicitly
        await expect(yesButton.or(noButton).first()).toBeVisible();
    });

    test('should allow declining optional ability', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup ink
        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            for (let i = 0; i < 5; i++) {
                debug?.addToInkwell(debug?.player1Id, 'Generic Ink');
            }
        });

        await gamePage.addCardToHand('Simba - Protective Cub', 1);
        await gamePage.page.waitForTimeout(500);

        // Play bodyguard
        await gamePage.clickCardInHand('Simba');
        await gamePage.clickAction('Play Card');

        // Wait for modal
        await gamePage.expectModal();

        // Decline the optional exert
        await gamePage.cancelModal();

        // Wait for play to complete
        await gamePage.page.waitForTimeout(1000);

        // Character should be in play (ready state since we declined exert)
        await gamePage.expectCardInPlay('Simba');
    });

    test('should allow accepting optional ability', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup
        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            for (let i = 0; i < 5; i++) {
                debug?.addToInkwell(debug?.player1Id, 'Generic Ink');
            }
        });

        await gamePage.addCardToHand('Simba - Protective Cub', 1);
        await gamePage.page.waitForTimeout(500);

        // Play bodyguard
        await gamePage.clickCardInHand('Simba');
        await gamePage.clickAction('Play Card');

        // Wait for modal
        await gamePage.expectModal();

        // Accept the optional exert
        await gamePage.confirmModal();

        // Wait for play to complete
        await gamePage.page.waitForTimeout(1000);

        // Character should be in play
        await gamePage.expectCardInPlay('Simba');
    });

});
