import { test, expect } from '../../fixtures/game-fixture';

test.describe('Batch: Set 1 Emerald', () => {

    test('Aladdin - Prince Ali - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Aladdin - Prince Ali', 1);
            
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
        await gamePage.clickCardInHand('Aladdin - Prince Ali');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Aladdin - Prince Ali. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Aladdin/i);
    });

    test('Beast - Wolfsbane - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Beast - Wolfsbane', 1);
            
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
        await gamePage.clickCardInHand('Beast - Wolfsbane');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Beast - Wolfsbane. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Cheshire Cat - Not All There - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Cheshire Cat - Not All There', 1);
            
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
        await gamePage.clickCardInHand('Cheshire Cat - Not All There');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Cheshire Cat - Not All There. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Cruella De Vil - Miserable as Usual - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Cruella De Vil - Miserable as Usual', 1);
            
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
        await gamePage.clickCardInHand('Cruella De Vil - Miserable as Usual');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Cruella De Vil - Miserable as Usual. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Flynn Rider - Charming Rogue - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Flynn Rider - Charming Rogue', 1);
            
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
        await gamePage.clickCardInHand('Flynn Rider - Charming Rogue');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Flynn Rider - Charming Rogue. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Genie - On the Job - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Genie - On the Job', 1);
            
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
        await gamePage.clickCardInHand('Genie - On the Job');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Genie - On the Job. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Genie - Powers Unleashed - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Genie - Powers Unleashed', 1);
            
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
        await gamePage.clickCardInHand('Genie - Powers Unleashed');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Genie - Powers Unleashed. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Iago - Loud-Mouthed Parrot - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Iago - Loud-Mouthed Parrot', 1);
            
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
        await gamePage.clickCardInHand('Iago - Loud-Mouthed Parrot');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Iago - Loud-Mouthed Parrot. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Jasper - Common Crook - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Jasper - Common Crook', 1);
            
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
        await gamePage.clickCardInHand('Jasper - Common Crook');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Jasper - Common Crook. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Jasper/i);
    });

    test('John Silver - Alien Pirate - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('John Silver - Alien Pirate', 1);
            
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
        await gamePage.clickCardInHand('John Silver - Alien Pirate');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for John Silver - Alien Pirate. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Kuzco - Temperamental Emperor - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Kuzco - Temperamental Emperor', 1);
            
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
        await gamePage.clickCardInHand('Kuzco - Temperamental Emperor');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Kuzco - Temperamental Emperor. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Lady Tremaine - Wicked Stepmother - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Lady Tremaine - Wicked Stepmother', 1);
            
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
        await gamePage.clickCardInHand('Lady Tremaine - Wicked Stepmother');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Lady Tremaine - Wicked Stepmother. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Lady Tremaine/i);
    });

    test('Mad Hatter - Gracious Host - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Mad Hatter - Gracious Host', 1);
            
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
        await gamePage.clickCardInHand('Mad Hatter - Gracious Host');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Mad Hatter - Gracious Host. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Mad Hatter/i);
    });

    test('Megara - Pulling the Strings - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Megara - Pulling the Strings', 1);
            
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
        await gamePage.clickCardInHand('Megara - Pulling the Strings');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Megara - Pulling the Strings. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Megara/i);
    });

    test('Mickey Mouse - Artful Rogue - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Mickey Mouse - Artful Rogue', 1);
            
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
        await gamePage.clickCardInHand('Mickey Mouse - Artful Rogue');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Mickey Mouse - Artful Rogue. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Mother Gothel - Selfish Manipulator - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Mother Gothel - Selfish Manipulator', 1);
            
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
        await gamePage.clickCardInHand('Mother Gothel - Selfish Manipulator');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Mother Gothel - Selfish Manipulator. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Mother Gothel/i);
    });

    test('Peter Pan - Never Landing - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Peter Pan - Never Landing', 1);
            
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
        await gamePage.clickCardInHand('Peter Pan - Never Landing');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Peter Pan - Never Landing. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Peter Pan/i);
    });

    test('Tinker Bell - Most Helpful - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Tinker Bell - Most Helpful', 1);
            
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
        await gamePage.clickCardInHand('Tinker Bell - Most Helpful');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Tinker Bell - Most Helpful. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Mother Knows Best - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Mother Knows Best', 1);
            
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
        await gamePage.clickCardInHand('Mother Knows Best');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Mother Knows Best. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Mother Knows Best/i);
    });

    test('Sudden Chill - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Sudden Chill', 1);
            
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
        await gamePage.clickCardInHand('Sudden Chill');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Sudden Chill. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Sudden Chill/i);
    });

});
