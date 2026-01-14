import { test, expect } from '../../fixtures/game-fixture';

test.describe('Batch: Set 1 Amethyst', () => {

    test('Anna - Heir to Arendelle - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Anna - Heir to Arendelle', 1);

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
        await gamePage.clickCardInHand('Anna - Heir to Arendelle');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Anna - Heir to Arendelle. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Anna/i);
    });

    test('Dr. Facilier - Agent Provocateur - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Dr. Facilier - Agent Provocateur', 1);

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
        await gamePage.clickCardInHand('Dr. Facilier - Agent Provocateur');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Dr. Facilier - Agent Provocateur. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Dr. Facilier - Charlatan - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Dr. Facilier - Charlatan', 1);

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
        await gamePage.clickCardInHand('Dr. Facilier - Charlatan');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Dr. Facilier - Charlatan. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Dr. Facilier - Remarkable Gentleman - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Dr. Facilier - Remarkable Gentleman', 1);

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
        await gamePage.clickCardInHand('Dr. Facilier - Remarkable Gentleman');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Dr. Facilier - Remarkable Gentleman. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Elsa - Snow Queen - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Elsa - Snow Queen', 1);

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
        await gamePage.clickCardInHand('Elsa - Snow Queen');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Elsa - Snow Queen. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Elsa - Spirit of Winter - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Elsa - Spirit of Winter', 1);

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
        await gamePage.clickCardInHand('Elsa - Spirit of Winter');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Elsa - Spirit of Winter. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Flotsam - Ursula\'s Spy - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Flotsam - Ursula\'s Spy', 1);

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
        await gamePage.clickCardInHand('Flotsam - Ursula\'s Spy');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Flotsam - Ursula\'s Spy. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Flotsam/i);
    });

    test('Jafar - Keeper of Secrets - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Jafar - Keeper of Secrets', 1);

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
        await gamePage.clickCardInHand('Jafar - Keeper of Secrets');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Jafar - Keeper of Secrets. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Jafar/i);
    });

    test('Jafar - Wicked Sorcerer - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Jafar - Wicked Sorcerer', 1);

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
        await gamePage.clickCardInHand('Jafar - Wicked Sorcerer');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Jafar - Wicked Sorcerer. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Jafar/i);
    });

    test('Jetsam - Ursula\'s Spy - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Jetsam - Ursula\'s Spy', 1);

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
        await gamePage.clickCardInHand('Jetsam - Ursula\'s Spy');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Jetsam - Ursula\'s Spy. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Jetsam/i);
    });

    test('Magic Broom - Bucket Brigade - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Magic Broom - Bucket Brigade', 1);

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
        await gamePage.clickCardInHand('Magic Broom - Bucket Brigade');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Magic Broom - Bucket Brigade. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Magic Broom/i);
    });

    test('Maleficent - Sorceress - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Maleficent - Sorceress', 1);

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
        await gamePage.clickCardInHand('Maleficent - Sorceress');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Maleficent - Sorceress. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Maleficent/i);
    });

    test('Marshmallow - Persistent Guardian - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Marshmallow - Persistent Guardian', 1);

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
        await gamePage.clickCardInHand('Marshmallow - Persistent Guardian');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Marshmallow - Persistent Guardian. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Marshmallow/i);
    });

    test('Mickey Mouse - Wayward Sorcerer - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Mickey Mouse - Wayward Sorcerer', 1);

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
        await gamePage.clickCardInHand('Mickey Mouse - Wayward Sorcerer');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Mickey Mouse - Wayward Sorcerer. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Pascal - Rapunzel\'s Companion - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Pascal - Rapunzel\'s Companion', 1);

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
        await gamePage.clickCardInHand('Pascal - Rapunzel\'s Companion');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Pascal - Rapunzel\'s Companion. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Pascal/i);
    });

    test('Rafiki - Mysterious Sage - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Rafiki - Mysterious Sage', 1);

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
        await gamePage.clickCardInHand('Rafiki - Mysterious Sage');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Rafiki - Mysterious Sage. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Rafiki/i);
    });

    test('The Queen - Wicked and Vain - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('The Queen - Wicked and Vain', 1);

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
        await gamePage.clickCardInHand('The Queen - Wicked and Vain');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for The Queen - Wicked and Vain. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/The Queen/i);
    });

    test('Tinker Bell - Peter Pan\'s Ally - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Tinker Bell - Peter Pan\'s Ally', 1);

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
        await gamePage.clickCardInHand('Tinker Bell - Peter Pan\'s Ally');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Tinker Bell - Peter Pan\'s Ally. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Tinker Bell/i);
    });

    test('Ursula - Power Hungry - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Ursula - Power Hungry', 1);

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
        await gamePage.clickCardInHand('Ursula - Power Hungry');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Ursula - Power Hungry. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Ursula/i);
    });

    test('Yzma - Alchemist - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);

        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Yzma - Alchemist', 1);

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
        await gamePage.clickCardInHand('Yzma - Alchemist');
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
                    console.log(`Interaction needed (Step ${modalLoop + 1}) for Yzma - Alchemist. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Yzma/i);
    });

});
