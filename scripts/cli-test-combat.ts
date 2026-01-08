import { CardLoader } from './engine/card-loader';
import { GameStateManager } from './engine/state';
import { TurnManager, ActionType } from './engine/actions';
import { ZoneType } from './engine/models';
import { printGameState } from './utils/debug';

async function main() {
    console.log('--- Lorcana Combat Test ---');

    const loader = new CardLoader();
    await loader.loadCards();
    const allCards = loader.getAllCards();

    const game = new GameStateManager();
    const p1Id = game.addPlayer('Player 1');
    const p2Id = game.addPlayer('Player 2');
    const p1 = game.getPlayer(p1Id);
    const p2 = game.getPlayer(p2Id);
    const turnManager = new TurnManager(game);

    // Setup: Give players specific cards for testing
    // P1 gets a strong attacker (e.g., Zeus or similar high strength)
    // P2 gets a weak character to be banished
    const attackerCard = allCards.find(c => c.strength && c.strength >= 3 && c.cost <= 5)!;
    const victimCard = allCards.find(c => c.willpower && c.willpower <= 2 && c.cost <= 5)!;

    // Cheat: Put them directly in play (simulating they were played previously)
    // BUT we want to test "drying", so let's play them normally first.

    // Give infinite ink for testing
    for (let i = 0; i < 10; i++) {
        p1.addCardToZone(allCards[0], ZoneType.Inkwell);
        p2.addCardToZone(allCards[0], ZoneType.Inkwell);
    }

    p1.hand.push(p1.addCardToZone(attackerCard, ZoneType.Hand));
    p2.hand.push(p2.addCardToZone(victimCard, ZoneType.Hand));

    turnManager.startGame(p1Id);

    // --- Turn 1: P1 Plays Attacker ---
    console.log('\n--- Turn 1: P1 ---');
    const p1Card = p1.hand[0];
    turnManager.resolveAction({ type: ActionType.PlayCard, playerId: p1Id, cardId: p1Card.instanceId });

    // Try to Quest immediately (Should Fail)
    console.log('Attempting to quest immediately (Should Fail):');
    turnManager.resolveAction({ type: ActionType.Quest, playerId: p1Id, cardId: p1Card.instanceId });

    turnManager.resolveAction({ type: ActionType.PassTurn, playerId: p1Id });
    printGameState(game, p1Id, p2Id);

    // --- Turn 2: P2 Plays Victim ---
    console.log('\n--- Turn 2: P2 ---');
    const p2Card = p2.hand[0];
    turnManager.resolveAction({ type: ActionType.PlayCard, playerId: p2Id, cardId: p2Card.instanceId });
    turnManager.resolveAction({ type: ActionType.PassTurn, playerId: p2Id });
    printGameState(game, p1Id, p2Id);

    // --- Turn 3: P1 ---
    console.log('\n--- Turn 3: P1 ---');
    // P1's card is now dry. P2's card is drying.
    // P2's card is NOT exerted, so P1 cannot challenge it yet.
    // P1 will Quest instead.
    console.log('Attempting to quest (Should Succeed):');
    turnManager.resolveAction({ type: ActionType.Quest, playerId: p1Id, cardId: p1Card.instanceId });

    turnManager.resolveAction({ type: ActionType.PassTurn, playerId: p1Id });
    printGameState(game, p1Id, p2Id);

    // --- Turn 4: P2 ---
    console.log('\n--- Turn 4: P2 ---');
    // P2 Quests (Exerting themselves)
    console.log('P2 Quests (Exerting):');
    turnManager.resolveAction({ type: ActionType.Quest, playerId: p2Id, cardId: p2Card.instanceId });
    turnManager.resolveAction({ type: ActionType.PassTurn, playerId: p2Id });
    printGameState(game, p1Id, p2Id);

    // --- Turn 5: P1 ---
    console.log('\n--- Turn 5: P1 ---');
    // P1's card readied at start of turn.
    // P2's card is exerted (from questing last turn? No, it readies at start of P2's turn... wait.)
    // Rules: "Ready Phase: The active player readies all their cards."
    // So P2's card readied at start of Turn 4. P2 quested Turn 4, so it is exerted.
    // At start of Turn 5 (P1's turn), P2's card REMAINS exerted until P2's next turn.
    // So P1 CAN challenge P2!

    console.log('P1 Challenges P2 (Should Succeed):');
    turnManager.resolveAction({
        type: ActionType.Challenge,
        playerId: p1Id,
        cardId: p1Card.instanceId,
        targetId: p2Card.instanceId
    });

    printGameState(game, p1Id, p2Id);
}

main().catch(console.error);
