import { GameState, ZoneType, GameAction } from '../engine/models';
import { PlayerState } from '../engine/state';
import { TurnManager, ActionType } from '../engine/actions';

export class ActionGenerator {
    private turnManager: TurnManager;

    constructor(turnManager: TurnManager) {
        this.turnManager = turnManager;
    }

    getPossibleActions(gameState: GameState, playerId: string): GameAction[] {
        const allActions = this.turnManager.getValidActions(playerId);

        // OPTIMIZATION: Quick lethal check - if we can win by questing, only return winning quests
        const player = gameState.players[playerId];
        if (!player) return allActions.filter(a => a.type !== ActionType.Concede);

        const questActions = allActions.filter(a => a.type === ActionType.Quest);
        const winningQuests: GameAction[] = [];

        for (const quest of questActions) {
            const card = player.play.find((c: any) => c.instanceId === quest.cardId);
            if (card) {
                const loreGain = this.turnManager.abilitySystem
                    ? this.turnManager.abilitySystem.getModifiedStat(card, 'lore')
                    : (card.lore || 0);

                if (player.lore + loreGain >= 20) {
                    winningQuests.push(quest);
                }
            }
        }

        // If we found winning quests, ONLY return those (massive optimization)
        if (winningQuests.length > 0) {
            return winningQuests;
        }

        // Filter out Concede
        return allActions.filter(a => a.type !== ActionType.Concede);
    }

    // Future: Implement lookahead or sequence generation
    // e.g. "Play Card -> Quest" as a single "Move"
}
