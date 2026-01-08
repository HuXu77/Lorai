import { TestHarness } from '../engine-test-utils';
import { ActionType, CardType } from '../../engine/models';

describe('The Queen - Commanding Presence Bug', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initGame([], []);
    });

    it('should prompt for targets when The Queen quests (using real parser)', async () => {
        const player1 = harness.game.getPlayer(harness.p1Id);
        const player2 = harness.game.getPlayer(harness.p2Id);

        // Load the REAL card by name, forcing parsing
        harness.setPlay(harness.p1Id, ['The Queen - Commanding Presence']);
        const queen = player1.play[0];
        // Sanity check we got the right card
        expect(queen.fullName).toBe('The Queen - Commanding Presence');

        // Log parsed effects to see what we're working with
        console.log('Queen Parsed Effects:', JSON.stringify(queen.parsedEffects, null, 2));

        // Set up target for the ability
        harness.setPlay(harness.p2Id, ['Mickey Mouse - Detective']);

        // Spy on choice requests
        let choiceRequests: any[] = [];
        const originalEmit = harness.turnManager.emitChoiceRequest;
        harness.turnManager.emitChoiceRequest = async (choice: any) => {
            choiceRequests.push(choice);
            // Auto-select first option to let flow continue if needed, 
            // though we mostly care that the request happened.
            // But for multi-step abilities, we might need to resolve.
            // For now, let's just push and verify length.
            return originalEmit.call(harness.turnManager, choice);
        };

        // Start game and turn to enable questing
        harness.turnManager.startTurn(harness.p1Id);

        // Resolve quest action
        await harness.turnManager.resolveAction({
            type: ActionType.Quest,
            playerId: player1.id,
            cardId: queen.instanceId
        });

        // We expect at least one choice request for target selection
        console.log('[DEBUG] Choice requests:', choiceRequests.length);
        choiceRequests.forEach((c, i) => console.log(`  [${i}] ${c.type}: ${c.prompt}`));

        expect(choiceRequests.length).toBeGreaterThan(0);

        // Detailed check on the first prompt
        const req1 = choiceRequests[0];
        console.log('Choice Source:', JSON.stringify(req1.source, null, 2));
        console.log('Choice Type:', req1.type);
        console.log('Options Count:', req1.options.length);
        console.log('First Option Owner:', req1.options[0]?.card?.ownerId);
        console.log('Request Player:', req1.playerId);

        // Use a more generic check or the exact string we received
        // Received: "Choose an opposing character"
        expect(req1.prompt).toMatch(/Choose an opposing character|chosen opposing character/i);
    });
});
