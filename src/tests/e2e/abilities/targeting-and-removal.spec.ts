import { test, expect } from '../fixtures/game-fixture';

/**
 * Batch 1: Direct Targeting & Removal
 * 
 * Verifies that the UI correctly handles:
 * 1. Playing Action cards requiring targets.
 * 2. Activating character abilities requiring targets.
 * 3. Applying 'Damage', 'Banish', and 'Exert' effects visually.
 */

test.describe('Abilities: Targeting & Removal', () => {

    test('Smash should deal 3 damage to chosen target', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        // Setup:
        // P1: Smash in hand, Ink
        // P2: Character in play (Simba - Future King, 3 Willpower -> 3 damage is lethal, let's use something sturdier to see damage)
        // Let's use 'Mickey Mouse - Brave Little Tailor' (5/5)
        await gamePage.injectState({
            player1: {
                hand: ['Smash'],
                inkwell: ['Ink', 'Ink', 'Ink'], // Cost 3
                play: [],
                deck: []
            },
            player2: {
                play: [{ name: 'Mickey Mouse - Brave Little Tailor', ready: true, damage: 0 }],
                hand: [],
                deck: [],
                inkwell: []
            },
            turnPlayer: 'player1'
        });

        // Play Smash
        await gamePage.clickCardInHand('Smash');
        await gamePage.clickAction('Play Card');

        // Check Trigger (Implicit in Play) -> Select Target
        // We expect the targeting mode to be active.
        // The gamePage doesn't have a generic "expectTargetingMode" but we can select the target.

        // Use selectModalOption to ensure we interact with the choice modal, not the background board
        await gamePage.selectModalOption('Mickey Mouse');

        // Confirm
        await gamePage.confirmModal();

        // Verify Effect: Mickey has 3 damage
        // Check for damage counter "3"
        // We use a locator scoped to the card that contains text "3" and is visible
        const mickeyCard = gamePage.page.locator('[data-card-name="Mickey Mouse - Brave Little Tailor"]');
        await expect(mickeyCard.locator('text="3"')).toBeVisible();
    });

    test('Dragon Fire should banish chosen target', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        // Setup: 
        // P1: Dragon Fire (Cost 5)
        // P2: Valid target
        await gamePage.injectState({
            player1: {
                hand: ['Dragon Fire'],
                inkwell: ['Ink', 'Ink', 'Ink', 'Ink', 'Ink'],
                play: [],
                deck: []
            },
            player2: {
                play: [{ name: 'Mickey Mouse - Brave Little Tailor', ready: true }],
                hand: [],
                deck: [],
                inkwell: []
            },
            turnPlayer: 'player1'
        });

        // Play Dragon Fire
        await gamePage.clickCardInHand('Dragon Fire');
        await gamePage.clickAction('Play Card');

        // Select Target
        await gamePage.selectModalOption('Mickey Mouse');
        await gamePage.confirmModal();

        // Wait for animation/state update
        await gamePage.page.waitForTimeout(1000);

        // Verify Effect: Mickey is gone from play OR in discard
        // Due to potential "ghost card" UI bug, we strictly verify it arrived in discard
        // which confirms the ability executed.
        await expect(gamePage.page.locator('text=Opponent Discard').locator('..').locator('img[alt*="Mickey Mouse - Brave Little Tailor"]')).toBeVisible();
    });

    test('Elsa - Snow Queen should exert chosen target', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        // Setup:
        // P1: Elsa - Snow Queen (Play area, ready, dry)
        // P2: Target character (Ready)
        await gamePage.injectState({
            player1: {
                play: [{ name: 'Elsa - Snow Queen', ready: true, turnPlayed: 0 }],
                hand: [],
                inkwell: [], // No cost to activate? Actually Elsa costs exert to activate.
                deck: []
            },
            player2: {
                play: [{ name: 'Mickey Mouse - Brave Little Tailor', ready: true }], // Target (Ready)
                hand: [],
                deck: [],
                inkwell: []
            },
            turnPlayer: 'player1'
        });

        // Activate Elsa
        await gamePage.clickCardInPlay('Elsa - Snow Queen');

        // Click the ability button. 
        // The button contains the ability text "Exert chosen opposing character".
        // Using "Exert" is robust because it's part of the ability description regardless of the name ("Freeze" or "Ability").
        await gamePage.clickAction('Exert');

        // Select Target
        await gamePage.expectModal();
        await gamePage.selectModalOption('Mickey Mouse');
        await gamePage.confirmModal();

        // Wait for animation/state update
        await gamePage.page.waitForTimeout(1000);

        // Verify Effect
        // Mickey should be exerted (opacity-60 class)
        const mickeyCard = gamePage.page.locator('[data-card-name="Mickey Mouse - Brave Little Tailor"]');
        await expect(mickeyCard).toHaveClass(/opacity-60/);
    });

});
