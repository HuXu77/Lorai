import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Test: Modal - DISTRIBUTE_DAMAGE / MULTI_TARGET
 * 
 * Tests abilities that require selecting multiple targets, specifically Mulan - Elite Archer's
 * splash damage ability ("deal damage to up to 2 other chosen characters").
 */

test.describe('Modal: Multi-Target Damage (Mulan)', () => {

    test('should allow selecting 2 targets for splash damage', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        // 1. Setup: 
        // P1: Mulan (Ready)
        // P2: Goofy (to be challenged), Donald, Mickey (targets for splash)
        await gamePage.injectState({
            player1: {
                play: [{ name: 'Mulan - Elite Archer', ready: true, damage: 0 }],
                lore: 0,
                hand: [],
                inkwell: [],
                deck: []
            },
            player2: {
                play: [
                    { name: 'Goofy - Musketeer', ready: false, exerted: true },
                    { name: 'Donald Duck - Musketeer', ready: true },
                    { name: 'Mickey Mouse - Musketeer', ready: true }
                ],
                lore: 0,
                hand: [],
                inkwell: [],
                deck: []
            },
            turnPlayer: 'player1'
        });

        // 2. Challenge Goofy with Mulan
        await gamePage.clickCardInPlay('Mulan');
        await gamePage.clickAction('Challenge');

        // Select target to challenge (Goofy)
        await gamePage.clickCardInPlay('Goofy');

        // 3. Verify Splash Damage Modal
        // "Deal 2 damage to up to 2 other chosen characters"
        const modal = await gamePage.expectModal();
        await expect(modal).toContainText('to up to 2 other chosen characters');

        // 4. Select Targets (Donald and Mickey)
        await gamePage.selectModalOption('Donald Duck');
        await gamePage.selectModalOption('Mickey Mouse');

        await gamePage.confirmModal();

        // 5. Verify Damage
        // Mulan deals 2 splash damage.
        await gamePage.expectLogMessage(/Donald Duck - Musketeer took 2 damage/i);
        await gamePage.expectLogMessage(/Mickey Mouse - Musketeer took 2 damage/i);
    });

});
