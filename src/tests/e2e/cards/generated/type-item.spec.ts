import { test, expect } from '../../fixtures/game-fixture';

test.describe('Batch: Type: Item', () => {

    test('Dinglehopper - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Dinglehopper', 1);
            
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
        await gamePage.clickCardInHand('Dinglehopper');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Dinglehopper`);
                   
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
        await gamePage.expectLogMessage(/Dinglehopper/i);
    });

    test('Lantern - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Lantern', 1);
            
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
        await gamePage.clickCardInHand('Lantern');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Lantern`);
                   
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
        await gamePage.expectLogMessage(/Lantern/i);
    });

    test('Ursula\'s Shell Necklace - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Ursula\'s Shell Necklace', 1);
            
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
        await gamePage.clickCardInHand('Ursula\'s Shell Necklace');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Ursula\'s Shell Necklace`);
                   
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
        await gamePage.expectLogMessage(/Ursula's Shell Necklace/i);
    });

    test('Magic Mirror - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Magic Mirror', 1);
            
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
        await gamePage.clickCardInHand('Magic Mirror');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Magic Mirror`);
                   
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
        await gamePage.expectLogMessage(/Magic Mirror/i);
    });

    test('Ursula\'s Cauldron - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('Ursula\'s Cauldron', 1);
            
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
        await gamePage.clickCardInHand('Ursula\'s Cauldron');
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
                   console.log(`Interaction needed (Step ${modalLoop + 1}) for Ursula\'s Cauldron`);
                   
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
        await gamePage.expectLogMessage(/Ursula's Cauldron/i);
    });

});
