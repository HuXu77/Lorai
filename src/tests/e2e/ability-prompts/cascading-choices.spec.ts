import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Tests for Cascading Choices Pattern (Category 7)
 */

test.describe('Cascading Choices - Sequential Decision Points', () => {
    test.beforeEach(async ({ gamePage }) => {
        await gamePage.loadTestGame();
    });

    test('should present choices in correct sequence (Draw then Discard)', async ({ gamePage }) => {
        // Setup: Tinker Bell - Tiny Tactician (BATTLE PLANS: Draw, then choose and discard)
        // Note: The ability text is "Draw a card, then choose and discard a card."
        // This likely triggers a draw automatically (Pattern 1), then a "Choose card to discard" modal (Pattern 3).
        // It might not be "Optional" draw.

        await gamePage.injectState({
            player1: {
                hand: ['Tinker Bell - Tiny Tactician', 'Mickey Mouse - True Friend'], // Need extra card to discard
                inkwell: Array(4).fill('Mickey Mouse - True Friend'),
                // Inventory: | 4 | BATTLE PLANS...
                play: ['Mickey Mouse - True Friend'], // Random char
                deck: ['Mickey Mouse - True Friend']
            },
            player2: { deck: ['Mickey Mouse - True Friend'] }
        });

        await gamePage.playCardFromHand('Tinker Bell - Tiny Tactician');

        // Use Ability (Exert)
        await gamePage.clickCardInPlay('Tinker Bell - Tiny Tactician');
        await gamePage.clickAction('Battle Plans'); // Assess ability name from UI

        // Step 1: Draw happens automatically (check log)
        // Step 2: Discard Modal appears
        const modal = await gamePage.expectModal('discard-choice');
        await expect(modal).toContainText(/discard/i);

        // Select card to discard (Mickey)
        // In discard choice modal, usually cards are presented to click
        // Let's assume standard card selection
        const cardToDiscard = modal.locator('img[alt="Mickey Mouse - True Friend"]').first();
        await cardToDiscard.click();

        // Verify discard happened
        await gamePage.expectLogMessage(/discards Mickey Mouse - True Friend/i);
    });

    test('should handle conditional cascading (Julieta Madrigal)', async ({ gamePage }) => {
        // Setup: Julieta Madrigal - Excellent Cook
        // "When you play this character, you may remove up to 2 damage... If you removed damage this way, you may draw a card."
        // Sequence:
        // 1. Optional Target (Single/Multi? "Choose character") - "remove up to 2 damage from chosen character"
        //    Actually text says "from chosen character".
        //    So it's Pattern 3 (Single Target).
        // 2. If damage removed > 0, Prompt "Do you want to draw a card?" (Pattern 2).

        const targetName = 'Mickey Mouse - True Friend';
        await gamePage.injectState({
            player1: {
                hand: ['Julieta Madrigal - Excellent Cook'],
                inkwell: Array(4).fill('Mickey Mouse - True Friend'),
                deck: ['Mickey Mouse - True Friend']
            },
            player2: {
                play: [{ name: targetName, damage: 2 }],
                deck: ['Mickey Mouse - True Friend']
            }
        });

        await gamePage.playCardFromHand('Julieta Madrigal - Excellent Cook');

        // Step 1: Choose character to heal (Mandatory selection? "You may remove..." usually implies optionality or 0 amount, 
        // but typically "may remove" starts with target selection, then amounts?)
        // Let's assume it prompts to select character first.

        // Wait, "you may remove up to 2 damage"
        // Usually implemented as: Select target -> Select amount -> Confirm?
        // Or just Select target -> Auto heal max possible?
        // Let's assume finding target
        await gamePage.clickCardInPlay(targetName);

        // Step 2: "You may draw a card" modal should appear
        const modal = await gamePage.expectModal();
        await expect(modal).toContainText(/draw a card/i);

        // Click Yes
        await gamePage.confirmModal();

        // Verify Draw
        await gamePage.expectHandSize(1);
    });
});

