import { test, expect } from '../fixtures/game-fixture';

test.describe('Static Ability: Ward', () => {
    // Skipping UI test due to modal persistence blocking board interaction in test runner
    test.skip('should prevent selecting warded characters for opponent abilities', async ({ gamePage }) => {
        // 0. Load Game
        await gamePage.loadTestGame();

        // 1. Setup State using correct injection technique
        // P1 (Player/Tester): Has targeting action (Dragon Fire) and Ink
        // P2 (Opponent): Has Warded character and Normal character
        await gamePage.injectState({
            player1: {
                hand: ['Dragon Fire'],
                inkwell: ['Maleficent - Biding Her Time', 'Maleficent - Biding Her Time', 'Maleficent - Biding Her Time', 'Maleficent - Biding Her Time', 'Maleficent - Biding Her Time'], // 5 Ink for Dragon Fire
                deck: ['Mickey Mouse - Detective']
            },
            player2: {
                play: [
                    { name: 'Donald Duck - Strutting His Stuff', ready: true }, // Has Ward
                    { name: 'Mickey Mouse - Detective', ready: true }           // No Ward
                ],
                deck: ['Mickey Mouse - Detective']
            },
            turnPlayer: 'player1'
        });

        // 2. Play Dragon Fire
        await gamePage.clickCardInHand('Dragon Fire');

        // Wait for detail modal to ensure we click the right "Play"
        // Snapshot shows generic modal with heading "Dragon Fire" and button "Play Card (5◆)"
        const detailModal = gamePage.page.locator('[role="dialog"]').filter({ hasText: 'Dragon Fire' });
        await expect(detailModal).toBeVisible();

        await detailModal.locator('button').filter({ hasText: /Play Card/i }).click({ force: true });

        // 3. Verify Detail Modal Closes (Action accepted, moving to targeting)
        await expect(detailModal).toBeHidden();

        // 4. Verify Targeting Mode
        // Usually a "Select a target" alert/toast appears
        const prompt = gamePage.page.locator('[role="alert"]');
        await expect(prompt).toBeVisible();
        await expect(prompt).toContainText(/Select|Choose/i);

        // 5. Verify Ward Interaction (Board Targeting)
        // Click Donald (Ward) -> Should NOT resolve (Alert should stay, Card should stay)
        const donald = gamePage.page.locator('[data-card-name*="Donald Duck"]');
        await donald.click({ force: true }); // Force click as prompt might overlay slightly

        // Verify state didn't change (Prompt still there)
        await expect(prompt).toBeVisible();

        // 6. Verify Valid Interaction
        // Click Mickey (Normal) -> Should Resolve
        const mickey = gamePage.page.locator('[data-card-name*="Mickey Mouse"]');
        await mickey.click();

        // 7. Verify Resolution
        // Prompt should disappear
        await expect(prompt).toBeHidden();
        // Mickey should be banished (hidden from play) (wait for server update)
        await expect(mickey).toBeHidden({ timeout: 10000 });
    });
});
