import { test, expect } from '../../fixtures/game-fixture';

test.describe('Batch: Set 1 Sapphire', () => {

    test('Ariel - Whoseit Collector - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Ariel - Whoseit Collector', 1);
            
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
        await gamePage.clickCardInHand('Ariel - Whoseit Collector');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Ariel - Whoseit Collector. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Ariel/i);
    });

    test('Aurora - Briar Rose - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Aurora - Briar Rose', 1);
            
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
        await gamePage.clickCardInHand('Aurora - Briar Rose');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Aurora - Briar Rose. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Aurora/i);
    });

    test('Aurora - Dreaming Guardian - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Aurora - Dreaming Guardian', 1);
            
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
        await gamePage.clickCardInHand('Aurora - Dreaming Guardian');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Aurora - Dreaming Guardian. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Aurora/i);
    });

    test('Belle - Inventive Engineer - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Belle - Inventive Engineer', 1);
            
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
        await gamePage.clickCardInHand('Belle - Inventive Engineer');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Belle - Inventive Engineer. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Belle - Strange but Special - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Belle - Strange but Special', 1);
            
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
        await gamePage.clickCardInHand('Belle - Strange but Special');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Belle - Strange but Special. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Chief Tui - Respected Leader - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Chief Tui - Respected Leader', 1);
            
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
        await gamePage.clickCardInHand('Chief Tui - Respected Leader');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Chief Tui - Respected Leader. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Chief Tui/i);
    });

    test('Donald Duck - Strutting His Stuff - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Donald Duck - Strutting His Stuff', 1);
            
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
        await gamePage.clickCardInHand('Donald Duck - Strutting His Stuff');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Donald Duck - Strutting His Stuff. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Gramma Tala - Storyteller - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Gramma Tala - Storyteller', 1);
            
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
        await gamePage.clickCardInHand('Gramma Tala - Storyteller');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Gramma Tala - Storyteller. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Gramma Tala/i);
    });

    test('Hades - Infernal Schemer - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Hades - Infernal Schemer', 1);
            
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
        await gamePage.clickCardInHand('Hades - Infernal Schemer');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Hades - Infernal Schemer. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Jasmine - Queen of Agrabah - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Jasmine - Queen of Agrabah', 1);
            
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
        await gamePage.clickCardInHand('Jasmine - Queen of Agrabah');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Jasmine - Queen of Agrabah. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Maurice - World-Famous Inventor - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Maurice - World-Famous Inventor', 1);
            
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
        await gamePage.clickCardInHand('Maurice - World-Famous Inventor');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Maurice - World-Famous Inventor. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Maurice/i);
    });

    test('Merlin - Self-Appointed Mentor - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Merlin - Self-Appointed Mentor', 1);
            
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
        await gamePage.clickCardInHand('Merlin - Self-Appointed Mentor');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Merlin - Self-Appointed Mentor. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Mickey Mouse - Detective - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Mickey Mouse - Detective', 1);
            
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
        await gamePage.clickCardInHand('Mickey Mouse - Detective');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Mickey Mouse - Detective. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Philoctetes - Trainer of Heroes - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Philoctetes - Trainer of Heroes', 1);
            
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
        await gamePage.clickCardInHand('Philoctetes - Trainer of Heroes');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Philoctetes - Trainer of Heroes. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Philoctetes/i);
    });

    test('Robin Hood - Unrivaled Archer - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Robin Hood - Unrivaled Archer', 1);
            
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
        await gamePage.clickCardInHand('Robin Hood - Unrivaled Archer');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Robin Hood - Unrivaled Archer. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Scar - Mastermind - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Scar - Mastermind', 1);
            
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
        await gamePage.clickCardInHand('Scar - Mastermind');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Scar - Mastermind. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Scar/i);
    });

    test('Tamatoa - So Shiny! - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Tamatoa - So Shiny!', 1);
            
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
        await gamePage.clickCardInHand('Tamatoa - So Shiny!');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Tamatoa - So Shiny!. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Tamatoa/i);
    });

    test('Let It Go - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Let It Go', 1);
            
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
        await gamePage.clickCardInHand('Let It Go');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Let It Go. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Let It Go/i);
    });

    test('One Jump Ahead - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('One Jump Ahead', 1);
            
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
        await gamePage.clickCardInHand('One Jump Ahead');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for One Jump Ahead. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/One Jump Ahead/i);
    });

    test('Coconut Basket - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Coconut Basket', 1);
            
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
        await gamePage.clickCardInHand('Coconut Basket');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Coconut Basket. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Coconut Basket/i);
    });

});
