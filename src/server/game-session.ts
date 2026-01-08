import { GameStateManager } from '../engine/state';
import { TurnManager } from '../engine/actions';
import { ActionType, ZoneType } from '../engine/models';
import { RandomBot } from '../ai/random-bot';
import { v4 as uuidv4 } from 'uuid';

export interface GameAction {
    type: 'PLAY_CARD' | 'QUEST' | 'CHALLENGE' | 'INK_CARD' | 'PASS_TURN' | 'USE_ABILITY' | 'SING';
    playerId: string;
    cardId?: string;
    targetId?: string;
    defenderId?: string;
}

export interface GameSessionConfig {
    player1Id: string;
    player1Name: string;
}

/**
 * GameSession manages a single game instance on the server.
 * All game logic and validation happens here - the client is just a view.
 */
export class GameSession {
    public readonly sessionId: string;
    public readonly gameState: GameStateManager;
    public readonly turnManager: TurnManager;
    public readonly bot: RandomBot;

    private player1Id: string;
    private botId: string = 'bot';

    constructor(config: GameSessionConfig, loader: any) {
        this.sessionId = uuidv4();
        this.player1Id = config.player1Id;

        // Initialize game state (no constructor params - API pattern from bot-sim.ts)
        this.gameState = new GameStateManager();

        // Add players
        this.gameState.addPlayer(config.player1Id, config.player1Name);
        this.gameState.addPlayer(this.botId, 'Heuristic Bot');

        // Setup decks
        const allCards = loader.getAllCards();
        const p1 = this.gameState.getPlayer(config.player1Id);
        const bot = this.gameState.getPlayer(this.botId);

        // Create random 60-card decks
        for (let i = 0; i < 60; i++) {
            p1.addCardToZone(allCards[i % allCards.length], ZoneType.Deck);
            bot.addCardToZone(allCards[(i + 20) % allCards.length], ZoneType.Deck);
        }

        // Draw starting hands
        for (let i = 0; i < 7; i++) {
            p1.hand.push(p1.deck.pop()!);
            bot.hand.push(bot.deck.pop()!);
        }

        // Initialize turn manager
        this.turnManager = new TurnManager(this.gameState);

        // Initialize bot
        this.bot = new RandomBot(this.turnManager);
        this.bot.onGameStart(this.botId, this.gameState.state);

        // Start game
        this.turnManager.startGame(config.player1Id);
    }

    /**
     * Validates and executes a player action.
     * Returns success/error and updated game state.
     */
    public async executeAction(action: GameAction): Promise<{ success: boolean; error?: string }> {
        try {
            // Validate it's the player's turn
            if (this.gameState.state.turnPlayerId !== action.playerId) {
                return { success: false, error: 'Not your turn' };
            }

            // Map action to engine action format
            const engineAction = this.mapToEngineAction(action);

            // Execute action through turn manager (validates automatically)
            this.turnManager.resolveAction(engineAction);

            // Check if bot needs to take turn
            if (this.gameState.state.turnPlayerId === this.botId) {
                await this.executeBotTurn();
            }

            return { success: true };

        } catch (error: any) {
            return { success: false, error: error.message || 'Invalid action' };
        }
    }

    /**
     * Bot takes its turn automatically
     */
    private async executeBotTurn(): Promise<void> {
        // Give UI a moment to update
        await new Promise(resolve => setTimeout(resolve, 500));

        while (this.gameState.state.turnPlayerId === this.botId) {
            const action = await this.bot.decideAction(this.gameState.state);

            if (action.type === ActionType.PassTurn) {
                this.turnManager.resolveAction(action);
                break;
            }

            this.turnManager.resolveAction(action);

            // Small delay between bot actions for visual clarity
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }

    /**
     * Maps client action format to engine action format
     */
    private mapToEngineAction(action: GameAction): any {
        const baseAction = {
            playerId: action.playerId
        };

        switch (action.type) {
            case 'PLAY_CARD':
                return {
                    ...baseAction,
                    type: ActionType.PlayCard,
                    cardId: action.cardId
                };

            case 'QUEST':
                return {
                    ...baseAction,
                    type: ActionType.Quest,
                    cardId: action.cardId
                };

            case 'CHALLENGE':
                return {
                    ...baseAction,
                    type: ActionType.Challenge,
                    attackerId: action.cardId,
                    defenderId: action.defenderId
                };

            case 'INK_CARD':
                return {
                    ...baseAction,
                    type: ActionType.InkCard,
                    cardId: action.cardId
                };

            case 'PASS_TURN':
                return {
                    ...baseAction,
                    type: ActionType.PassTurn
                };

            case 'USE_ABILITY':
                return {
                    ...baseAction,
                    type: ActionType.UseAbility,
                    cardId: action.cardId,
                    targetId: action.targetId
                };

            case 'SING':
                return {
                    ...baseAction,
                    type: ActionType.SingSong,
                    singerId: action.cardId,
                    songId: action.targetId
                };

            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }

    /**
     * Gets the current game state for sending to client
     */
    public getClientGameState() {
        const players = Object.values(this.gameState.state.players).map((p: any) => ({
            id: p.id,
            name: p.name,
            lore: p.lore,
            inkAvailable: p.inkwell.filter((c: any) => !c.used).length,
            handSize: p.hand.length,
            deckSize: p.deck.length,
            discardSize: p.discard.length,
            // Only reveal full hand if it's the human player
            hand: p.id === this.player1Id ? p.hand : [],
            play: p.play
        }));

        return {
            sessionId: this.sessionId,
            currentPlayer: this.gameState.state.turnPlayerId,
            phase: this.gameState.state.phase,
            turn: this.gameState.state.turnCount,
            players: players,
            winner: this.gameState.state.winnerId || null
        };
    }

    /**
     * Check if game is over
     */
    public isGameOver(): boolean {
        return this.gameState.state.winnerId !== null;
    }
}
