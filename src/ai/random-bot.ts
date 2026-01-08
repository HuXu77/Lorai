import { Bot } from './models';
import { GameState } from '../engine/models';
import { GameAction } from '../engine/models';
import { TurnManager } from '../engine/actions';

export class RandomBot implements Bot {
    id: string = 'random-bot';
    name: string = 'Random Bot';
    private playerId: string = '';
    private turnManager: TurnManager;

    constructor(turnManager: TurnManager) {
        this.turnManager = turnManager;
    }

    onGameStart(playerId: string, gameState: GameState): void {
        this.playerId = playerId;
    }

    onTurnStart(gameState: GameState): void {
        // No-op
    }

    async decideAction(gameState: GameState): Promise<GameAction> {
        const validActions = this.turnManager.getValidActions(this.playerId);

        if (validActions.length === 0) {
            throw new Error('No valid actions available!');
        }

        const randomIndex = Math.floor(Math.random() * validActions.length);
        return validActions[randomIndex];
    }
}
