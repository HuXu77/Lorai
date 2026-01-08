'use client';

import { GameStateManager } from '../engine/state';
import { TurnManager, ActionType, Phase } from '../engine/actions';
import { HeuristicBot } from '../ai/heuristic-bot';
import { GameState, CardInstance, ZoneType } from '../engine/models';
import { LogCategory } from '../types/log';

/**
 * Log entry for game events
 */
export interface GameLogEntry {
    category: LogCategory | string;
    message: string;
    details?: any;
}

/**
 * Callbacks for UI to receive updates
 */
export interface GameControllerCallbacks {
    onStateChange: (state: GameState) => void;
    onLogEntry: (entry: GameLogEntry) => void;
    onBotTurnStart?: () => void;
    onBotTurnEnd?: () => void;
}

/**
 * Configuration for initializing a game
 */
export interface GameConfig {
    player1Name: string;
    player2Name: string;
    deck1Cards: any[];
    deck2Cards: any[];
    cardDatabase: any[];
}

/**
 * Clean interface between game engine and UI.
 * This abstraction allows any UI (React, Vue, CLI, mobile) to use the same game engine.
 */
export class GameController {
    private stateManager: GameStateManager;
    private turnManager: TurnManager;
    private bot: HeuristicBot;
    private callbacks: GameControllerCallbacks;

    private player1Id: string = '';
    private player2Id: string = '';
    private botIsActing: boolean = false;

    // =========================================================================
    // BRIDGE LOGGER
    // =========================================================================

    private createLogger(): any {
        return {
            log: (level: any, msg: string, data?: any) => console.log(msg, data),
            debug: (msg: string, data?: any) => console.debug(msg, data),
            info: (msg: string, data?: any) => {
                console.log('[INFO]', msg, data);
                // Forward specific info logs if valuable, or keep as debug
                if (msg.startsWith('Turn') || msg.startsWith('Game')) {
                    this.log('turn', msg, data);
                } else if (msg.includes('Draw')) {
                    this.log('game', msg, data);
                }
            },
            warn: (msg: string, data?: any) => console.warn('[WARN]', msg, data),
            error: (msg: string, data?: any) => console.error('[ERROR]', msg, data),

            action: (player: string, action: string, details?: any) => {
                console.log('[ACTION]', `${player} ${action}`, details);

                // Map known details or action strings to categories
                let category = 'action';
                const actionLower = action.toLowerCase();

                if (actionLower.includes('challenge') || actionLower.includes('combat') || actionLower.includes('attack')) {
                    category = 'combat';
                } else if (actionLower.includes('quest') || actionLower.includes('lore')) {
                    category = 'lore';
                } else if (actionLower.includes('played') || actionLower.includes('plays') || actionLower.includes('shift') || actionLower.includes('sing')) {
                    category = 'card';
                } else if (actionLower.includes('ink')) {
                    category = 'card'; // or 'ink' if supported by UI
                } else if (actionLower.includes('activate') || actionLower.includes('ability')) {
                    category = 'ability';
                }

                if (typeof details === 'object' && details?.type) {
                    // Override with explicit type if available
                    if (details.type.includes('challenge') || details.type.includes('combat')) category = 'combat';
                    else if (details.type.includes('quest') || details.type.includes('lore')) category = 'lore';
                    else if (details.type === 'shift') category = 'card';
                    else if (details.type === 'ink') category = 'ink';
                    else if (details.type === 'play') category = 'card';
                    else if (details.type === 'ability') category = 'ability';
                }

                // --- ACTION MESSAGE ENHANCEMENT ---
                // Attempts to improve generic log messages (e.g. "PlayCard", "Quest") by adding card details

                // Helper to resolve card info
                const getCardName = (obj: any, id?: string): string | undefined => {
                    if (obj) return obj.fullName || obj.name;
                    if (id) {
                        const c = this.getCardFromAllZones(id);
                        if (c) return c.fullName || c.name;
                    }
                    return undefined;
                };

                // 1. Challenge / Combat
                if (details?.type === 'challenge_start' || details?.type === 'challenge' || actionLower.includes('challenge')) {
                    const attackerName = getCardName(details?.attacker || details?.card, details?.attackerId || details?.cardId) || 'Unknown Card';
                    const targetName = getCardName(details?.defender || details?.target, details?.defenderId || details?.targetId) || 'Unknown Target';
                    action = `challenged **${targetName}** with **${attackerName}**`;
                }
                // 2. Play Card
                else if (details?.type === 'play' || action === 'PlayCard' || action === 'playCard') {
                    const cardName = getCardName(details?.card, details?.cardId) || 'Unknown Card';
                    action = `played **${cardName}**`;
                }
                // 3. Quest
                else if (details?.type === 'quest' || action === 'Quest' || action === 'quest') {
                    const cardName = getCardName(details?.card, details?.cardId) || 'Unknown Card';
                    action = `quested with **${cardName}**`;
                }
                // 4. Ink
                else if (details?.type === 'ink' || action === 'InkCard' || action === 'inkCard') {
                    const cardName = getCardName(details?.card, details?.cardId) || 'Unknown Card';
                    action = `inked **${cardName}**`;
                }
                // 5. Ability
                else if (details?.type === 'ability' || action === 'UseAbility' || action === 'useAbility') {
                    const cardName = getCardName(details?.card, details?.cardId) || 'Unknown Card';
                    action = `used ability of **${cardName}**`;
                }

                // Clean message mapping
                // Engine sends: player="Player 1", action="Played Mickey"
                // UI expects: message="Player 1 Played Mickey"
                this.log(category, `${player} ${action}`, details);
            },

            effect: (source: string, effect: string, target?: string, details?: any) => {
                console.log('[EFFECT]', `${source} -> ${effect}`, target, details);
                this.log('effect', `${source}: ${effect}${target ? ' on ' + target : ''}`, details);
            },

            getLogs: () => []
        };
    }

    constructor(callbacks: GameControllerCallbacks) {
        this.callbacks = callbacks;
        this.stateManager = new GameStateManager();

        const bridgeLogger = this.createLogger();

        this.turnManager = new TurnManager(this.stateManager, bridgeLogger as any);
        this.bot = new HeuristicBot(this.turnManager);
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    /**
     * Initialize a new game with the given configuration
     */
    initialize(config: GameConfig): void {
        // Add players
        this.player1Id = this.stateManager.addPlayer('player1', config.player1Name);
        this.player2Id = this.stateManager.addPlayer('player2', config.player2Name);

        const player1 = this.stateManager.getPlayer(this.player1Id);
        const player2 = this.stateManager.getPlayer(this.player2Id);

        // Build card lookup map
        const cardMap = new Map<string, any>();
        config.cardDatabase.forEach(card => {
            const existing = cardMap.get(card.fullName.toLowerCase());
            if (!existing) {
                cardMap.set(card.fullName.toLowerCase(), card);
            }
        });

        // Load decks
        const loadDeck = (cardNames: any[]): any[] => {
            return cardNames.map(name => {
                const normalizedName = (typeof name === 'string' ? name : name.fullName || name.name)
                    .trim().toLowerCase().replace(/\s+/g, ' ');
                const card = cardMap.get(normalizedName);
                if (!card) {
                    console.error(`Card not found: "${name}"`);
                    return null;
                }
                const copiedCard = JSON.parse(JSON.stringify(card));
                if (!copiedCard.ink && copiedCard.color) {
                    copiedCard.ink = copiedCard.color;
                }
                return copiedCard;
            }).filter(c => c !== null);
        };

        const deck1 = loadDeck(config.deck1Cards);
        const deck2 = loadDeck(config.deck2Cards);

        // Add cards to decks
        deck1.forEach(card => player1.addCardToZone(card, 'Deck' as ZoneType));
        deck2.forEach(card => player2.addCardToZone(card, 'Deck' as ZoneType));

        // Shuffle
        player1.deck.sort(() => Math.random() - 0.5);
        player2.deck.sort(() => Math.random() - 0.5);

        // Register choice handlers
        this.turnManager.registerChoiceHandler(this.player1Id, async (request) => {
            // For now, return first valid option (human should override this via UI)
            const validOption = request.options?.find(o => o.valid);
            return {
                requestId: request.id,
                playerId: request.playerId,
                selectedIds: validOption ? [validOption.id] : (request.options?.[0] ? [request.options[0].id] : []),
                timestamp: Date.now()
            };
        });

        this.turnManager.registerChoiceHandler(this.player2Id, (request) => {
            const response = this.bot.respondToChoiceRequest(request);

            // Log the choice
            try {
                // Resolve selected IDs to names for friendly logging
                const selectedNames = response.selectedIds.map((id: string) => {
                    // 1. Check if it's an option in the request (most reliable for non-card options)
                    const option = request.options.find(o => o.id === id);
                    if (option) {
                        // Use display text if available, or card name if it's a card option
                        return option.display || option.card?.name || 'Unknown Option';
                    }

                    // 2. Fallback: Search all zones for card ID
                    const card = this.getCardFromAllZones(id);
                    return card ? (card.fullName || card.name) : 'Unknown Card';
                });

                if (selectedNames.length > 0) {
                    const names = selectedNames.join(', ');
                    let actionVerb = 'chose';

                    // Context-aware verb
                    if (request.type.includes('discard')) actionVerb = 'discarded';
                    else if (request.type.includes('target')) actionVerb = 'targeted';
                    else if (request.type.includes('reveal')) actionVerb = 'revealed';

                    this.log('choice', `Bot ${actionVerb}: ${names}`, { prompt: request.prompt });
                }
            } catch (err) {
                console.error('Error logging bot choice:', err);
            }

            return response;
        });

        // Initialize bot
        this.bot.onGameStart(this.player2Id, this.stateManager.state);

        // Draw starting hands
        this.turnManager.drawStartingHand(player1);
        this.turnManager.drawStartingHand(player2);

        this.notifyStateChange();
    }

    /**
     * Process mulligan decisions and start the game
     */
    processMulligan(playerMulliganIds: string[]): void {
        const player1 = this.stateManager.getPlayer(this.player1Id);
        const player2 = this.stateManager.getPlayer(this.player2Id);

        // Player mulligan
        this.turnManager.mulligan(player1, playerMulliganIds);

        // Bot mulligan
        const botMulliganIds = this.bot.decideMulligan(player2.hand);
        this.turnManager.mulligan(player2, botMulliganIds);

        // Start game
        this.turnManager.startGame(this.player1Id);

        this.log('turn', 'Game started!');
        this.notifyStateChange();
    }

    // =========================================================================
    // PLAYER ACTIONS
    // =========================================================================

    /**
     * End the current player's turn
     */
    async endTurn(): Promise<void> {
        if (!this.isMyTurn()) return;

        this.log('turn', 'You ended your turn');
        await this.turnManager.passTurn(this.player1Id);
        this.notifyStateChange();

        // Trigger bot turn if needed
        if (this.stateManager.state.turnPlayerId === this.player2Id) {
            await this.executeBotTurn();
        }
    }

    /**
     * Play a card from hand
     */
    async playCard(cardId: string): Promise<boolean> {
        if (!this.isMyTurn()) return false;

        const player = this.stateManager.getPlayer(this.player1Id);
        const card = player.hand.find(c => c.instanceId === cardId);

        if (!card) return false;

        try {
            await this.turnManager.playCard(player, cardId);
            // Engine logs action
            this.notifyStateChange();
            return true;
        } catch (error) {
            console.error('Failed to play card:', error);
            return false;
        }
    }

    /**
     * Ink a card from hand
     */
    async inkCard(cardId: string): Promise<boolean> {
        if (!this.isMyTurn()) return false;

        const player = this.stateManager.getPlayer(this.player1Id);
        const card = player.hand.find(c => c.instanceId === cardId);

        if (!card) return false;

        const success = await this.turnManager.inkCard(player, cardId);
        if (success) {
            // Engine logs action
            this.notifyStateChange();
        }
        return success;
    }

    /**
     * Quest with a character
     */
    quest(cardId: string): boolean {
        if (!this.isMyTurn()) return false;

        const player = this.stateManager.getPlayer(this.player1Id);
        const card = player.play.find(c => c.instanceId === cardId);

        if (!card || !card.ready) return false;

        try {
            this.turnManager.resolveAction({
                type: ActionType.Quest,
                playerId: this.player1Id,
                cardId
            });
            // Engine logs action
            this.notifyStateChange();
            return true;
        } catch (error) {
            console.error('Failed to quest:', error);
            return false;
        }
    }

    /**
     * Challenge an opponent's character
     */
    async challenge(attackerId: string, defenderId: string): Promise<boolean> {
        if (!this.isMyTurn()) return false;

        const player = this.stateManager.getPlayer(this.player1Id);
        const attacker = player.play.find(c => c.instanceId === attackerId);

        if (!attacker || !attacker.ready) return false;

        try {
            await this.turnManager.resolveAction({
                type: ActionType.Challenge,
                playerId: this.player1Id,
                cardId: attackerId,
                targetId: defenderId
            });
            // Engine logs action
            this.notifyStateChange();
            return true;
        } catch (error) {
            console.error('Failed to challenge:', error);
            return false;
        }
    }

    // =========================================================================
    // STATE QUERIES
    // =========================================================================

    /**
     * Get current game state
     */
    getState(): GameState {
        return this.stateManager.state;
    }

    /**
     * Check if it's the human player's turn
     */
    isMyTurn(): boolean {
        return this.stateManager.state.turnPlayerId === this.player1Id;
    }

    /**
     * Get available ink count
     */
    getAvailableInk(): number {
        const player = this.stateManager.getPlayer(this.player1Id);
        return player.inkwell.filter(c => c.ready).length;
    }

    /**
     * Get player's hand
     */
    getHand(): CardInstance[] {
        return this.stateManager.getPlayer(this.player1Id).hand;
    }

    /**
     * Get opponent's exerted characters (valid challenge targets)
     */
    getValidChallengeTargets(): CardInstance[] {
        const opponent = this.stateManager.getPlayer(this.player2Id);
        return opponent.play.filter(c => !c.ready && c.type === 'Character');
    }

    /**
     * Get ready characters that can quest or challenge
     */
    getReadyCharacters(): CardInstance[] {
        const player = this.stateManager.getPlayer(this.player1Id);
        return player.play.filter(c => c.ready && c.type === 'Character');
    }

    /**
     * Check if player has already inked this turn
     */
    hasInkedThisTurn(): boolean {
        const player = this.stateManager.getPlayer(this.player1Id);
        return player.inkedThisTurn || false;
    }

    /**
     * Get player 1 ID
     */
    getPlayerId(): string {
        return this.player1Id;
    }

    /**
     * Get player 2 (bot) ID
     */
    getBotId(): string {
        return this.player2Id;
    }

    // =========================================================================
    // BOT AUTOMATION
    // =========================================================================

    private async executeBotTurn(): Promise<void> {
        if (this.botIsActing) return;
        this.botIsActing = true;

        this.callbacks.onBotTurnStart?.();

        try {
            let actionCount = 0;
            const maxActions = 50;

            while (this.stateManager.state.turnPlayerId === this.player2Id && actionCount < maxActions) {
                const action = await this.bot.decideAction(this.stateManager.state);
                // console.log(`[Bot] Action #${actionCount + 1}: ${action.type}`);

                await this.turnManager.resolveAction(action);
                actionCount++;

                this.notifyStateChange();

                if (action.type === ActionType.PassTurn) {
                    this.log('turn', 'Bot ended their turn');
                    break;
                }

                // Delay between actions
                await new Promise(resolve => setTimeout(resolve, 800));
            }

            console.log(`[Bot] Turn complete after ${actionCount} actions`);
        } catch (error) {
            console.error('[Bot] Error during turn:', error);
        }

        this.botIsActing = false;
        this.callbacks.onBotTurnEnd?.();
        this.notifyStateChange();
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    private notifyStateChange(): void {
        this.callbacks.onStateChange({ ...this.stateManager.state });
    }

    private log(category: string, message: string, details?: any): void {
        this.callbacks.onLogEntry({ category, message, details });
    }

    /**
     * Helper to find a card in ANY zone of ANY player for logging purposes.
     * Replaces old getCardName to provide full card object.
     */
    private getCardFromAllZones(cardId?: string): CardInstance | undefined {
        if (!cardId) return undefined;
        // Search all logical zones including bag/staging if possible, but standard zones usually overflow.
        const allCards = [
            ...this.stateManager.getPlayer(this.player1Id).hand,
            ...this.stateManager.getPlayer(this.player1Id).play,
            ...this.stateManager.getPlayer(this.player1Id).discard,
            ...this.stateManager.getPlayer(this.player1Id).inkwell,

            ...this.stateManager.getPlayer(this.player2Id).hand,
            ...this.stateManager.getPlayer(this.player2Id).play,
            ...this.stateManager.getPlayer(this.player2Id).discard,
            ...this.stateManager.getPlayer(this.player2Id).inkwell
        ];

        return allCards.find(c => c.instanceId === cardId);
    }
}
