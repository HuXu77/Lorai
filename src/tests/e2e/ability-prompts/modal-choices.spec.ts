import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Tests for Modal Choice Pattern (Category 5)
 */

test.describe('Modal Choices - "Choose One" Effects', () => {
    test.beforeEach(async ({ gamePage }) => {
        await gamePage.loadTestGame();
    });

    test('should display all available options in modal', async ({ gamePage }) => {
        // Setup: Maui's Fish Hook (Action: Choose Evasive or +3 Strength)
        // Need a character to target for the effect
        await gamePage.injectState({
            player1: {
                hand: ["Maui's Fish Hook"],
                inkwell: ['Mickey Mouse - True Friend', 'Mickey Mouse - True Friend', 'Mickey Mouse - True Friend'], // 3 ink (Item cost 3? wait, inventory says 2 cost)
                // Inventory: | 2 | IT'S MAUI TIME! ... | Maui's Fish Hook |
                // Let's give 3 ink to be safe.
                play: [{ name: 'Mickey Mouse - True Friend' }],
                deck: ['Mickey Mouse - True Friend']
            },
            player2: {
                deck: ['Mickey Mouse - True Friend']
            }
        });

        // Play the item
        await gamePage.playCardFromHand("Maui's Fish Hook");

        // Use the item's ability "Shapeshift"
        // It costs 2 ink and exerts.
        // We need to click the item in play, then click "Shapeshift" in action menu
        await gamePage.clickCardInPlay("Maui's Fish Hook");
        await gamePage.clickAction("Shapeshift");

        // Verify Modal appears with options
        const modal = await gamePage.expectModal('modal-choice');
        await expect(modal).toContainText(/Choose one/i);
        await expect(modal).toContainText(/Evasive/i);
        await expect(modal).toContainText(/\+3/i);
    });

    test('should execute selected option and ignore others', async ({ gamePage }) => {
        // Same setup
        await gamePage.injectState({
            player1: {
                hand: ["Maui's Fish Hook"],
                inkwell: Array(5).fill('Mickey Mouse - True Friend'),
                play: [{ name: 'Mickey Mouse - True Friend' }],
                deck: ['Mickey Mouse - True Friend']
            },
            player2: { deck: ['Mickey Mouse - True Friend'] }
        });

        await gamePage.playCardFromHand("Maui's Fish Hook");

        // Use Ability
        await gamePage.clickCardInPlay("Maui's Fish Hook");
        await gamePage.clickAction("Shapeshift");

        // Select "+3 Strength" option
        await gamePage.selectModalOption("+3"); // Partial text match

        // Verify targeting follows (since checks chosen character)
        const targetModal = await gamePage.expectModal(); // Targeting modal or state
        // Or just click target
        await gamePage.clickCardInPlay('Mickey Mouse - True Friend');

        // Verify effect: Strength increased
        await gamePage.expectLogMessage(/ggets? \+3/i); // "Gets +3 Strength"
    });
});

