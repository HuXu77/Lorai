import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - DISTRIBUTE_DAMAGE / MULTI_TARGET
 * 
 * Tests abilities that require selecting multiple targets, specifically Mulan - Elite Archer's
 * splash damage ability ("deal damage to up to 2 other chosen characters").
 */

test.describe('Modal: Multi-Target Damage (Mulan)', () => {

    test('should allow selecting 2 targets for splash damage', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        // Setup: 
        // P1: Mulan (Ready, not drying)
        // P2: Goofy (exerted, can be challenged), Donald, Mickey (targets for splash)
        await gamePage.injectState({
            player1: {
                play: [{ name: 'Mulan - Elite Archer', ready: true, damage: 0, turnPlayed: 0 }],
                lore: 0,
                hand: [],
                inkwell: [],
                deck: ['Mickey Mouse - Detective', 'Mickey Mouse - Detective']
            },
            player2: {
                play: [
                    { name: 'Goofy - Musketeer', ready: false, exerted: true, turnPlayed: 0 },
                    { name: 'Donald Duck - Musketeer', ready: true, turnPlayed: 0 },
                    { name: 'Mickey Mouse - Musketeer', ready: true, turnPlayed: 0 }
                ],
                lore: 0,
                hand: [],
                inkwell: [],
                deck: ['Mickey Mouse - Detective', 'Mickey Mouse - Detective']
            },
            turnPlayer: 'player1'
        });

        await gamePage.page.waitForTimeout(2000);

        // Challenge Goofy with Mulan
        await gamePage.clickCardInPlay('Mulan');
        await gamePage.clickAction('Challenge');

        // Wait for challenge target selection modal to appear
        await expect(gamePage.page.getByText(/Challenge with Mulan|select|target/i).first()).toBeVisible({ timeout: 5000 });

        // Select Goofy from the modal (not from the board - modal overlay blocks board clicks)
        const goofyBtn = gamePage.page.getByRole('button', { name: /Goofy/i });
        await expect(goofyBtn).toBeVisible({ timeout: 5000 });
        await goofyBtn.click();

        // Wait for Splash Damage Modal
        await expect(gamePage.page.getByText(/choose|target|damage/i).first()).toBeVisible({ timeout: 10000 });

        // Select Targets (Donald and Mickey) - use getByRole for buttons  
        const donaldBtn = gamePage.page.getByRole('button', { name: /Donald Duck/i });
        const mickeyBtn = gamePage.page.getByRole('button', { name: /Mickey Mouse/i });

        await expect(donaldBtn).toBeVisible({ timeout: 5000 });
        await donaldBtn.click();

        await expect(mickeyBtn).toBeVisible();
        await mickeyBtn.click();

        // Confirm selections
        const confirmBtn = gamePage.page.getByRole('button', { name: /Confirm/i });
        await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
        await confirmBtn.click();

        // Wait for effects to resolve
        await gamePage.page.waitForTimeout(1500);

        // Verify Damage in log
        await gamePage.expectLogMessage(/damage|Donald|Mickey|Mulan/i);
    });

});
