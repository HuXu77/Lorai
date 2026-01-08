import { CardLoader } from './engine/card-loader';
import { GameStateManager } from './engine/state';
import { TurnManager, ActionType } from './engine/actions';
import { ZoneType } from './engine/models';
import { printGameState } from './utils/debug';

async function main() {
    console.log('--- Lorcana Engine CLI Test ---');

    // 1. Load Cards
    const loader = new CardLoader();
    await loader.loadCards();
    const allCards = loader.getAllCards();

    // 2. Setup Game
    const game = new GameStateManager();
    const p1Id = game.addPlayer('Player 1');
    const p2Id = game.addPlayer('Player 2');
    const p1 = game.getPlayer(p1Id);
    const p2 = game.getPlayer(p2Id);

    // 3. Setup Decks (Random 60 cards)
    for (let i = 0; i < 60; i++) {
        p1.addCardToZone(allCards[i % allCards.length], ZoneType.Deck);
        p2.addCardToZone(allCards[(i + 10) % allCards.length], ZoneType.Deck);
    }

    // 4. Draw Opening Hands (7 cards)
    for (let i = 0; i < 7; i++) {
        p1.hand.push(p1.deck.pop()!);
        p2.hand.push(p2.deck.pop()!);
    }

    console.log(`Game Initialized. P1 Hand: ${p1.hand.length}, P2 Hand: ${p2.hand.length}`);

    // 5. Start Game
    const turnManager = new TurnManager(game);
    turnManager.startGame(p1Id);

    // 6. Simulate Turn 1
    console.log(`\n--- Turn 1: ${p1.name} ---`);

    // Action: Ink a card
    const cardToInk = p1.hand.find(c => c.inkwell);
    if (cardToInk) {
        turnManager.resolveAction({
            type: ActionType.InkCard,
            playerId: p1Id,
            cardId: cardToInk.instanceId
        });
    }

    // Action: Play a card (Cost 1)
    const cardToPlay = p1.hand.find(c => c.cost <= 1);
    if (cardToPlay) {
        turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: p1Id,
            cardId: cardToPlay.instanceId
        });
    } else {
        console.log('No playable card found for cost 1.');
    }

    // Action: Pass Turn
    turnManager.resolveAction({
        type: ActionType.PassTurn,
        playerId: p1Id
    });

    console.log('\n--- Game State After Turn 1 ---');
    console.log('\n--- Game State After Turn 1 ---');
    printGameState(game, p1Id, p2Id);
}

main().catch(console.error);
