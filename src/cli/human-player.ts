import { Bot } from '../ai/models';
import { GameState, GameAction, CardInstance, CardType } from '../engine/models';
import { ActionType } from '../engine/actions';
import { ChoiceRequest, ChoiceResponse } from '../engine/models';
import * as readlineSync from 'readline-sync';

/**
 * Human player adapter - CLI controller for human decisions
 * Note: Does NOT implement Bot interface because that requires async
 */
export class HumanPlayer {
    id: string = 'human-player';
    name: string;
    private playerId: string = '';

    constructor(name: string = 'Human Player') {
        this.name = name;
    }

    /**
     * Initialize the player with their ID
     */
    onGameStart(playerId: string, gameState: GameState): void {
        this.playerId = playerId;
        console.log(`\n🎮 You are ${this.name} (Player ID: ${playerId.slice(0, 8)}...)\n`);
    }

    onTurnStart(gameState: GameState): void {
        // No-op for now
    }

    /**
     * Interactive mulligan - let human choose cards to mulligan
     */
    decideMulligan(hand: CardInstance[]): string[] {
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('                    MULLIGAN PHASE');
        console.log('═══════════════════════════════════════════════════════════\n');

        console.log('Your starting hand:');
        hand.forEach((card, i) => {
            const stats = this.formatCardStats(card);
            console.log(`  [${i + 1}] ${card.name} (${card.cost}💧)${stats}`);
        });

        console.log('\nEnter card numbers to mulligan (space-separated), or press ENTER to keep all:');

        const input = readlineSync.question('> ');

        if (!input.trim()) {
            console.log('Keeping all cards\n');
            return [];
        }

        // Parse input: "1 3 5" -> mulligan cards 1, 3, 5
        const indices = input.trim().split(/\s+/).map(s => parseInt(s) - 1);
        const toMulligan: string[] = [];

        indices.forEach(idx => {
            if (idx >= 0 && idx < hand.length) {
                toMulligan.push(hand[idx].instanceId);
            } else {
                console.log(`Warning: Invalid card number ${idx + 1}, skipping...`);
            }
        });

        console.log(`Mulliganing ${toMulligan.length} card(s)\n`);
        return toMulligan;
    }

    /**
     * Main decision loop - prompt human for action (SYNCHRONOUS)
     */
    decideAction(gameState: GameState): GameAction {
        const player = gameState.players[this.playerId];

        // Display game state
        this.displayGameState(gameState);

        // Generate and display available actions
        const validActions = this.getAvailableActions(gameState);

        if (validActions.length === 0) {
            return { type: ActionType.PassTurn, playerId: this.playerId };
        }

        // Simple menu for MVP
        console.log('\n📋 AVAILABLE ACTIONS:');
        validActions.forEach((action, i) => {
            console.log(`  [${i + 1}] ${this.formatAction(action, gameState)}`);
        });

        const choice = readlineSync.question('\nChoose action (enter number): ');
        const index = parseInt(choice) - 1;

        if (index >= 0 && index < validActions.length) {
            return validActions[index];
        }

        // Invalid choice, default to pass
        console.log('Invalid choice, passing turn...');
        return { type: ActionType.PassTurn, playerId: this.playerId };
    }

    /**
     * Interactive targeting for abilities
     */
    respondToChoiceRequest(request: ChoiceRequest, state: GameState): ChoiceResponse {
        console.log(`\n🎯 ${request.prompt}`);

        // Display options
        request.options.forEach((opt, i) => {
            const card = opt.card;
            if (card) {
                const stats = this.formatCardStats(card);
                const owner = card.ownerId === this.playerId ? '(Yours)' : '(Opponent)';
                console.log(`  [${i + 1}] ${card.name} ${owner}${stats}`);
            }
        });

        // For MVP, auto-select first option
        console.log('\n> [Auto-selecting first option]\n');
        return {
            requestId: request.id,
            playerId: this.playerId,
            selectedIds: request.options.length > 0 ? [request.options[0].id] : [],
            timestamp: Date.now()
        };
    }

    /**
     * Display current game state
     */
    private displayGameState(state: GameState): void {
        const player = state.players[this.playerId];
        const opponentId = Object.keys(state.players).find(id => id !== this.playerId)!;
        const opponent = state.players[opponentId];

        console.log('\n════════════════════════════════════════════════════════════');
        console.log(`              TURN ${state.turnCount || 1} - YOUR TURN`);
        console.log('════════════════════════════════════════════════════════════\n');

        // Player area
        console.log('┌─── YOUR AREA ─────────────────────────────────────────┐');
        console.log(`│ 💎 Lore: ${player.lore}/20  ${this.makeLoreBar(player.lore)}`);
        console.log(`│ 🪙 Ink: ${player.inkwell.length} available`);
        console.log(`│`);
        console.log(`│ 🃏 Hand (${player.hand.length} cards):`);
        player.hand.forEach((card, i) => {
            console.log(`│   [${i + 1}] ${card.name} (${card.cost}💧)`);
        });
        console.log(`│`);
        console.log(`│ 🎭 In Play (${player.play.length}):`);
        if (player.play.length === 0) {
            console.log(`│   (empty)`);
        } else {
            player.play.forEach(card => {
                const stats = this.formatCardStats(card);
                const status = card.ready ? '✓ READY' : '⚠ EXERTED';
                console.log(`│   ${card.name}${stats} ${status}`);
            });
        }
        console.log('└───────────────────────────────────────────────────────┘\n');

        // Opponent area
        console.log('┌─── OPPONENT AREA ─────────────────────────────────────┐');
        console.log(`│ 💎 Lore: ${opponent.lore}/20  ${this.makeLoreBar(opponent.lore)}`);
        console.log(`│ 🪙 Ink: ${opponent.inkwell.length}`);
        console.log(`│ 🃏 Hand: ${opponent.hand.length} cards`);
        console.log(`│`);
        console.log(`│ 🎭 In Play (${opponent.play.length}):`);
        if (opponent.play.length === 0) {
            console.log(`│   (empty)`);
        } else {
            opponent.play.forEach(card => {
                const stats = this.formatCardStats(card);
                const status = card.ready ? '' : '⚠ EXERTED';
                const damage = card.damage ? ` (${card.damage} dmg)` : '';
                console.log(`│   ${card.name}${stats} ${status}${damage}`);
            });
        }
        console.log('└───────────────────────────────────────────────────────┘');
    }

    /**
     * Get available actions for the human player
     */
    private getAvailableActions(state: GameState): GameAction[] {
        const player = state.players[this.playerId];
        const actions: GameAction[] = [];

        // Ink action (if not inked this turn)
        if (!player.inkedThisTurn && player.hand.length > 0) {
            player.hand.forEach(card => {
                if (card.inkwell) {
                    actions.push({
                        type: ActionType.InkCard,
                        playerId: this.playerId,
                        cardId: card.instanceId
                    });
                }
            });
        }

        // Play card actions
        const availableInk = player.inkwell.filter(c => c.ready).length;
        player.hand.forEach(card => {
            if (card.cost <= availableInk) {
                actions.push({
                    type: ActionType.PlayCard,
                    playerId: this.playerId,
                    cardId: card.instanceId
                });
            }
        });

        // Quest actions
        player.play.forEach(card => {
            if (card.ready && card.type === CardType.Character && card.turnPlayed < (state.turnCount || 1)) {
                actions.push({
                    type: ActionType.Quest,
                    playerId: this.playerId,
                    cardId: card.instanceId
                });
            }
        });

        // Challenge actions (simplified for MVP)
        const opponentId = Object.keys(state.players).find(id => id !== this.playerId)!;
        const opponent = state.players[opponentId];

        player.play.forEach(attacker => {
            if (attacker.ready && attacker.type === CardType.Character && attacker.strength) {
                opponent.play.forEach(defender => {
                    if (defender.type === CardType.Character) {
                        actions.push({
                            type: ActionType.Challenge,
                            playerId: this.playerId,
                            cardId: attacker.instanceId,
                            targetId: defender.instanceId
                        });
                    }
                });
            }
        });

        // Always allow pass turn
        actions.push({
            type: ActionType.PassTurn,
            playerId: this.playerId
        });

        return actions;
    }

    /**
     * Format action for display
     */
    private formatAction(action: GameAction, state: GameState): string {
        const player = state.players[this.playerId];

        switch (action.type) {
            case ActionType.InkCard:
                const inkCard = player.hand.find(c => c.instanceId === action.cardId);
                return `Ink ${inkCard?.name || 'card'}`;

            case ActionType.PlayCard:
                const playCard = player.hand.find(c => c.instanceId === action.cardId);
                return `Play ${playCard?.name || 'card'} (${playCard?.cost}💧)`;

            case ActionType.Quest:
                const questCard = player.play.find(c => c.instanceId === action.cardId);
                return `Quest with ${questCard?.name || 'character'}`;

            case ActionType.Challenge:
                const attacker = player.play.find(c => c.instanceId === action.cardId);
                const opponentId = Object.keys(state.players).find(id => id !== this.playerId)!;
                const defender = state.players[opponentId].play.find(c => c.instanceId === action.targetId);
                return `Challenge: ${attacker?.name} → ${defender?.name}`;

            case ActionType.PassTurn:
                return 'Pass turn';

            default:
                return action.type;
        }
    }

    /**
     * Format card stats for display
     */
    private formatCardStats(card: CardInstance): string {
        if (card.type === CardType.Character) {
            return ` [${card.strength}⚔/${card.willpower}🛡/${card.lore}⭐]`;
        }
        return '';
    }

    /**
     * Create lore progress bar
     */
    private makeLoreBar(lore: number): string {
        const filled = Math.floor((lore / 20) * 20);
        const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
        return `[${bar}]`;
    }
}
