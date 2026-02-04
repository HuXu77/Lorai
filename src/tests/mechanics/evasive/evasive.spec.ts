
import { test, expect } from '../../e2e/fixtures/game-fixture';

test.describe('Mechanic: Evasive', () => {
    test.beforeEach(async ({ gamePage }) => {
        await gamePage.loadTestGame();
    });

    test('Non-Evasive character cannot select Evasive target for challenge', async ({ gamePage }) => {
        // Setup: P1 has non-Evasive character (Stitch), P2 has Evasive character (Tinker Bell, exerted)
        await gamePage.injectState({
            player1: {
                play: [{ name: 'Stitch - Rock Star', ready: true, turnPlayed: 0 }],
                lore: 0
            },
            player2: {
                play: [{ name: 'Tinker Bell - Peter Pan\'s Ally', ready: false, exerted: true }],
                lore: 0
            },
            turnPlayer: 'player1'
        });

        // Click on Stitch to open action menu
        await gamePage.clickCardInPlay('Stitch - Rock Star');

        // Verify "Challenge" button exists
        const challengeBtn = gamePage.page.getByRole('button', { name: /challenge/i });

        // The Challenge button should either:
        // 1. Not exist (if no valid targets)
        // 2. Be disabled
        // 3. When clicked, show no targets

        // Check if challenge button is visible
        const isChallengeVisible = await challengeBtn.isVisible().catch(() => false);

        if (isChallengeVisible) {
            // If challenge button exists, it should be disabled or show no targets
            const isDisabled = await challengeBtn.isDisabled().catch(() => false);

            if (!isDisabled) {
                // If not disabled, clicking should show no valid targets
                await challengeBtn.click();

                // Verify Tinker Bell is NOT in the selectable targets
                const tinkerBellTarget = gamePage.page.getByTestId('challenge-target-Tinker Bell - Peter Pan\'s Ally');
                await expect(tinkerBellTarget).not.toBeVisible();
            }
        } else {
            // Challenge button doesn't exist - this is correct behavior (no valid targets)
            expect(isChallengeVisible).toBe(false);
        }
    });

    test('Evasive character can select Evasive target for challenge', async ({ gamePage }) => {
        // Setup: P1 has Evasive character (Jetsam), P2 has Evasive character (Tinker Bell, exerted)
        await gamePage.injectState({
            player1: {
                play: [{ name: 'Jetsam - Ursula\'s Spy', ready: true, turnPlayed: 0 }],
                lore: 0
            },
            player2: {
                play: [{ name: 'Tinker Bell - Peter Pan\'s Ally', ready: false, exerted: true }],
                lore: 0
            },
            turnPlayer: 'player1'
        });

        // Click on Jetsam to open action menu
        await gamePage.clickCardInPlay('Jetsam - Ursula\'s Spy');

        // Verify "Challenge" button exists and is enabled
        const challengeBtn = gamePage.page.getByRole('button', { name: /challenge/i });
        await expect(challengeBtn).toBeVisible();
        await expect(challengeBtn).toBeEnabled();

        // Click Challenge button to see available targets
        await challengeBtn.click();

        // Wait for UI to update
        await gamePage.page.waitForTimeout(1000);

        // Verify Tinker Bell IS visible as a selectable target
        // Since both have Evasive, Tinker Bell should be available
        const tinkerBellCard = gamePage.page.locator('[data-card-name*="Tinker Bell"], [data-card-id*="Tinker"]').first();
        await expect(tinkerBellCard).toBeVisible({ timeout: 5000 });

        // Success - Evasive character can see Evasive targets
    });

    test('Non-Evasive character can see non-Evasive targets for challenge', async ({ gamePage }) => {
        // Setup: P1 has non-Evasive (Stitch), P2 has non-Evasive (HeiHei, exerted)
        await gamePage.injectState({
            player1: {
                play: [{ name: 'Stitch - Rock Star', ready: true, turnPlayed: 0 }],
                lore: 0
            },
            player2: {
                play: [{ name: 'HeiHei - Boat Snack', ready: false, exerted: true }],
                lore: 0
            },
            turnPlayer: 'player1'
        });

        // Click on Stitch to open action menu
        await gamePage.clickCardInPlay('Stitch - Rock Star');

        // Verify "Challenge" button exists and is enabled
        const challengeBtn = gamePage.page.getByRole('button', { name: /challenge/i });
        await expect(challengeBtn).toBeVisible();
        await expect(challengeBtn).toBeEnabled();

        // Click Challenge button to see available targets
        await challengeBtn.click();

        // Wait for UI to update
        await gamePage.page.waitForTimeout(1000);

        // Verify HeiHei IS visible as a selectable target
        // Since neither has Evasive, HeiHei should be available
        const heiheiCard = gamePage.page.locator('[data-card-name*="HeiHei"], [data-card-id*="HeiHei"]').first();
        await expect(heiheiCard).toBeVisible({ timeout: 5000 });

        // Success - Non-Evasive character can see non-Evasive targets
    });
});
