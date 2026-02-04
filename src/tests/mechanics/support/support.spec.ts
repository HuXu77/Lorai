
import { test, expect } from '../../e2e/fixtures/game-fixture';

test.describe('Mechanic: Support', () => {
    test('should prompt to add support when questing', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup: HeiHei (Support) and another character to support
        await gamePage.injectState({
            player1: {
                play: [
                    { name: 'HeiHei - Boat Snack', ready: true, turnPlayed: 0 },
                    { name: 'Stitch - Rock Star', ready: true, turnPlayed: 0 }
                ],
                hand: [],
                inkwell: [],
                deck: ['P1 Deck']
            },
            player2: {
                deck: ['P2 Deck']
            },
            turnPlayer: 'player1'
        });

        const heiheiName = 'HeiHei - Boat Snack';
        const stitchName = 'Stitch - Rock Star';

        // Click HeiHei
        await gamePage.clickCardInPlay(heiheiName);

        // Click Quest (using localized button text if possible, or assume 'Quest')
        const questBtn = gamePage.page.getByRole('button', { name: 'Quest' });
        await expect(questBtn).toBeVisible();
        await questBtn.click();

        // Should see optional prompt "Use Support ability?" or similar
        // Since it triggers "Whenever this character quests", the engine handles this via the choice system.
        // It's likely a standard YES/NO prompt for the optional ability.

        // Wait for prompt
        const promptParams = [/Support/i, /Yes/i];
        const yesBtn = gamePage.page.getByRole('button', { name: /Yes|Confirm/i }).filter({ hasText: /Yes|Confirm/i }).first();

        // Flexible wait for either the ability prompt or targeting (if auto-yes)
        // But support is optional "You MAY add...", so it should ask.
        await expect(gamePage.page.getByText(/Support/i)).toBeVisible();
        await yesBtn.click();

        // Now should be in targeting mode
        await expect(gamePage.page.getByText('Choose a character')).toBeVisible();

        // Click Stitch
        await gamePage.clickCardInPlay(stitchName);

        // Verify Stitch gets +1 Strength visually? 
        // We can check the log or maybe a visual attribute if implemented.
        // Or check that HeiHei is exerted (Action completed).
        const heiheiCard = gamePage.page.locator(`[data-card-name="${heiheiName}"]`).first();
        await expect(heiheiCard).toHaveAttribute('data-exerted', 'true');
    });
});
