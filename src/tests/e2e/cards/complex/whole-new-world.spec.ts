import { test, expect } from '../../fixtures/game-fixture';

test.describe('A Whole New World [Complex]', () => {

    test('Ability: A Whole New World - Discard Hand and Draw 7', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup state using injectState
        await gamePage.injectState({
            player1: {
                hand: ['A Whole New World', 'Minnie Mouse - Beloved Princess'],
                inkwell: ['Minnie Mouse - Always Classy', 'Minnie Mouse - Always Classy', 'Minnie Mouse - Always Classy', 'Minnie Mouse - Always Classy', 'Minnie Mouse - Always Classy'], // 5 Ink
                deck: ['Mickey Mouse - Detective', 'Donald Duck - Strutting His Stuff', 'Goofy - Musketeer', 'Beast - Hardheaded', 'Aladdin - Street Rat', 'Abu - Mischievous Monkey', 'Genie - On the Job', 'Jafar - Wicked Sorcerer']
            },
            player2: {
                hand: ['Mickey Mouse - Detective', 'Donald Duck - Strutting His Stuff'],
                deck: ['Mickey Mouse - Detective', 'Donald Duck - Strutting His Stuff', 'Goofy - Musketeer', 'Beast - Hardheaded', 'Aladdin - Street Rat', 'Abu - Mischievous Monkey', 'Genie - On the Job', 'Jafar - Wicked Sorcerer']
            }
        });

        await gamePage.endTurn();
        await gamePage.page.waitForTimeout(1000);
        await gamePage.page.waitForSelector('text=Your Turn');

        // 1. Verify Initial State
        // Should have at least 3 cards (AWNW + Minnie + Draw for turn)
        await gamePage.expectHandSize(3);
        await gamePage.expectCardInHand('A Whole New World');
        await gamePage.expectCardInHand('Minnie Mouse - Beloved Princess');

        // 2. Play A Whole New World
        console.log('Playing A Whole New World...');
        await gamePage.clickCardInHand('A Whole New World');
        await gamePage.clickAction('Play Card');

        // This is a Song, so it plays immediately if ink is sufficient (it is).
        // It should trigger discard and draw.

        // 3. Verify Log
        // "Discard your hand and draw 7 cards."
        await gamePage.expectLogMessage(/played.*A Whole New World/i);

        // 4. Verify Effect
        // Hand count should be 7
        // Wait for animations/updates
        await gamePage.page.waitForTimeout(2000);

        await gamePage.expectHandSize(7);
    });

});
