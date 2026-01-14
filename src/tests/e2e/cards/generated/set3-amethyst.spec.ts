import { test, expect } from '../../fixtures/game-fixture';

test.describe('Batch: Set 3 Amethyst', () => {

    test('Alice - Tea Alchemist - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Alice - Tea Alchemist', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Alice - Tea Alchemist');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Alice - Tea Alchemist. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Chernabog\'s Followers - Creatures of Evil - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Chernabog\'s Followers - Creatures of Evil', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Chernabog\'s Followers - Creatures of Evil');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Chernabog\'s Followers - Creatures of Evil. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Chernabog's Followers/i);
    });

    test('Diablo - Faithful Pet - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Diablo - Faithful Pet', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Diablo - Faithful Pet');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Diablo - Faithful Pet. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Diablo/i);
    });

    test('Genie - Supportive Friend - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Genie - Supportive Friend', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Genie - Supportive Friend');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Genie - Supportive Friend. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Genie/i);
    });

    test('Hydros - Ice Titan - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Hydros - Ice Titan', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Hydros - Ice Titan');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Hydros - Ice Titan. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Hydros/i);
    });

    test('Iago - Pretty Polly - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Iago - Pretty Polly', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Iago - Pretty Polly');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Iago - Pretty Polly. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Iago/i);
    });

    test('Jafar - Lamp Thief - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Jafar - Lamp Thief', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Jafar - Lamp Thief');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Jafar - Lamp Thief. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Jafar - Striking Illusionist - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Jafar - Striking Illusionist', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Jafar - Striking Illusionist');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Jafar - Striking Illusionist. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Lena Sabrewing - Rebellious Teenager - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Lena Sabrewing - Rebellious Teenager', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Lena Sabrewing - Rebellious Teenager');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Lena Sabrewing - Rebellious Teenager. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Lena Sabrewing/i);
    });

    test('Magic Broom - Dancing Duster - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Magic Broom - Dancing Duster', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Magic Broom - Dancing Duster');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Magic Broom - Dancing Duster. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Magic Broom - Swift Cleaner - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Magic Broom - Swift Cleaner', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Magic Broom - Swift Cleaner');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Magic Broom - Swift Cleaner. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Magic Broom - The Big Sweeper - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Magic Broom - The Big Sweeper', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Magic Broom - The Big Sweeper');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Magic Broom - The Big Sweeper. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Magic Carpet - Flying Rug - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Magic Carpet - Flying Rug', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Magic Carpet - Flying Rug');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Magic Carpet - Flying Rug. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Magic Carpet/i);
    });

    test('Magica De Spell - The Midas Touch - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Magica De Spell - The Midas Touch', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Magica De Spell - The Midas Touch');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Magica De Spell - The Midas Touch. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Magica De Spell/i);
    });

    test('Magica De Spell - Thieving Sorceress - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Magica De Spell - Thieving Sorceress', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Magica De Spell - Thieving Sorceress');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Magica De Spell - Thieving Sorceress. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Magica De Spell/i);
    });

    test('Maleficent - Mistress of All Evil - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Maleficent - Mistress of All Evil', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Maleficent - Mistress of All Evil');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Maleficent - Mistress of All Evil. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Mama Odie - Voice of Wisdom - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Mama Odie - Voice of Wisdom', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Mama Odie - Voice of Wisdom');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Mama Odie - Voice of Wisdom. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Mama Odie/i);
    });

    test('Pua - Potbellied Buddy - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Pua - Potbellied Buddy', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Pua - Potbellied Buddy');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Pua - Potbellied Buddy. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Pua/i);
    });

    test('Rafiki - Mystical Fighter - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Rafiki - Mystical Fighter', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Rafiki - Mystical Fighter');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Rafiki - Mystical Fighter. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Stratos - Tornado Titan - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Stratos - Tornado Titan', 1);
            
            await gamePage.page.evaluate((cost) => {
                const debug = (window as any).lorcanaDebug;
                const p1 = debug?.player1Id;
                if (p1 && debug) {
                    for(let i=0; i<cost; i++) {
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
        await gamePage.clickCardInHand('Stratos - Tornado Titan');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Stratos - Tornado Titan. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Stratos/i);
    });

});
