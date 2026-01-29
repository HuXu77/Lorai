
import { test, expect } from '../fixtures/game-fixture';

test.describe('Abilities: Challenger & Ward', () => {

    test.skip('Challenger: Captain Hook should get +2 Strength while challenging', async ({ gamePage }) => {
        // Captain Hook - Forceful Duelist: 1 Strength, Challenger +2 (Total 3 while challenging)
        // Target: Minnie Mouse - Always Classy (3 Willpower)
        // Expected Result: Minnie is banished (3 damage >= 3 Willpower)

        await gamePage.loadTestGame();
        await gamePage.injectState({
            player1: {
                hand: [],
                play: [
                    { name: 'Captain Hook - Forceful Duelist', ready: true, turnPlayed: 0 } // Dry
                ],
                inkwell: [], deck: Array(10).fill('Ink')
            },
            player2: {
                play: [
                    { name: 'Minnie Mouse - Always Classy', ready: false } // Exerted target
                ],
                hand: [], inkwell: [], deck: Array(10).fill('Ink')
            },
            turnPlayer: 'player1'
        });

        // Debug: Verify initial states
        // Hook Strength 1
        // Minnie Willpower 3

        // Initiate Challenge
        await gamePage.clickCardInPlay('Captain Hook - Forceful Duelist');

        // Note: Hook has 1 Strength base. If Challenger wasn't working, he would deal 1 damage.
        // Minnie has 3 Willpower. 1 damage would leave her at 2 damage (alive).
        // With Challenger +2, he deals 3 damage. Minnie reaches 3 damage (banished).

        await gamePage.clickAction('Challenge');
        await gamePage.clickCardInPlay('Minnie Mouse - Always Classy');

        // Verify Outcome
        // Minnie should be in Player 2's discard (banished)
        // We can check if she is no longer in play
        await expect(gamePage.page.locator(`[data-name="Minnie Mouse - Always Classy"]`)).toHaveCount(0);

        // Verify Hook is exerted
        await expect(gamePage.page.locator(`[data-name="Captain Hook - Forceful Duelist"]`)).toHaveClass(/opacity-60/);
    });

    test.skip('Ward: Opponents cannot choose Donald Duck with Dragon Fire', async ({ gamePage }) => {
        // Donald Duck - Strutting His Stuff has Ward.
        // Goofy - Musketeer does not.
        // Dragon Fire: "Banish chosen character." (Chosen by opponent)

        await gamePage.loadTestGame();
        await gamePage.injectState({
            player1: {
                hand: ['Dragon Fire', 'Ink'],
                play: [],
                inkwell: ['Ink', 'Ink', 'Ink', 'Ink', 'Ink'], // Cost 5
                deck: Array(10).fill('Ink')
            },
            player2: {
                play: [
                    // Ward Character
                    { name: 'Donald Duck - Strutting His Stuff', ready: true },
                    // Non-Ward Character
                    { name: 'Goofy - Musketeer', ready: true }
                ],
                hand: [], inkwell: [], deck: Array(10).fill('Ink')
            },
            turnPlayer: 'player1'
        });

        // Play Dragon Fire
        await gamePage.clickCardInHand('Dragon Fire');
        await gamePage.clickAction('Play Card'); // Cost 5

        // Expect Choice Modal
        await gamePage.expectModal('choice-modal');

        // Validation:
        // 1. Goofy should be selectable
        // 2. Donald should NOT be selectable (Ward)

        // Get all option texts
        const options = await gamePage.page.locator('[data-testid="choice-option"]').allTextContents();
        console.log('Dragon Fire Targets:', options);

        // Assertions
        const hasGoofy = options.some(t => t.includes('Goofy'));
        const hasDonald = options.some(t => t.includes('Donald Duck'));

        expect(hasGoofy).toBe(true);
        expect(hasDonald).toBe(false);

        // Select Goofy to complete the action cleanly
        await gamePage.selectModalOption('Goofy');
        // Confirm if needed (gamePage helper might handle it or we wait for effect)
        // Dragon Fire usually auto-confirms if single select? Or maybe standard confirm.
        // selectModalOption clicks the option. 
        // Let's assume we might need to confirm if multiple targets were possible? 
        // Dragon Fire is single target.
        // But usually "OrderedCards" or "MultiSelect" needs confirm.
        // Single select might just proceed.

        // Wait for Goofy to be banished
        await expect(gamePage.page.locator(`[data-name="Goofy - Musketeer"]`)).toHaveCount(0);
    });

});
