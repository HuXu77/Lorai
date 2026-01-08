import { GameStateManager } from '../engine/state';
import { TurnManager, ActionType } from '../engine/actions';
import { GameLogger } from '../engine/logger';
import { DeckLoader } from '../engine/deck-loader';
import { HeuristicBot } from '../ai/heuristic-bot';
import { Bot } from '../ai/models';
import { getCurrentStrength, getCurrentWillpower, getCurrentLore, getActiveKeywords } from '../engine/stat-calculator';

// Parse arguments
const args = process.argv.slice(2);
let deck1Path = '';
let deck2Path = '';
let outPath = '';

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--deck1') {
        deck1Path = args[i + 1];
        i++;
    } else if (args[i] === '--deck2') {
        deck2Path = args[i + 1];
        i++;
    } else if (args[i] === '--out') {
        outPath = args[i + 1];
        i++;
    }
}

if (!deck1Path || !deck2Path) {
    console.error('Usage: ts-node run-simulation.ts --deck1 <path> --deck2 <path> [--out <log_file>]');
    process.exit(1);
}

// Initialize components
const logger = new GameLogger(outPath || undefined);
const gameStateManager = new GameStateManager();
const turnManager = new TurnManager(gameStateManager, logger);
const deckLoader = new DeckLoader();

/**
 * Enhanced logging helper to show complete game state
 */
function logGameState(title: string) {
    logger.info(`\n${'='.repeat(80)}`);
    logger.info(`  ${title}`);
    logger.info('='.repeat(80));

    const state = gameStateManager.state;
    const playerIds = Object.keys(state.players);
    const player1 = state.players[playerIds[0]];
    const player2 = state.players[playerIds[1]];

    // Turn info
    logger.info(`Turn: ${state.turnCount || 0} | Phase: ${state.phase} | Active Player: ${state.players[state.turnPlayerId]?.name || 'Unknown'}`);
    logger.info('');

    // Player 1 state
    logger.info(`🎮 ${player1.name} (ID: ${player1.id.slice(0, 8)}...)`);
    logger.info(`   💎 Lore: ${player1.lore}/20 | 🪙 Ink: ${player1.inkwell.length}`);
    logger.info(`   🃏 Hand (${player1.hand.length}): ${player1.hand.map(c => c.name).join(', ') || 'Empty'}`);
    logger.info(`   🎭 Play (${player1.play.length}): ${player1.play.map(c => {
        // Calculate current stats from active effects
        const currentStr = getCurrentStrength(c, state as any);
        const currentWil = getCurrentWillpower(c, state as any);
        const currentLore = getCurrentLore(c, state as any);

        const stats = [];

        // Show strength with diff if modified
        if (c.strength !== undefined) {
            const baseStr = c.strength;
            const diff = currentStr - baseStr;
            stats.push(diff !== 0 ? `${currentStr}¤(${diff > 0 ? '+' : ''}${diff})` : `${currentStr}¤`);
        }

        // Show willpower with diff if modified
        if (c.willpower !== undefined) {
            const baseWil = c.willpower;
            const diff = currentWil - baseWil;
            stats.push(diff !== 0 ? `${currentWil}◊(${diff > 0 ? '+' : ''}${diff})` : `${currentWil}◊`);
        }

        // Show lore with diff if modified
        if (c.lore !== undefined) {
            const baseLore = c.lore;
            const diff = currentLore - baseLore;
            stats.push(diff !== 0 ? `${currentLore}⛉(${diff > 0 ? '+' : ''}${diff})` : `${currentLore}⛉`);
        }

        if ((c as any).damage) stats.push(`${(c as any).damage}dmg`);

        // Show active keywords (including granted ones)
        const keywords = getActiveKeywords(c, state as any);
        const keywordStr = keywords.length > 0 ? ` {${keywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')}}` : '';

        const exerted = c.ready ? '' : ' (exerted)';
        return `${c.name} [${stats.join('/')}]${keywordStr}${exerted}`;
    }).join(', ') || 'Empty'}`);
    logger.info(`   📚 Deck: ${player1.deck.length} | 🗑️ Discard: ${player1.discard.length}`);
    logger.info('');

    // Player 2 state
    logger.info(`🎮 ${player2.name} (ID: ${player2.id.slice(0, 8)}...)`);
    logger.info(`   💎 Lore: ${player2.lore}/20 | 🪙 Ink: ${player2.inkwell.length}`);
    logger.info(`   🃏 Hand (${player2.hand.length}): ${player2.hand.map(c => c.name).join(', ') || 'Empty'}`);
    logger.info(`   🎭 Play (${player2.play.length}): ${player2.play.map(c => {
        // Calculate current stats from active effects
        const currentStr = getCurrentStrength(c, state as any);
        const currentWil = getCurrentWillpower(c, state as any);
        const currentLore = getCurrentLore(c, state as any);

        const stats = [];

        // Show strength with diff if modified
        if (c.strength !== undefined) {
            const baseStr = c.strength;
            const diff = currentStr - baseStr;
            stats.push(diff !== 0 ? `${currentStr}¤(${diff > 0 ? '+' : ''}${diff})` : `${currentStr}¤`);
        }

        // Show willpower with diff if modified
        if (c.willpower !== undefined) {
            const baseWil = c.willpower;
            const diff = currentWil - baseWil;
            stats.push(diff !== 0 ? `${currentWil}◊(${diff > 0 ? '+' : ''}${diff})` : `${currentWil}◊`);
        }

        // Show lore with diff if modified
        if (c.lore !== undefined) {
            const baseLore = c.lore;
            const diff = currentLore - baseLore;
            stats.push(diff !== 0 ? `${currentLore}⛉(${diff > 0 ? '+' : ''}${diff})` : `${currentLore}⛉`);
        }

        if ((c as any).damage) stats.push(`${(c as any).damage}dmg`);

        // Show active keywords (including granted ones)
        const keywords = getActiveKeywords(c, state as any);
        const keywordStr = keywords.length > 0 ? ` {${keywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')}}` : '';

        const exerted = c.ready ? '' : ' (exerted)';
        return `${c.name} [${stats.join('/')}]${keywordStr}${exerted}`;
    }).join(', ') || 'Empty'}`);
    logger.info(`   📚 Deck: ${player2.deck.length} | 🗑️ Discard: ${player2.discard.length}`);
    logger.info('='.repeat(80) + '\n');
}

// Load decks
try {
    const deck1 = deckLoader.loadDeck(deck1Path);
    const deck2 = deckLoader.loadDeck(deck2Path);

    logger.info('🎲 Lorcana TCG Game Simulation');
    logger.info('================================');
    logger.info('');

    // Setup Game
    const player1Id = gameStateManager.addPlayer('Player 1');
    const player2Id = gameStateManager.addPlayer('Player 2');

    const player1 = gameStateManager.getPlayer(player1Id);
    const player2 = gameStateManager.getPlayer(player2Id);

    // Initialize decks
    deck1.forEach(card => player1.addCardToZone(card, 'Deck' as any));
    deck2.forEach(card => player2.addCardToZone(card, 'Deck' as any));

    // Shuffle decks
    player1.deck.sort(() => Math.random() - 0.5);
    player2.deck.sort(() => Math.random() - 0.5);

    logger.info(`📋 Deck 1: ${deck1.length} cards for ${player1.name}`);
    logger.info(`📋 Deck 2: ${deck2.length} cards for ${player2.name}`);
    logger.info('');

    // Initialize Bots
    const bot1 = new HeuristicBot(turnManager, logger);
    bot1.onGameStart(player1Id, gameStateManager.state);

    const bot2 = new HeuristicBot(turnManager, logger);
    bot2.onGameStart(player2Id, gameStateManager.state);

    // Register choice handlers for ability targeting
    turnManager.registerChoiceHandler(player1Id, (request) => bot1.respondToChoiceRequest(request));
    turnManager.registerChoiceHandler(player2Id, (request) => bot2.respondToChoiceRequest(request));

    const bots: Record<string, Bot> = {
        [player1Id]: bot1,
        [player2Id]: bot2
    };

    // --- Game Setup Phase ---
    logger.info('');
    logger.info('📖 SETUP PHASE');
    logger.info('═'.repeat(80));

    // 1. Draw Starting Hands
    logger.info('');
    logger.info('🎴 Drawing starting hands (7 cards each)...');
    turnManager.drawStartingHand(player1);
    turnManager.drawStartingHand(player2);

    logGameState('Starting Hands Drawn');

    // 2. Mulligan Phase
    logger.info('🔄 Mulligan Phase');
    const p1Mulligan = bot1.decideMulligan(player1.hand);
    logger.info(`${player1.name} mulligans ${p1Mulligan.length} card(s): ${p1Mulligan.map(id => {
        const card = player1.hand.find(c => c.instanceId === id);
        return card ? card.name : id;
    }).join(', ')}`);
    turnManager.mulligan(player1, p1Mulligan);

    const p2Mulligan = bot2.decideMulligan(player2.hand);
    logger.info(`${player2.name} mulligans ${p2Mulligan.length} card(s): ${p2Mulligan.map(id => {
        const card = player2.hand.find(c => c.instanceId === id);
        return card ? card.name : id;
    }).join(', ')}`);
    turnManager.mulligan(player2, p2Mulligan);

    logGameState('After Mulligan');

    // Start Game
    turnManager.startGame(player1Id);
    logger.info('');
    logger.info('🎮 GAME START!');
    logger.info('═'.repeat(80));
    logger.info('');

    // Game Loop
    const MAX_TURNS = 200;
    let turns = 0;
    let actionsThisTurn = 0;

    (async () => {
        while (!gameStateManager.state.winnerId && turns < MAX_TURNS) {
            const currentPlayerId = gameStateManager.state.turnPlayerId;
            const currentBot = bots[currentPlayerId];
            const currentPlayer = gameStateManager.getPlayer(currentPlayerId);

            const action = await currentBot.decideAction(gameStateManager.state);

            try {
                // Log action
                logger.info('');
                logger.info(`🎯 Action #${actionsThisTurn + 1}: ${action.type}`);

                switch (action.type) {
                    case ActionType.PlayCard:
                        if (action.cardId) {
                            const card = currentPlayer.hand.find(c => c.instanceId === action.cardId);
                            logger.info(`   Playing: ${card?.name || action.cardId}`);
                            turnManager.playCard(currentPlayer, action.cardId, action.targetId, action.payload);
                        }
                        break;
                    case ActionType.Quest:
                        if (action.cardId) {
                            const card = currentPlayer.play.find(c => c.instanceId === action.cardId);
                            logger.info(`   Questing with: ${card?.name || action.cardId}`);
                            turnManager.quest(currentPlayer, action.cardId);
                        }
                        break;
                    case ActionType.Challenge:
                        if (action.cardId && action.targetId) {
                            const attacker = currentPlayer.play.find(c => c.instanceId === action.cardId);
                            logger.info(`   ${attacker?.name || action.cardId} challenges ${action.targetId}`);
                            turnManager.challenge(currentPlayer, action.cardId, action.targetId);
                        }
                        break;
                    case ActionType.UseAbility:
                        if (action.cardId) {
                            const card = currentPlayer.play.find(c => c.instanceId === action.cardId);
                            logger.info(`   Using ability on: ${card?.name || action.cardId} (ability ${action.abilityIndex})`);
                            turnManager.useAbility(currentPlayer, action.cardId!, action.abilityIndex!);
                        }
                        break;
                    case ActionType.SingSong:
                        if (action.cardId && action.singerId) {
                            logger.info(`   Singing: ${action.cardId} with ${action.singerId}`);
                            turnManager.singSong(currentPlayer, action.cardId, action.singerId);
                        }
                        break;
                    case ActionType.InkCard:
                        if (action.cardId) {
                            const card = currentPlayer.hand.find(c => c.instanceId === action.cardId);
                            logger.info(`   Inking: ${card?.name || action.cardId}`);
                            turnManager.inkCard(currentPlayer, action.cardId);
                        }
                        break;
                    case ActionType.PassTurn:
                        logger.info(`   ${currentPlayer.name} passes turn`);
                        logGameState(`End of Turn ${turns + 1}`);
                        turnManager.passTurn(currentPlayerId);
                        turns++;
                        actionsThisTurn = 0;
                        break;
                    case ActionType.Concede:
                        logger.info(`   ${currentPlayer.name} concedes!`);
                        turnManager.concede(currentPlayer);
                        break;
                }

                actionsThisTurn++;

            } catch (e) {
                logger.error('');
                logger.error(`❌ Error executing action ${action.type}: ${e}`);
                logger.error(`   Stack: ${(e as Error).stack}`);
                // Pass turn on error
                turnManager.passTurn(currentPlayerId);
                turns++;
                actionsThisTurn = 0;
            }

            await new Promise(resolve => setTimeout(resolve, 0));
        }

        // Game end
        logger.info('');
        logger.info('='.repeat(80));
        if (gameStateManager.state.winnerId) {
            const winner = gameStateManager.getPlayer(gameStateManager.state.winnerId);
            logger.info('');
            logger.info(`🏆 GAME OVER! Winner: ${winner.name} (Lore: ${winner.lore})`);
            logGameState('Final Game State');
        } else {
            logger.info('');
            logger.info(`⏱️ GAME TERMINATED: Max turns (${MAX_TURNS}) reached`);
            logGameState('Final State (Timeout)');
        }
        logger.info('='.repeat(80));

    })();

} catch (e) {
    console.error('');
    console.error('💥 FATAL ERROR:', e);
    logger.error('Simulation failed:', e);
    logger.error('Stack:', (e as Error).stack);
    process.exit(1);
}
