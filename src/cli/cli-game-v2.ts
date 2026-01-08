import { GameStateManager } from '../engine/state';
import { TurnManager, ActionType } from '../engine/actions';
import { GameLogger } from '../engine/logger';
import { DeckLoader } from '../engine/deck-loader';
import { HumanPlayer } from './human-player';
import { HeuristicBot } from '../ai/heuristic-bot';
import { Bot } from '../ai/models';
import * as readlineSync from 'readline-sync';

/**
 * Interactive CLI game: Human vs Bot
 * 
 * Usage:
 *   npx ts-node src/cli/cli-game-v2.ts \
 *     --player-deck path/to/your/deck.txt \
 *     --bot-deck path/to/bot/deck.txt
 */

// Parse command line arguments
const args = process.argv.slice(2);
let playerDeckPath = '';
let botDeckPath = '';

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--player-deck') {
        playerDeckPath = args[i + 1];
        i++;
    } else if (args[i] === '--bot-deck') {
        botDeckPath = args[i + 1];
        i++;
    }
}

if (!playerDeckPath || !botDeckPath) {
    console.error('❌ Error: Missing deck paths\n');
    console.error('Usage:');
    console.error('  npx ts-node src/cli/cli-game-v2.ts \\');
    console.error('    --player-deck path/to/your/deck.txt \\');
    console.error('    --bot-deck path/to/bot/deck.txt');
    process.exit(1);
}

// Initialize components
const logger = new GameLogger();
const gameStateManager = new GameStateManager();
const turnManager = new TurnManager(gameStateManager, logger);
const deckLoader = new DeckLoader();

/**
 * Main game function (FULLY SYNCHRONOUS)
 */
function playGame() {
    try {
        // Display welcome screen
        console.clear();
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║              🎴 LORCANA TCG - CLI EDITION 🎴             ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        // Load decks
        console.log('📋 Loading decks...');
        const playerDeck = deckLoader.loadDeck(playerDeckPath);
        const botDeck = deckLoader.loadDeck(botDeckPath);

        console.log(`✓ Player deck loaded: ${playerDeck.length} cards`);
        console.log(`✓ Bot deck loaded: ${botDeck.length} cards\n`);

        // Setup game
        console.log('🎮 Setting up game...');
        const humanPlayerId = gameStateManager.addPlayer('Human');
        const botPlayerId = gameStateManager.addPlayer('Bot');

        const humanPlayer = gameStateManager.getPlayer(humanPlayerId);
        const botPlayer = gameStateManager.getPlayer(botPlayerId);

        // Add cards to decks
        playerDeck.forEach(card => {
            const instance = humanPlayer.addCardToZone(card, 'Deck' as any);
        });
        botDeck.forEach(card => {
            const instance = botPlayer.addCardToZone(card, 'Deck' as any);
        });

        // Shuffle
        humanPlayer.deck.sort(() => Math.random() - 0.5);
        botPlayer.deck.sort(() => Math.random() - 0.5);

        console.log('✓ Game ready!\n');

        // Initialize player controllers
        const human = new HumanPlayer('You');
        const bot = new HeuristicBot(turnManager, logger);

        // =========================================================================
        // CALLBACK-BASED CHOICE SYSTEM
        // Register choice handlers - bot and human both just provide callbacks
        // Engine doesn't know or care which is which!
        // =========================================================================

        // Bot choice handler: Use bot's AI logic
        const botChoiceHandler = (request: any) => {
            return bot.respondToChoiceRequest(request);
        };

        // Human choice handler: Use readline-sync to prompt
        const humanChoiceHandler = (request: any) => {
            const readlineSync = require('readline-sync');
            console.log(`\n❓ ${request.prompt}`);

            const validOptions = request.options.filter((opt: any) => opt.valid);
            if (validOptions.length === 0) {
                console.log('  No valid options.');
                return {
                    requestId: request.id,
                    playerId: request.playerId,
                    selectedIds: [],
                    declined: true,
                    timestamp: Date.now()
                };
            }

            // Show options
            validOptions.forEach((opt: any, idx: number) => {
                const card = opt.card;
                if (card) {
                    console.log(`  [${idx + 1}] ${card.name} (${card.cost}💧)`);
                } else {
                    console.log(`  [${idx + 1}] ${opt.display || opt.label}`);
                }
            });

            const answer = readlineSync.question('\nChoose (number): ');
            const index = parseInt(answer) - 1;

            if (index >= 0 && index < validOptions.length) {
                return {
                    requestId: request.id,
                    playerId: request.playerId,
                    selectedIds: [validOptions[index].id],
                    declined: false,
                    timestamp: Date.now()
                };
            }

            // Invalid - decline
            return {
                requestId: request.id,
                playerId: request.playerId,
                selectedIds: [],
                declined: true,
                timestamp: Date.now()
            };
        };

        // Register the callbacks
        turnManager.registerChoiceHandler(humanPlayerId, humanChoiceHandler);
        turnManager.registerChoiceHandler(botPlayerId, botChoiceHandler);

        // Notify of game start
        human.onGameStart(humanPlayerId, gameStateManager.state);
        bot.onGameStart(botPlayerId, gameStateManager.state);

        // CRITICAL: Register bot in game state so executor can find it
        // The executor checks (game as any).bots[playerId] to determine if player is a bot
        if (!(gameStateManager as any).bots) {
            (gameStateManager as any).bots = {};
        }
        (gameStateManager as any).bots[botPlayerId] = bot;

        // Notify of game start
        human.onGameStart(humanPlayerId, gameStateManager.state);
        bot.onGameStart(botPlayerId, gameStateManager.state);

        // Draw starting hands
        console.log('🎴 Drawing starting hands...');
        turnManager.drawStartingHand(humanPlayer);
        turnManager.drawStartingHand(botPlayer);

        // Mulligan phase
        console.log('═'.repeat(60));
        const humanMulligan = human.decideMulligan(humanPlayer.hand);

        // Actually mulligan the cards if any selected
        if (humanMulligan.length > 0) {
            humanMulligan.forEach((cardId: string) => {
                const card = humanPlayer.hand.find(c => c.instanceId === cardId);
                if (card) {
                    const idx = humanPlayer.hand.indexOf(card);
                    humanPlayer.hand.splice(idx, 1);
                    card.zone = 'Deck' as any;
                    humanPlayer.deck.unshift(card); // Bottom of deck
                }
            });

            // Draw replacement cards
            for (let i = 0; i < humanMulligan.length; i++) {
                if (humanPlayer.deck.length > 0) {
                    const card = humanPlayer.deck.pop()!;
                    card.zone = 'Hand' as any;
                    humanPlayer.hand.push(card);
                }
            }

            // Shuffle deck
            humanPlayer.deck.sort(() => Math.random() - 0.5);
        }

        const botMulligan = bot.decideMulligan(botPlayer.hand);
        console.log('Bot kept all cards\n');

        // Start game
        turnManager.startGame(humanPlayerId);

        console.log('🎮 Game started! You are playing first.\n');
        readlineSync.question('Press ENTER to begin...');
        console.log('');

        // Game loop
        const MAX_TURNS = 100;
        let turns = 0;

        while (!gameStateManager.state.winnerId && turns < MAX_TURNS) {
            const currentPlayerId = gameStateManager.state.turnPlayerId;
            const isHumanTurn = currentPlayerId === humanPlayerId;
            const currentPlayer = gameStateManager.getPlayer(currentPlayerId);

            try {
                let action: any;

                if (isHumanTurn) {
                    // Human player - fully synchronous
                    action = human.decideAction(gameStateManager.state);
                } else {
                    // Bot player - async but we block synchronously
                    let botAction: any = null;
                    let done = false;

                    bot.decideAction(gameStateManager.state).then(a => {
                        botAction = a;
                        done = true;
                    }).catch(err => {
                        console.error('Bot error:', err);
                        done = true;
                    });

                    // Busy wait (synchronous block)
                    while (!done) {
                        // Spin wait - not ideal but keeps everything synchronous
                    }

                    action = botAction || { type: ActionType.PassTurn, playerId: currentPlayerId };
                }

                // Execute action
                switch (action.type) {
                    case ActionType.InkCard:
                        if (action.cardId) {
                            const card = currentPlayer.hand.find(c => c.instanceId === action.cardId);
                            console.log(`\n⚡ Inking: ${card?.name || 'card'}`);
                            turnManager.inkCard(currentPlayer, action.cardId);
                        }
                        break;

                    case ActionType.PlayCard:
                        if (action.cardId) {
                            const card = currentPlayer.hand.find(c => c.instanceId === action.cardId);
                            console.log(`\n🎭 Playing: ${card?.name || 'card'}`);
                            turnManager.playCard(currentPlayer, action.cardId, action.targetId, action.payload);
                        }
                        break;

                    case ActionType.Quest:
                        if (action.cardId) {
                            const card = currentPlayer.play.find(c => c.instanceId === action.cardId);
                            console.log(`\n⭐ Questing with: ${card?.name || 'character'}`);
                            turnManager.quest(currentPlayer, action.cardId);
                        }
                        break;

                    case ActionType.Challenge:
                        if (action.cardId && action.targetId) {
                            const attacker = currentPlayer.play.find(c => c.instanceId === action.cardId);
                            const opponentId = Object.keys(gameStateManager.state.players).find(id => id !== currentPlayerId)!;
                            const defender = gameStateManager.getPlayer(opponentId).play.find(c => c.instanceId === action.targetId);
                            console.log(`\n⚔️  Challenge: ${attacker?.name} → ${defender?.name}`);
                            turnManager.challenge(currentPlayer, action.cardId, action.targetId);
                        }
                        break;

                    case ActionType.PassTurn:
                        console.log('\n⏭️  Passing turn...\n');
                        turnManager.passTurn(currentPlayerId);
                        turns++;
                        break;

                    default:
                        console.log(`\n⚠️  Unhandled action: ${action.type}`);
                }

            } catch (error) {
                console.error(`\n❌ Error during turn: ${error}`);
                console.error((error as Error).stack);
                // Pass turn on error
                turnManager.passTurn(currentPlayerId);
                turns++;
            }
        }

        // Game over
        console.log('\n════════════════════════════════════════════════════════════');
        console.log('                      🏆 GAME OVER! 🏆');
        console.log('════════════════════════════════════════════════════════════\n');

        if (gameStateManager.state.winnerId) {
            const winner = gameStateManager.getPlayer(gameStateManager.state.winnerId);
            if (gameStateManager.state.winnerId === humanPlayerId) {
                console.log('🎉 YOU WIN! 🎉');
            } else {
                console.log('😔 Bot wins. Better luck next time!');
            }
            console.log(`\nFinal lore: ${winner.lore}/20`);
        } else {
            console.log('Game ended after maximum turns');
        }

        console.log('\nFinal standings:');
        console.log(`  You: ${humanPlayer.lore} lore`);
        console.log(`  Bot: ${botPlayer.lore} lore`);


    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        console.error((error as Error).stack);
        process.exit(1);
    }
}

// Run the game
playGame();
