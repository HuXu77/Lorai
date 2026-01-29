import { test, expect } from '../fixtures/game-fixture';

test.describe('Abilities: Healing', () => {

    test.skip('Dinglehopper should remove 1 damage from chosen character', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        await gamePage.injectState({
            player1: {
                play: [
                    { name: 'Dinglehopper', ready: true },
                    { name: 'Stitch - New Dog', damage: 1, ready: true } // 1 damage
                ],
                hand: [],
                inkwell: ['Ink', 'Ink'], // Cost 1 to activate
                deck: Array(20).fill('Ink')
            },
            player2: { play: [], hand: [], deck: [], inkwell: [] },
            turnPlayer: 'player1'
        });

        // Use Dinglehopper
        await gamePage.clickCardInPlay('Dinglehopper');

        // Use more flexible selector for ability/item action
        // Button text seen in logs: "✨\nAbility\n"⟳ — Remove up to 1 damage from chosen character.""
        const actionButton = gamePage.page.locator('button').filter({ hasText: /Ability|Remove up to 1 damage/ }).first();
        if (await actionButton.isVisible()) {
            await actionButton.click();
        } else {
            console.log('Action button not found! Dumping buttons:');
            const buttons = await gamePage.page.locator('button').allInnerTexts();
            console.log(buttons);
            throw new Error('Dinglehopper action button not found - check logs for button list');
        }

        // Select Stitch
        await gamePage.expectModal();
        await gamePage.selectModalOption('Stitch - New Dog');

        // Assert damage reduced (1 -> 0)
        await gamePage.page.waitForTimeout(1000);
        await expect(gamePage.page.locator('[data-name="Stitch - New Dog"] .bg-red-600')).not.toBeVisible();

        // Assert Dinglehopper exerted
        await expect(gamePage.page.locator('[data-name="Dinglehopper"]')).toHaveClass(/opacity-60/);
    });

    test.skip('Rapunzel should remove up to 3 damage and draw cards', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        await gamePage.injectState({
            player1: {
                hand: ['Rapunzel - Gifted with Healing'],
                play: [
                    { name: 'Beast - Hardheaded', damage: 1, ready: true } // 1 damage
                ],
                inkwell: ['Ink', 'Ink', 'Ink', 'Ink', 'Ink'], // Cost 4
                deck: Array(20).fill('Ink')
            },
            player2: { play: [], hand: [], deck: [], inkwell: [] },
            turnPlayer: 'player1'
        });

        // Debug: Verify Beast is on board
        await expect(gamePage.page.locator('[data-name="Beast - Hardheaded"]')).toBeVisible();

        // Play Rapunzel
        await gamePage.clickCardInHand('Rapunzel - Gifted with Healing');
        await gamePage.clickAction('Play Card');

        // Select Beast to heal
        await gamePage.expectModal();
        await gamePage.selectModalOption('Beast - Hardheaded');
        await gamePage.confirmModal();

        // Assert: Beast damage 0 (1-1)
        await gamePage.page.waitForTimeout(1000);
        await expect(gamePage.page.locator('[data-name="Beast - Hardheaded"] .bg-red-600')).not.toBeVisible();

        // Assert Hand size (Draw 1)
        // Hand: Rapunzel played (-1). Hand = 0. Draw 1. Total 1.
        await expect(gamePage.page.locator('[data-testid="player-hand"] .card-container')).toHaveCount(1);
    });

});
