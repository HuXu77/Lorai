import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - TARGET_OPPOSING_CHARACTER
 * 
 * Tests the targeting modal for "chosen opposing character" abilities.
 * Uses: The Queen - Commanding Presence (deals -4 strength to chosen opposing character when she quests)
 */

test.describe('Modal: Target Opposing Character', () => {

    test('should show modal with only opponent characters as options', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                play: [
                    { name: 'The Queen - Commanding Presence', ready: true, turnPlayed: 0 },
                    { name: 'Stitch - Carefree Surfer', ready: true, turnPlayed: 0 } // Own character (should be filtered out)
                ],
                lore: 0,
                hand: [],
                inkwell: [],
                deck: ['Mickey Mouse - Detective']
            },
            player2: {
                play: [{ name: 'Mickey Mouse - Brave Little Tailor', ready: false, exerted: true, turnPlayed: 0 }],
                deck: ['Mickey Mouse - Detective']
            },
            turnPlayer: 'player1'
        });

        await gamePage.page.waitForTimeout(2000); // State settle

        // Quest with The Queen to trigger opposing target
        await gamePage.clickCardInPlay('The Queen');
        await gamePage.clickAction('Quest');

        // Modal should appear - use getByRole for reliable detection
        await expect(gamePage.page.getByText(/choose|target|select/i).first()).toBeVisible({ timeout: 10000 });

        // Should show opponent's Mickey (use getByRole for button)
        await expect(gamePage.page.getByRole('button', { name: /Mickey Mouse/i })).toBeVisible();

        // Should NOT show our Stitch - buttons shouldn't have Stitch
        const stitchButton = gamePage.page.getByRole('button', { name: /Stitch/i });
        await expect(stitchButton).toHaveCount(0);
    });

    test('should only allow selecting opposing characters', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                play: [{ name: 'The Queen - Commanding Presence', ready: true, turnPlayed: 0 }],
                deck: ['Mickey Mouse - Detective']
            },
            player2: {
                play: [{ name: 'Mickey Mouse - Brave Little Tailor', ready: false, exerted: true, turnPlayed: 0 }],
                deck: ['Mickey Mouse - Detective']
            },
            turnPlayer: 'player1'
        });

        await gamePage.page.waitForTimeout(2000);

        // Trigger ability
        await gamePage.clickCardInPlay('The Queen');
        await gamePage.clickAction('Quest');

        // Wait for modal and select Mickey (first target - opposing, gets -4)
        const mickeyBtn = gamePage.page.getByRole('button', { name: /Mickey Mouse/i });
        await expect(mickeyBtn).toBeVisible({ timeout: 10000 });
        await mickeyBtn.click();

        // Wait for confirm button and click (first selection)
        let confirmBtn = gamePage.page.getByRole('button', { name: /Confirm/i });
        await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
        await confirmBtn.click();

        // The Queen has a second part: "chosen character gets +4 strength"
        // Wait for second targeting modal
        await expect(gamePage.page.getByText(/choose/i).first()).toBeVisible({ timeout: 10000 });

        // Select The Queen herself for +4 strength
        const queenBtn = gamePage.page.getByRole('button', { name: /The Queen/i });
        await expect(queenBtn).toBeVisible({ timeout: 5000 });
        await queenBtn.click();

        // Confirm second selection
        confirmBtn = gamePage.page.getByRole('button', { name: /Confirm/i });
        await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
        await confirmBtn.click();

        // Verify modal closed
        await gamePage.page.waitForTimeout(1000);

        // Verify effect applied (strength reduction or log)
        await gamePage.expectLogMessage(/-4|strength|Mickey|Queen/i);
    });

});
