import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Opponent Choice Mechanic
 * 
 * Tests "You Have Forgotten Me" — an action where each opponent
 * chooses and discards 2 cards from their own hand.
 * This verifies the opponent_discard_choice flow where the choice
 * is routed to the opponent (bot), not the active player.
 */
test.describe('Opponent Choice Mechanic', () => {
    test('You Have Forgotten Me should force opponent to discard 2 cards', async ({ gamePage }) => {
        test.setTimeout(60000);
        const actionCard = 'You Have Forgotten Me'; // Cost 4, "Each opponent chooses and discards 2 cards."

        // 0. Load Game
        await gamePage.loadTestGame();

        // 1. Setup Board State
        await gamePage.injectState({
            player1: {
                hand: [actionCard],
                play: [],
                inkwell: ['Ink', 'Ink', 'Ink', 'Ink'], // 4 Ink for cost 4
            },
            player2: {
                hand: [
                    'Goofy - Musketeer',
                    'Beast - Hardheaded',
                    'Minnie Mouse - Beloved Princess'
                ], // 3 cards — should discard 2, leaving 1
                play: [],
                lore: 0,
                deck: ['Stitch - Rock Star'] // Need at least 1 card so game doesn't end
            },
            turnPlayer: 'player1'
        });

        // 2. Snapshot pre-play state
        const preState = await gamePage.page.evaluate(() => {
            // @ts-ignore
            const debug = window.lorcanaDebug;
            if (!debug) return null;
            const p2 = debug.state.players[debug.player2Id];
            return {
                p2Hand: p2.hand.length,
                p2Discard: p2.discard.length
            };
        });
        expect(preState).not.toBeNull();
        expect(preState!.p2Hand).toBe(3);
        expect(preState!.p2Discard).toBe(0);

        // 3. Play the card
        await gamePage.clickCardInHand(actionCard);

        // Click play button via data-testid
        const playButton = gamePage.page.getByTestId('play-card-button').first();
        await expect(playButton).toBeVisible();
        await playButton.evaluate((btn) => (btn as HTMLElement).click());

        // 4. Wait for the bot to auto-resolve its discard choices
        // The bot handles opponent_discard_choice automatically (random fallback)
        await gamePage.page.waitForTimeout(3000);

        // 5. Verify post-play state via engine
        const postState = await gamePage.page.evaluate(() => {
            // @ts-ignore
            const debug = window.lorcanaDebug;
            if (!debug) return null;
            const p2 = debug.state.players[debug.player2Id];
            return {
                p2Hand: p2.hand.length,
                p2Discard: p2.discard.length,
                p2DiscardNames: p2.discard.map((c: any) => c.name)
            };
        });

        expect(postState).not.toBeNull();

        // Opponent should have discarded exactly 2 cards
        expect(postState!.p2Hand).toBe(1); // 3 - 2 = 1
        expect(postState!.p2Discard).toBe(2);
        expect(postState!.p2DiscardNames).toHaveLength(2);
    });

    test('You Have Forgotten Me with opponent having fewer than 2 cards', async ({ gamePage }) => {
        test.setTimeout(60000);
        const actionCard = 'You Have Forgotten Me';

        await gamePage.loadTestGame();

        // Opponent has only 1 card — should discard 1 (can't discard more than they have)
        await gamePage.injectState({
            player1: {
                hand: [actionCard],
                play: [],
                inkwell: ['Ink', 'Ink', 'Ink', 'Ink'],
            },
            player2: {
                hand: ['Goofy - Musketeer'], // Only 1 card
                play: [],
                lore: 0,
                deck: ['Stitch - Rock Star']
            },
            turnPlayer: 'player1'
        });

        // Play the card
        await gamePage.clickCardInHand(actionCard);
        const playButton = gamePage.page.getByTestId('play-card-button').first();
        await expect(playButton).toBeVisible();
        await playButton.evaluate((btn) => (btn as HTMLElement).click());

        await gamePage.page.waitForTimeout(3000);

        // Verify: opponent discarded only 1 (all they had)
        const postState = await gamePage.page.evaluate(() => {
            // @ts-ignore
            const debug = window.lorcanaDebug;
            if (!debug) return null;
            const p2 = debug.state.players[debug.player2Id];
            return {
                p2Hand: p2.hand.length,
                p2Discard: p2.discard.length
            };
        });

        expect(postState).not.toBeNull();
        expect(postState!.p2Hand).toBe(0); // 1 - 1 = 0
        expect(postState!.p2Discard).toBe(1);
    });
});
