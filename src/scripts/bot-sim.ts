import { GameStateManager } from '../engine/state';
import { TurnManager, ActionType } from '../engine/actions';
import { GameAction } from '../engine/models';
import { RandomBot } from '../ai/random-bot';
import { HeuristicBot } from '../ai/heuristic-bot';
import { Bot } from '../ai/models';
import { GameState, Card } from '../engine/models';
import { DeckLoader } from '../engine/deck-loader';
import { DeckValidator } from '../engine/deck-validator';

class PersistentRandomBot extends RandomBot {
    async decideAction(gameState: GameState): Promise<GameAction> {
        const action = await super.decideAction(gameState);
        if (action.type === ActionType.Concede) {
            // Retry until we get a non-concede action or pass
            const validActions = (this as any).turnManager.getValidActions((this as any).playerId);
            const nonConcede = validActions.filter((a: GameAction) => a.type !== ActionType.Concede);
            if (nonConcede.length > 0) {
                return nonConcede[Math.floor(Math.random() * nonConcede.length)];
            }
            return { type: ActionType.PassTurn, playerId: (this as any).playerId };
        }
        return action;
    }
}

async function runSimulation(games: number = 100, deck1Path?: string, deck2Path?: string) {
    console.log(`Starting simulation of ${games} games...`);

    // Load Decks if provided
    let deck1: Card[] | null = null;
    let deck2: Card[] | null = null;
    const loader = new DeckLoader();
    const validator = new DeckValidator();

    if (deck1Path) {
        console.log(`Loading Deck 1 from ${deck1Path}...`);
        deck1 = loader.loadDeck(deck1Path);
        const result = validator.validateDeck(deck1);
        if (!result.valid) {
            console.error(`Deck 1 Invalid:\n${result.errors.join('\n')}`);
            process.exit(1);
        }
    }

    if (deck2Path) {
        console.log(`Loading Deck 2 from ${deck2Path}...`);
        deck2 = loader.loadDeck(deck2Path);
        const result = validator.validateDeck(deck2);
        if (!result.valid) {
            console.error(`Deck 2 Invalid:\n${result.errors.join('\n')}`);
            process.exit(1);
        }
    }

    let heuristicWins = 0;
    let randomWins = 0;
    let draws = 0;
    let totalTurns = 0;

    for (let i = 0; i < games; i++) {
        const game = new GameStateManager();
        const turnManager = new TurnManager(game);

        // Setup Players
        const p1Id = game.addPlayer('Heuristic Bot 1');
        const p2Id = game.addPlayer('Heuristic Bot 2');

        const bot1 = new HeuristicBot(turnManager);
        const bot2 = new HeuristicBot(turnManager);

        bot1.onGameStart(p1Id, game.state);
        bot2.onGameStart(p2Id, game.state);

        const bots: Record<string, Bot> = {
            [p1Id]: bot1,
            [p2Id]: bot2
        };

        // Populate Decks
        const populateDeck = (playerId: string, customDeck: Card[] | null) => {
            const player = game.getPlayer(playerId);

            if (customDeck) {
                // Use custom deck
                customDeck.forEach(card => {
                    player.addCardToZone(card, 'Deck' as any);
                });
            } else {
                // Generate dummy deck
                for (let j = 0; j < 60; j++) {
                    player.addCardToZone({
                        id: j,
                        name: `Card ${j}`,
                        fullName: `Card ${j}`,
                        cost: Math.floor(Math.random() * 6) + 1,
                        inkwell: true,
                        type: 'Character',
                        color: 'Steel',
                        strength: 2,
                        willpower: 2,
                        lore: 1,
                        subtypes: ['Storyborn'],
                        abilities: []
                    } as any, 'Deck' as any);
                }
            }

            // Shuffle (simple sort)
            player.deck.sort(() => Math.random() - 0.5);

            // Draw initial hand (7 cards)
            for (let k = 0; k < 7; k++) {
                const card = player.deck.pop();
                if (card) player.hand.push(card);
            }
        };

        populateDeck(p1Id, deck1);
        populateDeck(p2Id, deck2);

        // Start Game
        turnManager.startGame(p1Id);

        let gameOver = false;
        let turns = 0;
        const MAX_TURNS = 100; // Prevent infinite loops

        while (!gameOver && turns < MAX_TURNS) {
            const currentPlayerId = game.state.turnPlayerId;
            const currentBot = bots[currentPlayerId];

            try {
                const action = await currentBot.decideAction(game.state);

                // Execute Action
                turnManager.resolveAction(action);

                // Check Win Condition
                if (game.state.winnerId) {
                    gameOver = true;
                    if (game.state.winnerId === p1Id) heuristicWins++;
                    else randomWins++;
                }
            } catch (e) {
                console.error(`Error in game ${i}:`, e);
                gameOver = true; // Abort game on error
            }

            // Increment turn count (approximate, based on pass turn)
            if (game.state.turnPlayerId !== currentPlayerId) {
                turns++;
            }
        }

        totalTurns += turns;

        if (i % 10 === 0) {
            process.stdout.write('.');
        }
    }

    console.log('\n\nSimulation Complete!');
    console.log(`Player 1 Wins: ${heuristicWins}`);
    console.log(`Player 2 Wins: ${randomWins}`);
    console.log(`P1 Win Rate: ${((heuristicWins / games) * 100).toFixed(1)}%`);
    console.log(`Avg Turns: ${(totalTurns / games).toFixed(1)}`);
}

const args = process.argv.slice(2);
const deck1 = args[0];
const deck2 = args[1];

runSimulation(50, deck1, deck2).catch(console.error);
