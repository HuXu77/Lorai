import { GameState, GameAction } from '../engine/models';

export interface Bot {
    id: string;
    name: string;

    // Lifecycle hooks
    onGameStart(playerId: string, gameState: GameState): void;
    onTurnStart(gameState: GameState): void;

    // Decision making
    decideAction(gameState: GameState): Promise<GameAction>;
}
