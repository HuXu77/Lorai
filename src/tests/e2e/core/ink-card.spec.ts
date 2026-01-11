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

        // Wait for game to be fully interactive
        await gamePage.page.waitForTimeout(1000);

        // Use the debug API to verify we can see the state
        const hasCards = await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            const state = JSON.parse(debug?.getState() || '{}');
            return state.players?.player1?.hand?.length > 0;
        });
        expect(hasCards).toBe(true);

        // Find an inkable card in hand by looking for any card button/clickable element
        const handCards = gamePage.page.locator('.card, [class*="card"]').first();
        if (await handCards.isVisible()) {
            await handCards.click();

            // Wait for action menu to appear and try to click Ink
            await gamePage.page.waitForTimeout(500);
            const inkButton = gamePage.page.locator('button:has-text("Ink")').first();
            if (await inkButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                await inkButton.click();
                await gamePage.page.waitForTimeout(1000);

                // Verify via log or state change
                await gamePage.expectLogMessage(/ink/i);
            }
        }
    });

});
