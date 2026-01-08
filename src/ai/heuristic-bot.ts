import { Bot } from './models';
import { GameState } from '../engine/models';
import { GameAction } from '../engine/models';
import { TurnManager, ActionType } from '../engine/actions';
import { GameStateEvaluator } from './evaluator';
import { ActionGenerator } from './action-generator';
import { GameLogger } from '../engine/logger';

export class HeuristicBot implements Bot {
    id: string = 'heuristic-bot';
    name: string = 'Heuristic Bot';
    private playerId: string = '';
    private turnManager: TurnManager;
    private evaluator: GameStateEvaluator;
    private actionGenerator: ActionGenerator;
    private logger?: GameLogger;

    constructor(turnManager: TurnManager, logger?: GameLogger) {
        this.turnManager = turnManager;
        this.logger = logger;
        this.evaluator = new GameStateEvaluator();
        this.actionGenerator = new ActionGenerator(turnManager);
    }

    /**
     * Decide which cards to mulligan
     * Strategy: Keep cards with cost <= 4 to ensure early game plays.
     * @param hand Current hand
     * @returns List of instance IDs to mulligan (put on bottom)
     */
    decideMulligan(hand: any[]): string[] {
        const toMulligan: string[] = [];

        // Get player state for cost calculation context
        const player = this.turnManager.game.getPlayer(this.playerId);

        hand.forEach(card => {
            // Use modified cost if available
            const cost = this.turnManager.abilitySystem
                ? this.turnManager.abilitySystem.getModifiedCost(card, player)
                : card.cost;

            // Simple heuristic: Mulligan expensive cards (> 4 cost)
            // unless we have no low cost cards, but this is a per-card decision
            if (cost > 4) {
                toMulligan.push(card.instanceId);
            }
        });

        if (this.logger) {
            this.logger.info(`[Bot] Mulligan decision: Keeping ${hand.length - toMulligan.length}, Mulliganing ${toMulligan.length}`);
        }

        return toMulligan;
    }

    onGameStart(playerId: string, gameState: GameState): void {
        this.playerId = playerId;
    }

    onTurnStart(gameState: GameState): void {
        // No-op
    }

    async decideAction(gameState: GameState): Promise<GameAction> {
        const validActions = this.actionGenerator.getPossibleActions(gameState, this.playerId);

        if (validActions.length === 0) {
            return { type: ActionType.PassTurn, playerId: this.playerId };
        }

        // 1. Ink Phase Logic
        // If we haven't inked yet, check if we should
        const player = gameState.players[this.playerId] as any; // Cast to access inkedThisTurn
        if (!player.inkedThisTurn) {
            const inkAction = this.getBestInkAction(validActions, player);
            if (inkAction) {
                return inkAction;
            }
        }

        // 2. Main Phase Logic (Greedy Search)
        // Filter out ink actions if we decided not to ink or already checked
        const mainPhaseActions = validActions.filter(a => a.type !== ActionType.InkCard);

        if (mainPhaseActions.length === 0) {
            return { type: ActionType.PassTurn, playerId: this.playerId };
        }

        // Optimization: If only one action (e.g. Pass), just take it
        if (mainPhaseActions.length === 1) {
            if (this.logger) {
                this.logger.info(`[Bot] Only one action available: ${mainPhaseActions[0].type}`);
            }
            return mainPhaseActions[0];
        }

        if (this.logger) {
            this.logger.info(`[Bot] Evaluating ${mainPhaseActions.length} actions...`);
            // Log what actions are available
            const actionSummary = mainPhaseActions.map(a => {
                if (a.type === ActionType.PlayCard) {
                    const card = player.hand.find((c: any) => c.instanceId === a.cardId);
                    return `PlayCard(${card?.name || a.cardId})`;
                }
                if (a.type === ActionType.Quest) {
                    const card = player.play.find((c: any) => c.instanceId === a.cardId);
                    return `Quest(${card?.name || a.cardId})`;
                }
                if (a.type === ActionType.Challenge) {
                    const attackCard = player.play.find((c: any) => c.instanceId === a.cardId);
                    // Find defender in opponent's play area
                    const opponentId = Object.keys(gameState.players).find(id => id !== this.playerId);
                    const defender = opponentId ? gameState.players[opponentId].play.find((c: any) => c.instanceId === a.targetId) : null;
                    return `Challenge(${attackCard?.name || a.cardId} → ${defender?.name || a.targetId})`;
                }
                if (a.type === ActionType.UseAbility) {
                    const card = player.play.find((c: any) => c.instanceId === a.cardId);
                    return `UseAbility(${card?.name || a.cardId})`;
                }
                if (a.type === ActionType.SingSong) {
                    const singer = player.play.find((c: any) => c.instanceId === a.cardId);
                    const song = player.hand.find((c: any) => c.instanceId === a.targetId);
                    return `Sing(${singer?.name} → ${song?.name})`;
                }
                return a.type;
            }).join(', ');
            this.logger.info(`[Bot] Available: ${actionSummary}`);
        }

        // Evaluate each action
        let bestAction = mainPhaseActions[0];
        let bestScore = -Infinity;

        // Clone the game state once to avoid repeated deserialization overhead if possible,
        // but for now we need a fresh clone for each action simulation.
        // Since we don't have a full simulation engine yet, we will use a simplified heuristic:
        // "What action gives me the most immediate value?"

        // TODO: Implement true simulation with GameStateManager.clone()
        // For now, we'll use a simplified evaluation based on action type

        const abilitySystem = this.turnManager.abilitySystem;

        for (const action of mainPhaseActions) {
            let score = 0;

            // Heuristic scoring based on action type
            switch (action.type) {
                case ActionType.Quest:
                    score += 100; // Questing is good
                    // Bonus if it wins the game
                    const questerCard = gameState.players[this.playerId].play.find(c => c.instanceId === action.cardId);

                    // CRITICAL: Use modified lore
                    const loreGained = abilitySystem
                        ? abilitySystem.getModifiedStat(questerCard, 'lore')
                        : (questerCard?.lore || 1);

                    if ((gameState.players[this.playerId].lore + loreGained) >= 20) {
                        score += 10000; // LETHAL - ALWAYS QUEST FOR WIN
                    }
                    break;

                case ActionType.Challenge:
                    score += 50; // Base score

                    // Analyze the challenge
                    const attacker = gameState.players[this.playerId].play.find(c => c.instanceId === action.cardId);
                    const opponentId = Object.keys(gameState.players).find(id => id !== this.playerId);
                    const defender = opponentId ? gameState.players[opponentId].play.find(c => c.instanceId === action.targetId) : null;

                    if (attacker && defender) {
                        // CRITICAL: Use modified stats for combat calculation
                        const attStrength = abilitySystem ? abilitySystem.getModifiedStat(attacker, 'strength') : (attacker.strength || 0);
                        const attWillpower = abilitySystem ? abilitySystem.getModifiedStat(attacker, 'willpower') : (attacker.willpower || 0);

                        const defStrength = abilitySystem ? abilitySystem.getModifiedStat(defender, 'strength') : (defender.strength || 0);
                        const defWillpower = abilitySystem ? abilitySystem.getModifiedStat(defender, 'willpower') : (defender.willpower || 0);

                        const defLore = abilitySystem ? abilitySystem.getModifiedStat(defender, 'lore') : (defender.lore || 0);
                        const attLore = abilitySystem ? abilitySystem.getModifiedStat(attacker, 'lore') : (attacker.lore || 0);

                        const attCost = abilitySystem ? abilitySystem.getModifiedCost(attacker, player) : (attacker.cost || 0);
                        const defCost = defender.cost || 0; // Can't easily get opponent modified cost, use base

                        const damageToDefender = attStrength;
                        const damageToAttacker = defStrength;

                        const defenderDies = (defender.damage || 0) + damageToDefender >= defWillpower;
                        const attackerDies = (attacker.damage || 0) + damageToAttacker >= attWillpower;

                        // 1. Favorable Trade: We kill them, we survive
                        if (defenderDies && !attackerDies) {
                            score += 60; // Total 110 (Beats Quest 100)
                        }

                        // 2. Trade Up: We both die, but they are more valuable (Lore)
                        if (defenderDies && attackerDies) {
                            if (defLore > attLore) {
                                score += 60;
                            } else if (defCost > attCost) {
                                score += 40; // Value trade
                            }
                        }

                        // 3. Remove Threat: They have high lore
                        if (defLore >= 2) {
                            score += (defLore * 10);
                        }

                        // 4. Desperation: If they are about to win, prioritize challenging
                        const opponent = gameState.players[opponentId!];
                        if (opponent.lore >= 18) {
                            score += 100; // MUST STOP THEM
                        }
                    }
                    break;

                case ActionType.PlayCard:
                    score += 20; // Playing cards is generally good
                    break;

                case ActionType.UseAbility:
                    score += 30; // Using abilities is generally good
                    break;

                case ActionType.SingSong:
                    score += 40; // Singing is efficient (free action)
                    break;

                case ActionType.PassTurn:
                    score -= 10; // Passing is last resort
                    break;

                default:
                    score += 0;
            }

            // Add some randomness to break ties
            score += Math.random();

            if (score > bestScore) {
                bestScore = score;
                bestAction = action;
            }
        }

        if (this.logger) {
            let actionDetails: string = bestAction.type;
            if (bestAction.type === ActionType.PlayCard || bestAction.type === ActionType.InkCard) {
                const card = player.hand.find((c: any) => c.instanceId === bestAction.cardId);
                if (card) actionDetails += ` (${card.name})`;
            } else if (bestAction.type === ActionType.Quest || bestAction.type === ActionType.Challenge || bestAction.type === ActionType.SingSong) {
                const card = player.play.find((c: any) => c.instanceId === bestAction.cardId);
                if (card) actionDetails += ` (${card.name})`;
            }

            this.logger.info(`[Bot] Chose action: ${actionDetails} with score ${bestScore.toFixed(2)}`);
        }

        return bestAction;
    }

    private getBestInkAction(validActions: GameAction[], player: any): GameAction | null {
        const inkActions = validActions.filter(a => a.type === ActionType.InkCard);
        if (inkActions.length === 0) return null;

        // Heuristic: Ink if we have < 7 ink (soft cap)
        if (player.inkwell.length >= 7) return null;

        // Strategy: Ink the most expensive unplayable card, or duplicates
        // For now, simple strategy: Ink the highest cost card that is inkable
        // We need to look up the card cost from the hand
        // But Action only has cardId. We need to find the card in hand.

        let bestInkAction = inkActions[0];
        let maxCost = -1;

        const abilitySystem = this.turnManager.abilitySystem;

        for (const action of inkActions) {
            const card = player.hand.find((c: any) => c.instanceId === action.cardId);
            if (card) {
                // Use modified cost if available
                const cost = abilitySystem
                    ? abilitySystem.getModifiedCost(card, player)
                    : card.cost;

                if (cost > maxCost) {
                    maxCost = cost;
                    bestInkAction = action;
                }
            }
        }

        return bestInkAction; // Return the selected ink action!
    }
    /**
     * Respond to a choice request (for interactive targeting)
     * 
     * Implements smart targeting heuristics:
     * - For offensive buffs: Choose our weakest character to boost
     * - For debuffs/damage: Choose opponent's strongest/most threatening character
     * - For items: Choose based on effect type
     */
    respondToChoiceRequest(request: any): any {
        if (!request || !request.options || request.options.length === 0) {
            return { requestId: request.id, playerId: request.playerId, selectedIds: [], declined: false, timestamp: Date.now() };
        }

        const validOptions = request.options.filter((opt: any) => opt.valid);

        if (validOptions.length === 0) {
            if (this.logger) {
                this.logger.warn(`[Bot] No valid options for choice request ${request.type}`);
            }
            return { requestId: request.id, playerId: request.playerId, selectedIds: [], declined: false, timestamp: Date.now() };
        }

        // Determine choice strategy based on request type
        let chosenOption: any = null;

        switch (request.type) {
            case 'target_character':
            case 'chosen_character':
                // If it's our own character, likely a buff - choose weakest to maximize value
                // If opponent's character, likely removal/debuff - choose strongest threat
                chosenOption = this.chooseCharacterTarget(validOptions, request);
                break;

            case 'target_opposing_character':
            case 'chosen_opposing_character':
                // Debuff/removal - choose biggest threat
                chosenOption = this.chooseThreatTarget(validOptions);
                break;

            case 'target_item':
            case 'chosen_item':
            case 'target_location':
            case 'chosen_location':
                // For now, just pick randomly (can enhance later)
                chosenOption = validOptions[Math.floor(Math.random() * validOptions.length)];
                break;

            case 'reveal_and_decide':
                // For reveal choices, prefer putting character cards in hand
                // If 'hand' option exists, pick it; otherwise pick first valid option
                chosenOption = validOptions.find((opt: any) => opt.id === 'hand') || validOptions[0];
                break;

            default:
                // Unknown type - pick first valid option
                chosenOption = validOptions[0];
                break;
        }

        if (!chosenOption) {
            chosenOption = validOptions[0]; // Fallback
        }

        if (this.logger) {
            this.logger.info(`[Bot] Choice: ${request.prompt} → ${chosenOption.display}`);
        }

        return {
            requestId: request.id,
            playerId: request.playerId,
            selectedIds: [chosenOption.id],
            declined: false,
            timestamp: Date.now()
        };
    }

    /**
     * Choose a character target (context-dependent)
     */
    private chooseCharacterTarget(options: any[], request: any): any {
        // Heuristic: If source card text suggests buff/positive effect, choose our weakest
        // Otherwise (removal/damage), choose opponent's strongest

        // For now, default to threat-based targeting (assume hostile by default)
        return this.chooseThreatTarget(options);
    }

    /**
     * Choose the biggest threat from opponent's characters
     * Prioritizes:
     * 1. Characters close to death (easy to remove)
     * 2. High willpower (hard to challenge)
     * 3. High strength (dangerous attackers)
     */
    private chooseThreatTarget(options: any[]): any {
        if (options.length === 0) return null;

        let bestTarget = options[0];
        let bestScore = -Infinity;

        for (const option of options) {
            if (!option.card) continue;

            const card = option.card;
            let score = 0;

            // Prioritize damaged characters (easier to kill)
            if (card.damage && card.damage > 0 && card.willpower) {
                const remainingHP = card.willpower - card.damage;
                if (remainingHP <= 2) {
                    score += 100; // Almost dead!
                } else if (remainingHP <= 4) {
                    score += 50; // Damaged
                }
            }

            // High willpower characters are valuable targets (hard to remove normally)
            if (card.willpower) {
                score += card.willpower * 10;
            }

            // High strength characters are dangerous
            if (card.strength) {
                score += card.strength * 8;
            }

            // High lore characters win games
            if (card.lore) {
                score += card.lore * 15;
            }

            // Exerted characters are better targets (can't challenge back)
            if (!card.ready) {
                score += 20;
            }

            if (score > bestScore) {
                bestScore = score;
                bestTarget = option;
            }
        }

        return bestTarget;
    }
}
