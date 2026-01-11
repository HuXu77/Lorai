import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Tests for Challenge Mechanics
 * 
 * Mirrors engine tests from cursed-merfolk.test.ts and other challenge tests.
 */

test.describe('Challenge Mechanics', () => {

    test('basic challenge - attacker damages defender', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup: Player has ready attacker, opponent has exerted defender
        await gamePage.addCardToPlay('Mickey Mouse - Brave Little Tailor', 1, true);
        await gamePage.addCardToPlay('Elsa - Spirit of Winter', 2, false); // Exerted = can be challenged

        await gamePage.page.waitForTimeout(500);

        // Click attacker
        await gamePage.clickCardInPlay('Mickey Mouse');

        // Click Challenge
        await gamePage.clickAction('Challenge');

        // Should see targeting modal to select defender
        const modal = await gamePage.expectModal();

        // Select the opponent's card
        await gamePage.selectModalOption('Elsa');

        // Wait for combat resolution
        await gamePage.page.waitForTimeout(1000);

        // Verify combat occurred via game log
        await gamePage.expectLogMessage(/challenge|damage/i);
    });

    test('Cursed Merfolk triggers discard when challenged', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Player 1 (human) has attacker and cards in hand
        await gamePage.addCardToPlay('Mickey Mouse - Brave Little Tailor', 1, true);

        // Add cards to P1 hand (to be discarded by Cursed Merfolk ability)
        await gamePage.addCardToHand('Stitch - Carefree Surfer', 1);
        await gamePage.addCardToHand('Moana - Of Motunui', 1);

        // Player 2 (bot) has Cursed Merfolk - exerted (challengeable)
        await gamePage.addCardToPlay('Cursed Merfolk - Ursula\'s Handiwork', 2, false);

        await gamePage.page.waitForTimeout(500);

        // Get initial hand count
        // Capture P1 hand size before challenge
        const handBefore = await gamePage.page.locator('[data-testid="player-hand"] [data-card-name]').count();

        // Challenge Cursed Merfolk
        await gamePage.clickCardInPlay('Mickey Mouse');
        await gamePage.clickAction('Challenge');
        await gamePage.selectModalOption('Cursed Merfolk');

        // Wait for ability resolution
        await gamePage.page.waitForTimeout(1500);

        // P1 should have discarded a card (Cursed Merfolk's ability)
        // Note: This assertion may need adjustment based on actual UI behavior
        const handAfter = await gamePage.page.locator('[data-testid="player-hand"] [data-card-name]').count();

        // Hand should be smaller (discarded 1 card)
        expect(handAfter).toBeLessThan(handBefore);
    });

});
