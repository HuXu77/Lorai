import { test, expect } from '../../fixtures/game-fixture';

test.describe('Batch: Set 3 Steel', () => {

    test('Eeyore - Overstuffed Donkey - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Eeyore - Overstuffed Donkey', 1);

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
        await gamePage.clickCardInHand('Eeyore - Overstuffed Donkey');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Eeyore - Overstuffed Donkey. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Eeyore/i);
    });

    test('Gustav the Giant - Terror of the Kingdom - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Gustav the Giant - Terror of the Kingdom', 1);

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
        await gamePage.clickCardInHand('Gustav the Giant - Terror of the Kingdom');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Gustav the Giant - Terror of the Kingdom. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Gustav the Giant/i);
    });

    test('Hades - Hotheaded Ruler - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Hades - Hotheaded Ruler', 1);

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
        await gamePage.clickCardInHand('Hades - Hotheaded Ruler');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Hades - Hotheaded Ruler. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Hades/i);
    });

    test('Helga Sinclair - Right-Hand Woman - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Helga Sinclair - Right-Hand Woman', 1);

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
        await gamePage.clickCardInHand('Helga Sinclair - Right-Hand Woman');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Helga Sinclair - Right-Hand Woman. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Helga Sinclair/i);
    });

    test('John Silver - Greedy Treasure Seeker - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('John Silver - Greedy Treasure Seeker', 1);

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
        await gamePage.clickCardInHand('John Silver - Greedy Treasure Seeker');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for John Silver - Greedy Treasure Seeker. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/John Silver/i);
    });

    test('Kida - Royal Warrior - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Kida - Royal Warrior', 1);

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
        await gamePage.clickCardInHand('Kida - Royal Warrior');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Kida - Royal Warrior. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Kida/i);
    });

    test('Little John - Resourceful Outlaw - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Little John - Resourceful Outlaw', 1);

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
        await gamePage.clickCardInHand('Little John - Resourceful Outlaw');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Little John - Resourceful Outlaw. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Little John/i);
    });

    test('Little John - Robin\'s Pal - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Little John - Robin\'s Pal', 1);

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
        await gamePage.clickCardInHand('Little John - Robin\'s Pal');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Little John - Robin\'s Pal. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Little John/i);
    });

    test('Lythos - Rock Titan - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Lythos - Rock Titan', 1);

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
        await gamePage.clickCardInHand('Lythos - Rock Titan');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Lythos - Rock Titan. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Lythos/i);
    });

    test('Mickey Mouse - Stalwart Explorer - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Mickey Mouse - Stalwart Explorer', 1);

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
        await gamePage.clickCardInHand('Mickey Mouse - Stalwart Explorer');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Mickey Mouse - Stalwart Explorer. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Mickey Mouse/i);
    });

    test('Mickey Mouse - Trumpeter - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Mickey Mouse - Trumpeter', 1);

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
        await gamePage.clickCardInHand('Mickey Mouse - Trumpeter');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Mickey Mouse - Trumpeter. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Mickey Mouse/i);
    });

    test('Minnie Mouse - Funky Spelunker - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Minnie Mouse - Funky Spelunker', 1);

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
        await gamePage.clickCardInHand('Minnie Mouse - Funky Spelunker');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Minnie Mouse - Funky Spelunker. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Minnie Mouse/i);
    });

    test('Mr. Smee - Bumbling Mate - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Mr. Smee - Bumbling Mate', 1);

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
        await gamePage.clickCardInHand('Mr. Smee - Bumbling Mate');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Mr. Smee - Bumbling Mate. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Mr\. Smee/i);
    });

    test('Pyros - Lava Titan - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Pyros - Lava Titan', 1);

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
        await gamePage.clickCardInHand('Pyros - Lava Titan');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Pyros - Lava Titan. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Pyros/i);
    });

    test('Razoul - Palace Guard - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Razoul - Palace Guard', 1);

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
        await gamePage.clickCardInHand('Razoul - Palace Guard');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Razoul - Palace Guard. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Razoul/i);
    });

    test('Robin Hood - Champion of Sherwood - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Robin Hood - Champion of Sherwood', 1);

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
        await gamePage.clickCardInHand('Robin Hood - Champion of Sherwood');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Robin Hood - Champion of Sherwood. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Robin Hood/i);
    });

    test('Sheriff of Nottingham - Corrupt Official - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Sheriff of Nottingham - Corrupt Official', 1);

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
        await gamePage.clickCardInHand('Sheriff of Nottingham - Corrupt Official');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Sheriff of Nottingham - Corrupt Official. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Sheriff of Nottingham/i);
    });

    test('Simba - Fighting Prince - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Simba - Fighting Prince', 1);

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
        await gamePage.clickCardInHand('Simba - Fighting Prince');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Simba - Fighting Prince. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Simba/i);
    });

    test('Simba - Rightful King - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Simba - Rightful King', 1);

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
        await gamePage.clickCardInHand('Simba - Rightful King');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Simba - Rightful King. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Simba/i);
    });

    test('Thaddeus E. Klang - Metallic Leader - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Thaddeus E. Klang - Metallic Leader', 1);

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
        await gamePage.clickCardInHand('Thaddeus E. Klang - Metallic Leader');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Thaddeus E. Klang - Metallic Leader. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Thaddeus E\. Klang/i);
    });

});
