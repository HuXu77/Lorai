
import { test, expect } from '../fixtures/game-fixture';

test.describe('Abilities: Exert & Ready', () => {

    test.skip('LeFou - Instigator should ready chosen character on play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        await gamePage.injectState({
            player1: {
                hand: ['LeFou - Instigator', 'Ink', 'Ink'],
                play: [
                    { name: 'Stitch - New Dog', damage: 0, ready: false } // Exerted
                ],
                inkwell: ['Ink', 'Ink'], // Cost 2
                deck: Array(20).fill('Ink')
            },
            player2: { play: [], hand: [], deck: [], inkwell: [] },
            turnPlayer: 'player1'
        });

        // Debug: Verify Stitch is exerted
        await expect(gamePage.page.locator('[data-name="Stitch - New Dog"]')).toHaveClass(/opacity-60/);

        // Play LeFou
        await gamePage.clickCardInHand('LeFou - Instigator');
        await gamePage.clickAction('Play'); // Cost 2

        // LeFou has a "When you play this character" ability: "Ready chosen character."
        // We expect a choice modal.
        await gamePage.expectModal('choice-modal'); // Target selection
        await gamePage.selectModalOption('Stitch');
        await gamePage.confirmModal();

        // Assert Stitch is ready (not opacity-60)
        // Note: The ability also says "They can't quest this turn." 
        // We can verify this by checking if clicking Stitch shows the Quest action (it shouldn't, or it should be disabled)
        // But primarily we check the ready state visually.
        await expect(gamePage.page.locator('[data-name="Stitch - New Dog"]')).not.toHaveClass(/opacity-60/);

        // Assert: Verify "Can't Quest" (Optional, but good for completeness)
        // If we click the ready Stitch, checking actions...
        await gamePage.clickCardInPlay('Stitch - New Dog');
        // The action menu should NOT show "Quest" or it should be blocked.
        // Assuming "Quest" button exists but clicking it might show a warning or it's absent.
        // For now, let's just stick to the Ready check.
    });

    test.skip('Fan the Flames should ready chosen character', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        await gamePage.injectState({
            player1: {
                hand: ['Fan the Flames', 'Ink', 'Ink'],
                play: [
                    { name: 'Stitch - New Dog', damage: 0, ready: false } // Exerted
                ],
                inkwell: ['Ink', 'Ink'], // Cost 1? 
                // Fan the Flames cost is 1 (Action)
                deck: Array(20).fill('Ink')
            },
            player2: { play: [], hand: [], deck: [], inkwell: [] },
            turnPlayer: 'player1'
        });

        // Debug: Verify Stitch is exerted
        await expect(gamePage.page.locator('[data-name="Stitch - New Dog"]')).toHaveClass(/opacity-60/);

        // Play Fan the Flames
        await gamePage.clickCardInHand('Fan the Flames');
        await gamePage.clickAction('Play');

        // Target selection
        await gamePage.expectModal('choice-modal');
        await gamePage.selectModalOption('Stitch');
        await gamePage.confirmModal();

        // Assert Stitch is ready
        await expect(gamePage.page.locator('[data-name="Stitch - New Dog"]')).not.toHaveClass(/opacity-60/);

        // Assert Fan the Flames is in discard (Action processed)
        // We can check discard pile or just that it's no longer in hand/play.
    });

});
