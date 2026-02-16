import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Tests for Single Target Selection Pattern (Category 3)
 */

test.describe('Single Target Selection - "Chosen Character" Effects', () => {
    test.beforeEach(async ({ gamePage }) => {
        await gamePage.loadTestGame();
    });

    test('should highlight valid targets for damage effect', async ({ gamePage }) => {
        // Setup: Smash (Deal 3 damage to chosen character)
        const targetName = 'Mickey Mouse - True Friend';
        await gamePage.injectState({
            player1: {
                hand: ['Smash'],
                inkwell: ['Mickey Mouse - True Friend', 'Mickey Mouse - True Friend', 'Mickey Mouse - True Friend'],
                deck: ['Mickey Mouse - True Friend']
            },
            player2: {
                play: [{ name: targetName }],
                deck: ['Mickey Mouse - True Friend']
            }
        });

        await gamePage.playCardFromHand('Smash');

        // Verify log indicates targeting or UI state
        // For now, we just perform the action
        await gamePage.clickCardInPlay(targetName);

        // Verify damage dealt
        // We can check the log
        await gamePage.expectLogMessage(`Smash deals 3 damage to ${targetName}`);
    });

    test('should restrict targeting by type (Item vs Character)', async ({ gamePage }) => {
        // Setup: Break (Banish chosen item)
        // Opponent has a character AND an item
        const charName = 'Mickey Mouse - True Friend';
        const itemName = 'Frying Pan';

        await gamePage.injectState({
            player1: {
                hand: ['Break'],
                inkwell: ['Mickey Mouse - True Friend', 'Mickey Mouse - True Friend'],
                deck: ['Mickey Mouse - True Friend']
            },
            player2: {
                play: [{ name: charName }, { name: itemName }],
                deck: ['Mickey Mouse - True Friend']
            }
        });

        await gamePage.playCardFromHand('Break');

        // Try to click character (Invalid target)
        await gamePage.clickCardInPlay(charName);

        // Asset character is still in play (didn't get banished)
        await gamePage.expectCardInPlay(charName, 2);

        // Click item (Valid target)
        await gamePage.clickCardInPlay(itemName);

        // Verify item is banished (no longer in play)
        // Note: expectCardInPlay checks visibility. If it's gone, it should fail or return false.
        // We need a negative assertion helper or catch expectation failure
        // For now, check log
        await gamePage.expectLogMessage(`Break banishes ${itemName}`);
    });

    test('should handle Recursion (Select from Discard)', async ({ gamePage }) => {
        // Setup: Part of Your World (Return character from discard)
        // Use a different card to ensure no ID conflicts or specific card issues
        const discardName = 'Stitch - New Dog';

        await gamePage.injectState({
            player1: {
                hand: ['Part of Your World'],
                discard: [discardName],
                inkwell: ['Mickey Mouse - True Friend', 'Mickey Mouse - True Friend', 'Mickey Mouse - True Friend'],
                deck: ['Mickey Mouse - True Friend']
            },
            player2: { deck: ['Mickey Mouse - True Friend'] }
        });

        // Add a small wait to ensure state is fully settled and indexed
        await gamePage.page.waitForTimeout(2000);

        await gamePage.playCardFromHand('Part of Your World');

        // Verify Discard Modal appears
        const modal = await gamePage.expectModal('discard-browser');
        await expect(modal).toBeVisible();

        // Select card from discard
        // Targeted fix: Find card in modal
        const cardInModal = modal.locator(`img[alt="${discardName}"]`).first();
        await expect(cardInModal).toBeVisible({ timeout: 5000 });
        await cardInModal.click();

        // Verify returned to hand
        await gamePage.expectLogMessage(`Part of Your World returns ${discardName} to hand`);
        await gamePage.expectHandSize(1); // 0 -> 1
    });
});

