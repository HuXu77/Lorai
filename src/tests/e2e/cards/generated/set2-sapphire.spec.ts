import { test, expect } from '../../fixtures/game-fixture';

test.describe('Batch: Set 2 Sapphire', () => {

    test('Alice - Growing Girl - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Alice - Growing Girl', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 3 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Alice - Growing Girl');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Alice - Growing Girl. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Alice/i);
    });

    test('Basil - Great Mouse Detective - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Basil - Great Mouse Detective', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 6 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Basil - Great Mouse Detective');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Basil - Great Mouse Detective. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Basil/i);
    });

    test('Basil - Of Baker Street - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Basil - Of Baker Street', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 2 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Basil - Of Baker Street');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Basil - Of Baker Street. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Basil/i);
    });

    test('Cogsworth - Grandfather Clock - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Cogsworth - Grandfather Clock', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 5 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Cogsworth - Grandfather Clock');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Cogsworth - Grandfather Clock. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Cogsworth/i);
    });

    test('Cogsworth - Talking Clock - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Cogsworth - Talking Clock', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 2 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Cogsworth - Talking Clock');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Cogsworth - Talking Clock. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Cogsworth/i);
    });

    test('Cruella De Vil - Fashionable Cruiser - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Cruella De Vil - Fashionable Cruiser', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 2 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Cruella De Vil - Fashionable Cruiser');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Cruella De Vil - Fashionable Cruiser. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Cruella De Vil/i);
    });

    test('Cruella De Vil - Perfectly Wretched - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Cruella De Vil - Perfectly Wretched', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 5 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Cruella De Vil - Perfectly Wretched');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Cruella De Vil - Perfectly Wretched. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Cruella De Vil/i);
    });

    test('Duke Weaselton - Small-Time Crook - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Duke Weaselton - Small-Time Crook', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 2 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Duke Weaselton - Small-Time Crook');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Duke Weaselton - Small-Time Crook. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Duke Weaselton/i);
    });

    test('Gaston - Intellectual Powerhouse - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Gaston - Intellectual Powerhouse', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 6 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Gaston - Intellectual Powerhouse');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Gaston - Intellectual Powerhouse. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Gaston/i);
    });

    test('Grand Pabbie - Oldest and Wisest - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Grand Pabbie - Oldest and Wisest', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 7 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Grand Pabbie - Oldest and Wisest');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Grand Pabbie - Oldest and Wisest. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Grand Pabbie/i);
    });

    test('Hiram Flaversham - Toymaker - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Hiram Flaversham - Toymaker', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 4 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Hiram Flaversham - Toymaker');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Hiram Flaversham - Toymaker. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Hiram Flaversham/i);
    });

    test('James - Role Model - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('James - Role Model', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 4 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('James - Role Model');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for James - Role Model. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/James/i);
    });

    test('Jasmine - Heir of Agrabah - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Jasmine - Heir of Agrabah', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 1 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Jasmine - Heir of Agrabah');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Jasmine - Heir of Agrabah. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Jasmine/i);
    });

    test('Judy Hopps - Optimistic Officer - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Judy Hopps - Optimistic Officer', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 3 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Judy Hopps - Optimistic Officer');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Judy Hopps - Optimistic Officer. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Judy Hopps/i);
    });

    test('Mrs. Judson - Housekeeper - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Mrs. Judson - Housekeeper', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 4 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Mrs. Judson - Housekeeper');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Mrs. Judson - Housekeeper. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Mrs\. Judson/i);
    });

    test('Nick Wilde - Wily Fox - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Nick Wilde - Wily Fox', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 4 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Nick Wilde - Wily Fox');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Nick Wilde - Wily Fox. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Nick Wilde/i);
    });

    test('Noi - Orphaned Thief - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Noi - Orphaned Thief', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 2 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Noi - Orphaned Thief');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Noi - Orphaned Thief. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Noi/i);
    });

    test('Sisu - Divine Water Dragon - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Sisu - Divine Water Dragon', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 4 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Sisu - Divine Water Dragon');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Sisu - Divine Water Dragon. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Sisu/i);
    });

    test('The Nokk - Water Spirit - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('The Nokk - Water Spirit', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 4 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('The Nokk - Water Spirit');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for The Nokk - Water Spirit. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/The Nokk/i);
    });

    test('Winnie the Pooh - Having a Think - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Winnie the Pooh - Having a Think', 1);

            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for (let i = 0; i < cost; i++) {
                        debug.addToInkwell(p1, 'Minnie Mouse - Always Classy');
                    }

                    // Helper: Set deck to have Songs to satisfy searches (Ariel)
                    // We need at least 4 cards for Ariel to look at
                    debug.setDeck(p1, ['A Whole New World', 'A Whole New World', 'A Whole New World', 'A Whole New World']);
                }
            }, 3 + 1); // +1 buffer

            // Helper: Add a character to play using the fixture method (reliable)
            // 'Goofy - Musketeer' is a Musketeer, satisfying Goofy's heal target requirements
            // He is also a character, satisfying generic "Choose Character" requirements
            await gamePage.addCardToPlay('Goofy - Musketeer', 1);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Winnie the Pooh - Having a Think');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
                await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start

                // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
                // "Confirm Order" is used by OrderCardsChoice.tsx, "Confirm (1)" for multi-select
                const dismissBtn = gamePage.page.locator('button').filter({ hasText: /Pass|Done|Confirm|Cancel|Select|Decline|Yes|No|Skip/i }).first();

                // Also look for the blocking overlay to know if we SHOULD be acting
                // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
                // Note: 'fixed inset-0 z-[100]' is standard for modals.
                const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
                const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
                const hasButton = await dismissBtn.isVisible();

                if (isBlocked || hasButton) {
                    const allBtns = await gamePage.page.locator('button').allInnerTexts().catch(() => []);
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Winnie the Pooh - Having a Think. Blocked: ${isBlocked}, Button: ${hasButton}`);
                    console.log('All Visible Buttons:', allBtns);

                    let interacted = false;

                    // 1. Try to select an option (if required, inside a dialog)
                    const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                    if (await option.isVisible()) {
                        const optText = await option.textContent().catch(() => 'unknown');
                        console.log(`Selecting an option: "${optText.substring(0, 20)}..."`);
                        await option.click({ force: true });
                        await gamePage.page.waitForTimeout(500);
                        interacted = true;
                    }

                    // 2. Click Dismiss/Confirm
                    if (await dismissBtn.isVisible()) {
                        const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                        console.log(`Clicking dismiss/confirm button: "${btnText}"...`);
                        await dismissBtn.click({ force: true });
                        await gamePage.page.waitForTimeout(1000);
                        interacted = true;
                    }

                    // 3. [FALLBACK] Try Clicking Board Target
                    // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                    // Try clicking the Dummy Target on the board.
                    if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(`Attempting to click Board Target (Goofy) [Step ${modalLoop + 1}]...`);
                        const boardCard = gamePage.page.locator('div').filter({ hasText: 'Goofy - Musketeer' }).last();
                        if (await boardCard.isVisible()) {
                            await boardCard.click({ force: true });
                            // console.log('Clicked Goofy - Musketeer on board.');
                            await gamePage.page.waitForTimeout(1000);
                        }
                    }

                } else {
                    // No overlay and no buttons -> likely done
                    // Double check after a small wait in case of animation
                    await gamePage.page.waitForTimeout(500);
                    if (!(await overlay.isVisible())) {
                        break;
                    }
                }
            } catch (e) {
                console.log('Error in modal loop: ' + e.message);
                break;
            }
            modalLoop++;
        }

        // Verify it entered play
        // Note: Characters logs: "Name played!"
        // Actions logs: "You Played Action Name"
        // We'll check for the name in the log, which confirms successful processing.
        await gamePage.expectLogMessage(/Winnie the Pooh/i);
    });

});
