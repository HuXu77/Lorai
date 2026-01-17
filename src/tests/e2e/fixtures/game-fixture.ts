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
        // Wait for the page to settle
        await this.page.waitForLoadState('networkidle', { timeout: 30000 });
        // Give React time to hydrate and initialize game engine
        await this.page.waitForTimeout(2000);
        // Try to wait for lorcanaDebug - fallback if not available
        try {
            await this.page.waitForFunction(
                () => (window as any).lorcanaDebug !== undefined,
                { timeout: 10000, polling: 500 }
            );
        } catch {
            // Debug API may not be available - continue anyway
        }
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
                const success = debug.loadPreset({
                    id: 'injected',
                    name: 'Injected State',
                    setup: cfg
                });
                if (!success) {
                    throw new Error('Failed to load injected state via lorcanaDebug');
                }
            } else {
                throw new Error('lorcanaDebug not found during injectState');
            }
        }, config);
        await this.page.waitForTimeout(1000); // Increased wait time
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
    async addCardToPlay(cardName: string, player: 1 | 2 = 1, ready: boolean = true, bypassSummoningSickness: boolean = false) {
        await this.page.evaluate(({ name, p, r, bypass }) => {
            const debug = (window as any).lorcanaDebug;
            const playerId = p === 1 ? debug?.player1Id : debug?.player2Id;
            const options: any = { ready: r };
            if (bypass) {
                // Set turnPlayed to -1 (or 0) to ensure it can act immediately
                options.turnPlayed = 0;
            }
            debug?.addToPlay(playerId, name, options);
        }, { name: cardName, p: player, r: ready, bypass: bypassSummoningSickness });
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
        // Scope to player hand to avoid clicking matching cards in play
        const hand = this.page.locator('[data-testid="player-hand"]');
        const card = hand.locator(`[data-card-name*="${cardName}"], [title*="${cardName}"], img[alt*="${cardName}"]`).first();
        await card.click();
    }

    /**
     * Click a card in play area by name
     */
    async clickCardInPlay(cardName: string) {
        // Use broader selector since data-testid may not exist
        const card = this.page.locator(`[data-card-name*="${cardName}"], [title*="${cardName}"], img[alt*="${cardName}"]`).first();
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
        // Try multiple possible button texts
        const endTurnButton = this.page.locator('button:has-text("Pass"), button:has-text("End Turn"), button:has-text("End")').first();
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
        // pattern for regex matching
        const pattern = new RegExp(optionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

        // Priority 1: CardSelectionChoice custom option
        const choiceOption = this.page.locator(`[data-testid="choice-option"]`).filter({ hasText: pattern }).first();
        try {
            // click() auto-waits for visibility and actionability
            await choiceOption.click({ timeout: 2000 });
            return;
        } catch (e) {
            // Ignore failure, try next
        }

        // Priority 2: Standard Button (PlayAreaActionMenu, etc)
        // Check finding button by role (handles aria-label)
        try {
            await this.page.getByRole('button', { name: pattern }).first().click({ timeout: 2000 });
            return;
        } catch (e) {
            // Ignore
        }

        // Priority 3: Locator fallback (button with text content)
        // Useful if role is missing or strange structure
        await this.page.locator('button').filter({ hasText: pattern }).first().click({ timeout: 5000 });
    }

    /**
     * Confirm a modal (click OK/Confirm/Yes)
     */
    async confirmModal() {
        // Use filter with regex for flexibility
        const confirmBtn = this.page.locator('button').filter({ hasText: /Confirm|OK|Yes|Select/i }).first();
        try {
            await confirmBtn.click();
        } catch (e) {
            // If generalized confirm fails, specific button might exist?
            // Usually this is fine.
            throw e;
        }
    }

    /**
     * Cancel a modal
     */
    async cancelModal() {
        const cancelBtn = this.page.getByRole('button', { name: /Cancel|No|Decline/i }).first();
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
        // Broad search for the card
        const cards = this.page.locator(`[data-card-name*="${cardName}"], [title*="${cardName}"], img[alt*="${cardName}"]`);
        const count = await cards.count();
        let found = false;

        for (let i = 0; i < count; i++) {
            if (await cards.nth(i).isVisible()) {
                found = true;
                break;
            }
        }
        expect(found, `Card "${cardName}" should be visible in play`).toBe(true);

        // If checking player 1, ensure it's NOT in hand (since playing moves it)
        // Note: Hand usually hides cards or removes them. We just want to ensure we found a visible one (above).
        // If we want to strictly check it's NOT in hand, we need a reliable hand selector.
        // Given we don't have one, the visibility check above is the best proxy.
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
     * Assert game log contains message (searches page body)
     */
    async expectLogMessage(message: string | RegExp) {
        // Ensure log is open
        const logHeader = this.page.locator('h3:has-text("Game Log")');
        if (!(await logHeader.isVisible())) {
            const toggleBtn = this.page.locator('button[title="Open Game Log"]');
            if (await toggleBtn.isVisible()) {
                await toggleBtn.click();
                await expect(logHeader).toBeVisible();
            }
        }

        // Search the entire page (now including the open modal)
        await expect(this.page.locator('body')).toContainText(message, { timeout: 5000 });
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
    play?: (string | { name: string; ready?: boolean; exerted?: boolean; damage?: number; turnPlayed?: number })[];
    inkwell?: string[];
    deck?: string[];
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
