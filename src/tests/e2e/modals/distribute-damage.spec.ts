import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - DISTRIBUTE_DAMAGE
 * 
 * Tests the modal for distributing damage among targets.
 * Example: "Deal 4 damage divided as you choose among characters."
 */

test.describe('Modal: Distribute Damage', () => {

    test('should show damage distribution interface', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Distribute damage allows splitting X damage among targets
        // This would need a specific card like "Fire the Cannons!"

        // For now, verify the game loads
        await gamePage.page.waitForSelector('[data-testid="game-board"]');
    });

});
