import { test, expect } from '../../fixtures/game-fixture';

// Helper to check exertion status by looking for rotation class on the container
const isExerted = (container: any, cardName: string) =>
    container.locator('.rotate-90').filter({ has: container.page().locator(`[data-card-name="${cardName}"]`) });
// Note: passing page context via container.page() might be tricky if container is a Locator.
// Better approach: Locator-based filtering.

test.describe('Demona - Scourge of the Wyvern Clan [Complex]', () => {

    test.beforeEach(async ({ gamePage }) => {
        await gamePage.loadTestGame();
        // Wait for auto-mulligan to initiate and complete (approx 3-5s animation)
        await gamePage.page.waitForTimeout(5000);
    });

    test('Ability 1: Mass Exertion - Should exert all opposing characters on play', async ({ gamePage }) => {
        // Setup Opponent Characters (Ready)
        await gamePage.page.evaluate(async () => {
            const debug = (window as any).lorcanaDebug;
            debug.addToPlay(debug.player2Id, 'Mickey Mouse - Steamboat Pilot', { ready: true });
            debug.addToPlay(debug.player2Id, 'Goofy - Musketeer', { ready: true });
        });

        // Add Demona to hand
        await gamePage.addCardToHand('Demona - Scourge of the Wyvern Clan', 1);

        // Add Ink for P1
        await gamePage.page.evaluate(async () => {
            const debug = (window as any).lorcanaDebug;
            for (let i = 0; i < 6; i++) {
                debug.addToInkwell(debug.player1Id, 'Minnie Mouse - Always Classy');
            }
        });

        // 1. Verify Opponent characters are READY initially
        // We use the rotation class check logic
        const opponentBoard = gamePage.page.locator('div').filter({ hasText: 'Opponent Characters' });

        // Define locator for exerted card wrappers
        const exertedMickey = opponentBoard.locator('.rotate-90').filter({ has: gamePage.page.locator('[data-card-name="Mickey Mouse - Steamboat Pilot"]') });
        const exertedGoofy = opponentBoard.locator('.rotate-90').filter({ has: gamePage.page.locator('[data-card-name="Goofy - Musketeer"]') });

        // Initially NOT exerted (should not find the wrapper with rotation)
        await expect(exertedMickey).not.toBeVisible();
        await expect(exertedGoofy).not.toBeVisible();

        // 2. Play Demona
        await gamePage.clickCardInHand('Demona - Scourge of the Wyvern Clan');
        await gamePage.clickAction('Play Card');
        await gamePage.expectLogMessage(/Demona - Scourge of the Wyvern Clan played/i);

        // Wait for effects
        await gamePage.page.waitForTimeout(2000);

        // 3. Verify Opponent characters are now EXERTED
        await expect(exertedMickey).toBeVisible();
        await expect(exertedGoofy).toBeVisible();
    });

    test('Ability 1: Conditional Draw (Self) - Should draw to 3 cards if hand < 3', async ({ gamePage }) => {
        // Clear hand completely using debug
        await gamePage.page.evaluate(async () => {
            const debug = (window as any).lorcanaDebug;
            debug.clearHand(debug.player1Id);
        });

        // Add Demona
        await gamePage.addCardToHand('Demona - Scourge of the Wyvern Clan', 1);

        // Ensure Deck (at least 3 cards to draw)
        await gamePage.page.evaluate(async () => {
            const debug = (window as any).lorcanaDebug;
            debug.setDeck(debug.player1Id, ['Minnie Mouse - Always Classy', 'Minnie Mouse - Always Classy', 'Minnie Mouse - Always Classy', 'Minnie Mouse - Always Classy']);
            // Add Ink
            for (let i = 0; i < 6; i++) {
                debug.addToInkwell(debug.player1Id, 'Minnie Mouse - Always Classy');
            }
        });

        // Current Hand: 1 (Demona)
        const p1Hand = gamePage.page.locator('[data-testid="player-hand"] [data-card-name]');
        await expect(p1Hand).toHaveCount(1);

        // Play Demona (Hand becomes 0, then draws to 3)
        await gamePage.clickCardInHand('Demona - Scourge of the Wyvern Clan');
        await gamePage.clickAction('Play Card');

        await gamePage.page.waitForTimeout(3000);

        // Verify P1 Hand Size = 3
        const p1HandFinal = gamePage.page.locator('[data-testid="player-hand"] [data-card-name]');
        await expect(p1HandFinal).toHaveCount(3);
        await gamePage.expectLogMessage(/Drew \d+ card/i);
    });

    test('Ability 2: Readying Restriction - Should NOT ready if hand >= 3', async ({ gamePage }) => {
        // Hand size starts at 7 (>= 3). No reduction needed.

        // Setup: Demona Exerted in Play
        await gamePage.addCardToPlay('Demona - Scourge of the Wyvern Clan', 1, false); // Exerted

        // Ink to pass turn
        await gamePage.page.evaluate(async () => {
            const debug = (window as any).lorcanaDebug;
            debug.addToInkwell(debug.player1Id, 'Minnie Mouse - Always Classy');
        });

        const p1Board = gamePage.page.locator('div').filter({ hasText: 'Your Characters' });
        const exertedDemona = p1Board.locator('.rotate-90').filter({ has: gamePage.page.locator('[data-card-name="Demona - Scourge of the Wyvern Clan"]') });

        // Verify initial state (should be visible as we added it exerted)
        await expect(exertedDemona).toBeVisible();

        // Pass Turn -> Opponent Turn -> Pass Turn -> My Turn (Ready Phase)
        await gamePage.endTurn();
        await gamePage.page.waitForTimeout(500);
        await gamePage.page.waitForSelector('text=Your Turn', { timeout: 20000 });

        // Verify Demona is STILL Exerted (Should NOT ready)
        await expect(exertedDemona).toBeVisible();
    });

    test('Ability 2: Readying Restriction - Should READY if hand < 3', async ({ gamePage }) => {
        // Clear hand + Add 2 cards (Hand size = 2, < 3)
        await gamePage.page.evaluate(async () => {
            const debug = (window as any).lorcanaDebug;
            debug.clearHand(debug.player1Id);
            debug.addToHand(debug.player1Id, 'Minnie Mouse - Always Classy');
            debug.addToHand(debug.player1Id, 'Minnie Mouse - Always Classy');
        });

        // Setup: Demona Exerted in Play
        await gamePage.addCardToPlay('Demona - Scourge of the Wyvern Clan', 1, false);

        // Ink to pass turn (Use one of the cards in hand to be safe or just add infinite ink via debug)
        await gamePage.page.evaluate(async () => {
            const debug = (window as any).lorcanaDebug;
            debug.addToInkwell(debug.player1Id, 'Minnie Mouse - Always Classy'); // Infinite ink
        });

        const p1Board = gamePage.page.locator('div').filter({ hasText: 'Your Characters' });
        const exertedDemona = p1Board.locator('.rotate-90').filter({ has: gamePage.page.locator('[data-card-name="Demona - Scourge of the Wyvern Clan"]') });

        // Initial check
        await expect(exertedDemona).toBeVisible();

        // Pass Turn -> Opponent Turn -> Pass Turn -> My Turn (Ready Phase)
        await gamePage.endTurn();
        await gamePage.page.waitForTimeout(500);
        await gamePage.page.waitForSelector('text=Your Turn', { timeout: 20000 });

        // Verify Demona is READY (restriction didn't apply, so NO rotation)
        await expect(exertedDemona).not.toBeVisible();
    });

});
