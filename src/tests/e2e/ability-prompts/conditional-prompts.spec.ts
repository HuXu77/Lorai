import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Tests for Conditional Prompt Pattern (Category 6)
 */

test.describe('Conditional Prompts - Condition-Based Effects', () => {
    test.beforeEach(async ({ gamePage }) => {
        await gamePage.loadTestGame();
    });

    test('should prompt when condition IS met', async ({ gamePage }) => {
        // Setup: World's Greatest Criminal Mind (Banish chosen character with 5 Strength or more)
        const targetName = 'Maufasa - Ruler of Pride Rock'; // Has 5+ (Wait, Mufasa is 4 cost... let's check inventory for high strength char)
        // Inventory check: | 24 | STONE BY DAY... | Demona - Betrayer of the Clan | has high stats?
        // Let's use "Maui - Hero to All" (Cost 5, 6/5) - definitely > 5 Strength 
        const validTarget = 'Maui - Hero to All';

        await gamePage.injectState({
            player1: {
                hand: ["World's Greatest Criminal Mind"],
                inkwell: ['Mickey Mouse - True Friend', 'Mickey Mouse - True Friend', 'Mickey Mouse - True Friend'], // Cost 2
                deck: ['Mickey Mouse - True Friend']
            },
            player2: {
                play: [{ name: validTarget }],
                deck: ['Mickey Mouse - True Friend']
            }
        });

        await gamePage.playCardFromHand("World's Greatest Criminal Mind");

        // Verify Targeting appears (Log or UI state)
        // Select target
        await gamePage.clickCardInPlay(validTarget);

        // Verify banished
        await gamePage.expectLogMessage(/banishes Maui - Hero to All/i);
    });

    test('should NOT allow targeting when condition is not met', async ({ gamePage }) => {
        // Setup: Target has LESS than 5 Strength
        const invalidTarget = 'Mickey Mouse - True Friend'; // 3/3 Stats

        await gamePage.injectState({
            player1: {
                hand: ["World's Greatest Criminal Mind"],
                inkwell: ['Mickey Mouse - True Friend', 'Mickey Mouse - True Friend'],
                deck: ['Mickey Mouse - True Friend']
            },
            player2: {
                play: [{ name: invalidTarget }],
                deck: ['Mickey Mouse - True Friend']
            }
        });

        await gamePage.playCardFromHand("World's Greatest Criminal Mind");

        // Try to click invalid target
        await gamePage.clickCardInPlay(invalidTarget);

        // Verify Target is STILL there (not banished)
        await gamePage.expectCardInPlay(invalidTarget);

        // NOTE: In strict UI, this might just refuse selection or show "No valid targets" and fizzle.
        // If it fizzles automatically because NO valid targets exist on board, we should verify that.
        // "World's Greatest Criminal Mind" requires "chosen character with 5 Strenth or more".
        // If none exist, the parser might skip the effect entirely (Pattern 1 behavior).
        // Let's verify THAT behavior if possible?
        // But here we are testing "Attempt to select invalid".
    });
});

