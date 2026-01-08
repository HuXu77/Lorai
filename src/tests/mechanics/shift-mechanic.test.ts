import { TurnManager } from '../../engine/actions';
import { GameState } from '../../engine/models';
import { ZoneType } from '../../engine/models';
import { EffectExecutor } from '../../engine/abilities/executor';

// Mock Game
const mockGame = {
    getOpponents: jest.fn().mockReturnValue([]),
    getPlayers: jest.fn().mockReturnValue([])
} as any;

describe('Shift Mechanic Reproduction', () => {
    let turnManager: TurnManager;
    let player: any;
    let executor: EffectExecutor;

    beforeEach(() => {
        const gameState = {
            players: {
                'p1': {
                    id: 'p1',
                    name: 'Player 1',
                    hand: [],
                    deck: [],
                    discard: [],
                    play: [],
                    inkwell: [],
                    lore: 0,
                    inkedThisTurn: false
                }
            },
            turnPlayerId: 'p1',
            phase: 'Main',
            activeEffects: [],
            bag: []
        } as unknown as GameState;

        // Mock game object to wrap state
        const game = {
            state: gameState,
            getOpponents: jest.fn().mockReturnValue([]),
            getPlayer: jest.fn().mockImplementation((id: string) => gameState.players[id]),
            logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() }
        } as any;

        turnManager = new TurnManager(gameState);
        (turnManager as any).game = game; // Inject mock game

        player = gameState.players['p1'];
        // Mock logger with debug and action
        turnManager.logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), action: jest.fn() } as any;
        executor = new EffectExecutor(turnManager);
        (turnManager as any).abilitySystem = {
            executor: executor,
            registerCardAbilities: jest.fn(),
            registerCard: jest.fn(),
            getModifiedShiftCost: jest.fn((card: any, player: any, baseCost: number) => baseCost), // Return base cost unchanged
            unregisterCard: jest.fn()
        };
    });

    it('should successfully shift Junior Prospector onto Mystery Enthusiast', async () => {
        // Setup Cards
        const mysteryEnthusiast = {
            instanceId: 'target-webby',
            name: 'Webby Vanderquack',
            fullName: 'Webby Vanderquack - Mystery Enthusiast',
            cost: 1,
            inkwell: true,
            zone: ZoneType.Play,
            ownerId: 'p1',
            ready: true,
            parsedEffects: []
        };

        const juniorProspector = {
            instanceId: 'shift-webby',
            name: 'Webby Vanderquack',
            fullName: 'Webby Vanderquack - Junior Prospector',
            cost: 3,
            inkwell: true,
            zone: ZoneType.Hand,
            ownerId: 'p1',
            abilities: [],
            parsedEffects: [
                {
                    type: 'static',
                    keyword: 'shift',
                    value: 2 // Shift 2 (Legacy parser format)
                }
            ]
        };

        // Add to zones
        player.play.push(mysteryEnthusiast);
        player.hand.push(juniorProspector);

        // Add ink to pay for shift
        player.inkwell = [
            { instanceId: 'ink1', ready: true },
            { instanceId: 'ink2', ready: true }
        ];

        // Perform Shift Action
        // Simulating the call from UI: turnManager.playCard(player, cardId, singerId, shiftTargetId)
        // Signature: playCard(player: PlayerState, cardId: string, singerId?: string, shiftTargetId?: string, ...)
        await turnManager.playCard(player, juniorProspector.instanceId, undefined, mysteryEnthusiast.instanceId);

        // Assertions
        // 1. Target should be gone (or under)
        // 2. Played card should be in Play
        // 3. Played card should be ready (if target was ready)
        // 4. Ink should be exerted

        const playedCardInPlay = player.play.find((c: any) => c.instanceId === juniorProspector.instanceId);
        expect(playedCardInPlay).toBeDefined();

        // Check for underlying card
        // Note: Implementation specific. Usually via 'meta.shiftedFrom' or similar?
        // Or strictly strictly: target removed from play array?

        const targetInPlay = player.play.find((c: any) => c.instanceId === mysteryEnthusiast.instanceId);
        // Depending on implementation, target might be removed or attached.
        // Assuming Standard Lorcana: Stack. The top card is the one in play list?
        // Or both in list but linked?
        // Let's check if 'playedCardInPlay' exists. 

        expect(playedCardInPlay.zone).toBe(ZoneType.Play);
        expect(player.hand).toHaveLength(0);

        // Check Ink
        const readyInk = player.inkwell.filter((c: any) => c.ready).length;
        expect(readyInk).toBe(0); // Should use 2 ink
    });
});
