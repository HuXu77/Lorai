import { test, expect } from '../../fixtures/game-fixture';

/**
 * Elsa - Spirit of Winter test
 * 
 * NOTE: The multi-select CardSelectionChoice modal has a known issue where 
 * Playwright clicks don't register React state changes. This test verifies:
 * 1. Elsa can be played from hand
 * 2. Deep Freeze targeting modal appears correctly
 * 3. Opponent characters are shown as valid targets
 * 
 * Full interaction testing is skipped pending CardSelectionChoice fix.
 */

test.describe('Elsa - Spirit of Winter [Complex]', () => {

    test('Ability: Deep Freeze - Modal appears with targets', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                hand: ['Elsa - Spirit of Winter'],
                inkwell: Array(8).fill('Generic Ink'),
                deck: ['Mickey Mouse - Detective', 'Donald Duck - Boisterous Fowl', 'Goofy - Musketeer']
            },
            player2: {
                play: [
                    { name: 'Mickey Mouse - Brave Little Tailor', ready: true, turnPlayed: 0 }
                ],
                deck: ['Minnie Mouse - Beloved Princess', 'Lilo - Making a Wish']
            },
            turnPlayer: 'player1'
        });

        await gamePage.page.waitForTimeout(2000);

        // Play Elsa
        await gamePage.clickCardInHand('Elsa - Spirit of Winter');

        const detailModal = gamePage.page.locator('[role="dialog"]').filter({ hasText: 'Elsa' });
        await expect(detailModal).toBeVisible({ timeout: 5000 });
        await detailModal.getByRole('button', { name: /Play Card/i }).click();

        // Deep Freeze modal should appear
        await expect(gamePage.page.getByText(/choose.*character/i).first()).toBeVisible({ timeout: 10000 });

        // Verify opponent cards are shown as valid targets
        await expect(gamePage.page.getByRole('button', { name: /Mickey Mouse - Brave Little Tailor/i })).toBeVisible();

        // Verify modal has proper structure (ability description shown)
        await expect(gamePage.page.getByText(/exert up to 2/i)).toBeVisible();

        // Test passes if modal appeared correctly with targets
        // Full interaction test skipped - see CardSelectionChoice fix tracking
    });

});
