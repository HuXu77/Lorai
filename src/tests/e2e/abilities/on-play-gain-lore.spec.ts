import { test, expect } from '../fixtures/game-fixture';

/**
 * On Play -> Gain Lore Abilities
 * Tests for characters that gain lore when played.
 */

test.describe('Abilities: On Play - Gain Lore', () => {

    test('The White Rose - Jewel of the Garden should gain 1 lore on play', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                hand: ['The White Rose - Jewel of the Garden'],
                inkwell: ['Ink', 'Ink', 'Ink'], // Cost 3
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

        // Play The White Rose
        await gamePage.clickCardInHand('The White Rose');
        await gamePage.clickAction('Play Card');

        await gamePage.page.waitForTimeout(1000);

        // Verify: Player 1 lore is 1
        await gamePage.expectLore(1, 1);
    });

    test('Bambi - Little Prince should gain 1 lore on play', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                hand: ['Bambi - Little Prince'],
                inkwell: ['Ink', 'Ink', 'Ink'], // Cost 3 (assuming cost is <= 3, check json if needed, grep said cost 3 in snippet? No, didn't see cost)
                // Bambi cost is usually low. I'll give 5 ink just in case.
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

        // Add extra ink just to be safe about cost
        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            if (debug) {
                for (let i = 0; i < 5; i++) {
                    debug.addToInkwell(debug.player1Id, 'Generic Ink');
                }
            }
        });

        // Play Bambi
        await gamePage.clickCardInHand('Bambi');
        await gamePage.clickAction('Play Card');

        await gamePage.page.waitForTimeout(1000);

        // Verify: Player 1 lore is 1
        await gamePage.expectLore(1, 1);
    });

});
