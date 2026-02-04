
import { test, expect } from '../../e2e/fixtures/game-fixture';

test.describe('Mechanic: Bodyguard', () => {
    test.beforeEach(async ({ gamePage }) => {
        await gamePage.loadTestGame();
    });

    test('Enters Play Exerted choice', async ({ gamePage }) => {
        // Setup state: Simba in hand, 2 ink
        await gamePage.injectState({
            player1: {
                hand: ['Simba - Protective Cub'],
                inkwell: ['Mickey Mouse - True Friend', 'Mickey Mouse - True Friend'], // Valid cards for ink
                play: [],
                lore: 0
            },
            player2: {
                deck: [],
                hand: [],
                lore: 0
            },
            turnPlayer: 'player1'
        });

        // Play Simba
        await gamePage.playCardFromHand('Simba - Protective Cub');

        // Verify "Enter Exerted?" modal
        await expect(gamePage.page.getByText(/play.*exerted/i)).toBeVisible();

        // Choose "Yes" (or "Confirm" / "Play Exerted")
        // NOTE: Label might be "Exerted" or "Yes". Adjust based on actual UI.
        const yesBtn = gamePage.page.getByRole('button', { name: /Yes|Exerted/i });
        await yesBtn.click();

        // Verify Simba is in play and EXERTED
        // We can visual check logging or attributes
        await gamePage.expectLogMessage(/played Simba/i);

        // TODO: Add visual assertion for exerted state if possible (class check?)
    });

    test('Forces Challenge Target', async ({ gamePage }) => {
        // Setup state: P1 Hook (Attacker), P2 Simba (Exerted Bodyguard) + Minnie (Exerted)
        await gamePage.injectState({
            player1: {
                play: [{ name: 'Captain Hook - Forceful Duelist', ready: true, turnPlayed: 0 }],
                lore: 0
            },
            player2: {
                play: [
                    { name: 'Simba - Protective Cub', ready: false, exerted: true }, // Bodyguard
                    { name: 'Minnie Mouse - Always Classy', ready: false, exerted: true } // Protected
                ],
                lore: 0
            },
            turnPlayer: 'player1'
        });

        // Initiate Challenge
        await gamePage.clickCardInPlay('Captain Hook');
        const challengeBtn = gamePage.page.getByRole('button', { name: /Challenge/i });
        await challengeBtn.click();

        // Verify selection modal
        await expect(gamePage.page.getByText(/Challenge with/i)).toBeVisible();

        // Simba should be visible
        const simbaOption = gamePage.page.locator('button').filter({ hasText: 'Simba' });
        await expect(simbaOption).toBeVisible();

        // Minnie should NOT be visible (implicit check by absence or explicitly checking not visible)
        const minnieOption = gamePage.page.locator('button').filter({ hasText: 'Minnie' });
        await expect(minnieOption).not.toBeVisible();

        // Verify we can click Simba
        await simbaOption.click();
        await gamePage.expectLogMessage(/challenged .*Simba/i);
    });
});
