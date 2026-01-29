
import { test, expect } from '../fixtures/game-fixture';

test.describe('Opponent Hand UI', () => {
    test('should update opponent hand count when they ink or play cards', async ({ gamePage }) => {
        // Setup a scenario where the bot (Player 2) has cards and will take actions
        // We need to force the bot to act.
        // Since we can't easily script the bot's precise timing in E2E without mock controllers,
        // we can assume the standard bot will ink and play if possible.

        await gamePage.loadTestGame();

        // Give bot a specific hand
        await gamePage.injectState({
            player2: {
                hand: ['Minnie Mouse - Beloved Princess', 'Minnie Mouse - Beloved Princess'], // Cost 2 (Playable) and Inkable. Vanilla.
                inkwell: ['Minnie Mouse - Beloved Princess', 'Minnie Mouse - Beloved Princess'], // 2 Ink
                deck: ['Minnie Mouse - Beloved Princess'], // CRITICAL: Must have card to draw, otherwise Game Over!
                // Bot logic: 
                // 1. Draw 1 card (Hand -> 3)
                // 2. Ink 'Minnie' (Hand -> 2, Ink -> 3)
                // 3. Play 'Minnie' (Cost 2, Ink 3) (Hand -> 1)
                // Final Hand should be 1.
            },
            turnPlayer: 'player1' // Start on Player 1, then pass
        });

        // Pass turn to Bot
        const endTurnBtn = gamePage.page.getByRole('button', { name: /End Turn/i });
        await endTurnBtn.click({ force: true });

        // The bot should act immediately on its turn.
        // We wait for the state to stabilize.
        await gamePage.page.waitForTimeout(2000);

        // Check the Side Panel for Opponent Hand Count vs Engine State
        const engineState = await gamePage.page.evaluate(() => {
            // @ts-ignore
            const debug = window.lorcanaDebug;
            if (!debug) return null;
            const p2 = debug.state.players[debug.player2Id];
            return {
                hand: p2.hand.length,
                inkwell: p2.inkwell.length
            };
        });

        if (engineState) {
            // Verify engine state matches expectation
            expect(engineState.inkwell).toBe(3);
            expect(engineState.hand).toBe(1);
        }

        // Assuming the sidebar renders "Hand" and then the number
        const opponentHandStat = gamePage.page.locator('.game-sidebar').filter({ hasText: 'Bot' }).getByText(/Hand/i).locator('..').getByText(/\d+/);

        // Wait and poll, or assert final state.
        await expect(opponentHandStat).toHaveText('1', { timeout: 10000 });
    });
});
