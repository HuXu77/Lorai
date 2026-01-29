import { test, expect } from '../fixtures/game-fixture';

/**
 * On Play -> Resources (Lore, Cards)
 * Tests for characters that gain resources when played.
 */

test.describe('Abilities: On Play - Resources', () => {

    test('Merlin - Goat should gain 1 lore on play', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                hand: ['Merlin - Goat'],
                inkwell: ['Ink', 'Ink', 'Ink', 'Ink'], // Cost 4
                play: [],
                deck: [],
                lore: 0
            },
            player2: {
                play: [],
                hand: [],
                deck: [],
                inkwell: []
            },
            turnPlayer: 'player1'
        });

        await gamePage.clickCardInHand('Merlin - Goat');
        await gamePage.clickAction('Play Card');

        await gamePage.page.waitForTimeout(1000);

        // Verify: Player 1 lore is 1
        await gamePage.expectLore(1, 1);
    });

    test('Genie - Wish Fulfilled should draw 1 card on play', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                hand: ['Genie - Wish Fulfilled'],
                inkwell: ['Ink', 'Ink', 'Ink', 'Ink', 'Ink', 'Ink'], // Cost 6
                play: [],
                deck: ['Mickey Mouse - Brave Little Tailor'], // Card to draw
                lore: 0
            },
            player2: {
                play: [],
                hand: [],
                deck: [],
                inkwell: []
            },
            turnPlayer: 'player1'
        });

        await gamePage.clickCardInHand('Genie - Wish Fulfilled');
        await gamePage.clickAction('Play Card');

        await gamePage.page.waitForTimeout(1000);

        // Verify: Hand size increased (Genie left hand, drawn card entered)
        // Start: 1 card (Genie). Play -> Hand empty. Draw -> Hand 1.

        await expect(gamePage.page.locator('[data-testid="player-hand"] img[alt*="Mickey Mouse"]')).toBeVisible();
    });

    test('Friends on the Other Side should draw 2 cards', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                hand: ['Friends on the Other Side'],
                inkwell: ['Ink', 'Ink', 'Ink'], // Cost 3
                play: [],
                deck: ['Mickey Mouse - Brave Little Tailor', 'Minnie Mouse - Always Classy'],
                lore: 0
            },
            player2: {
                play: [],
                hand: [],
                deck: [],
                inkwell: []
            },
            turnPlayer: 'player1'
        });

        await gamePage.clickCardInHand('Friends on the Other Side');
        await gamePage.clickAction('Play Card'); // It's a song/action, plays immediately

        await gamePage.page.waitForTimeout(1000);

        // Verify: Hand contains Micky and Minnie
        await expect(gamePage.page.locator('[data-testid="player-hand"] img[alt*="Mickey Mouse"]')).toBeVisible();
        await expect(gamePage.page.locator('[data-testid="player-hand"] img[alt*="Minnie Mouse"]')).toBeVisible();
    });

});
