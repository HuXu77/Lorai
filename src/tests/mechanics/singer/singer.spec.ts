
import { test, expect } from '../../e2e/fixtures/game-fixture';

test.describe('Mechanic: Singer', () => {
    test.beforeEach(async ({ gamePage }) => {
        await gamePage.loadTestGame();
    });

    test('Positive: Singer 5 (Ariel) can sing cost 5 song', async ({ gamePage }) => {
        // Setup state: Ariel (Singer 5) and A Whole New World (Cost 5)
        await gamePage.injectState({
            player1: {
                play: [{ name: 'Ariel - Spectacular Singer', ready: true, turnPlayed: 0 }],
                hand: ['A Whole New World'],
                inkwell: [],
                lore: 0
            },
            player2: {
                hand: [],
                deck: [],
                lore: 0
            },
            turnPlayer: 'player1'
        });

        await gamePage.expectCardInPlay('Ariel');

        // Click Song
        await gamePage.clickCardInHand('A Whole New World');

        // Expect Sing button
        const singBtn = gamePage.page.getByRole('button', { name: /Sing/i });
        await expect(singBtn).toBeVisible();
        await expect(singBtn).toBeEnabled();

        // Click Sing
        await singBtn.click();

        // Select Ariel
        await expect(gamePage.page.getByText(/Choose a character to sing/i)).toBeVisible();
        await gamePage.selectModalOption('Ariel');

        // Confirm selection (Multiselect since multiple singers allowed)
        await gamePage.confirmModal();

        // Verify effect (Hand reset involved in AWNW, but we can just check log or discard)
        // AWNW causes draw, so check log for confirmation. Note: Log says "sang" or "sings"
        await gamePage.expectLogMessage(/Ariel.*(sang|sings).*A Whole New World/i);

        // Check Ariel is exerted
        // Note: checking visual state of card 'ready' status might be via opacity or transform in live app, 
        // usually 'play-card' locator wrapper can be checked for class.
        // For now, reliance on log/effect is sufficient for functional proof.
    });

    test('Negative: Singer 3 (Cinderella) cannot sing cost 5 song', async ({ gamePage }) => {
        // Setup state: Cinderella (Singer 3) and A Whole New World (Cost 5)
        await gamePage.injectState({
            player1: {
                play: [{ name: 'Cinderella - Ballroom Sensation', ready: true, turnPlayed: 0 }],
                hand: ['A Whole New World'],
                inkwell: [],
                lore: 0
            },
            player2: {
                hand: [],
                deck: [],
                lore: 0
            },
            turnPlayer: 'player1'
        });

        await gamePage.expectCardInPlay('Cinderella');

        // Click Song
        await gamePage.clickCardInHand('A Whole New World');

        // Expect Sing button to be VISIBLE but DISABLED
        const singBtn = gamePage.page.getByRole('button', { name: /Sing/i });
        await expect(singBtn).toBeVisible();
        await expect(singBtn).toBeDisabled();
    });
});
