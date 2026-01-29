
import { test, expect } from '../fixtures/game-fixture';

test.describe('Tramp Cost Reduction Bug', () => {
    test('should apply cost reduction to multiple Tramp cards when Lady is in play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Clear any lingering abilities/stack from previous tests
        // This is critical because we reuse the engine instance
        // Wait for gameEngine to be available
        await gamePage.page.waitForFunction(() => (window as any).gameEngine !== undefined);

        // Clear any lingering abilities/stack from previous tests
        // This is critical because we reuse the engine instance
        await gamePage.page.evaluate(() => {
            if ((window as any).gameEngine && (window as any).gameEngine.turnManager) {
                const tm = (window as any).gameEngine.turnManager;
                if (tm.abilitySystem) {
                    tm.abilitySystem.abilityQueue = new Map();
                    tm.abilitySystem.processingQueue = false;
                }
                if (tm.stack) {
                    tm.stack = [];
                }
            }
        });

        // Inject State:
        // Player 1: Lady in play. 2 Tramps in hand.
        await gamePage.injectState({
            player1: {
                play: ['Lady - Elegant Spaniel'], // Valid Lady card
                hand: ['Tramp - Enterprising Dog', 'Tramp - Enterprising Dog'],
                inkwell: ['Mickey Mouse - Detective', 'Mickey Mouse - Detective'], // 2 Ink just in case
                lore: 0
            },
            turnPlayer: 'player1'
        });

        // 1. Check Cost of First Tramp (should be 1)
        // We select the wrapper div which contains both card and play button
        const handCards = gamePage.page.locator('[data-testid=player-hand] > div');
        await expect(handCards).toHaveCount(2);

        // Click first card to reveal button
        await handCards.nth(0).click();

        // Check play button text for cost cost
        // Scoped to the card wrapper
        const playButton = handCards.nth(0).getByRole('button', { name: /Play/i });
        await expect(playButton).toBeVisible();
        await expect(playButton).toContainText('(1◆)'); // Explicitly check for cost 1
    });

    test('should allow playing multiple Tramps with 1 Ink each', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Wait for gameEngine to be available
        await gamePage.page.waitForFunction(() => (window as any).gameEngine !== undefined);

        // Clear any lingering abilities/stack from previous tests
        await gamePage.page.evaluate(() => {
            if ((window as any).gameEngine && (window as any).gameEngine.turnManager) {
                const tm = (window as any).gameEngine.turnManager;
                if (tm.abilitySystem) {
                    tm.abilitySystem.abilityQueue = new Map();
                    tm.abilitySystem.processingQueue = false;
                }
                if (tm.stack) tm.stack = [];
            }
        });

        // Inject State: 2 Tramps, 1 Lady. 2 Ink total (enough for 2 plays of cost 1).
        await gamePage.injectState({
            player1: {
                play: ['Lady - Elegant Spaniel'],
                hand: ['Tramp - Enterprising Dog', 'Tramp - Enterprising Dog'],
                inkwell: ['Mickey Mouse - Detective', 'Mickey Mouse - Detective'], // 2 Ink
                lore: 0
            },
            turnPlayer: 'player1'
        });

        // 1. Play first Tramp
        const handCards = gamePage.page.locator('[data-testid=player-hand] > div');
        // Play first Tramp
        // Note: Play button handles play, we don't need to select the card first (which might trigger side effects)
        const playButton1 = handCards.first().getByRole('button', { name: /Play/i });
        await expect(playButton1).toBeEnabled();
        await expect(playButton1).toContainText('(1◆)'); // Cost 1

        // Use force: true because the modal might appear instantly and intercept reference check
        await playButton1.click();

        // Handle Triggered Ability Selection Modal (Tramp's effect)
        // Wait for modal to appear
        const modal = gamePage.page.locator('.fixed.inset-0.z-\\[10000\\]');
        // Handle potential multiple modals (due to race conditions or double triggers)
        let loopCount = 0;
        await expect(async () => {
            loopCount++;
            console.log(`[TEST-DEBUG] Modal Loop ${loopCount}`);
            const modalVisible = await modal.isVisible();
            if (modalVisible) {
                const option = modal.locator('.cursor-pointer').first();
                if (await option.isVisible()) {
                    await option.click();
                    const confirmParams = { name: /Confirm/i, timeout: 500 };
                    const confirmButton = modal.getByRole('button', confirmParams);
                    if (await confirmButton.isVisible()) {
                        await confirmButton.click();
                    }
                }
            }
            await expect(modal).not.toBeVisible({ timeout: 3000 });
        }).toPass({ timeout: 5000 });

        // Wait for play to finish
        // We need to re-query handCards because the DOM changed (one card removed)
        // Use a more specific selector to avoid counting the "No cards in hand" message div
        const remainingHand = gamePage.page.locator('[data-testid=player-hand] > div.relative');
        await expect(remainingHand).toHaveCount(1);

        // 2. Play second Tramp
        // Remaining Ink: 1. Cost: 1.
        // If bug exists (cost 2), we cannot play it.


        const playButton2 = remainingHand.first().getByRole('button', { name: /Play/i });
        // This assertion should fail if the bug exists
        // This assertion should fail if the bug exists
        await expect(playButton2).toBeEnabled();
        await expect(playButton2).toContainText('(1◆)'); // Cost 1
        await playButton2.click();

        // Check hand
        const finalHand = gamePage.page.locator('[data-testid=player-hand] > div.relative');
        await expect(finalHand).toHaveCount(0);

        // Verify cards are in Play Area
        // Note: PlayArea doesn't have a test-id in the component file I read, but let's check page.tsx usage
        // Or inspect the DOM structure implied by component: border-2 border-dashed
        // Verify cards are in Play Area. Wait for Tramp text to ensure rendering.
        const trampCard = gamePage.page.locator('text=Tramp - Enterprising Dog').first();
        await expect(trampCard).toBeVisible();

        // Use filtered locator for count within the specific play area
        const playArea = gamePage.page.locator('[data-testid=play-area]').filter({ hasText: 'Your Characters' });
        await expect(playArea).toBeVisible();

        // Count all cards (Lady + 2 Tramps = 3) via data-card-id
        // Note: data-card-id appears on both ZoomableCard wrapper AND inner Card component, so we target the wrapper
        const cards = playArea.locator('div[data-card-id]:has(div[data-card-id])');
        await expect(cards).toHaveCount(3);
    });
});
