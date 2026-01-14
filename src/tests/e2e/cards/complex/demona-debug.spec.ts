import { test, expect } from '../../fixtures/game-fixture';

test.describe('Demona Debug', () => {
    test('Inspect findCard result', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        await gamePage.page.evaluate(() => {
            const debug = (window as any).lorcanaDebug;
            if (!debug) {
                console.error("Debug not found");
                return;
            }

            const name = "Demona - Scourge of the Wyvern Clan";
            const found = debug.findCard(name);
            console.log(`findCard("${name}") result:`, found ? "FOUND" : "NULL");

            if (!found) {
                throw new Error(`Card '${name}' not found by findCard!`);
            }

            console.log("Card Def:", JSON.stringify(found).substring(0, 500));

            // Try adding to hand
            const p1 = debug.player1Id;
            const added = debug.addToHand(p1, name);
            if (!added) {
                throw new Error(`addToHand returned null/false for '${name}'`);
            }
            console.log("Added Instance:", JSON.stringify(added).substring(0, 500));
        });

        // Assert hand count in UI
        // Assert hand count in UI using correct selector
        const handCard = gamePage.page.locator('[data-testid="player-hand"] [data-card-name*="Demona"]');
        await expect(handCard).toBeVisible({ timeout: 5000 });
        await expect(handCard).toHaveCount(1);
    });
});
