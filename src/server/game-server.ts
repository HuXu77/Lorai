import { WebSocketServer, WebSocket } from 'ws';
import { GameSession, GameAction } from './game-session';
import { CardLoader } from '../engine/card-loader';

interface Client {
    ws: WebSocket;
    playerId: string;
    sessionId: string;
}

/**
 * WebSocket Game Server
 * Handles client connections, game creation, and action routing.
 * All game logic is validated server-side for security.
 */
export class GameServer {
    private wss: WebSocketServer;
    private sessions: Map<string, GameSession> = new Map();
    private clients: Map<WebSocket, Client> = new Map();
    private cardLoader: CardLoader;

    constructor(port: number = 3001) {
        this.wss = new WebSocketServer({ port });
        this.cardLoader = new CardLoader();
        this.cardLoader.loadCards();

        console.log(`🎮 Game Server listening on port ${port}`);

        this.wss.on('connection', (ws: WebSocket) => {
            this.handleConnection(ws);
        });
    }

    private handleConnection(ws: WebSocket) {
        console.log('👤 New client connected');

        ws.on('message', (data: Buffer) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleMessage(ws, message);
            } catch (error) {
                this.sendError(ws, 'Invalid message format');
            }
        });

        ws.on('close', () => {
            const client = this.clients.get(ws);
            if (client) {
                console.log(`👤 Client ${client.playerId} disconnected`);
                this.clients.delete(ws);
            }
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }

    private async handleMessage(ws: WebSocket, message: any) {
        const { type, ...payload } = message;

        switch (type) {
            case 'CREATE_GAME':
                await this.handleCreateGame(ws, payload);
                break;

            case 'ACTION':
                await this.handleAction(ws, payload);
                break;

            case 'GET_STATE':
                this.handleGetState(ws);
                break;

            default:
                this.sendError(ws, `Unknown message type: ${type}`);
        }
    }

    /**
     * Create a new game session
     */
    private async handleCreateGame(ws: WebSocket, payload: any) {
        try {
            const { playerName } = payload;

            // Create game session (decks are created inside GameSession now)
            const session = new GameSession({
                player1Id: playerName || 'player1',
                player1Name: playerName || 'Player 1'
            }, this.cardLoader);

            this.sessions.set(session.sessionId, session);

            // Register client
            this.clients.set(ws, {
                ws,
                playerId: session.gameState.state.players[session.gameState.state.turnPlayerId].id,
                sessionId: session.sessionId
            });

            // Send initial game state
            this.send(ws, {
                type: 'GAME_CREATED',
                sessionId: session.sessionId,
                gameState: session.getClientGameState()
            });

            console.log(`🎮 Game created: ${session.sessionId}`);

        } catch (error: any) {
            this.sendError(ws, `Failed to create game: ${error.message}`);
        }
    }

    /**
     * Handle player action
     */
    private async handleAction(ws: WebSocket, payload: GameAction) {
        const client = this.clients.get(ws);
        if (!client) {
            return this.sendError(ws, 'Not connected to a game');
        }

        const session = this.sessions.get(client.sessionId);
        if (!session) {
            return this.sendError(ws, 'Game session not found');
        }

        // Execute action (server validates everything)
        const result = await session.executeAction(payload);

        if (!result.success) {
            return this.send(ws, {
                type: 'ACTION_ERROR',
                error: result.error
            });
        }

        // Broadcast updated game state
        this.broadcastGameState(session);

        // Check for game over
        if (session.isGameOver()) {
            this.send(ws, {
                type: 'GAME_OVER',
                winner: session.gameState.state.winnerId
            });
        }
    }

    /**
     * Get current game state
     */
    private handleGetState(ws: WebSocket) {
        const client = this.clients.get(ws);
        if (!client) {
            return this.sendError(ws, 'Not connected to a game');
        }

        const session = this.sessions.get(client.sessionId);
        if (!session) {
            return this.sendError(ws, 'Game session not found');
        }

        this.send(ws, {
            type: 'GAME_STATE',
            gameState: session.getClientGameState()
        });
    }

    /**
     * Broadcast game state to all clients in a session
     */
    private broadcastGameState(session: GameSession) {
        const gameState = session.getClientGameState();

        this.clients.forEach((client) => {
            if (client.sessionId === session.sessionId) {
                this.send(client.ws, {
                    type: 'GAME_STATE',
                    gameState
                });
            }
        });
    }

    /**
     * Send message to client
     */
    private send(ws: WebSocket, message: any) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    /**
     * Send error to client
     */
    private sendError(ws: WebSocket, error: string) {
        this.send(ws, {
            type: 'ERROR',
            error
        });
    }
}

// Start server if run directly
if (require.main === module) {
    const server = new GameServer(3001);
    console.log('🚀 WebSocket game server started');
    console.log('📝 Waiting for client connections...');
}
