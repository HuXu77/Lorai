import { test, expect } from '../fixtures/game-fixture';

test.describe('Bug Repro: Simba - Future King Crash', () => {
    test('Simba - Future King - Should not crash when triggering ability', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup: Add Simba to hand and enough ink
        await gamePage.addCardToHand('Simba - Future King', 1);

        // Add ink via evaluate
        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            if (debug) {
                const p1 = debug.player1Id;
                // Cost is 1, give 2 ink
                debug.addToInkwell(p1, 'Ink');
                debug.addToInkwell(p1, 'Ink');
                // Ensure deck has cards to draw
                debug.setDeck(p1, ['Ink', 'Ink', 'Ink']);
            }
        });

        // Play the card
        await gamePage.clickCardInHand('Simba - Future King');
        await gamePage.clickAction('Play Card');

        // Handle Optional Draw (Simba: "You may draw a card...")
        // Detect if extraction asks "Do you want to draw..." or generic "Do you want to use ability..."
        const drawModal = gamePage.page.locator('text=Do you want to draw');
        if (await drawModal.isVisible({ timeout: 5000 })) {
            await gamePage.selectModalOption('Yes');
        }

        // Expect Modal to appear (Choose a card to discard)
        // This is where it normally crashes (if source is missing)
        await expect(gamePage.page.locator('text=Choose a card to discard')).toBeVisible({ timeout: 5000 });
    });
});
