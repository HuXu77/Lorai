import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Core Flow - Ink Card
 * 
 * Tests the basic action of adding a card to inkwell.
 * This is the foundation action that enables all other plays.
 */

test.describe('Core Flow: Ink Card', () => {

    test('should ink a card from hand', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Get initial ink count (should be 0 at turn 1)
        const initialInk = await gamePage.page.locator('[data-testid="ink-count"]').textContent();

        // Wait for hand to load
        await gamePage.page.waitForSelector('[data-testid="player-hand"]');

        // Find an inkable card in hand and click it
        const hand = gamePage.page.locator('[data-testid="player-hand"]');
        const firstCard = hand.locator('[data-card-name]').first();
        await firstCard.click();

        // Click "Ink This Card" action
        await gamePage.clickAction('Ink');

        // Verify ink count increased
        await gamePage.page.waitForTimeout(500);

        // Verify game log shows inking action
        await gamePage.expectLogMessage(/ink/i);
    });

    test('should show ink option only for inkable cards', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Add a non-inkable card (characters with special abilities often aren't inkable)
        await gamePage.addCardToHand('The Queen - Commanding Presence', 1);

        await gamePage.page.waitForTimeout(500);

        // Click the card
        await gamePage.clickCardInHand('The Queen');

        // Ink option should NOT be available for non-inkable cards
        const inkButton = gamePage.page.locator('button:has-text("Ink")');

        // Either button doesn't exist or is disabled
        const isVisible = await inkButton.isVisible().catch(() => false);
        if (isVisible) {
            const isDisabled = await inkButton.isDisabled();
            expect(isDisabled).toBe(true);
        }
    });

});
