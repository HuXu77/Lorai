import { test, expect } from '../fixtures/game-fixture';

test.describe('Ability: Bodyguard', () => {
    test.beforeEach(async ({ gamePage }) => {
        await gamePage.loadTestGame();
    });

    test('should force challenging the Bodyguard character', async ({ gamePage }) => {
        // Setup state
        await gamePage.injectState({
            player1: {
                play: [
                    { name: 'Captain Hook', ready: true, turnPlayed: 0 }
                ],
                hand: [],
                inkwell: [],
                lore: 0
            },
            player2: {
                play: [
                    { name: 'Simba - Protective Cub', ready: false, exerted: true, damage: 0 }, // Bodyguard
                    { name: 'Minnie Mouse', ready: false, exerted: true, damage: 0 } // Protected
                ],
                hand: [],
                deck: [],
                lore: 0
            },
            turnPlayer: 'player1'
        });

        // Ensure Captain Hook is present
        await gamePage.expectCardInPlay('Captain Hook');

        // Click Captain Hook (Attacker)
        await gamePage.clickCardInPlay('Captain Hook');

        // Click Challenge
        // PlayAreaActionMenu should appear
        const challengeBtn = gamePage.page.getByRole('button', { name: /Challenge/i });
        await expect(challengeBtn).toBeVisible();
        await challengeBtn.click();

        // Verify Targets in the modal
        // "Challenge with Captain Hook..." should appear
        await expect(gamePage.page.getByText(/Challenge with/i)).toBeVisible();

        // Simba should be selectable (visible option)
        // We look for button containing "Simba"
        const simbaOption = gamePage.page.locator('button').filter({ hasText: 'Simba' });
        await expect(simbaOption).toBeVisible();

        // Minnie should NOT be selectable (or not present in list)
        const minnieOption = gamePage.page.locator('button').filter({ hasText: 'Minnie' });
        await expect(minnieOption).not.toBeVisible();

        // Challenge Simba
        await simbaOption.click();

        // Wait for update
        await gamePage.page.waitForTimeout(1000);

        // Verify log - Using more flexible regex
        // "You challenged **Simba...** with **Captain Hook...**"
        await gamePage.expectLogMessage(/challenged .*Simba/i);
    });
});
