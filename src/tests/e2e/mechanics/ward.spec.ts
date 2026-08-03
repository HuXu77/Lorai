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

        // Click play button via data-testid
        const playButton = gamePage.page.getByTestId('play-card-button').first();
        await expect(playButton).toBeVisible();
        await playButton.evaluate((btn) => (btn as HTMLElement).click());

        // 3. Verify Ward filtering in target modal
        const modal = gamePage.page.locator('[data-testid="choice-modal"]');
        await expect(modal).toBeVisible({ timeout: 5000 });

        // Beast (no Ward) should be a valid target
        await expect(modal).toContainText("Beast");
        // Donald Duck (Ward) should NOT be in the target list
        await expect(modal).not.toContainText("Donald Duck");
    });
});
