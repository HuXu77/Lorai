import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - REVEAL_AND_DECIDE
 * 
 * Tests the "Reveal and Decide" modal interactions.
 * specifically focusing on Daisy Duck - Donald's Date which causes
 * the OPPONENT to reveal a card.
 * 
 * Player 1 (User) should see an informational modal ("OK" button)
 * showing what the Opponent revealed.
 */

test.describe('Modal: Reveal and Decide', () => {

    test('should show revealed character from opponent deck', async ({ gamePage }) => {
        test.setTimeout(60000);
        gamePage.page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
        await gamePage.loadTestGame();

        // Setup: Daisy in Play for Player 1
        // Opponent (Player 2) has a Character on top of deck (Mickey Mouse)
        await gamePage.injectState({
            player1: {
                play: [{ name: 'Daisy Duck - Donald\'s Date', ready: true, turnPlayed: 0 }],
                deck: [],
                lore: 0,
                hand: [],
                inkwell: []
            },
            player2: {
                deck: ['Mickey Mouse - Brave Little Tailor'],
                hand: [],
                play: [],
                inkwell: [],
                lore: 0
            },
            turnPlayer: 'player1'
        });

        // Quest with Daisy to trigger ability
        await gamePage.clickCardInPlay('Daisy Duck');
        await gamePage.clickAction('Quest');

        // Verify Modal Appears with correct text
        const modal = await gamePage.expectModal();
        await expect(modal).toContainText('Mickey Mouse'); // Revealed Card Name

        // Acknowledge (Player 1 clicks OK)
        await gamePage.selectModalOption('OK');

        // Since it's a Character, Bot MIGHT put it in hand. 
        // We verify the interaction log/completion primarily.
        // We can check if modal closed.
        await expect(modal).toBeHidden();
    });

    test('should show revealed non-character from opponent deck', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        // Setup: Daisy in Play for Player 1
        // Opponent (Player 2) has a Non-Character on top of deck (Dragon Fire)
        await gamePage.injectState({
            player1: {
                play: [{ name: 'Daisy Duck - Donald\'s Date', ready: true, turnPlayed: 0 }],
                deck: [],
                lore: 0,
                hand: [],
                inkwell: []
            },
            player2: {
                deck: ['Dragon Fire'],
                hand: [],
                play: [],
                inkwell: [],
                lore: 0
            },
            turnPlayer: 'player1'
        });

        await gamePage.clickCardInPlay('Daisy Duck');
        await gamePage.clickAction('Quest');

        const modal = await gamePage.expectModal();
        await expect(modal).toContainText('Dragon Fire');

        await gamePage.selectModalOption('OK');

        await expect(modal).toBeHidden();

        // Opponent MUST put non-character on bottom.
        // We could verify deck size/bottom, but simply ensuring no crash/hang is sufficient.
    });

});
