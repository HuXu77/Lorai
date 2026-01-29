import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - REARRANGE_HAND
 * 
 * Tests abilities that put cards from hand back onto deck.
 * Card: Hypnotic Deduction (Draw 3 cards, then put 2 cards from your hand on top of your deck.)
 */

test.describe('Modal: Rearrange Hand', () => {

    // GAP: Hypnotic Deduction (Put 2 from hand on deck) not triggering modal
    test('should allow selecting cards from hand to put on deck', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup:
        // Hand: Hypnotic Deduction + 2 other cards (to put back)
        // Ink: 3 cards (assuming cost is <= 3, likely 2 or 3)
        // Deck: 3 cards (for drawing)
        await gamePage.injectState({
            player1: {
                hand: ['Hypnotic Deduction', 'Mickey Mouse - Detective', 'Donald Duck - Boisterous Fowl'],
                inkwell: ['Goofy - Musketeer', 'Goofy - Musketeer', 'Goofy - Musketeer'],
                deck: ['Magic Broom - Bucket Brigade', 'Magic Broom - Bucket Brigade', 'Magic Broom - Bucket Brigade'],
                play: []
            },
            turnPlayer: 'player1'
        });

        // Open Action Menu
        await gamePage.clickCardInHand('Hypnotic Deduction');

        // Wait for Debug Object
        console.log('BROWSER: [TEST] Waiting 3000ms for UI resolution...');
        await gamePage.page.waitForTimeout(3000);

        // Close Action Menu
        console.log('BROWSER: [TEST] Closing Action Menu (Escape)...');
        await gamePage.page.keyboard.press('Escape');
        await gamePage.page.waitForTimeout(500);

        await gamePage.page.evaluate(async () => {
            // Poll for debug object
            let attempts = 0;
            while (attempts < 10) {
                const debug = (window as any).lorcanaDebug;
                if (debug && debug.engine && debug.state && debug.state.players) break;
                await new Promise(r => setTimeout(r, 500));
                attempts++;
            }

            const debug = (window as any).lorcanaDebug;
            if (!debug || !debug.engine) {
                console.error('BROWSER: [TEST-ERROR] Debug object incomplete!');
                return;
            }

            const engine = debug.engine;
            const player1 = debug.state.players[debug.player1Id];
            const card = player1.hand.find((c: any) => c.name.includes('Hypnotic'));

            console.log(`BROWSER: [TEST] Direct playCard call for ${card.name}`);

            // Async call to avoid deadlock
            engine.turnManager.playCard(player1, card.instanceId).then((r: any) =>
                console.log('Play resolved:', r)
            );
        });

        console.log('BROWSER: [TEST] Direct call completed. Waiting for modal...');

        // It draws 3 first. So hand size increases to 2+3 = 5.
        // Then modal appears to put 2 back.

        // Expect Modal "Choose 2 cards"
        const modal = await gamePage.expectModal();
        await expect(modal).toBeVisible();
        await expect(modal).toContainText(/put 2 cards/i);

        // Select 2 cards (Mickey and Donald)
        // Note: The modal might use the hand UI or a specific list. 
        // Select cards to put back
        const mickeyBtn = modal.getByRole('button', { name: /Mickey Mouse/i });
        const donaldBtn = modal.getByRole('button', { name: /Donald Duck/i });

        await expect(mickeyBtn).toBeVisible();
        await mickeyBtn.click();
        await donaldBtn.click();

        // Confirm
        const confirmBtn = gamePage.page.getByRole('button', { name: /Confirm/i });
        await expect(confirmBtn).toBeEnabled();
        await confirmBtn.click();

        // Modal Should Close (or trigger Order Cards next?)
        // If Hypnotic Deduction says "in any order", it might trigger ORDER_CARDS next.
        // Let's check if another modal appears.

        // Wait briefly to see if order modal appears or if it just closes
        await gamePage.page.waitForTimeout(1000);

        // If order modal appears, we just click confirm (default order)
        const orderModal = gamePage.page.locator('[role="dialog"]').filter({ hasText: /order/i });
        if (await orderModal.isVisible()) {
            await gamePage.page.getByRole('button', { name: /Confirm/i }).click();
        }

        await expect(modal).toBeHidden();

        // Verify Log
        await gamePage.expectLogMessage(/Hypnotic Deduction/i);
    });

});
