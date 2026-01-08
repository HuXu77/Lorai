import { GameState, ZoneType, GameAction } from '../engine/models';
import { PlayerState } from '../engine/state';
import { TurnManager, ActionType } from '../engine/actions';

export class ActionGenerator {
    private turnManager: TurnManager;

    constructor(turnManager: TurnManager) {
        this.turnManager = turnManager;
    }

    getPossibleActions(gameState: GameState, playerId: string): GameAction[] {
        const validActions = this.turnManager.getValidActions(playerId);

        // Filter out Concede
        return validActions.filter(a => a.type !== ActionType.Concede);
    }

    // Future: Implement lookahead or sequence generation
    // e.g. "Play Card -> Quest" as a single "Move"
}
