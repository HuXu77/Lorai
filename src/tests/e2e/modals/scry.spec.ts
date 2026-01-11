import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - SCRY
 * 
 * Tests the scry modal for looking at and reordering top cards.
 * Example: "Look at the top 3 cards. Put any on bottom in any order."
 */

test.describe('Modal: Scry', () => {

    test('should load game successfully for scry testing', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Verify game loaded by checking debug API is available
        const hasDebugApi = await gamePage.page.evaluate(() => {
            return (window as any).lorcanaDebug !== undefined;
        });
        expect(hasDebugApi).toBe(true);
    });

});
