import { GameStateManager } from '../../engine/state';
import { ActionType, TurnManager } from '../../engine/actions';
import { CardLoader } from '../../engine/card-loader';
import { printGameState } from '../../utils/debug';

describe('Ink Rule Verification', () => {
    it('should enforce ink once per turn rule', async () => {
        console.log('--- Verifying Ink Once Per Turn Rule ---');

        // 1. Setup
        const loader = new CardLoader();
        await loader.loadCards();

        const allCards = loader.getAllCards();
        const getCard = (name: string) => allCards.find(c => c.name.includes(name));

        const game = new GameStateManager();
        const p1Id = game.addPlayer('Player 1');
        const p2Id = game.addPlayer('Player 2');

        const turnManager = new TurnManager(game);
        turnManager.startGame(p1Id);

        const p1 = game.getPlayer(p1Id);

        // Ensure P1 has inkable cards in hand
        const inkableCard1 = getCard('Mickey Mouse');
        const inkableCard2 = getCard('Goofy');

        if (!inkableCard1 || !inkableCard2) {
            throw new Error('Could not find test cards');
        }

        // Mock hand to ensure we have specific cards
        p1.hand = [
            { ...inkableCard1, instanceId: 'card-1', ownerId: p1Id, zone: 'Hand', ready: true, damage: 0, turnPlayed: 0, meta: {} },
            { ...inkableCard2, instanceId: 'card-2', ownerId: p1Id, zone: 'Hand', ready: true, damage: 0, turnPlayed: 0, meta: {} }
        ] as any;

        // Force inkable to true just in case
        p1.hand[0].inkwell = true;
        p1.hand[1].inkwell = true;

        console.log('Initial State:');
        printGameState(game, p1Id, p2Id);

        // 2. Attempt to Ink First Card
        console.log('\nAttempting to ink first card...');
        const action1 = {
            type: ActionType.InkCard,
            playerId: p1Id,
            cardId: 'card-1'
        };
        const result1 = await turnManager.resolveAction(action1);
        console.log(`Result 1 (Should be true): ${result1}`);

        expect(result1).toBe(true);

        // 3. Attempt to Ink Second Card
        console.log('\nAttempting to ink second card (Should fail)...');
        const action2 = {
            type: ActionType.InkCard,
            playerId: p1Id,
            cardId: 'card-2'
        };
        const result2 = await turnManager.resolveAction(action2);
        console.log(`Result 2 (Should be false): ${result2}`);

        expect(result2).toBe(false);
        console.log('SUCCESS: Prevented inking a second card.');

        console.log('\nFinal State:');
        printGameState(game, p1Id, p2Id);
    });
});

