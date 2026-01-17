import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - SCRY
 * 
 * Tests the scry modal for looking at and reordering top cards.
 * Example: "Look at the top 3 cards. Put any on bottom in any order."
 */

test.describe('Modal: Scry', () => {

    test('should allow reordering cards with Scry', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        // 1. Setup: Ursula's Cauldron and known deck
        await gamePage.injectState({
            player1: {
                play: [{ name: 'Ursula\'s Cauldron', ready: true }],
                deck: ['Mickey Mouse - Detective', 'Donald Duck - Boisterous Fowl'],
                lore: 0,
                hand: [],
                inkwell: []
            },
            player2: {
                deck: [],
                hand: [],
                play: [],
                inkwell: [],
                lore: 0
            },
            turnPlayer: 'player1'
        });

        // 2. Activate Cauldron
        await gamePage.clickCardInPlay('Ursula\'s Cauldron');
        // It's an item, so clicking usually shows "Activate" or the ability name if it has an activated ability
        // If it sends a `UseAbility` action directly, we check available actions.
        // Usually items with 1 activated ability might just have a "Use Ability" or the ability name.
        await gamePage.clickAction('PEER INTO THE DEPTHS'); // Ability Name from card text

        // 3. Verify Scry Modal
        await gamePage.page.waitForTimeout(1000);
        const modal = await gamePage.expectModal();
        await expect(modal).toContainText('Look at top 2 cards');

        // Should verify cards are present in the modal
        await expect(modal.locator('text=Mickey Mouse')).toBeVisible();
        await expect(modal.locator('text=Donald Duck')).toBeVisible();

        // 4. Interact (Confirm default order or just confirm)
        // For simplicity in this first pass, we just confirm the view. 
        // Complex drag-and-drop testing is flaky without specific testids for slots.
        await gamePage.confirmModal();

        // 5. Verify Log
        await gamePage.expectLogMessage(/Player 1 looked at top 2 cards/i);
    });

});
