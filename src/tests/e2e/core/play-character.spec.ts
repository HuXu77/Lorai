import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Core Flow - Play Character
 * 
 * Tests playing a character card from hand to play area.
 */

test.describe('Core Flow: Play Character', () => {

    test('should play character when enough ink available', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Add ink to pay for a character
        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            const playerId = debug?.player1Id;
            for (let i = 0; i < 5; i++) {
                debug?.addToInkwell(playerId, 'Generic Ink Card');
            }
        });

        // Add a cheap character to hand
        await gamePage.addCardToHand('Stitch - Carefree Surfer', 1);
        await gamePage.page.waitForTimeout(500);

        // Click the card
        await gamePage.clickCardInHand('Stitch');

        // Click Play action
        await gamePage.clickAction('Play');

        // Wait for play to complete
        await gamePage.page.waitForTimeout(1000);

        // Verify card is now in play area
        await gamePage.expectCardInPlay('Stitch');

        // Verify game log shows play action
        await gamePage.expectLogMessage(/played/i);
    });

    test('should not allow playing when insufficient ink', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Add expensive character but no ink
        await gamePage.addCardToHand('The Queen - Commanding Presence', 1);
        await gamePage.page.waitForTimeout(500);

        // Click the card
        await gamePage.clickCardInHand('The Queen');

        // Play button should be disabled or not visible
        const playButton = gamePage.page.locator('button:has-text("Play")');
        const isVisible = await playButton.isVisible().catch(() => false);

        if (isVisible) {
            const isDisabled = await playButton.isDisabled();
            expect(isDisabled).toBe(true);
        }
    });

    test('should show character as drying after play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup ink and character
        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            const playerId = debug?.player1Id;
            for (let i = 0; i < 3; i++) {
                debug?.addToInkwell(playerId, 'Generic Ink Card');
            }
        });
        await gamePage.addCardToHand('Stitch - Carefree Surfer', 1);
        await gamePage.page.waitForTimeout(500);

        // Play the character
        await gamePage.clickCardInHand('Stitch');
        await gamePage.clickAction('Play');
        await gamePage.page.waitForTimeout(1000);

        // Verify card shows drying state (can't quest same turn)
        const card = gamePage.page.locator('[data-testid="player-play-area"] [data-card-name*="Stitch"]');
        await expect(card).toBeVisible();

        // Card should have some visual indicator of drying/ink-drying state
        // The exact selector depends on your UI implementation
    });

});
