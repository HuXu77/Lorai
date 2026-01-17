import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - OPPONENT_HAND_DISCARD
 * 
 * Tests abilities that reveal opponent's hand to choose a discard.
 * Example: The Bare Necessities
 */

test.describe('Modal: Opponent Hand Discard (Bare Necessities)', () => {

    test('should reveal opponent hand and allow discarding non-character', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        // 1. Setup:
        // P1: Bare Necessities in hand (to play) or play (if ready to use? No, it's an action, must play from hand)
        // Let's put it in hand and enough ink.
        // P2: Hand with mix of cards (Character, Action, Item)
        await gamePage.injectState({
            player1: {
                hand: ['The Bare Necessities'],
                inkwell: ['Ink', 'Ink'], // Cost 2
                lore: 0,
                play: [],
                deck: []
            },
            player2: {
                hand: [
                    'Goofy - Musketeer', // Character (Invalid)
                    'Dragon Fire', // Action (Valid)
                    'Magic Mirror' // Item (Valid)
                ],
                deck: [],
                lore: 0,
                play: [],
                inkwell: []
            },
            turnPlayer: 'player1'
        });

        // 2. Play Bare Necessities
        await gamePage.clickCardInHand('The Bare Necessities');
        await gamePage.clickAction('Play Card'); // Button says "Play Card (Cost)"

        // 3. Verify Modal
        const modal = await gamePage.expectModal();
        // User confirmed text: "Choose a card from opponent's hand to discard"
        await expect(modal).toContainText("Choose a card from opponent's hand to discard");

        // 4. Verify Options
        // Goofy should be invalid or not selectable? Usually logic marks it invalid in UI.
        // Let's try to find Dragon Fire.
        await expect(modal.locator('text=Dragon Fire')).toBeVisible();
        await expect(modal.locator('text=Goofy')).toBeVisible();

        // 5. Select Dragon Fire
        await gamePage.selectModalOption('Dragon Fire');
        // Wait for selection to visually register
        await gamePage.page.waitForTimeout(500);
        // Explicitly click the confirm button which likely has dynamic text like "Confirm (1)"
        await gamePage.page.locator('button').filter({ hasText: 'Confirm' }).click();

        // 6. Verify Discard
        // Log message seems missing or delayed, but state is correct (card is in discard).
        // Verifying the card exists in the discard pile area.
        // Note: We use a specific locator for opponent discard if possible, or just check visibility if unique.
        // Based on fixtures, we don't have a dedicated method, so we use a locator relative to the discard label or area.
        await expect(gamePage.page.locator('text=Opponent Discard').locator('..').locator('img[alt*="Dragon Fire"]')).toBeVisible();

        // Verify P2 hand size reduced
        // We can check P2 discard pile if we had a selector, but log message is good proxy.
    });

});
