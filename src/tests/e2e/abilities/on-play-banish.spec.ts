import { test, expect } from '../fixtures/game-fixture';

test.describe('Abilities: On Play - Banish', () => {

    test('Madame Medusa - The Boss should banish chosen opposing character', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                hand: ['Madame Medusa - The Boss'],
                inkwell: ['Ink', 'Ink', 'Ink', 'Ink', 'Ink', 'Ink'],
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

        await gamePage.clickCardInHand('Madame Medusa - The Boss');
        await gamePage.clickAction('Play Card');
        await gamePage.selectModalOption('Mickey Mouse');
        await gamePage.confirmModal();
        await gamePage.page.waitForTimeout(1000);
        await expect(gamePage.page.locator('text=Opponent Discard').locator('..').locator('img[alt*="Mickey Mouse"]')).toBeVisible();
    });

    test('Minnie Mouse - Musketeer Champion should banish opposing character with cost 5 or more', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                hand: ['Minnie Mouse - Musketeer Champion'],
                inkwell: ['Ink', 'Ink', 'Ink', 'Ink', 'Ink'],
                play: [],
                deck: []
            },
            player2: {
                play: [
                    { name: 'Mickey Mouse - Brave Little Tailor', ready: true }, // Strength 5, valid
                    { name: "Pascal - Rapunzel's Companion", ready: true } // Strength 1, invalid
                ],
                hand: [],
                deck: [],
                inkwell: []
            },
            turnPlayer: 'player1'
        });

        await gamePage.clickCardInHand('Minnie Mouse - Musketeer Champion');
        await gamePage.clickAction('Play Card');

        // Handle Bodyguard choice (Enter play exerted? -> No)
        await gamePage.selectModalOption('No');
        await gamePage.page.waitForTimeout(500);

        // Now handle Banish ability
        await gamePage.selectModalOption('Mickey Mouse');
        await gamePage.confirmModal();
        await gamePage.page.waitForTimeout(1000);

        // precise assertions
        await expect(gamePage.page.locator('text=Opponent Discard').locator('..').locator('img[alt*="Mickey Mouse"]')).toBeVisible();
        // Check Pascal is still in play (visible anywhere, effectively)
        await expect(gamePage.page.locator('img[alt*="Pascal"]')).toBeVisible();
        // And NOT in discard
        await expect(gamePage.page.locator('text=Opponent Discard').locator('..').locator('img[alt*="Pascal"]')).not.toBeVisible();
    });

    test('Dragon Fire action should banish chosen character', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

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

        await gamePage.clickCardInHand('Dragon Fire');
        await gamePage.clickAction('Play Card');
        await gamePage.selectModalOption('Mickey Mouse');
        await gamePage.confirmModal();
        await gamePage.page.waitForTimeout(1000);
        await expect(gamePage.page.locator('text=Opponent Discard').locator('..').locator('img[alt*="Mickey Mouse"]')).toBeVisible();
    });

    test('Queen of Hearts - Quick-Tempered should deal 1 damage on play', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                hand: ['Queen of Hearts - Quick-Tempered'],
                inkwell: ['Ink', 'Ink'],
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

        await gamePage.clickCardInHand('Queen of Hearts - Quick-Tempered');
        await gamePage.clickAction('Play Card');
        await gamePage.selectModalOption('Mickey Mouse');
        await gamePage.confirmModal();
        await gamePage.page.waitForTimeout(1000);
        const mickeyCard = gamePage.page.locator('[data-card-name="Mickey Mouse - Brave Little Tailor"]');
        await expect(mickeyCard.locator('text="1"')).toBeVisible();
    });

    test('Jetsam - Opportunistic Eel should deal 3 damage on play', async ({ gamePage }) => {
        test.setTimeout(60000);
        await gamePage.loadTestGame();

        await gamePage.injectState({
            player1: {
                hand: ['Jetsam - Opportunistic Eel'],
                inkwell: ['Ink', 'Ink', 'Ink', 'Ink', 'Ink', 'Ink', 'Ink'],
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

        await gamePage.clickCardInHand('Jetsam - Opportunistic Eel');
        await gamePage.clickAction('Play Card');
        await gamePage.selectModalOption('Mickey Mouse');
        await gamePage.confirmModal();
        await gamePage.page.waitForTimeout(1000);
        const mickeyCard = gamePage.page.locator('[data-card-name="Mickey Mouse - Brave Little Tailor"]');
        await expect(mickeyCard.locator('text="3"')).toBeVisible();
    });

});
