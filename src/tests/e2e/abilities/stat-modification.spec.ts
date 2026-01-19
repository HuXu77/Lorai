
import { test, expect } from '../fixtures/game-fixture';

test.describe('Abilities: Stat Modification', () => {

    test('Megara - Pulling the Strings should give +2 Strength on play', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup: Megara in hand, Mickey Mouse in play to receive buff matches
        await gamePage.injectState({
            player1: {
                hand: ['Megara - Pulling the Strings'],
                play: ['Mickey Mouse - Detective'], // 1/3 stats
                inkwell: ['Ink', 'Ink'], // Cost 2
            },
            player2: { play: [], hand: [], deck: [], inkwell: [] },
            turnPlayer: 'player1'
        });

        const initialStr = await gamePage.page.evaluate(() => {
            const state = JSON.parse((window as any).lorcanaDebug.getState());
            return state.players.player1.play[0].strength;
        });
        expect(initialStr).toBe(1);

        // Play Megara
        await gamePage.clickCardInHand('Megara - Pulling the Strings');
        await gamePage.clickAction('Play Card');

        // Should prompt for target
        await gamePage.expectModal();
        await gamePage.selectModalOption('Mickey Mouse - Detective');
        await gamePage.confirmModal(); // Assuming confirm is needed or auto-resolves? Usually target choice expects click.

        await gamePage.page.waitForTimeout(1000);

        // Verify +2 Strength (Total 3)
        const newStr = await gamePage.page.evaluate(() => {
            const state = JSON.parse((window as any).lorcanaDebug.getState());
            // Megara is now play[1], Mickey is play[0]
            return state.players.player1.play[0].strength;
        });
        expect(newStr).toBe(3);
    });

    test('The Queen - Commanding Presence should modify strength on quest', async ({ gamePage }) => {
        // "Whenever this character quests, chosen opposing character gets -4 strength this turn and chosen character gets +4 strength this turn."
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                play: [
                    { name: 'The Queen - Commanding Presence', ready: true, turnPlayed: 0 }, // Questic source
                    { name: 'Stitch - New Dog', ready: true, turnPlayed: 0 } // +4 target (2/2)
                ],
                hand: [],
                inkwell: [],
            },
            player2: {
                play: [
                    { name: 'Mickey Mouse - Brave Little Tailor', ready: true } // -4 target (5/5)
                ],
                hand: [], deck: [], inkwell: []
            },
            turnPlayer: 'player1'
        });

        // Quest with The Queen
        await gamePage.clickCardInPlay('The Queen - Commanding Presence');
        await gamePage.clickAction('Quest');

        // Should trigger two choices.
        // Order depends on implementation. 
        // 1. Chosen opposing character (-4)
        // 2. Chosen character (+4)

        // Wait for first modal
        await gamePage.expectModal();

        // We need to know which prompt is which.
        const prompt1 = await gamePage.page.locator('[data-testid="choice-modal"] h2').textContent();

        if (prompt1?.includes('opposing') || prompt1?.includes('Opposing')) {
            await gamePage.selectModalOption('Mickey Mouse - Brave Little Tailor');
            await gamePage.confirmModal();

            // Wait for modal transition. 
            await expect(gamePage.page.locator('[data-testid="choice-modal"] h2')).not.toHaveText(prompt1 as string, { timeout: 5000 });
            const prompt2 = await gamePage.page.locator('[data-testid="choice-modal"] h2').textContent();

            await gamePage.selectModalOption('Stitch - New Dog');
            await gamePage.confirmModal();
        } else {
            // Maybe order is swapped or prompt is generic
            await gamePage.selectModalOption('Stitch - New Dog');
            await gamePage.confirmModal();

            await expect(gamePage.page.locator('[data-testid="choice-modal"] h2')).not.toHaveText(prompt1 as string, { timeout: 5000 });
            await gamePage.selectModalOption('Mickey Mouse - Brave Little Tailor');
            await gamePage.confirmModal();
        }

        await gamePage.page.waitForTimeout(1000);

        // Verify Stats
        const stats = await gamePage.page.evaluate(() => {
            const state = JSON.parse((window as any).lorcanaDebug.getState());
            const p1 = state.players.player1;
            const p2 = state.players.player2;

            const stitch = p1.play.find((c: any) => c.name.includes('Stitch'));
            const mickey = p2.play.find((c: any) => c.name.includes('Mickey'));

            return {
                stitchStr: stitch.strength, // 2 + 4 = 6
                mickeyStr: mickey.strength  // 5 - 4 = 1
            };
        });

        expect(stats.stitchStr).toBe(6);
        expect(stats.mickeyStr).toBe(1);
    });

});
