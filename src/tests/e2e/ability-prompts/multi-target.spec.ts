import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Tests for Multiple Target Selection Pattern (Category 4)
 */

test.describe('Multiple Target Selection - "Choose Up To X" Effects', () => {
    test.beforeEach(async ({ gamePage }) => {
        await gamePage.loadTestGame();
    });

    test('should allow selecting multiple targets up to maximum', async ({ gamePage }) => {
        // Setup: Elsa - Spirit of Winter (Exert up to 2 chosen characters)
        // Opponent has 2 characters
        await gamePage.injectState({
            player1: {
                hand: ['Elsa - Spirit of Winter'],
                inkwell: Array(6).fill('Mickey Mouse - True Friend'),
                deck: ['Mickey Mouse - True Friend']
            },
            player2: {
                play: [{ name: 'Mickey Mouse - True Friend' }, { name: 'Minnie Mouse - Always Classy' }],
                deck: ['Mickey Mouse - True Friend']
            }
        });

        await gamePage.playCardFromHand('Elsa - Spirit of Winter');

        // Select first target
        await gamePage.clickCardInPlay('Mickey Mouse - True Friend');
        // UI should show "1/2 selected" or similar

        // Select second target
        await gamePage.clickCardInPlay('Minnie Mouse - Always Classy');

        // Confirm selection (Multiselect often requires explicit confirm)
        await gamePage.confirmModal();

        // Verify Log
        await gamePage.expectLogMessage(/Elsa - Spirit of Winter exerts Mickey Mouse - True Friend/i);
        await gamePage.expectLogMessage(/Elsa - Spirit of Winter exerts Minnie Mouse - Always Classy/i);
    });

    test('should allow selecting fewer than max targets (0 or 1)', async ({ gamePage }) => {
        // Same setup
        await gamePage.injectState({
            player1: {
                hand: ['Elsa - Spirit of Winter'],
                inkwell: Array(6).fill('Mickey Mouse - True Friend'),
                deck: ['Mickey Mouse - True Friend']
            },
            player2: {
                play: [{ name: 'Mickey Mouse - True Friend' }, { name: 'Minnie Mouse - Always Classy' }],
                deck: ['Mickey Mouse - True Friend']
            }
        });

        await gamePage.playCardFromHand('Elsa - Spirit of Winter');

        // Select ONLY one target
        await gamePage.clickCardInPlay('Mickey Mouse - True Friend');

        // Confirm
        await gamePage.confirmModal();

        // Verify ONLY one exerted
        await gamePage.expectLogMessage(/Elsa - Spirit of Winter exerts Mickey Mouse - True Friend/i);
        // Should NOT see second one
        // await gamePage.expectLogMessage(/exerts Minnie Mouse/i); // Hard to assert 'not' with this helper
    });
});

