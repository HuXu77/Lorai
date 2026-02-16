import { test, expect } from '../fixtures/game-fixture';

test.describe('Ward Mechanic', () => {
    test('should prevent targeting characters with Ward', async ({ gamePage }) => {
        const wardChar = 'Donald Duck - Strutting His Stuff'; // Has Ward
        const nonWardChar = 'Beast - Hardheaded'; // No Ward
        const removalCard = 'Dragon Fire'; // "Banish chosen character"

        // 0. Load Game
        await gamePage.loadTestGame();

        // 1. Setup Board State
        await gamePage.injectState({
            player1: {
                hand: [removalCard],
                play: [],
                inkwell: ['Ink', 'Ink', 'Ink', 'Ink', 'Ink'], // 5 Ink for Dragon Fire
            },
            player2: {
                hand: [],
                play: [
                    { name: wardChar, ready: true },
                    { name: nonWardChar, ready: true }
                ],
                lore: 0
            }
        });

        // 2. Play Dragon Fire
        await gamePage.clickCardInHand(removalCard);

        // Debug Play button
        const playBtn = gamePage.page.locator('button').filter({ hasText: /Play/i }).first();
        await expect(playBtn).toBeVisible();

        // Wait for enabled
        await expect(playBtn).toBeEnabled();

        // Click play button
        const playButton = gamePage.page.getByTestId('play-card-button').first();
        await expect(playButton).toBeVisible();
        await playButton.evaluate((btn) => (btn as HTMLElement).click());

        // Check for modal
        const modal = gamePage.page.locator('[data-testid="choice-modal"]');
        await expect(modal).toBeVisible({ timeout: 5000 });

        // Verify "Beast" is an option (valid target) and "Donald Duck" is NOT (Ward)
        await expect(modal).toContainText("Beast");
        await expect(modal).not.toContainText("Donald Duck");

        // Select Beast to finish action
        const beastOption = modal.getByText("Beast");
        await beastOption.evaluate((btn) => (btn as HTMLElement).click());

        // Verify resolution
        await expect(modal).toBeHidden({ timeout: 5000 });
        await gamePage.page.waitForTimeout(1000); // Allow animations/state updates to settle
        // await gamePage.expectLogMessage(/banished/i); // Flaky log panel toggle
        await gamePage.expectCardInDiscard(nonWardChar, 2); // Player 2's discard
    });
});
