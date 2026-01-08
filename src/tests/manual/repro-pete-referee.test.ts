import { TestHarness } from '../engine-test-utils';
import { CardType } from '../../engine/models';

describe('Pete - Games Referee Duration Bug', () => {
    let harness: TestHarness;

    beforeEach(() => {
        harness = new TestHarness();
    });

    it('should restrict opponents from playing actions until start of next turn', async () => {
        // Manual Init to set decks before start
        await harness.loader.loadCards();
        harness.game.addPlayer(harness.p1Id, 'Player 1');
        harness.game.addPlayer(harness.p2Id, 'Player 2');

        const fillers = Array(30).fill('Tinker Bell - Tiny Tactician');

        harness.setDeck(harness.p1Id, fillers);
        harness.setDeck(harness.p2Id, fillers);

        harness.turnManager.startGame(harness.p1Id);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        // Turn 1: P1
        // P1 plays Pete
        p1.play = [];
        harness.setHand(p1.id, ['Pete - Games Referee']);
        harness.setInk(p1.id, 10);

        await harness.playCard(p1, p1.hand[0]);

        // Verify Pete is in play
        expect(p1.play.length).toBe(1);

        // Verify restriction on P2
        // We can check valid actions for P2.
        harness.setHand(p2.id, [
            {
                name: 'Test Action',
                type: CardType.Action,
                cost: 1,
                fullText: "Do nothing."
            }
        ]);
        harness.setInk(p2.id, 10);

        // P1 turn still active. P2 shouldn't affect P1 turn, but restriction is on P2.

        console.log("--- Ending Turn 1 (P1) ---");
        harness.turnManager.passTurn(p1.id);

        // Turn 2: P2
        console.log("--- Starting Turn 2 (P2) ---");
        expect(harness.game.state.turnPlayerId).toBe(p2.id);

        // P2 should NOT be able to play action
        let p2Actions = harness.turnManager.getValidActions(p2.id);
        const playAction = p2Actions.find((a: any) => a.type === 'PlayCard' && a.cardId === p2.hand[0].instanceId);

        if (playAction) {
            console.log("Bug: P2 CAN play action:", playAction);
        } else {
            console.log("Success: P2 CANNOT play action");
        }
        expect(playAction).toBeUndefined();

        console.log("--- Ending Turn 2 (P2) ---");
        harness.turnManager.passTurn(p2.id);

        // Turn 3: P1 again
        console.log("--- Starting Turn 3 (P1) ---");
        expect(harness.game.state.turnPlayerId).toBe(p1.id);

        // Restriction should expire NOW (Start of P1's next turn).

        // Now it's P1 turn.
        // We need to check if P2 could play action? 
        // P2 only plays on their turn. So we simulate P2 turn again?
        // Or we check if the modifier is gone.

        // Let's pass turn 3 (P1) to Turn 4 (P2)
        console.log("--- Ending Turn 3 (P1) ---");
        harness.turnManager.passTurn(p1.id);

        console.log("--- Starting Turn 4 (P2) ---");
        // Now P2 should be able to play action
        p2Actions = harness.turnManager.getValidActions(p2.id);
        const playAction4 = p2Actions.find((a: any) => a.type === 'PlayCard' && a.cardId === p2.hand[0].instanceId);

        expect(playAction4).toBeDefined();
    });
});
