import { test, expect } from '../../fixtures/game-fixture';

test.describe('Batch: Type: Location', () => {

    test('Pride Lands - Pride Rock - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Pride Lands - Pride Rock', 1);
            
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
        await gamePage.clickCardInHand('Pride Lands - Pride Rock');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
               await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start
               
               // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
               // "Confirm Order" is used by OrderCardsChoice.tsx
               const dismissBtn = gamePage.page.locator('button').filter({ hasText: /^Pass$|^Done$|^Confirm$|^Confirm Order$|^Cancel$|^Select$|^Decline$/i }).first();
               
               // Also look for the blocking overlay to know if we SHOULD be acting
               // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
               const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
               const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
               
               if (isBlocked || await dismissBtn.isVisible()) {
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Pride Lands - Pride Rock`);
                   
                   // 1. Try to select an option (if required)
                   // Look for "Option" divs or cards in a dialog
                   const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                   if (await option.isVisible()) {
                       console.log('Selecting an option...');
                       await option.click({ force: true }); 
                       await gamePage.page.waitForTimeout(500); 
                   }

                   // 2. Click Dismiss
                   if (await dismissBtn.isVisible()) {
                       console.log('Clicking dismiss/confirm button...');
                       await dismissBtn.click({ force: true });
                       await gamePage.page.waitForTimeout(1000); 
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
        await gamePage.expectLogMessage(/Pride Lands/i);
    });

    test('Tiana\'s Palace - Jazz Restaurant - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Tiana\'s Palace - Jazz Restaurant', 1);
            
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
        await gamePage.clickCardInHand('Tiana\'s Palace - Jazz Restaurant');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
               await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start
               
               // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
               // "Confirm Order" is used by OrderCardsChoice.tsx
               const dismissBtn = gamePage.page.locator('button').filter({ hasText: /^Pass$|^Done$|^Confirm$|^Confirm Order$|^Cancel$|^Select$|^Decline$/i }).first();
               
               // Also look for the blocking overlay to know if we SHOULD be acting
               // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
               const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
               const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
               
               if (isBlocked || await dismissBtn.isVisible()) {
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Tiana\'s Palace - Jazz Restaurant`);
                   
                   // 1. Try to select an option (if required)
                   // Look for "Option" divs or cards in a dialog
                   const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                   if (await option.isVisible()) {
                       console.log('Selecting an option...');
                       await option.click({ force: true }); 
                       await gamePage.page.waitForTimeout(500); 
                   }

                   // 2. Click Dismiss
                   if (await dismissBtn.isVisible()) {
                       console.log('Clicking dismiss/confirm button...');
                       await dismissBtn.click({ force: true });
                       await gamePage.page.waitForTimeout(1000); 
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
        await gamePage.expectLogMessage(/Tiana's Palace/i);
    });

    test('The Queen\'s Castle - Mirror Chamber - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('The Queen\'s Castle - Mirror Chamber', 1);
            
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
        await gamePage.clickCardInHand('The Queen\'s Castle - Mirror Chamber');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
               await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start
               
               // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
               // "Confirm Order" is used by OrderCardsChoice.tsx
               const dismissBtn = gamePage.page.locator('button').filter({ hasText: /^Pass$|^Done$|^Confirm$|^Confirm Order$|^Cancel$|^Select$|^Decline$/i }).first();
               
               // Also look for the blocking overlay to know if we SHOULD be acting
               // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
               const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
               const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
               
               if (isBlocked || await dismissBtn.isVisible()) {
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for The Queen\'s Castle - Mirror Chamber`);
                   
                   // 1. Try to select an option (if required)
                   // Look for "Option" divs or cards in a dialog
                   const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                   if (await option.isVisible()) {
                       console.log('Selecting an option...');
                       await option.click({ force: true }); 
                       await gamePage.page.waitForTimeout(500); 
                   }

                   // 2. Click Dismiss
                   if (await dismissBtn.isVisible()) {
                       console.log('Clicking dismiss/confirm button...');
                       await dismissBtn.click({ force: true });
                       await gamePage.page.waitForTimeout(1000); 
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
        await gamePage.expectLogMessage(/The Queen's Castle/i);
    });

    test('The Sorcerer\'s Tower - Wondrous Workspace - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('The Sorcerer\'s Tower - Wondrous Workspace', 1);
            
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
        await gamePage.clickCardInHand('The Sorcerer\'s Tower - Wondrous Workspace');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
               await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start
               
               // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
               // "Confirm Order" is used by OrderCardsChoice.tsx
               const dismissBtn = gamePage.page.locator('button').filter({ hasText: /^Pass$|^Done$|^Confirm$|^Confirm Order$|^Cancel$|^Select$|^Decline$/i }).first();
               
               // Also look for the blocking overlay to know if we SHOULD be acting
               // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
               const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
               const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
               
               if (isBlocked || await dismissBtn.isVisible()) {
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for The Sorcerer\'s Tower - Wondrous Workspace`);
                   
                   // 1. Try to select an option (if required)
                   // Look for "Option" divs or cards in a dialog
                   const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                   if (await option.isVisible()) {
                       console.log('Selecting an option...');
                       await option.click({ force: true }); 
                       await gamePage.page.waitForTimeout(500); 
                   }

                   // 2. Click Dismiss
                   if (await dismissBtn.isVisible()) {
                       console.log('Clicking dismiss/confirm button...');
                       await dismissBtn.click({ force: true });
                       await gamePage.page.waitForTimeout(1000); 
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
        await gamePage.expectLogMessage(/The Sorcerer's Tower/i);
    });

    test('Fang - River City - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Fang - River City', 1);
            
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
        await gamePage.clickCardInHand('Fang - River City');
        await gamePage.clickAction('Play Card');

        // Handle generic choice modals (like "Choose Character" or "Order Cards")
        // Use a loop to handle sequences (e.g. Select Target -> Order Remaining)
        let modalLoop = 0;
        while (modalLoop < 5) {
            try {
               await gamePage.page.waitForTimeout(1000); // Allow animations to settle/start
               
               // Strategy: Look for specific buttons anywhere on screen (high z-index usually)
               // "Confirm Order" is used by OrderCardsChoice.tsx
               const dismissBtn = gamePage.page.locator('button').filter({ hasText: /^Pass$|^Done$|^Confirm$|^Confirm Order$|^Cancel$|^Select$|^Decline$/i }).first();
               
               // Also look for the blocking overlay to know if we SHOULD be acting
               // Use attribute selector to avoid escaping issues with Tailwind arbitrary values
               const overlay = gamePage.page.locator('div[class*="z-[100]"]').first();
               const isBlocked = await overlay.isVisible({ timeout: 500 }).catch(() => false);
               
               if (isBlocked || await dismissBtn.isVisible()) {
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Fang - River City`);
                   
                   // 1. Try to select an option (if required)
                   // Look for "Option" divs or cards in a dialog
                   const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                   if (await option.isVisible()) {
                       console.log('Selecting an option...');
                       await option.click({ force: true }); 
                       await gamePage.page.waitForTimeout(500); 
                   }

                   // 2. Click Dismiss
                   if (await dismissBtn.isVisible()) {
                       console.log('Clicking dismiss/confirm button...');
                       await dismissBtn.click({ force: true });
                       await gamePage.page.waitForTimeout(1000); 
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
        await gamePage.expectLogMessage(/Fang/i);
    });

});
