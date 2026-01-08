import { GameStateManager } from '../../engine/state';
import { ActionType, TurnManager } from '../../engine/actions';
import { CardLoader } from '../../engine/card-loader';
import { printGameState } from '../../utils/debug';

describe('Cost Rule Verification', () => {
    it('should prevent playing cards without enough ink', async () => {
        console.log('--- Verifying Pay Ink Cost Rule ---');

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

        // Get a card with Cost 5 (e.g., Beast - Hardheaded)
        const highCostCard = getCard('Beast');
        if (!highCostCard) {
            throw new Error('Could not find test card');
        }

        // Mock hand
        p1.hand = [
            { ...highCostCard, instanceId: 'card-1', ownerId: p1Id, zone: 'Hand', ready: true, damage: 0, turnPlayed: 0, meta: {} }
        ] as any;

        // Mock Inkwell with only 2 ink
        const inkCard = getCard('Mickey Mouse')!;
        p1.inkwell = [
            { ...inkCard, instanceId: 'ink-1', ownerId: p1Id, zone: 'Inkwell', ready: true, damage: 0, turnPlayed: 0, meta: {} },
            { ...inkCard, instanceId: 'ink-2', ownerId: p1Id, zone: 'Inkwell', ready: true, damage: 0, turnPlayed: 0, meta: {} }
        ] as any;

        console.log('Initial State (2 Ink, Need 5):');
        printGameState(game, p1Id, p2Id);

        // 2. Attempt to Play Card (Should Fail)
        console.log('\nAttempting to play Cost 5 card with 2 Ink...');
        const action1 = {
            type: ActionType.PlayCard,
            playerId: p1Id,
            cardId: 'card-1'
        };
        const result1 = await turnManager.resolveAction(action1);
        console.log(`Result 1 (Should be false): ${result1}`);

        expect(result1).toBe(false);
        console.log('SUCCESS: Prevented playing card without enough ink.');

        // 3. Add more ink (Total 5)
        console.log('\nAdding 3 more ink...');
        p1.inkwell.push(
            { ...inkCard, instanceId: 'ink-3', ownerId: p1Id, zone: 'Inkwell', ready: true, damage: 0, turnPlayed: 0, meta: {} } as any,
            { ...inkCard, instanceId: 'ink-4', ownerId: p1Id, zone: 'Inkwell', ready: true, damage: 0, turnPlayed: 0, meta: {} } as any,
            { ...inkCard, instanceId: 'ink-5', ownerId: p1Id, zone: 'Inkwell', ready: true, damage: 0, turnPlayed: 0, meta: {} } as any
        );

        console.log('State with 5 Ink:');
        printGameState(game, p1Id, p2Id);

        // 4. Attempt to Play Card (Should Succeed)
        console.log('\nAttempting to play Cost 5 card with 5 Ink...');
        const result2 = await turnManager.resolveAction(action1);
        console.log(`Result 2 (Should be true): ${result2}`);

        expect(result2).toBe(true);
        console.log('SUCCESS: Played card with correct cost.');

        console.log('\nFinal State (Ink should be exerted):');
        printGameState(game, p1Id, p2Id);
    });
});

