import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { GameLogger } from '../../engine/logger';
import { CardType, ChoiceRequest, ChoiceResponse, ZoneType } from '../../engine/models';

describe('Callback Choice System', () => {
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

        // Mock handler that captures requests and auto-responds
        const mockHandler = (request: ChoiceRequest): ChoiceResponse => {
            choiceRequests.push(request);

            const validOptions = request.options.filter(o => o.valid);
            return {
                requestId: request.id,
                playerId: request.playerId,
                selectedIds: validOptions.length > 0 ? [validOptions[0].id] : ['yes'],
                declined: false,
                timestamp: Date.now()
            };
        };

        turnManager.registerChoiceHandler(p1Id, mockHandler);
        turnManager.registerChoiceHandler(p2Id, mockHandler);

        turnManager.startGame(p1Id);
    });

    test('Optional effect prompts with yes/no', async () => {
        const p1 = gameState.getPlayer(p1Id);

        // Manually trigger optional effect through executor
        const executor = (turnManager as any).abilitySystem.executor;

        choiceRequests = [];

        // Call checkOptional directly
        const result = await (executor as any).checkOptional(
            { optional: true },
            { player: p1, card: { name: 'Test' }, abilityName: 'Test' },
            'You may draw a card.'
        );

        // Should have prompted
        expect(choiceRequests.length).toBe(1);
        expect(choiceRequests[0].type).toBe('yes_no');
        expect(choiceRequests[0].prompt).toMatch(/draw/i);
        expect(choiceRequests[0].options).toHaveLength(2);

        const ids = choiceRequests[0].options.map(o => o.id);
        expect(ids).toContain('yes');
        expect(ids).toContain('no');
    });

    test('Declining optional returns false', async () => {
        const p1 = gameState.getPlayer(p1Id);

        // Handler that declines
        const declineHandler = (request: ChoiceRequest): ChoiceResponse => {
            choiceRequests.push(request);
            return {
                requestId: request.id,
                playerId: request.playerId,
                selectedIds: ['no'],
                declined: true,
                timestamp: Date.now()
            };
        };
        turnManager.registerChoiceHandler(p1Id, declineHandler);

        const executor = (turnManager as any).abilitySystem.executor;
        choiceRequests = [];

        const result = await (executor as any).checkOptional(
            { optional: true },
            { player: p1, card: { name: 'Test' }, abilityName: 'Test' },
            'You may draw a card.'
        );

        expect(result).toBe(false);
        expect(choiceRequests.length).toBe(1);
    });

    test('Accepting optional returns true', async () => {
        const p1 = gameState.getPlayer(p1Id);

        // Handler that accepts
        const acceptHandler = (request: ChoiceRequest): ChoiceResponse => {
            choiceRequests.push(request);
            return {
                requestId: request.id,
                playerId: request.playerId,
                selectedIds: ['yes'],
                declined: false,
                timestamp: Date.now()
            };
        };
        turnManager.registerChoiceHandler(p1Id, acceptHandler);

        const executor = (turnManager as any).abilitySystem.executor;
        choiceRequests = [];

        const result = await (executor as any).checkOptional(
            { optional: true },
            { player: p1, card: { name: 'Test' }, abilityName: 'Test' },
            'You may draw a card.'
        );

        expect(result).toBe(true);
        expect(choiceRequests.length).toBe(1);
    });

    test('Non-optional effect does not prompt', async () => {
        const p1 = gameState.getPlayer(p1Id);

        const executor = (turnManager as any).abilitySystem.executor;
        choiceRequests = [];

        const result = await (executor as any).checkOptional(
            { optional: false },  // NOT optional
            { player: p1, card: { name: 'Test' }, abilityName: 'Test' },
            'Draw a card.'
        );

        // Should NOT have prompted
        expect(choiceRequests.length).toBe(0);
        expect(result).toBe(true);  // Non-optional always executes
    });

    test('Choice handler receives correct request structure', () => {
        const p1 = gameState.getPlayer(p1Id);

        const executor = (turnManager as any).abilitySystem.executor;
        choiceRequests = [];

        (executor as any).checkOptional(
            { optional: true },
            { player: p1, card: { instanceId: 'card-123', name: 'Test Card' }, abilityName: 'Test Ability' },
            'Test prompt message'
        );

        expect(choiceRequests.length).toBe(1);
        const request = choiceRequests[0];

        expect(request.id).toBeDefined();
        expect(request.playerId).toBe(p1.id);
        expect(request.prompt).toBe('Test Ability: Test prompt message');
        expect(request.source).toBeDefined();
        expect(request.source.card).toBeDefined();
        expect(request.source.abilityName).toBe('Test Ability');
        expect(request.timestamp).toBeDefined();
    });

    test('Multiple players have separate handlers', () => {
        const p1 = gameState.getPlayer(p1Id);
        const p2 = gameState.getPlayer(p2Id);

        let p1Calls = 0;
        let p2Calls = 0;

        const p1Handler = (request: ChoiceRequest): ChoiceResponse => {
            p1Calls++;
            return {
                requestId: request.id,
                playerId: request.playerId,
                selectedIds: ['yes'],
                declined: false,
                timestamp: Date.now()
            };
        };

        const p2Handler = (request: ChoiceRequest): ChoiceResponse => {
            p2Calls++;
            return {
                requestId: request.id,
                playerId: request.playerId,
                selectedIds: ['no'],
                declined: true,
                timestamp: Date.now()
            };
        };

        turnManager.registerChoiceHandler(p1Id, p1Handler);
        turnManager.registerChoiceHandler(p2Id, p2Handler);

        const executor = (turnManager as any).abilitySystem.executor;

        // P1 choice
        (executor as any).checkOptional(
            { optional: true },
            { player: p1, card: { name: 'Test' }, abilityName: 'Test' },
            'Player 1 choice'
        );

        expect(p1Calls).toBe(1);
        expect(p2Calls).toBe(0);

        // P2 choice
        (executor as any).checkOptional(
            { optional: true },
            { player: p2, card: { name: 'Test' }, abilityName: 'Test' },
            'Player 2 choice'
        );

        expect(p1Calls).toBe(1);
        expect(p2Calls).toBe(1);
    });
});
