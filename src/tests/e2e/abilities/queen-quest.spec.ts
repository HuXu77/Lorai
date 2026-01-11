import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Tests for The Queen - Commanding Presence
 * 
 * Ability: "Whenever this character quests, chosen opposing character 
 * gets -4 Strength this turn and chosen character gets +4 Strength this turn."
 * 
 * These tests mirror the engine tests in queen-commanding-presence.test.ts
 * but interact with the actual UI.
 */

test.describe('The Queen - Commanding Presence', () => {

    test('should trigger ability and show targeting modal on quest', async ({ gamePage }) => {
        // Load test game
        await gamePage.loadTestGame();

        // Inject The Queen in play (ready) and an opponent character
        await gamePage.addCardToPlay('The Queen - Commanding Presence', 1, true);
        await gamePage.addCardToPlay('Mickey Mouse - Brave Little Tailor', 2, false);

        // Give player ink to pay for ability if needed
        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            const playerId = debug?.player1Id;
            // Add ink cards
            for (let i = 0; i < 5; i++) {
                debug?.addToInkwell(playerId, 'Mickey Mouse - Artful Rogue');
            }
        });

        // Wait for state to update
        await gamePage.page.waitForTimeout(500);

        // Click The Queen in play
        await gamePage.clickCardInPlay('The Queen');

        // Click Quest action
        await gamePage.clickAction('Quest');

        // Expect a targeting modal to appear for choosing targets
        const modal = await gamePage.expectModal();
        await expect(modal).toContainText(/choose|target|select/i);
    });

    test('should trigger on subsequent quests across turns', async ({ gamePage }) => {
        // This test verifies the bug fix for abilities only triggering once
        await gamePage.loadTestGame();

        // Inject state
        await gamePage.addCardToPlay('The Queen - Commanding Presence', 1, true);
        await gamePage.addCardToPlay('Target Dummy', 2, false);

        // Add ink
        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            const playerId = debug?.player1Id;
            for (let i = 0; i < 5; i++) {
                debug?.addToInkwell(playerId, 'Generic Ink Card');
            }
        });

        // Quest turn 1
        await gamePage.clickCardInPlay('The Queen');
        await gamePage.clickAction('Quest');

        // Should see modal
        const modal1 = await gamePage.expectModal();
        await expect(modal1).toBeVisible();

        // Cancel/complete the modal
        await gamePage.cancelModal();

        // End turn to go to opponent's turn
        await gamePage.endTurn();

        // Wait for opponent turn to pass (bot does nothing)
        await gamePage.page.waitForTimeout(2000);

        // Queen should be ready again
        // Quest turn 2 - THE KEY TEST: ability should trigger again
        await gamePage.clickCardInPlay('The Queen');
        await gamePage.clickAction('Quest');

        // Should see modal AGAIN (this was the bug - it didn't trigger on turn 2)
        const modal2 = await gamePage.expectModal();
        await expect(modal2).toBeVisible();
    });

});
