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
    /**
     * Decide which cards to mulligan
     * Strategy:
     * - Keep a reliable early game (Cards cost 1-2).
     * - If we have a good early game (2+ low cost cards), keep ONE high-impact card (Cost 5+).
     * - Otherwise, look for curve.
     */
    decideMulligan(hand: any[]): string[] {
        const toMulligan: string[] = [];
        const player = this.turnManager.game.getPlayer(this.playerId);

        // Analyze hand structure
        const lowCostCards = hand.filter(c => {
            const cost = this.turnManager.abilitySystem ? this.turnManager.abilitySystem.getModifiedCost(c, player) : c.cost;
            return cost <= 2;
        });

        const hasGoodEarlyGame = lowCostCards.length >= 2;
        let highCostKeeperFound = false;

        hand.forEach(card => {
            const cost = this.turnManager.abilitySystem
                ? this.turnManager.abilitySystem.getModifiedCost(card, player)
                : card.cost;

            // Always keep low cost cards
            if (cost <= 2) return;

            // If we have early game secured, we can keep ONE expensive bomb
            if (hasGoodEarlyGame && cost >= 5 && !highCostKeeperFound) {
                highCostKeeperFound = true;
                return; // Keep this one
            }

            // Otherwise, mulligan expensive cards and mid-range clutter if we are fishing for early game
            if (cost > 4 || (!hasGoodEarlyGame && cost > 2)) {
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
        const player = gameState.players[this.playerId] as any;
        if (!player.inkedThisTurn) {
            const inkAction = this.getBestInkAction(validActions, player);
            if (inkAction) {
                return inkAction;
            }
        }

        // 2. Main Phase Logic (Greedy Search with Threat Awareness)
        const mainPhaseActions = validActions.filter(a => a.type !== ActionType.InkCard);

        if (mainPhaseActions.length === 0) {
            return { type: ActionType.PassTurn, playerId: this.playerId };
        }

        // Optimization: If only one action, take it
        if (mainPhaseActions.length === 1) {
            return mainPhaseActions[0];
        }

        // --- LETHAL & THREAT ANALYSIS ---
        const opponentId = Object.keys(gameState.players).find(id => id !== this.playerId);
        const opponent = opponentId ? gameState.players[opponentId] : null;
        const abilitySystem = this.turnManager.abilitySystem;

        let defensiveEmergency = false;
        let myLethal = false;

        // Check if I have lethal on board (current lore + ready characters)
        const myReadyLore = player.play
            .filter((c: any) => c.ready)
            .reduce((sum: number, c: any) => sum + (abilitySystem ? abilitySystem.getModifiedStat(c, 'lore') : (c.lore || 0)), 0);

        if (player.lore + myReadyLore >= 20) {
            myLethal = true; // Full Aggro Mode
        }

        // Check opponent threat
        if (opponent) {
            const opponentReadyLore = opponent.play
                .filter((c: any) => c.ready)
                .reduce((sum: number, c: any) => sum + (abilitySystem ? abilitySystem.getModifiedStat(c, 'lore') : (c.lore || 0)), 0);

            const opponentTotalThreat = opponent.lore + opponentReadyLore;

            // If opponent can win next turn, we are in emergency mode
            if (opponentTotalThreat >= 20 && !myLethal) {
                defensiveEmergency = true;
                if (this.logger) this.logger.info(`[Bot] 🚨 DEFENSIVE EMERGENCY! Opponent threat: ${opponentTotalThreat}`);
            }
        }

        // Evaluate each action
        let bestAction = mainPhaseActions[0];
        let bestScore = -Infinity;

        for (const action of mainPhaseActions) {
            let score = 0;

            switch (action.type) {
                case ActionType.Quest:
                    score += 100; // Base value

                    const questerCard = gameState.players[this.playerId].play.find(c => c.instanceId === action.cardId);
                    const loreGained = abilitySystem ? abilitySystem.getModifiedStat(questerCard, 'lore') : (questerCard?.lore || 1);

                    // If this wins the game, infinite value
                    if ((gameState.players[this.playerId].lore + loreGained) >= 20) {
                        score += 100000;
                    }
                    // If we are about to die, DO NOT QUEST unless it wins
                    else if (defensiveEmergency) {
                        score -= 500; // Questing exerts us and ignores the threat
                    }
                    else if (questerCard?.ready === false) {
                        // Should not happen for quest action, but safeguard
                        score -= 50;
                    }
                    break;

                case ActionType.Challenge:
                    score += 50; // Base value

                    const attacker = gameState.players[this.playerId].play.find(c => c.instanceId === action.cardId);
                    const defender = opponentId ? gameState.players[opponentId!].play.find(c => c.instanceId === action.targetId) : null;

                    if (attacker && defender) {
                        const attStrength = abilitySystem ? abilitySystem.getModifiedStat(attacker, 'strength') : (attacker.strength || 0);
                        const attWillpower = abilitySystem ? abilitySystem.getModifiedStat(attacker, 'willpower') : (attacker.willpower || 0);

                        const defStrength = abilitySystem ? abilitySystem.getModifiedStat(defender, 'strength') : (defender.strength || 0);
                        const defWillpower = abilitySystem ? abilitySystem.getModifiedStat(defender, 'willpower') : (defender.willpower || 0);
                        const defLore = abilitySystem ? abilitySystem.getModifiedStat(defender, 'lore') : (defender.lore || 0);

                        const damageToDefender = attStrength;
                        const damageToAttacker = defStrength;

                        const defenderDies = (defender.damage || 0) + damageToDefender >= defWillpower;
                        const attackerDies = (attacker.damage || 0) + damageToAttacker >= attWillpower;

                        // EMERGENCY MODE PRIORITIES
                        if (defensiveEmergency) {
                            if (defenderDies && defLore > 0) {
                                score += 500; // MUST KILL LORE THREATS
                            } else if (defLore > 0) {
                                score += 200; // Soften them up at least
                            }
                        }

                        // STANDARD TRADING LOGIC
                        if (defenderDies) {
                            score += 50; // Kill bonus

                            // Value Trading: Did we trade up?
                            // Trading weak unit for strong unit
                            if (attackerDies) {
                                if (defLore > (attacker.lore || 0)) score += 60; // Traded for better lore
                                if ((defender.cost || 0) > (attacker.cost || 0)) score += 40; // Traded for better cost
                            } else {
                                // FREE KILL
                                score += 100;
                            }

                            // Removing High Lore Targets (even outside emergency)
                            if (defLore >= 2) score += (defLore * 20);
                        } else {
                            // Chip damage - generally less valuable unless setting up
                            score -= 20;
                        }
                    }
                    break;

                case ActionType.PlayCard:
                    score += 20; // Developing board is good
                    // In emergency, prioritize Rush/Evasive/Bodyguard? (Future improvement)
                    break;

                case ActionType.UseAbility:
                    score += 30;
                    // Ability logic would need specific parsing (Damage abilities good in emergency)
                    if (defensiveEmergency) score += 50; // Prefer abilities that might affect board
                    break;

                case ActionType.SingSong:
                    score += 40;
                    break;

                case ActionType.PassTurn:
                    score -= 100; // Avoid passing if possible
                    break;
            }

            // Tie-breaker
            score += Math.random() * 5;

            if (score > bestScore) {
                bestScore = score;
                bestAction = action;
            }
        }

        if (this.logger) {
            // Shortened logging for brevity in this complex logic
            this.logger.info(`[Bot] Action: ${bestAction.type} Score: ${bestScore.toFixed(0)} E:${defensiveEmergency}`);
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
