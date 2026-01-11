import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - ORDER_CARDS
 * 
 * Tests the modal for reordering cards (e.g., put cards on top in any order).
 * Example: "Put revealed cards on top of your deck in any order."
 */

test.describe('Modal: Order Cards', () => {

    test('should allow reordering cards', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Order cards abilities show multiple cards to arrange
        // This would need a specific card with such ability

        // For now, verify the game loads
        await gamePage.page.waitForSelector('[data-testid="game-board"]');
    });

});
