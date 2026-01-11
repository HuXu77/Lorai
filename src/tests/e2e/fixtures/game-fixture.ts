import { test as base, expect, Page, Locator } from '@playwright/test';

/**
 * Game Page Object Model
 * 
 * Provides clean API for interacting with the game UI in E2E tests.
 * Mirrors patterns from engine TestHarness for consistency.
 */
export class GamePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ==================== NAVIGATION ====================

    /**
     * Load game with test mode and auto-mulligan
     */
    async loadTestGame() {
        await this.page.goto('/game?test=true&autoMulligan=true&debug=true');
        await this.waitForGameReady();
    }

    /**
     * Load game with specific starting hand
     */
    async loadWithStartingHand(cardNames: string[]) {
        const cardsParam = cardNames.join(',');
        await this.page.goto(`/game?test=true&autoMulligan=true&debug=true&startingHand=${encodeURIComponent(cardsParam)}`);
        await this.waitForGameReady();
    }

    /**
     * Wait for game to be fully loaded and ready
     */
    async waitForGameReady() {
        // Wait for game board to be visible
        await this.page.waitForSelector('[data-testid="game-board"]', { timeout: 30000 });
        // Wait for "Your Turn" or turn indicator
        await this.page.waitForSelector('text=/Your Turn|Turn 1/i', { timeout: 10000 });
    }

    // ==================== STATE INJECTION ====================

    /**
     * Inject a preset via the debug panel
     */
    async loadPreset(presetId: string) {
        await this.openDebugPanel();
        await this.page.click(`[data-preset-id="${presetId}"]`);
        await this.closeDebugPanel();
        await this.page.waitForTimeout(500); // Allow state to update
    }

    /**
     * Inject custom state via debug panel API
     */
    async injectState(config: GameStateConfig) {
        await this.page.evaluate((cfg) => {
            const debug = (window as any).lorcanaDebug;
            if (debug) {
                debug.loadPreset({
                    id: 'injected',
                    name: 'Injected State',
                    setup: cfg
                });
            }
        }, config);
        await this.page.waitForTimeout(500); // Allow state to update
    }

    /**
     * Add a card to player's hand via debug panel
     */
    async addCardToHand(cardName: string, player: 1 | 2 = 1) {
        await this.page.evaluate(({ name, p }) => {
            const debug = (window as any).lorcanaDebug;
            const playerId = p === 1 ? debug?.player1Id : debug?.player2Id;
            debug?.addToHand(playerId, name);
        }, { name: cardName, p: player });
    }

    /**
     * Add a card to play area via debug panel
     */
    async addCardToPlay(cardName: string, player: 1 | 2 = 1, ready: boolean = true) {
        await this.page.evaluate(({ name, p, r }) => {
            const debug = (window as any).lorcanaDebug;
            const playerId = p === 1 ? debug?.player1Id : debug?.player2Id;
            debug?.addToPlay(playerId, name, { ready: r });
        }, { name: cardName, p: player, r: ready });
    }

    /**
     * Set player's lore
     */
    async setLore(player: 1 | 2, amount: number) {
        await this.page.evaluate(({ p, lore }) => {
            const debug = (window as any).lorcanaDebug;
            const playerId = p === 1 ? debug?.player1Id : debug?.player2Id;
            debug?.setLore(playerId, lore);
        }, { p: player, lore: amount });
    }

    // ==================== DEBUG PANEL ====================

    async openDebugPanel() {
        const debugButton = this.page.locator('button:has-text("🔧")');
        if (await debugButton.isVisible()) {
            await debugButton.click();
        }
    }

    async closeDebugPanel() {
        const closeButton = this.page.locator('[data-testid="debug-panel-close"]');
        if (await closeButton.isVisible()) {
            await closeButton.click();
        }
    }

    // ==================== CARD INTERACTIONS ====================

    /**
     * Click a card in hand by name (partial match)
     */
    async clickCardInHand(cardName: string) {
        const hand = this.page.locator('[data-testid="player-hand"]');
        const card = hand.locator(`[data-card-name*="${cardName}"]`).first();
        await card.click();
    }

    /**
     * Click a card in play area by name
     */
    async clickCardInPlay(cardName: string) {
        const playArea = this.page.locator('[data-testid="play-area"]');
        const card = playArea.locator(`[data-card-name*="${cardName}"]`).first();
        await card.click();
    }

    /**
     * Click an action button in the card action menu
     */
    async clickAction(actionName: string) {
        const menuButton = this.page.locator(`button:has-text("${actionName}")`).first();
        await menuButton.click();
    }

    /**
     * End the current turn
     */
    async endTurn() {
        const endTurnButton = this.page.locator('button:has-text(/Pass|End Turn/i)').first();
        await endTurnButton.click();
        // Wait for turn to change
        await this.page.waitForTimeout(1000);
    }

    // ==================== MODAL INTERACTIONS ====================

    /**
     * Wait for and interact with choice modal
     */
    async expectModal(modalType?: string) {
        const modal = this.page.locator('[data-testid="choice-modal"], [role="dialog"]');
        await expect(modal).toBeVisible({ timeout: 5000 });
        return modal;
    }

    /**
     * Select an option in a choice modal
     */
    async selectModalOption(optionText: string) {
        const option = this.page.locator(`[data-testid="choice-option"]:has-text("${optionText}")`).first();
        if (await option.isVisible()) {
            await option.click();
        } else {
            // Fallback - click any button containing the text
            await this.page.locator(`button:has-text("${optionText}")`).first().click();
        }
    }

    /**
     * Confirm a modal (click OK/Confirm/Yes)
     */
    async confirmModal() {
        const confirmBtn = this.page.locator('button:has-text(/Confirm|OK|Yes/i)').first();
        await confirmBtn.click();
    }

    /**
     * Cancel a modal
     */
    async cancelModal() {
        const cancelBtn = this.page.locator('button:has-text(/Cancel|No/i)').first();
        await cancelBtn.click();
    }

    // ==================== ASSERTIONS ====================

    /**
     * Assert player's lore amount
     */
    async expectLore(player: 1 | 2, amount: number) {
        const loreSelector = player === 1 ? '[data-testid="player-lore"]' : '[data-testid="opponent-lore"]';
        const loreDisplay = this.page.locator(loreSelector);
        await expect(loreDisplay).toContainText(String(amount));
    }

    /**
     * Assert card is in play area
     */
    async expectCardInPlay(cardName: string, player: 1 | 2 = 1) {
        const areaSelector = player === 1 ? '[data-testid="player-play-area"]' : '[data-testid="opponent-play-area"]';
        const area = this.page.locator(areaSelector);
        const card = area.locator(`[data-card-name*="${cardName}"]`);
        await expect(card).toBeVisible();
    }

    /**
     * Assert card is in hand
     */
    async expectCardInHand(cardName: string) {
        const hand = this.page.locator('[data-testid="player-hand"]');
        const card = hand.locator(`[data-card-name*="${cardName}"]`);
        await expect(card).toBeVisible();
    }

    /**
     * Assert card count in hand
     */
    async expectHandSize(size: number) {
        const hand = this.page.locator('[data-testid="player-hand"]');
        const cards = hand.locator('[data-card-name]');
        await expect(cards).toHaveCount(size);
    }

    /**
     * Assert game log contains message
     */
    async expectLogMessage(message: string | RegExp) {
        const log = this.page.locator('[data-testid="game-log"]');
        await expect(log).toContainText(message);
    }
}

// ==================== STATE CONFIG TYPE ====================

export interface GameStateConfig {
    player1?: PlayerConfig;
    player2?: PlayerConfig;
    turnPlayer?: 'player1' | 'player2';
}

export interface PlayerConfig {
    hand?: string[];
    play?: (string | { name: string; ready?: boolean; exerted?: boolean })[];
    inkwell?: string[];
    discard?: string[];
    lore?: number;
}

// ==================== FIXTURE ====================

type GameFixtures = {
    gamePage: GamePage;
};

/**
 * Extended test fixture with GamePage
 */
export const test = base.extend<GameFixtures>({
    gamePage: async ({ page }, use) => {
        const gamePage = new GamePage(page);
        await use(gamePage);
    },
});

export { expect };
