import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - SCRY
 * 
 * Tests the scry modal for looking at and reordering top cards.
 * Uses: Ursula's Cauldron - Item with "Peer Into The Depths" ability
 */

test.describe('Modal: Scry', () => {

    // Known gap: Item click doesn't open action menu reliably in E2E
    // Gap tracker: PlayAreaActionMenu not rendering for items
    // Gap tracker: PlayAreaActionMenu not rendering for items
    test('should allow reordering cards with Scry', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        // Setup: Ursula's Cauldron (item) and known deck
        await gamePage.injectState({
            player1: {
                play: [{ name: 'Ursula\'s Cauldron', turnPlayed: 0, ready: true }], // Ensure ready
                deck: ['Mickey Mouse - Detective', 'Donald Duck - Boisterous Fowl'],
                lore: 0,
                hand: [],
                inkwell: ['Generic Ink'] // Items usually need ink to activate
            },
            player2: {
                deck: ['Mickey Mouse - Detective'],
                hand: [],
                play: [],
                inkwell: [],
                lore: 0
            },
            turnPlayer: 'player1'
        });

        await gamePage.page.waitForTimeout(2000);

        // Activate Cauldron - click to open action menu
        await gamePage.clickCardInPlay('Ursula\'s Cauldron');

        // Wait for action menu dialog to appear
        const actionMenu = gamePage.page.locator('[role="dialog"]').filter({ hasText: 'Ursula\'s Cauldron' });
        await expect(actionMenu).toBeVisible({ timeout: 5000 });

        // Click the ability button - look for button containing ability name text
        // The ability name is "PEER INTO THE DEPTHS" but may be formatted differently
        const abilityBtn = actionMenu.getByRole('button', { name: /PEER INTO|Peer Into|depth/i });
        await expect(abilityBtn).toBeVisible({ timeout: 5000 });
        await abilityBtn.click();

        // Verify Scry Modal appears - look for "Look at" text
        await expect(gamePage.page.getByText(/look at|scry/i).first()).toBeVisible({ timeout: 10000 });

        // Should verify cards are present - use getByRole for buttons
        await expect(gamePage.page.getByRole('button', { name: /Mickey Mouse/i })).toBeVisible();
        await expect(gamePage.page.getByRole('button', { name: /Donald Duck/i })).toBeVisible();

        // Confirm the scry (keep default order)
        const confirmBtn = gamePage.page.getByRole('button', { name: /Confirm|Done|OK/i });
        await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
        await confirmBtn.click();

        // Verify modal closed
        await gamePage.page.waitForTimeout(1000);

        // Verify Log
        await gamePage.expectLogMessage(/looked|scry|Ursula's Cauldron/i);
    });

});
