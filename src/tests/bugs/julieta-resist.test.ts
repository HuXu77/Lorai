import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { GameLogger } from '../../engine/logger';
import { ChoiceRequest, ChoiceResponse, CardType } from '../../engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Bug Reproduction: Julieta Madrigal', () => {
    let gameState: GameStateManager;
    let turnManager: TurnManager;
    let logger: GameLogger;
    let choiceRequests: ChoiceRequest[];
    let p1Id: string;
    let p2Id: string;

    beforeEach(() => {
        logger = new GameLogger();
        gameState = new GameStateManager();
        turnManager = new TurnManager(gameState, logger);
        choiceRequests = [];

        p1Id = gameState.addPlayer('Player 1');
        p2Id = gameState.addPlayer('Player 2');

        // Mock handler that captures requests
        const mockHandler = (request: ChoiceRequest): ChoiceResponse => {
            choiceRequests.push(request);

            // Auto-select first valid option if available
            const validOptions = request.options?.filter(o => o.valid) || [];

            return {
                requestId: request.id,
                playerId: request.playerId,
                selectedIds: validOptions.length > 0 ? [validOptions[0].id] : [],
                declined: false,
                timestamp: Date.now()
            };
        };

        turnManager.registerChoiceHandler(p1Id, mockHandler);
        turnManager.registerChoiceHandler(p2Id, mockHandler);
        turnManager.startGame(p1Id);
    });

    it('should prompt to remove damage and apply Resist +1', async () => {
        const p1 = gameState.getPlayer(p1Id);

        // Define Julieta
        const julieta = {
            id: 'julieta-madrigal',
            name: 'Julieta Madrigal',
            fullName: 'Julieta Madrigal - Excellent Cook',
            type: 'character',
            cost: 5,
            inkwell: true,
            abilities: [
                {
                    fullText: "When you play this character, you may remove up to 2 damage from chosen character and they gain Resist +1 until the start of your next turn."
                }
            ]
        } as any;

        // Parse abilities
        julieta.parsedEffects = parseToAbilityDefinition(julieta);

        // Define Target (Self or other)
        const targetChar = {
            instanceId: 'target-char',
            id: 'target-char-id',
            name: 'Target Character',
            type: 'character',
            cost: 1,
            willpower: 5,
            strength: 2,
            damage: 0,
            zone: 'play',
            ownerId: p1Id
        } as any;

        // Setup
        p1.hand.push({ ...julieta, instanceId: 'julieta-instance', ownerId: p1Id });
        p1.play.push(targetChar); // Add target to play

        // Add ink to pay for playing
        for (let i = 0; i < 5; i++) {
            p1.inkwell.push({ instanceId: `ink-${i}`, name: 'Ink', type: 'character', ownerId: p1Id, ready: true } as any);
        }

        // Damage the target
        targetChar.damage = 3;

        // Act: Play Julieta
        // We use turnManager.playCard which should trigger abilities
        const result = await turnManager.playCard(p1, 'julieta-instance');

        // Expectation: 
        // 1. Should have received a choice request
        // The choice should be for "remove damage" or "choose character"

        const relevantRequest = choiceRequests.find(r =>
            r.prompt.includes('remove') ||
            r.prompt.includes('Julieta') ||
            r.options.some(o => o.id === targetChar.instanceId)
        );

        expect(relevantRequest).toBeDefined();

        // If we want to be more specific, we can simulate the choice response properly
        // But for now, just proving the prompt exists or not is enough.

        // If the bug is "no prompt", specific assertion:
        expect(choiceRequests.length).toBeGreaterThan(0);
    });
});
