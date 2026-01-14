import { test, expect } from '../../fixtures/game-fixture';

test.describe('Batch: Set 2 Emerald', () => {

    test('Beast - Relentless - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Beast - Relentless', 1);

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
        await gamePage.clickCardInHand('Beast - Relentless');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Beast - Relentless. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Beast/i);
    });

    test('Belle - Bookworm - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Belle - Bookworm', 1);

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
        await gamePage.clickCardInHand('Belle - Bookworm');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Belle - Bookworm. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Belle/i);
    });

    test('Belle - Hidden Archer - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Belle - Hidden Archer', 1);

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
        await gamePage.clickCardInHand('Belle - Hidden Archer');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Belle - Hidden Archer. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Belle/i);
    });

    test('Bucky - Squirrel Squeak Tutor - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Bucky - Squirrel Squeak Tutor', 1);

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
        await gamePage.clickCardInHand('Bucky - Squirrel Squeak Tutor');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Bucky - Squirrel Squeak Tutor. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Bucky/i);
    });

    test('Cheshire Cat - From the Shadows - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Cheshire Cat - From the Shadows', 1);

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
            }, 8 + 1); // +1 buffer

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
        await gamePage.clickCardInHand('Cheshire Cat - From the Shadows');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Cheshire Cat - From the Shadows. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Cheshire Cat/i);
    });

    test('Daisy Duck - Secret Agent - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Daisy Duck - Secret Agent', 1);

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
        await gamePage.clickCardInHand('Daisy Duck - Secret Agent');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Daisy Duck - Secret Agent. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Daisy Duck/i);
    });

    test('Donald Duck - Perfect Gentleman - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Donald Duck - Perfect Gentleman', 1);

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
        await gamePage.clickCardInHand('Donald Duck - Perfect Gentleman');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Donald Duck - Perfect Gentleman. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Donald Duck/i);
    });

    test('Donald Duck - Sleepwalker - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Donald Duck - Sleepwalker', 1);

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
        await gamePage.clickCardInHand('Donald Duck - Sleepwalker');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Donald Duck - Sleepwalker. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Donald Duck/i);
    });

    test('Dr. Facilier - Fortune Teller - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Dr. Facilier - Fortune Teller', 1);

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
        await gamePage.clickCardInHand('Dr. Facilier - Fortune Teller');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Dr. Facilier - Fortune Teller. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Dr\. Facilier/i);
    });

    test('Enchantress - Unexpected Judge - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Enchantress - Unexpected Judge', 1);

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
        await gamePage.clickCardInHand('Enchantress - Unexpected Judge');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Enchantress - Unexpected Judge. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Enchantress/i);
    });

    test('Flynn Rider - His Own Biggest Fan - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Flynn Rider - His Own Biggest Fan', 1);

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
        await gamePage.clickCardInHand('Flynn Rider - His Own Biggest Fan');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Flynn Rider - His Own Biggest Fan. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Flynn Rider/i);
    });

    test('Gaston - Scheming Suitor - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Gaston - Scheming Suitor', 1);

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
        await gamePage.clickCardInHand('Gaston - Scheming Suitor');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Gaston - Scheming Suitor. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Lucifer - Cunning Cat - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Lucifer - Cunning Cat', 1);

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
        await gamePage.clickCardInHand('Lucifer - Cunning Cat');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Lucifer - Cunning Cat. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Lucifer/i);
    });

    test('Pain - Underworld Imp - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Pain - Underworld Imp', 1);

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
        await gamePage.clickCardInHand('Pain - Underworld Imp');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Pain - Underworld Imp. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Pain/i);
    });

    test('Panic - Underworld Imp - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Panic - Underworld Imp', 1);

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
        await gamePage.clickCardInHand('Panic - Underworld Imp');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Panic - Underworld Imp. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Panic/i);
    });

    test('Pete - Bad Guy - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Pete - Bad Guy', 1);

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
        await gamePage.clickCardInHand('Pete - Bad Guy');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Pete - Bad Guy. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Pete/i);
    });

    test('Prince John - Greediest of All - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Prince John - Greediest of All', 1);

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
        await gamePage.clickCardInHand('Prince John - Greediest of All');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Prince John - Greediest of All. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Prince John/i);
    });

    test('Queen of Hearts - Quick-Tempered - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Queen of Hearts - Quick-Tempered', 1);

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
        await gamePage.clickCardInHand('Queen of Hearts - Quick-Tempered');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Queen of Hearts - Quick-Tempered. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Queen of Hearts/i);
    });

    test('Ratigan - Criminal Mastermind - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Ratigan - Criminal Mastermind', 1);

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
        await gamePage.clickCardInHand('Ratigan - Criminal Mastermind');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Ratigan - Criminal Mastermind. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Ratigan/i);
    });

    test('Ray - Easygoing Firefly - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Ray - Easygoing Firefly', 1);

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
        await gamePage.clickCardInHand('Ray - Easygoing Firefly');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Ray - Easygoing Firefly. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Ray/i);
    });

});
