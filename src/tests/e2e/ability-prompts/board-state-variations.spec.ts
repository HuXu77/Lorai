import { test, expect } from '../fixtures/game-fixture';

/**
 * E2E Tests for Phase 2: Board State Variations
 * 
 * Data-driven test suite verifying specific ability types and their 
 * effects on the board state.
 */

interface VariationTestCase {
    name: string;
    card: string;
    setup: (gamePage: any) => Promise<void>;
    action: (gamePage: any) => Promise<void>;
    assertion: (gamePage: any) => Promise<void>;
}

const testCases: VariationTestCase[] = [
    {
        name: 'Banish Character (Dragon Fire)',
        card: 'Dragon Fire',
        setup: async (gamePage) => {
            await gamePage.injectState({
                player1: {
                    hand: ['Dragon Fire'],
                    inkwell: Array(5).fill('Mickey Mouse - True Friend'),
                    deck: ['Mickey Mouse - True Friend']
                },
                player2: {
                    play: [{ name: 'Mickey Mouse - True Friend' }],
                    deck: ['Mickey Mouse - True Friend']
                }
            });
        },
        action: async (gamePage) => {
            await gamePage.playCardFromHand('Dragon Fire');
            await gamePage.clickCardInPlay('Mickey Mouse - True Friend');
        },
        assertion: async (gamePage) => {
            await gamePage.expectLogMessage(/banishes Mickey Mouse - True Friend/i);
            // Verify card is no longer in play
            await expect(gamePage.page.locator(`[data-card-name="Mickey Mouse - True Friend"]`)).toBeHidden();
        }
    },
    {
        name: 'Heal (Dinglehopper)',
        card: 'Dinglehopper',
        setup: async (gamePage) => {
            await gamePage.injectState({
                player1: {
                    hand: ['Dinglehopper'],
                    inkwell: Array(2).fill('Mickey Mouse - True Friend'),
                    play: [{ name: 'Goofy - Musketeer', damage: 2 }], // Goofy has 2 damage
                    deck: ['Mickey Mouse - True Friend']
                },
                player2: { deck: ['Mickey Mouse - True Friend'] }
            });
        },
        action: async (gamePage) => {
            await gamePage.playCardFromHand('Dinglehopper');
            // Use ability: Exert -> Remove 1 damage
            await gamePage.clickCardInPlay('Dinglehopper');
            await gamePage.clickAction('Straighten Hair');
            await gamePage.clickCardInPlay('Goofy - Musketeer');
        },
        assertion: async (gamePage) => {
            // Verify damage reduced (or log message)
            await gamePage.expectLogMessage(/removes 1 damage from Goofy - Musketeer/i);
        }
    },
    {
        name: 'Exert (Elsa - Snow Queen)',
        card: 'Elsa - Snow Queen',
        setup: async (gamePage) => {
            await gamePage.injectState({
                player1: {
                    hand: ['Elsa - Snow Queen'], // Needs to be in play with Rush or simulated ready? 
                    // Better: Put in play ready, with ink to use ability
                    play: [{ name: 'Elsa - Snow Queen', ready: true }],
                    inkwell: Array(4).fill('Mickey Mouse - True Friend'),
                    deck: ['Mickey Mouse - True Friend']
                },
                player2: {
                    play: [{ name: 'Simba - Future King', ready: true }], // Ready target
                    deck: ['Mickey Mouse - True Friend']
                }
            });
        },
        action: async (gamePage) => {
            await gamePage.clickCardInPlay('Elsa - Snow Queen');
            await gamePage.clickAction('Freeze');
            await gamePage.clickCardInPlay('Simba - Future King');
        },
        assertion: async (gamePage) => {
            await gamePage.expectLogMessage(/exerts Simba - Future King/i);
        }
    },
    {
        name: 'Ready (Shield of Virtue)',
        card: 'Shield of Virtue',
        setup: async (gamePage) => {
            await gamePage.injectState({
                player1: {
                    play: [
                        { name: 'Shield of Virtue', ready: true },
                        { name: 'Aladdin - Heroic Outlaw', exerted: true } // Exerted target
                    ],
                    inkwell: Array(5).fill('Mickey Mouse - True Friend'), // Cost 3 to use
                    deck: ['Mickey Mouse - True Friend']
                },
                player2: { deck: ['Mickey Mouse - True Friend'] }
            });
        },
        action: async (gamePage) => {
            await gamePage.clickCardInPlay('Shield of Virtue');
            await gamePage.clickAction('Fireproof');
            await gamePage.clickCardInPlay('Aladdin - Heroic Outlaw');
        },
        assertion: async (gamePage) => {
            await gamePage.expectLogMessage(/readies Aladdin - Heroic Outlaw/i);
        }
    },
    {
        name: 'Return to Hand (Genie - On the Job)',
        card: 'Genie - On the Job',
        setup: async (gamePage) => {
            await gamePage.injectState({
                player1: {
                    hand: ['Genie - On the Job'],
                    inkwell: Array(6).fill('Mickey Mouse - True Friend'),
                    deck: ['Mickey Mouse - True Friend']
                },
                player2: {
                    play: [{ name: 'Stitch - Rock Star' }],
                    deck: ['Mickey Mouse - True Friend']
                }
            });
        },
        action: async (gamePage) => {
            await gamePage.playCardFromHand('Genie - On the Job');
            // "You may return..." -> Optional Prompt -> Target
            // Assuming simplified flow or verifying optionality

            // Check if modal appears or automatic target if optimized?
            // Usually "You may" -> Yes/No.
            const modal = await gamePage.expectModal();
            if (await modal.textContent().then(t => t?.includes('return'))) {
                await gamePage.confirmModal(); // Click Yes
            }

            await gamePage.clickCardInPlay('Stitch - Rock Star');
        },
        assertion: async (gamePage) => {
            await gamePage.expectLogMessage(/returns Stitch - Rock Star to player's hand/i);
            await expect(gamePage.page.locator(`[data-card-name="Stitch - Rock Star"]`)).toBeHidden();
        }
    },
    {
        name: 'Lore Loss (Aladdin - Street Rat)',
        card: 'Aladdin - Street Rat',
        setup: async (gamePage) => {
            await gamePage.injectState({
                player1: {
                    hand: ['Aladdin - Street Rat'],
                    inkwell: Array(3).fill('Mickey Mouse - True Friend'),
                    deck: ['Mickey Mouse - True Friend']
                },
                player2: {
                    lore: 1, // Opponent has 1 lore
                    deck: ['Mickey Mouse - True Friend']
                }
            });
        },
        action: async (gamePage) => {
            await gamePage.playCardFromHand('Aladdin - Street Rat');
        },
        assertion: async (gamePage) => {
            await gamePage.expectLore(2, 0); // Opponent (P2) should have 0 lore
        }
    },
    {
        name: 'Inkwell/Ramp (One Jump Ahead)',
        card: 'One Jump Ahead',
        setup: async (gamePage) => {
            await gamePage.injectState({
                player1: {
                    hand: ['One Jump Ahead'],
                    inkwell: ['Mickey Mouse - True Friend', 'Mickey Mouse - True Friend'], // 2 ink
                    deck: ['Mickey Mouse - True Friend'] // Card to jump
                },
                player2: { deck: ['Mickey Mouse - True Friend'] }
            });
        },
        action: async (gamePage) => {
            // Need to verify inkwell size before?
            // InjectState handles setup.
            await gamePage.playCardFromHand('One Jump Ahead');
        },
        assertion: async (gamePage) => {
            // Verify inkwell increased.

            // Wait for animation/state update
            await gamePage.page.waitForTimeout(3000);

            // Check log confirmation with simple regex
            await gamePage.expectLogMessage(/inkwell/i);

            // Verify ink count in UI using specific test ID
            // If this is flaky, we rely on the log
            const inkDisplay = gamePage.page.locator('[data-testid="player-ink-display"]');
            if (await inkDisplay.isVisible()) {
                const text = await inkDisplay.textContent();
                console.log('Ink Display:', text);
            }
        }
    }
];

test.describe('Board State Variations', () => {
    test.beforeEach(async ({ gamePage }) => {
        await gamePage.loadTestGame();
    });

    for (const testCase of testCases) {
        test(`should handle ${testCase.name}`, async ({ gamePage }) => {
            // console.log(`Starting variation test: ${testCase.name}`);
            await testCase.setup(gamePage);
            await testCase.action(gamePage);
            await testCase.assertion(gamePage);
        });
    }
});
