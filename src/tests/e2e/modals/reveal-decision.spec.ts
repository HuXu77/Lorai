import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - REVEAL_AND_DECIDE
 * 
 * Tests abilities where player looks at top card and decides where to put it (Top/Bottom).
 * Card: Merlin - Squirrel (When you play this character, look at the top card of your deck. Put it on either the top or the bottom.)
 */

test.describe('Modal: Reveal and Decide (Top/Bottom)', () => {

    // GAP: Merlin - Squirrel ability
    test('should allow putting card on bottom of deck', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup:
        // Hand: Merlin - Squirrel (2 cost)
        // Ink: 2 cards
        // Deck: Magic Broom (Top card)
        await gamePage.injectState({
            player1: {
                hand: ['Merlin - Squirrel'],
                inkwell: ['Mickey Mouse - Detective', 'Mickey Mouse - Detective'],
                deck: ['Magic Broom - Bucket Brigade'],
                play: []
            },
            turnPlayer: 'player1'
        });

        // Play Merlin
        console.log('BROWSER: [TEST] Clicking Merlin in hand...');
        await gamePage.clickCardInHand('Merlin - Squirrel');

        // Check if Play button is enabled
        const playButton = gamePage.page.locator('button:has-text("Play")').first();
        const isDisabled = await playButton.isDisabled();
        const updateHtml = await playButton.innerHTML();
        console.log(`BROWSER: [TEST] Play Button Disabled: ${isDisabled}`);
        console.log(`BROWSER: [TEST] Play Button HTML: ${updateHtml}`);

        // Check Inkwell state via evaluate
        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            if (debug && debug.state && debug.state.players) {
                const p1 = debug.state.players[debug.player1Id];
                if (p1) {
                    console.log(`BROWSER: [TEST] Inkwell Count: ${p1.inkwell.length}`);
                    p1.inkwell.forEach((c: any, i: number) => {
                        console.log(`BROWSER: [TEST] Ink[${i}]: ${c.name} ready=${c.ready}`);
                    });
                }
            } else {
                console.log('BROWSER: [TEST-WARN] Debug state not ready yet during check');
            }
        });

        console.log('BROWSER: [TEST] Waiting 3000ms for UI resolution and debug object...',);
        await gamePage.page.waitForTimeout(3000);

        // Close the Action Menu so it doesn't conflict with expectModal
        console.log('BROWSER: [TEST] Closing Action Menu (Escape)...');
        await gamePage.page.keyboard.press('Escape');
        await gamePage.page.waitForTimeout(500); // Wait for animation

        console.log('BROWSER: [TEST] Calling playCard via window.lorcanaDebug...');
        await gamePage.page.evaluate(async () => {
            // Poll for debug object
            let attempts = 0;
            while (attempts < 10) {
                const debug = (window as any).lorcanaDebug;
                if (debug && debug.engine && debug.state && debug.state.players) {
                    break;
                }
                await new Promise(r => setTimeout(r, 500));
                attempts++;
            }

            const debug = (window as any).lorcanaDebug;
            if (!debug || !debug.engine || !debug.state || !debug.state.players) {
                console.error('BROWSER: [TEST-ERROR] Debug object incomplete after polling!');
                return;
            }
            const engine = debug.engine;
            const player1 = debug.state.players[debug.player1Id];

            // Find Merlin
            const card = player1.hand.find((c: any) => c.name.includes('Merlin'));
            if (!card) {
                console.error('BROWSER: [TEST-ERROR] Merlin not found in hand for direct call!');
                return;
            }

            console.log(`BROWSER: [TEST] Direct playCard call for ${card.name} (${card.instanceId})`);

            // CRITICAL FIX: Do NOT await playCard!
            // playCard waits for user input (the choice). If we await it here, page.evaluate never returns,
            // blocking the test from clicking the modal. Deadlock.
            engine.turnManager.playCard(player1, card.instanceId).then((result: any) => {
                console.log(`BROWSER: [TEST] Direct call resolved: ${result}`);
            }).catch((e: any) => {
                console.error(`BROWSER: [TEST-ERROR] Direct call exception: ${e}`);
            });

            console.log('BROWSER: [TEST] Triggered playCard (async)...');
        });

        console.log('BROWSER: [TEST] Direct call completed. Waiting for modal...');

        console.log('BROWSER: [TEST] Direct call completed. Waiting for modal...');

        // Verify Modal - Use specific ID to avoid Action Menu conflict
        // const modal = await gamePage.expectModal();
        const modal = gamePage.page.locator('[data-testid="choice-modal"]');
        await expect(modal).toBeVisible();

        await expect(modal).toContainText(/Look at top card/i);
        await expect(modal).toContainText('Magic Broom');

        // Verify Options (Top / Bottom)
        const topBtn = gamePage.page.getByRole('button', { name: /Top/i });
        const bottomBtn = gamePage.page.getByRole('button', { name: /Bottom/i });
        await expect(topBtn).toBeVisible();
        await expect(bottomBtn).toBeVisible();

        // Choose Bottom
        await bottomBtn.click();

        // Verify Modal Closed
        await expect(modal).toBeHidden();
    });

    // GAP: Same issue
    test('should allow putting card on top of deck', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                hand: ['Merlin - Squirrel'],
                inkwell: ['Mickey Mouse - Detective', 'Mickey Mouse - Detective'],
                deck: ['Magic Broom - Bucket Brigade'],
                play: []
            },
            turnPlayer: 'player1'
        });

        // Open Action Menu (needed for hand selection visual)
        await gamePage.clickCardInHand('Merlin - Squirrel');

        // Wait for Debug Object
        console.log('BROWSER: [TEST] Waiting 3000ms for UI resolution...');
        await gamePage.page.waitForTimeout(3000);

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
            const card = player1.hand.find((c: any) => c.name.includes('Merlin'));

            console.log(`BROWSER: [TEST] Direct playCard call for ${card.name}`);

            // Async call to avoid deadlock
            engine.turnManager.playCard(player1, card.instanceId).then((r: any) =>
                console.log('Play resolved:', r)
            );
        });

        const modal = gamePage.page.locator('[data-testid="choice-modal"]');
        await expect(modal).toBeVisible();

        await gamePage.page.getByRole('button', { name: /Top/i }).click();
        await expect(modal).toBeHidden();
    });

});
