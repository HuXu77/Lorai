import { test, expect } from '../fixtures/game-fixture';

test.describe('Generated E2E Tests Batch 1 - Damage/Banish', () => {
    // Increase timeout for E2E tests
    test.setTimeout(60000); 


    test('Queen of Hearts - Quick-Tempered (306) - Deal 1 Damage (Ability 0)', async ({ gamePage }) => {
        // Setup
        await gamePage.loadTestGame();
        await gamePage.injectState({
            player1: {
                hand: ['Queen of Hearts - Quick-Tempered'],
                inkwell: Array(2).fill('Ink'), // Sufficient ink
                play: []
            },
            player2: {
                play: [{ name: 'Mickey Mouse - Brave Little Tailor', ready: true, damage: 0 }]
            },
            turnPlayer: 'player1'
        });

        // Action: Play Card
        await gamePage.clickCardInHand('Queen of Hearts - Quick-Tempered');
        await gamePage.clickAction('Play Card');
        
        // Target: Opponent's Mickey
        // E2E infrastructure handles targeting via "selectModalOption" for reliability
        
        await gamePage.selectModalOption('Mickey Mouse - Brave Little Tailor'); 
        await gamePage.confirmModal(); // If confirmation is needed
        
        // Wait for update
        await gamePage.page.waitForTimeout(1000);
        
        // Verify: Check damage counter on target
        // Locator strategy: Find card by name, then look for text"1" inside it
        const targetCard = gamePage.page.locator('[data-card-name="Mickey Mouse - Brave Little Tailor"]');
        
        // If damage >= 5 (Mickey's HP), he gets banished, so check discard instead
        if (1 >= 5) {
             await expect(gamePage.page.locator('text=Opponent Discard').locator('..').locator('img[alt*="Mickey Mouse - Brave Little Tailor"]')).toBeVisible();
        } else {
             await expect(targetCard.locator('text="1"')).toBeVisible();
        }
    });

    test('Jetsam - Opportunistic Eel (2266) - Deal 3 Damage (Ability 0)', async ({ gamePage }) => {
        // Setup
        await gamePage.loadTestGame();
        await gamePage.injectState({
            player1: {
                hand: ['Jetsam - Opportunistic Eel'],
                inkwell: Array(7).fill('Ink'), // Sufficient ink
                play: []
            },
            player2: {
                play: [{ name: 'Mickey Mouse - Brave Little Tailor', ready: true, damage: 0 }]
            },
            turnPlayer: 'player1'
        });

        // Action: Play Card
        await gamePage.clickCardInHand('Jetsam - Opportunistic Eel');
        await gamePage.clickAction('Play Card');
        
        // Target: Opponent's Mickey
        // E2E infrastructure handles targeting via "selectModalOption" for reliability
        
        await gamePage.selectModalOption('Mickey Mouse - Brave Little Tailor'); 
        await gamePage.confirmModal(); // If confirmation is needed
        
        // Wait for update
        await gamePage.page.waitForTimeout(1000);
        
        // Verify: Check damage counter on target
        // Locator strategy: Find card by name, then look for text"3" inside it
        const targetCard = gamePage.page.locator('[data-card-name="Mickey Mouse - Brave Little Tailor"]');
        
        // If damage >= 5 (Mickey's HP), he gets banished, so check discard instead
        if (3 >= 5) {
             await expect(gamePage.page.locator('text=Opponent Discard').locator('..').locator('img[alt*="Mickey Mouse - Brave Little Tailor"]')).toBeVisible();
        } else {
             await expect(targetCard.locator('text="3"')).toBeVisible();
        }
    });
});
