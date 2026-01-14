import { test, expect } from '../../fixtures/game-fixture';

test.describe('Batch: Set 2 Amber', () => {

    test('Bashful - Hopeless Romantic - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Bashful - Hopeless Romantic', 1);
            
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
        await gamePage.clickCardInHand('Bashful - Hopeless Romantic');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Bashful - Hopeless Romantic. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Bashful/i);
    });

    test('Christopher Robin - Adventurer - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Christopher Robin - Adventurer', 1);
            
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
        await gamePage.clickCardInHand('Christopher Robin - Adventurer');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Christopher Robin - Adventurer. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Christopher Robin/i);
    });

    test('Cinderella - Ballroom Sensation - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Cinderella - Ballroom Sensation', 1);
            
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
        await gamePage.clickCardInHand('Cinderella - Ballroom Sensation');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Cinderella - Ballroom Sensation. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Cinderella/i);
    });

    test('Doc - Leader of the Seven Dwarfs - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Doc - Leader of the Seven Dwarfs', 1);
            
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
        await gamePage.clickCardInHand('Doc - Leader of the Seven Dwarfs');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Doc - Leader of the Seven Dwarfs. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Doc/i);
    });

    test('Dopey - Always Playful - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Dopey - Always Playful', 1);
            
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
        await gamePage.clickCardInHand('Dopey - Always Playful');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Dopey - Always Playful. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Dopey/i);
    });

    test('Gaston - Baritone Bully - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Gaston - Baritone Bully', 1);
            
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
        await gamePage.clickCardInHand('Gaston - Baritone Bully');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Gaston - Baritone Bully. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Grand Duke - Advisor to the King - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Grand Duke - Advisor to the King', 1);
            
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
        await gamePage.clickCardInHand('Grand Duke - Advisor to the King');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Grand Duke - Advisor to the King. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Grand Duke/i);
    });

    test('Grumpy - Bad-Tempered - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Grumpy - Bad-Tempered', 1);
            
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
        await gamePage.clickCardInHand('Grumpy - Bad-Tempered');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Grumpy - Bad-Tempered. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Grumpy/i);
    });

    test('Happy - Good-Natured - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Happy - Good-Natured', 1);
            
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
        await gamePage.clickCardInHand('Happy - Good-Natured');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Happy - Good-Natured. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Happy/i);
    });

    test('King Louie - Jungle VIP - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('King Louie - Jungle VIP', 1);
            
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
        await gamePage.clickCardInHand('King Louie - Jungle VIP');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for King Louie - Jungle VIP. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/King Louie/i);
    });

    test('Mickey Mouse - Friendly Face - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Mickey Mouse - Friendly Face', 1);
            
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
        await gamePage.clickCardInHand('Mickey Mouse - Friendly Face');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Mickey Mouse - Friendly Face. Blocked: ${isBlocked}, Button: ${hasButton}`);
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

    test('Mufasa - Betrayed Leader - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Mufasa - Betrayed Leader', 1);
            
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
        await gamePage.clickCardInHand('Mufasa - Betrayed Leader');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Mufasa - Betrayed Leader. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Mufasa/i);
    });

    test('Mulan - Free Spirit - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Mulan - Free Spirit', 1);
            
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
        await gamePage.clickCardInHand('Mulan - Free Spirit');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Mulan - Free Spirit. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Mulan/i);
    });

    test('Mulan - Reflecting - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Mulan - Reflecting', 1);
            
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
        await gamePage.clickCardInHand('Mulan - Reflecting');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Mulan - Reflecting. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Mulan/i);
    });

    test('Nana - Darling Family Pet - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Nana - Darling Family Pet', 1);
            
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
        await gamePage.clickCardInHand('Nana - Darling Family Pet');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Nana - Darling Family Pet. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Nana/i);
    });

    test('Rapunzel - Gifted Artist - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Rapunzel - Gifted Artist', 1);
            
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
        await gamePage.clickCardInHand('Rapunzel - Gifted Artist');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Rapunzel - Gifted Artist. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Rapunzel/i);
    });

    test('Rapunzel - Sunshine - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Rapunzel - Sunshine', 1);
            
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
        await gamePage.clickCardInHand('Rapunzel - Sunshine');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Rapunzel - Sunshine. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Rapunzel/i);
    });

    test('Sleepy - Nodding Off - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Sleepy - Nodding Off', 1);
            
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
        await gamePage.clickCardInHand('Sleepy - Nodding Off');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Sleepy - Nodding Off. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Sleepy/i);
    });

    test('Sneezy - Very Allergic - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Sneezy - Very Allergic', 1);
            
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
        await gamePage.clickCardInHand('Sneezy - Very Allergic');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Sneezy - Very Allergic. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Sneezy/i);
    });

    test('Snow White - Lost in the Forest - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Snow White - Lost in the Forest', 1);
            
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
        await gamePage.clickCardInHand('Snow White - Lost in the Forest');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Snow White - Lost in the Forest. Blocked: ${isBlocked}, Button: ${hasButton}`);
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
        await gamePage.expectLogMessage(/Snow White/i);
    });

});
