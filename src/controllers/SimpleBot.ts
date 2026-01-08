import { PlayerController, ChoiceRequest, ChoiceResponse, GameState, GameAction } from '../engine/models';

/**
 * Simple bot that makes random valid choices.
 * Used as opponent for testing.
 */
export class SimpleBot implements PlayerController {
    id: string;
    name: string;

    constructor(name: string = 'Bot') {
        this.id = `bot_${Date.now()}`;
        this.name = name;
    }

    /**
     * Respond to choice requests with random valid option
     */
    respondToChoiceRequest(request: ChoiceRequest): ChoiceResponse {
        const validOptions = request.options.filter(o => o.valid);

        // If optional and 50% chance, decline
        if (request.optional && Math.random() < 0.5) {
            return {
                requestId: request.id,
                playerId: this.id,
                selectedIds: [],
                declined: true,
                timestamp: Date.now()
            };
        }

        // Pick random valid option
        if (validOptions.length > 0) {
            const randomOption = validOptions[Math.floor(Math.random() * validOptions.length)];
            return {
                requestId: request.id,
                playerId: this.id,
                selectedIds: [randomOption.id],
                declined: false,
                timestamp: Date.now()
            };
        }

        // No valid options
        return {
            requestId: request.id,
            playerId: this.id,
            selectedIds: [],
            declined: request.optional || false,
            timestamp: Date.now()
        };
    }

    onGameStart(playerId: string, gameState: GameState): void {
        this.id = playerId;
        console.log(`[Bot ${this.name}] Game started as player ${playerId}`);
    }

    onTurnStart(gameState: GameState): void {
        if (gameState.turnPlayerId === this.id) {
            console.log(`[Bot ${this.name}] Turn ${gameState.turnCount} started`);
        }
    }
}
