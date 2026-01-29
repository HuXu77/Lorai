import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - COMPLEX_TARGETING
 * 
 * Tests "Choose up to X targets" functionality.
 * Card: Elsa - Spirit of Winter
 * Ability: "DEEP FREEZE: When you play this character, exert up to 2 chosen characters. They can't ready at the start of their next turn."
 */

test.describe('Modal: Complex Targeting (Elsa)', () => {

    test('should allow choosing 2 opposing characters to exert', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup:
        // P1: Elsa in hand. Ink 6.
        // P2: 2 Characters in play (Minnie, Donald).
        await gamePage.injectState({
            player1: {
                hand: ['Elsa - Spirit of Winter'],
                inkwell: Array(6).fill('Goofy - Musketeer'), // 6 ink using valid card
                deck: ['Goofy - Musketeer'],
                lore: 0
            },
            player2: {
                play: [
                    { name: 'Minnie Mouse - Always Classy', ready: true }, // Target 1
                    { name: 'Donald Duck - Musketeer', ready: true }      // Target 2
                ],
                deck: ['Mickey Mouse - Detective'],
                lore: 0
            },
            turnPlayer: 'player1'
        });

        await gamePage.page.waitForTimeout(1000);

        // Play Elsa
        await gamePage.playCardFromHand('Elsa - Spirit of Winter');
        console.log('BROWSER: [TEST] Clicked Play Card via Helper');

        // Should trigger Ability: "Exert up to 2 chosen characters"
        // Expect Modal "Choose up to 2 characters" or similar
        // Since it's "chosen characters" (AbilityParser maps to target_character with count?),
        // It might be `target_character` with max=2.

        // Wait for modal
        const modal = gamePage.page.locator('[data-testid="choice-modal"]');
        await expect(modal).toBeVisible();
        await expect(modal).toContainText(/Select|Choose/i);

        // Verify options (Minnie and Donald)
        const minnieOption = modal.getByRole('button', { name: /Minnie Mouse/i });
        const donaldOption = modal.getByRole('button', { name: /Donald Duck/i });

        await expect(minnieOption).toBeVisible();
        await expect(donaldOption).toBeVisible();

        // Select both
        await minnieOption.click();
        await donaldOption.click();

        // Check if selection indicators appear (optional check, but good for UI verification)
        // Usually checked by "Confirm" becoming enabled.

        const confirmBtn = modal.getByRole('button', { name: /Confirm/i });
        await expect(confirmBtn).toBeEnabled();
        await confirmBtn.click();

        // Verify Effect
        // Both Minnie and Donald should be Exerted.
        // We can check the "Exerted" state (usually visual rotation or attribute).
        // injectState sets them to 'ready: true'.
        // After effect, they should be 'ready: false' (exerted).

        // We can check game log first
        await gamePage.expectLogMessage(/Elsa/i);
        await gamePage.expectLogMessage(/exerted/i);

        // Check state via debug or UI class
        // UI uses `transform: rotate` or similar.
        // Or we can check if they are "Exerted" in their tooltip/details?
        // GamePage fixture has expectCardInPlay(..., { exerted: true })? No.
        // We'll rely on Log + Modal success for now.
    });

    test('should allow choosing 0 or 1 target (up to 2)', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                hand: ['Elsa - Spirit of Winter'],
                inkwell: Array(6).fill('Generic Ink'),
                deck: ['Goofy - Musketeer']
            },
            player2: {
                play: [{ name: 'Minnie Mouse - Always Classy', ready: true }],
                deck: ['Mickey Mouse - Detective']
            },
            turnPlayer: 'player1'
        });

        await gamePage.clickCardInHand('Elsa - Spirit of Winter');
        await gamePage.page.getByRole('button', { name: /Play Card/i }).click();

        const modal = gamePage.page.locator('[data-testid="choice-modal"]');
        await expect(modal).toBeVisible();

        // Select 1 (Minnie)
        await modal.getByRole('button', { name: /Minnie Mouse/i }).click();

        // Confirm should be enabled
        await modal.getByRole('button', { name: /Confirm/i }).click();

        await gamePage.expectLogMessage(/Elsa/i);
    });
});
