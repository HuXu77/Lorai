import { GameState, ZoneType } from '../engine/models';
import { PlayerState } from '../engine/state';

export class GameStateEvaluator {
    // Weights
    private static readonly LORE_WEIGHT = 100;
    private static readonly LORE_THREAT_WEIGHT = 1000; // Bonus for getting close to 20
    private static readonly INK_WEIGHT = 10;
    private static readonly HAND_WEIGHT = 5;
    private static readonly BOARD_STRENGTH_WEIGHT = 2;
    private static readonly BOARD_WILLPOWER_WEIGHT = 1;
    private static readonly READY_CHARACTER_WEIGHT = 5;

    evaluate(gameState: GameState, playerId: string): number {
        const player = gameState.players[playerId] as PlayerState;
        const opponentId = Object.keys(gameState.players).find(id => id !== playerId)!;
        const opponent = gameState.players[opponentId] as PlayerState;

        let score = 0;

        // 1. Lore Score
        score += this.evaluateLore(player);
        score -= this.evaluateLore(opponent); // Subtract opponent's lore value

        // 2. Board Presence
        score += this.evaluateBoard(player);
        score -= this.evaluateBoard(opponent);

        // 3. Resources (Ink & Hand)
        score += this.evaluateResources(player);
        score -= this.evaluateResources(opponent);

        return score;
    }

    private evaluateLore(player: PlayerState): number {
        let score = player.lore * GameStateEvaluator.LORE_WEIGHT;

        // Exponential bonus as we get closer to winning (20)
        if (player.lore >= 10) {
            score += (player.lore - 10) * GameStateEvaluator.LORE_THREAT_WEIGHT;
        }

        return score;
    }

    private evaluateBoard(player: PlayerState): number {
        let score = 0;

        for (const card of player.play) {
            // Base stats
            score += (card.strength || 0) * GameStateEvaluator.BOARD_STRENGTH_WEIGHT;
            score += (card.willpower || 0) * GameStateEvaluator.BOARD_WILLPOWER_WEIGHT; // Current damage not accounted for here, maybe should use (willpower - damage)

            // Effective Health
            const currentHealth = (card.willpower || 0) - (card.damage || 0);
            score += currentHealth; // Bonus for healthy characters

            // Ready status (can act next turn)
            if (card.ready) {
                score += GameStateEvaluator.READY_CHARACTER_WEIGHT;
            }

            // Lore potential (threat)
            score += (card.lore || 0) * 10; // High lore characters are valuable
        }

        return score;
    }

    private evaluateResources(player: PlayerState): number {
        let score = 0;

        // Inkwell
        score += player.inkwell.length * GameStateEvaluator.INK_WEIGHT;

        // Hand Size
        score += player.hand.length * GameStateEvaluator.HAND_WEIGHT;

        return score;
    }
}
