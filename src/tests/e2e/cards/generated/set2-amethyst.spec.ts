import { test, expect } from '../../fixtures/game-fixture';

test.describe('Batch: Set 2 Amethyst', () => {

    test('Arthur - Wizard\'s Apprentice - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Arthur - Wizard\'s Apprentice', 1);

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
        await gamePage.clickCardInHand('Arthur - Wizard\'s Apprentice');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Arthur - Wizard\'s Apprentice. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Arthur/i);
    });

    test('Blue Fairy - Rewarding Good Deeds - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Blue Fairy - Rewarding Good Deeds', 1);

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
        await gamePage.clickCardInHand('Blue Fairy - Rewarding Good Deeds');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Blue Fairy - Rewarding Good Deeds. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Blue Fairy/i);
    });

    test('Dr. Facilier - Savvy Opportunist - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Dr. Facilier - Savvy Opportunist', 1);

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
        await gamePage.clickCardInHand('Dr. Facilier - Savvy Opportunist');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Dr. Facilier - Savvy Opportunist. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Elsa - Gloves Off - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Elsa - Gloves Off', 1);

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
        await gamePage.clickCardInHand('Elsa - Gloves Off');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Elsa - Gloves Off. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Elsa/i);
    });

    test('Fairy Godmother - Mystic Armorer - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Fairy Godmother - Mystic Armorer', 1);

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
        await gamePage.clickCardInHand('Fairy Godmother - Mystic Armorer');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Fairy Godmother - Mystic Armorer. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Fairy Godmother/i);
    });

    test('Fairy Godmother - Pure Heart - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Fairy Godmother - Pure Heart', 1);

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
        await gamePage.clickCardInHand('Fairy Godmother - Pure Heart');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Fairy Godmother - Pure Heart. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Fairy Godmother/i);
    });

    test('HeiHei - Persistent Presence - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('HeiHei - Persistent Presence', 1);

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
        await gamePage.clickCardInHand('HeiHei - Persistent Presence');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for HeiHei - Persistent Presence. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/HeiHei/i);
    });

    test('Jiminy Cricket - Pinocchio\'s Conscience - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Jiminy Cricket - Pinocchio\'s Conscience', 1);

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
        await gamePage.clickCardInHand('Jiminy Cricket - Pinocchio\'s Conscience');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Jiminy Cricket - Pinocchio\'s Conscience. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Jiminy Cricket/i);
    });

    test('Kuzco - Wanted Llama - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Kuzco - Wanted Llama', 1);

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
        await gamePage.clickCardInHand('Kuzco - Wanted Llama');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Kuzco - Wanted Llama. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Kuzco/i);
    });

    test('Madam Mim - Fox - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Madam Mim - Fox', 1);

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
        await gamePage.clickCardInHand('Madam Mim - Fox');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Madam Mim - Fox. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Madam Mim/i);
    });

    test('Madam Mim - Purple Dragon - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Madam Mim - Purple Dragon', 1);

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
            await gamePage.addCardToPlay('Goofy - Musketeer', 2);

            // Pass turn to ready ink
            await gamePage.endTurn();
            await gamePage.page.waitForTimeout(1000);
            await gamePage.page.waitForSelector('text=Your Turn');
        }

        // Play the card
        await gamePage.clickCardInHand('Madam Mim - Purple Dragon');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Madam Mim - Purple Dragon. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Madam Mim/i);
    });

    test('Madam Mim - Rival of Merlin - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Madam Mim - Rival of Merlin', 1);

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
        await gamePage.clickCardInHand('Madam Mim - Rival of Merlin');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Madam Mim - Rival of Merlin. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Madam Mim/i);
    });

    test('Madam Mim - Snake - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Madam Mim - Snake', 1);

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
        await gamePage.clickCardInHand('Madam Mim - Snake');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Madam Mim - Snake. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Madam Mim/i);
    });

    test('Merlin - Crab - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Merlin - Crab', 1);

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
        await gamePage.clickCardInHand('Merlin - Crab');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Merlin - Crab. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Merlin/i);
    });

    test('Merlin - Goat - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Merlin - Goat', 1);

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
        await gamePage.clickCardInHand('Merlin - Goat');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Merlin - Goat. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Merlin/i);
    });

    test('Merlin - Rabbit - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Merlin - Rabbit', 1);

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
        await gamePage.clickCardInHand('Merlin - Rabbit');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Merlin - Rabbit. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Merlin/i);
    });

    test('Merlin - Shapeshifter - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Merlin - Shapeshifter', 1);

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
        await gamePage.clickCardInHand('Merlin - Shapeshifter');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Merlin - Shapeshifter. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Merlin/i);
    });

    test('Merlin - Squirrel - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Merlin - Squirrel', 1);

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
        await gamePage.clickCardInHand('Merlin - Squirrel');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Merlin - Squirrel. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Merlin/i);
    });

    test('Peter Pan\'s Shadow - Not Sewn On - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Peter Pan\'s Shadow - Not Sewn On', 1);

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
        await gamePage.clickCardInHand('Peter Pan\'s Shadow - Not Sewn On');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Peter Pan\'s Shadow - Not Sewn On. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Peter Pan's Shadow/i);
    });

    test('Pinocchio - On the Run - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Pinocchio - On the Run', 1);

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
        await gamePage.clickCardInHand('Pinocchio - On the Run');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Pinocchio - On the Run. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Pinocchio/i);
    });

});
