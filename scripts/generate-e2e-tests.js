const fs = require('fs');
const path = require('path');

const CARDS_FILE_PATH = path.join(process.cwd(), 'allCards.json');
const OUTPUT_DIR = path.join(process.cwd(), 'src/tests/e2e/cards/generated');

async function main() {
    const args = process.argv.slice(2);
    const setCodeArg = args.find(a => a.startsWith('--set='));
    const setCode = setCodeArg ? setCodeArg.split('=')[1] : null;

    const colorArg = args.find(a => a.startsWith('--color='));
    const color = colorArg ? colorArg.split('=')[1] : null;

    const limitArg = args.find(a => a.startsWith('--limit='));
    const limit = parseInt(limitArg ? limitArg.split('=')[1] : '5');

    const typeArg = args.find(a => a.startsWith('--type='));
    const type = typeArg ? typeArg.split('=')[1] : null;

    if ((!setCode || !color) && !type) {
        console.error('Usage: node scripts/generate-e2e-tests.js --set=1 --color=Amber [--limit=5] OR --type=Item [--limit=5]');
        process.exit(1);
    }

    // Read Cards
    const data = JSON.parse(fs.readFileSync(CARDS_FILE_PATH, 'utf-8'));
    const cards = data.cards.filter((c) => {
        let match = (c.abilities || []).length > 0;
        if (setCode) match = match && c.setCode === setCode;
        if (color) match = match && c.color === color;
        if (type) match = match && c.type.toLowerCase() === type.toLowerCase();
        return match;
    }).slice(0, limit);

    if (cards.length === 0) {
        console.log('No cards found matching criteria.');
        return;
    }

    console.log(`Generating tests for ${cards.length} cards...`);

    // Ensure output dir
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Generate Test File Content
    let fileContent = `import { test, expect } from '../../fixtures/game-fixture';\n\n`;
    const batchName = type ? `Type: ${type}` : `Set ${setCode} ${color}`;
    fileContent += `test.describe('Batch: ${batchName}', () => {\n\n`;

    for (const card of cards) {
        // Sanitize name for test description
        const safeName = card.fullName.replace(/'/g, "\\'");

        fileContent += `    test('${safeName} - Basic Play', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        const debugAvailable = await gamePage.page.evaluate(() => !!(window as any).lorcanaDebug);
        
        if (debugAvailable) {
            // Setup: Add card to hand and enough ink
            await gamePage.addCardToHand('${safeName}', 1);
            
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
            }, ${card.cost} + 1); // +1 buffer

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
        await gamePage.clickCardInHand('${safeName}');
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
                   console.log(\`Interaction needed (Step \${modalLoop + 1}) for ${safeName}. Blocked: \${isBlocked}, Button: \${hasButton}\`);
                   console.log('All Visible Buttons:', allBtns);
                   
                   let interacted = false;

                   // 1. Try to select an option (if required, inside a dialog)
                   const option = gamePage.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .cursor-pointer, [data-testid="choice-option"]').first();
                   if (await option.isVisible()) {
                       const optText = await option.textContent().catch(() => 'unknown');
                       console.log(\`Selecting an option: "\${optText.substring(0, 20)}..."\`);
                       await option.click({ force: true }); 
                       await gamePage.page.waitForTimeout(500); 
                       interacted = true;
                   }

                   // 2. Click Dismiss/Confirm
                   if (await dismissBtn.isVisible()) {
                       const btnText = await dismissBtn.textContent().catch(() => 'unknown');
                       console.log(\`Clicking dismiss/confirm button: "\${btnText}"...\`);
                       await dismissBtn.click({ force: true });
                       await gamePage.page.waitForTimeout(1000); 
                       interacted = true;
                   }
                   
                   // 3. [FALLBACK] Try Clicking Board Target
                   // If we assume we interacted but are STILL here (modalLoop > 0), OR if we verified no interaction:
                   // Try clicking the Dummy Target on the board.
                   if ((!interacted && isBlocked) || (modalLoop > 0 && isBlocked)) {
                        console.log(\`Attempting to click Board Target (Goofy) [Step \${modalLoop + 1}]...\`);
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
`;
        const safeLogName = card.name.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');
        fileContent += `        await gamePage.expectLogMessage(/${safeLogName}/i);\n    });\n\n`;
    }

    fileContent += `});\n`;

    const filename = type
        ? `type-${type.toLowerCase()}.spec.ts`
        : `set${setCode}-${color.toLowerCase()}.spec.ts`;
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), fileContent);
    console.log(`Created ${path.join(OUTPUT_DIR, filename)}`);
}

main().catch(console.error);
