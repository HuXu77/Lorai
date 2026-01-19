
import { test, expect } from '../fixtures/game-fixture';

test.describe('Abilities: Draw & Manipulation', () => {



    test('Friends on the Other Side should draw 2 cards', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        // Setup:
        // P1: Friends in hand, 3 Ink, Deck has 2 cards
        await gamePage.injectState({
            player1: {
                hand: ['Friends on the Other Side'],
                deck: ['Mickey Mouse - Brave Little Tailor', 'Tinker Bell - Giant Fairy'],
                inkwell: ['Ink', 'Ink', 'Ink'], // Cost 3
                play: [],
            },
            player2: { play: [], hand: [], deck: [], inkwell: [] },
            turnPlayer: 'player1'
        });

        await gamePage.clickCardInHand('Friends on the Other Side');
        // Action menu "Play" or "Play Card". 
        // Using "Play" to match likely button text (often "Play (3)").
        await gamePage.clickAction('Play Card');

        // Wait for effects
        await gamePage.page.waitForTimeout(2000);

        // Verify state directly
        const handSize = await gamePage.page.evaluate(() => {
            const state = JSON.parse((window as any).lorcanaDebug.getState());
            return state.players.player1.hand.length;
        });
        expect(handSize).toBe(2);
    });

    test('Develop Your Brain should look at top 2 and put one in hand', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        // Develop Your Brain: 1 Cost Action.
        await gamePage.injectState({
            player1: {
                hand: ['Develop Your Brain'],
                deck: ['Maleficent - Monstrous Dragon', 'Goofy - Musketeer'],
                inkwell: ['Ink'],
                play: [],
            },
            player2: { play: [], hand: [], deck: [], inkwell: [] },
            turnPlayer: 'player1'
        });

        await gamePage.clickCardInHand('Develop Your Brain');
        await gamePage.clickAction('Play Card');

        // Should show modal with the 2 cards
        await gamePage.expectModal();

        // Verify both cards are options
        // Modal usually shows card images or names. selectModalOption matches by text/name.
        // Assuming cards in deck are A, B. 
        // Note: We don't strictly know which is top/bottom from injectState array order without testing.
        // But both should be in the "top 2" if deck size is 2.

        // Select Maleficent
        await gamePage.selectModalOption('Maleficent - Monstrous Dragon');

        // Confirm selection
        await gamePage.confirmModal();

        await gamePage.page.waitForTimeout(1000);

        // Verify Maleficent is in hand (via state)
        const hand = await gamePage.page.evaluate(() => {
            const state = JSON.parse((window as any).lorcanaDebug.getState());
            return state.players.player1.hand.map((c: any) => c.fullName);
        });
        expect(hand).toContain('Maleficent - Monstrous Dragon');
        expect(hand).not.toContain('Goofy - Musketeer');
    });

    test('Mickey Mouse - Detective should ramp ink', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        // Mickey Mouse - Detective: 3 Cost Character. 
        await gamePage.injectState({
            player1: {
                hand: ['Mickey Mouse - Detective'],
                deck: ['One Jump Ahead'],
                inkwell: ['Ink', 'Ink', 'Ink'], // Cost 3
                play: [],
            },
            player2: { play: [], hand: [], deck: [], inkwell: [] },
            turnPlayer: 'player1'
        });

        // Play Mickey
        await gamePage.clickCardInHand('Mickey Mouse - Detective');
        await gamePage.clickAction('Play Card');

        await gamePage.page.waitForTimeout(2000);

        // Try to handle optional prompt if it exists
        const confirmBtn = gamePage.page.locator('button').filter({ hasText: /Yes|Confirm|Ok/i });
        if (await confirmBtn.count() > 0 && await confirmBtn.first().isVisible()) {
            await confirmBtn.first().click();
            await gamePage.page.waitForTimeout(1000);
        }

        const inkCount = await gamePage.page.evaluate(() => {
            const state = JSON.parse((window as any).lorcanaDebug.getState());
            return state.players.player1.inkwell.length;
        });

        // 3 paid (exerted) + 1 new (exerted) = 4 total
        expect(inkCount).toBe(4);
    });

});
