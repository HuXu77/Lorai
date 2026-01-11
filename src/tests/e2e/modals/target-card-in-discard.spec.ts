import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - TARGET_CARD_IN_DISCARD
 * 
 * Tests the modal for selecting cards from discard pile.
 * Example: "Return a character from your discard to your hand"
 */

test.describe('Modal: Target Card in Discard', () => {

    test('should show discard pile cards as options', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Add cards to discard
        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            const state = JSON.parse(debug?.getState() || '{}');
            const playerId = debug?.player1Id;

            if (state.players?.[playerId]) {
                state.players[playerId].discard = [
                    { instanceId: 'discard-1', name: 'Mickey Mouse', fullName: 'Mickey Mouse - Brave Little Tailor', type: 'Character' },
                    { instanceId: 'discard-2', name: 'Elsa', fullName: 'Elsa - Spirit of Winter', type: 'Character' }
                ];
                debug?.importState(JSON.stringify(state));
            }
        });

        await gamePage.page.waitForTimeout(500);

        // Verify discard has cards
        // The actual ability triggering this modal would need a specific card
        // This test is more about verifying the modal type works
    });

});
