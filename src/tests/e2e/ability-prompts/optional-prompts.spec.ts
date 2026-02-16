import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Tests for Optional Prompt Interaction Pattern (Category 2)
 * 
 * Tests verify that "you may" effects correctly display prompts to the user
 * and that the UI responds appropriately to user choices.
 */

test.describe('Optional Prompts - "You May" Effects', () => {
    test.beforeEach(async ({ gamePage }) => {
        await gamePage.loadTestGame();
    });

    test('should display Yes/No modal for "you may draw" effect', async ({ gamePage }) => {
        // Setup: Maleficent - Sorceress (Cost 2, When play may draw 1)
        await gamePage.injectState({
            player1: {
                hand: ['Maleficent - Sorceress'],
                inkwell: ['Mickey Mouse - True Friend', 'Mickey Mouse - True Friend'], // 2 ink
                deck: ['Mickey Mouse - True Friend'] // Card to draw
            },
            player2: {
                deck: ['Mickey Mouse - True Friend']
            }
        });

        // Play the character
        await gamePage.playCardFromHand('Maleficent - Sorceress');

        // Verify modal appears
        const modal = await gamePage.expectModal();
        await expect(modal).toContainText(/Maleficent - Sorceress/i);
        await expect(modal).toContainText(/draw a card/i);

        // Click Yes
        await gamePage.confirmModal(); // Handles "Yes", "Confirm", etc.

        // Verify effect: Hand size should be 1 (0 after play + 1 drawn)
        await gamePage.expectHandSize(1);
    });

    test('should respect "No" choice and not execute effect', async ({ gamePage }) => {
        await gamePage.injectState({
            player1: {
                hand: ['Maleficent - Sorceress'],
                inkwell: ['Mickey Mouse - True Friend', 'Mickey Mouse - True Friend'],
                deck: ['Mickey Mouse - True Friend']
            },
            player2: {
                deck: ['Mickey Mouse - True Friend']
            }
        });

        await gamePage.playCardFromHand('Maleficent - Sorceress');

        // Verify modal appears
        await gamePage.expectModal();

        // Click No
        await gamePage.cancelModal();

        // Verify effect: Hand size should be 0 (0 after play + 0 drawn)
        await gamePage.expectHandSize(0);
    });

    test('should handle optional damage effect (Switch to Targeting)', async ({ gamePage }) => {
        // Setup: Stitch - Team Underdog (Cost 4, When play, may deal 2 damage to chosen char)
        // Need a target for it to be valid
        await gamePage.injectState({
            player1: {
                hand: ['Stitch - Team Underdog'],
                inkwell: ['Mickey Mouse - True Friend', 'Mickey Mouse - True Friend', 'Mickey Mouse - True Friend', 'Mickey Mouse - True Friend'], // 4 ink
                deck: ['Mickey Mouse - True Friend']
            },
            player2: {
                play: [{ name: 'Mickey Mouse - True Friend' }], // Target
                deck: ['Mickey Mouse - True Friend']
            }
        });

        await gamePage.playCardFromHand('Stitch - Team Underdog');

        // Note: For "You may deal damage to chosen character", the engine might optimize
        // by skipping the "Do you want to?" Yes/No prompt and going straight to targeting
        // with a "Skip" or "Pass" option.
        // The logs showed it went straight to `target_character`.

        // Verify targeting mode (checking log or just performing action)
        // Select the opponent's Mickey
        await gamePage.clickCardInPlay('Mickey Mouse - True Friend');

        // Verify damage dealt (Mickey has 2 damage)
        // We can check log for now as reliable proxy
        await gamePage.expectLogMessage(/Stitch - Team Underdog.*deal 2 damage/i);
    });
});
