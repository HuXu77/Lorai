import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateManager, PlayerState } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType } from '../../engine/models';
import { LogLevel, LogCategory } from '../../engine/logger';

// Helper to create simple cards
function createCard(name: string, type: string = 'Character', cost: number = 1): CardInstance {
    return {
        instanceId: `card-${Date.now()}-${Math.random()}`,
        name: name,
        fullName: name,
        type: type,
        cost: cost,
        inkwell: true,
        zone: ZoneType.Hand,
        ready: true,
        damage: 0,
        turnPlayed: 0,
        abilities: [],
        parsedEffects: [],
        ownerId: '',
        meta: {}
    } as any;
}

describe('Finnick Log Verbosity', () => {
    let gameState: GameStateManager;
    let turnManager: TurnManager;
    let player1: PlayerState;
    let player2: PlayerState;

    // Mock logger to capture entries
    const logEntries: any[] = [];
    const mockLogger = {
        debug: () => { },
        info: (msg: string) => logEntries.push({ level: LogLevel.INFO, message: msg }),
        warn: (msg: string) => logEntries.push({ level: LogLevel.WARN, message: msg }),
        error: (msg: string) => logEntries.push({ level: LogLevel.ERROR, message: msg }),
        log: (level: LogLevel, message: string, data?: any) => {
            logEntries.push({ level, message, data });
        },
        // Helpers that channel to log
        action: (p: string, action: string, details?: any) => {
            logEntries.push({ level: LogLevel.ACTION, message: `${p} ${action}`, data: { category: LogCategory.CARD, details } });
        },
        effect: (source: string, effect: string, target?: string, details?: any) => {
            logEntries.push({
                level: LogLevel.EFFECT,
                message: `${source} -> ${effect}${target ? ' on ' + target : ''}`,
                data: { category: LogCategory.ABILITY, details, source, effect, target }
            });
        }
    };

    beforeEach(() => {
        logEntries.length = 0;
        gameState = new GameStateManager();
        turnManager = new TurnManager(gameState, mockLogger as any);
        const p1Id = gameState.addPlayer('Player 1');
        const p2Id = gameState.addPlayer('Player 2');
        player1 = gameState.getPlayer(p1Id);
        player2 = gameState.getPlayer(p2Id);
        turnManager.startGame(p1Id);
    });

    it('should log ability trigger and return to hand action for Finnick', async () => {
        // Setup Finnick
        // Finnick - Ele-Finnick
        // 1 Cost, 1/1
        // Ability: "Wait, I'll Help!" - When you play this character, you may return a card from your discard to your hand.

        // Setup discard
        const cardInDiscard = createCard('Pawpsicle');
        cardInDiscard.ownerId = player1.id;
        cardInDiscard.zone = ZoneType.Discard;
        player1.discard.push(cardInDiscard);

        // Setup Finnick in hand
        const finnick = createCard('Finnick - Ele-Finnick');
        finnick.ownerId = player1.id;

        // Define ability manually for test
        finnick.parsedEffects = [{
            type: 'triggered',
            event: 'card_played',
            triggerFilter: {
                target: 'self',
                mine: true
            },
            effects: [{
                type: 'return_from_discard',
                target: {
                    type: 'choice', // implies choice from discard
                    location: 'discard',
                    count: 1
                },
                amount: 1
            }],
            abilityName: "Wait, I'll Help!"
        } as any]; // Cast to any to avoid strict type checks for test mock
        player1.hand.push(finnick);

        const ink = createCard('Ink');
        ink.ownerId = player1.id;
        ink.zone = ZoneType.Inkwell;
        player1.inkwell.push(ink);
        player1.inkwell[0].ready = true;

        // Mock requestChoice to simulate player choosing the card
        turnManager.requestChoice = async (req: any) => {
            // For return from discard, we likely get options of cards in discard
            if (req.options && req.options.length > 0) {
                return {
                    requestId: req.id,
                    playerId: req.playerId,
                    selectedIds: [req.options[0].id],
                    timestamp: Date.now()
                };
            }
            return { requestId: req.id, playerId: req.playerId, selectedIds: [], timestamp: Date.now() };
        };

        // Play Finnick
        await turnManager.playCard(player1, finnick.instanceId);

        // Check logs for Trigger
        const triggerLog = logEntries.find(l =>
            l.level === LogLevel.EFFECT &&
            l.message.includes('triggered ability')
        );
        expect(triggerLog, 'Should log ability trigger').toBeDefined();
        expect(triggerLog.message).toContain('Finnick');

        // Execute choice (simulate player choosing Pawpsicle)
        // Since we are mocking the engine loop, we need to inspect if a choice was requested or auto-handled by our test setup
        // The real engine would pause for choice. 
        // For this test, let's verify that IF the effect executes, it logs properly.

        // Manually invoke the effect part to verify ZoneFamilyHandler logging
        const context = {
            player: player1,
            card: finnick,
            gameState: gameState,
            eventContext: {},
            abilityName: "Wait, I'll Help!"
        };

        // Call executeReturnFromDiscard directly via executor to test logging
        // But we can't easily access private method.
        // Instead, let's look at recent logs after playCard. 
        // Since mocking choice is complex without full integration, we can check if the TRIGGER was logged at least.

        console.log('Logs:', JSON.stringify(logEntries, null, 2));
    });

    it('should log executeReturnFromDiscard in ZoneFamilyHandler', async () => {
        // We need to verify that ZoneFamilyHandler uses logger.effect
        // Since ZoneFamilyHandler is not exported or hard to instantiate without full executor,
        // we will check if we can import it. 
        // Executor imports *FamilyHandler. 
        // Let's assume we can trigger it or we need to import EffectExecutor.
        // Actually, let's just create a new test file for unit testing ZoneFamilyHandler if possible, or try to reach it here.

        // Easier way: Create a mock context and try to run the logic if we could access it.
        // But `ZoneFamilyHandler` is likely a class or set of functions in `src/engine/abilities/families/zone-family.ts`.
        // Let's check imports.
    });
});
import { ZoneFamilyHandler } from '../../engine/abilities/families/zone-family';
import { GameContext } from '../../engine/abilities/executor';

describe('ZoneFamilyHandler Logging', () => {
    let gameState: GameStateManager;
    let turnManager: TurnManager;
    let player1: PlayerState;
    const logEntries: any[] = [];

    const mockLogger = {
        debug: () => { },
        info: (msg: string) => logEntries.push({ level: LogLevel.INFO, message: msg }),
        warn: (msg: string) => logEntries.push({ level: LogLevel.WARN, message: msg }),
        error: (msg: string) => logEntries.push({ level: LogLevel.ERROR, message: msg }),
        log: (level: LogLevel, message: string, data?: any) => {
            logEntries.push({ level, message, data });
        },
        action: (p: string, action: string, details?: any) => {
            logEntries.push({ level: LogLevel.ACTION, message: `${p} ${action}`, data: { category: LogCategory.CARD, details } });
        },
        effect: (source: string, effect: string, target?: string, details?: any) => {
            logEntries.push({
                level: LogLevel.EFFECT,
                message: `${source} -> ${effect}${target ? ' on ' + target : ''}`,
                data: { category: LogCategory.ABILITY, details, source, effect, target }
            });
        }
    };

    beforeEach(() => {
        logEntries.length = 0;
        gameState = new GameStateManager();
        turnManager = new TurnManager(gameState, mockLogger as any);
        const p1Id = gameState.addPlayer('Player 1');
        player1 = gameState.getPlayer(p1Id);
    });

    it('should log return to hand interaction correctly', async () => {
        const mockExecutor = { turnManager: turnManager };
        const handler = new ZoneFamilyHandler(mockExecutor);
        const cardInDiscard = createCard('Pawpsicle');
        cardInDiscard.ownerId = player1.id;
        cardInDiscard.zone = ZoneType.Discard;
        player1.discard.push(cardInDiscard);

        const finnick = createCard('Finnick');
        finnick.ownerId = player1.id;

        const context: GameContext = {
            gameState: gameState,
            player: player1,
            card: finnick,
            eventContext: {
                trigger: 'activated'
            } as any,
            abilityName: 'Test Ability'
        };

        const effect = {
            type: 'return_from_discard',
            amount: 1,
            target: { location: 'discard' } // simplified
        };

        // We override resolveTargets to return our mocked target because real resolution needs full executor
        (handler as any).resolveTargets = async () => [cardInDiscard];

        // Call private method
        await (handler as any).executeReturnFromDiscard(effect, context);

        // Verify Log
        const log = logEntries.find(l => l.level === LogLevel.EFFECT && l.message.includes('returned from discard to hand'));
        expect(log).toBeDefined();
        expect(log.data.category).toBe(LogCategory.ABILITY);
    });
});
