import { test, expect } from '../fixtures/game-fixture';

/**
 * POC: Automated Card Test for "Develop Your Brain"
 * 
 * Verifies:
 * 1. Manual State Setup (Hand, Ink)
 * 2. Play Action (Playing an Action card)
 * 3. Cost Payment (Using Ink)
 * 4. Effect Execution (Modal Choice)
 */
test.describe('POC: Develop Your Brain Interactions', () => {

    test('should show choice modal when played', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // 1. Setup - Manual State
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        expect(debugAvailable, 'Debug API should be available').toBe(true);

        if (debugAvailable) {
            console.log('Setting up board state...');

            // Hand: Develop Your Brain
            // Ink: 1 (Cost 1)
            // We need to add cards to hand
            await gamePage.addCardToHand('Develop Your Brain', 1);

            // Add Ink
            await gamePage.page.evaluate(() => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                }
            });

            // Pass turn to ready the ink
            console.log('Passing turn to ready ink...');
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn', { timeout: 30000 });
            console.log('Turn passed. Ready to play.');
        }

        // 2. Perform Action: Play Card
        console.log('Clicking card in hand...');
        await gamePage.clickCardInHand('Develop Your Brain');

        console.log('Clicking Play action...');
        await gamePage.clickAction('Play Card');

        // 3. Handle Interactions: Expect Choice Modal
        // 3. Handle Interactions: Expect Choice Modal
        console.log('Waiting for choice modal...');
        const modal = gamePage.page.locator('[data-testid="choice-modal"]');
        await expect(modal).toBeVisible();
        console.log('Modal visible, selecting card...');

        // Select the first card option
        const firstOption = gamePage.page.locator('[data-testid="choice-option"]').first();
        await expect(firstOption).toBeVisible();
        await firstOption.click();

        // Confirm choice
        const confirmBtn = gamePage.page.locator('button', { hasText: 'Confirm' });
        await expect(confirmBtn).toBeVisible();
        await confirmBtn.click();

        // Wait for modal to close
        await expect(modal).not.toBeVisible();

        // 4. Verify Outcome (Log is the source of truth for action execution)
        // Log message is "You Played Action Develop Your Brain"
        await gamePage.expectLogMessage(/played.*Develop Your Brain/i);
        console.log('Log message verified.');
    });

});
