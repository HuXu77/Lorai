import { test, expect } from '../fixtures/game-fixture';

test.describe('Ability: Singer', () => {
    test.beforeEach(async ({ gamePage }) => {
        await gamePage.loadTestGame();
    });

    test('should allow singing a song with a character that has Singer ability', async ({ gamePage }) => {
        // Setup state using injectState
        await gamePage.injectState({
            player1: {
                play: [{ name: 'Ariel - Spectacular Singer', ready: true }],
                hand: ['A Whole New World'],
                inkwell: [],
                lore: 0
            },
            player2: {
                hand: [],
                deck: [],
                lore: 0
            },
            turnPlayer: 'player1'
        });

        // Verify Ariel is in play
        await gamePage.expectCardInPlay('Ariel');

        // Click Song in Hand
        await gamePage.clickCardInHand('A Whole New World');

        // Check Action Menu for "Sing"
        const singBtn = gamePage.page.getByRole('button', { name: /Sing/i });
        await expect(singBtn).toBeVisible();
        await expect(singBtn).toBeEnabled();

        // Click Sing
        await singBtn.click();

        // Select Ariel to sing
        // Verify modal prompt
        await expect(gamePage.page.getByText(/Choose a character to sing/i)).toBeVisible();

        // Select Ariel using the shared selection component
        await gamePage.selectModalOption('Ariel');

        // Verify Song Played effect (Hand size 0)
        // A Whole New World discards hand and draws 7.
        // Wait for animation and effect
        await gamePage.page.waitForTimeout(2000);

        // Check if hand replenished (7 cards)
        await gamePage.expectHandSize(7);

        // Verify log says "played A Whole New World"
        await gamePage.expectLogMessage(/played A Whole New World/i);
    });
});
