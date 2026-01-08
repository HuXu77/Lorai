import { EffectExecutor } from '../../engine/abilities/executor';
import { TurnManager } from '../../engine/actions';
import { GameState } from '../../engine/models';
import { ChoiceType } from '../../engine/models';
import { ZoneType } from '../../engine/models';
import { DeckManipulationFamilyHandler } from '../../engine/abilities/families/deck-manipulation-family';

// Mock TurnManager and Game
const mockTurnManager = {
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    },
    requestChoice: jest.fn(),
    game: {
        getOpponents: jest.fn()
    }
} as any;

describe('Interactive Choices Verification', () => {
    let executor: EffectExecutor;
    let player: any;
    let opponent: any;
    let context: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup players
        player = {
            id: 'p1',
            name: 'Player 1',
            deck: [],
            hand: [],
            discard: [],
            play: [],
            lore: 0
        };

        opponent = {
            id: 'p2',
            name: 'Opponent',
            deck: [],
            hand: [],
            discard: [],
            play: [],
            lore: 0
        };

        mockTurnManager.game.getOpponents.mockReturnValue([opponent]);

        executor = new EffectExecutor(mockTurnManager);
        context = {
            player,
            game: mockTurnManager.game,
            // Add missing GameContext props to satisfy type
            card: null as any,
            gameState: {} as any,
            eventContext: undefined
        };
    });

    describe('Distribute Damage', () => {
        it('should request DISTRIBUTE_DAMAGE and apply split damage correcty', async () => {
            // Setup targets
            const target1 = { instanceId: 't1', damage: 0, willpower: 5, name: 'Target 1' };
            const target2 = { instanceId: 't2', damage: 0, willpower: 5, name: 'Target 2' };

            // Effect definition
            const effect = {
                type: 'distribute_damage',
                target: { type: 'chosen' }, // Simplified
                amount: 3
                // totalDamage usually passed in effect or context
            };

            // Mock resolveTargets to return our targets
            executor['resolveTargets'] = jest.fn().mockReturnValue([target1, target2]);

            // Mock requestChoice response
            mockTurnManager.requestChoice.mockResolvedValue({
                selectedIds: ['t1', 't1', 't2'] // 2 damage to t1, 1 to t2
            });

            // Execute - executeDistributeDamageChoice only takes 2 args: effect, context
            // Targets are resolved internally or passed via context if needed, but signature is (effect, context)
            // Wait, let me check signature of executeDistributeDamageChoice in executor.ts
            // checking... it is private async executeDistributeDamageChoice(effect: any, context: GameContext, targets?: any[])
            // Ah, it DOES take 3 args. The lint says "Expected 2 arguments, but got 3".
            // That implies the definition the test sees might be different or I am mistaking the file content helper vs actual.
            // Let me trust the lint and pass targets in context or check definition.
            // If lint says 2, then maybe it's (effect, context).
            // Let's assume targets are passed in context or resolved.
            // But I mocked resolveTargets!
            // Let's pass targets in context to be safe if signature changed.
            // context.targets = [target1, target2];
            // await executor['executeDistributeDamageChoice'](effect, context);
            // Casting effect to any because test definition is loose object
            await executor['executeDistributeDamageChoice'](effect as any, context);

            // Verify request
            expect(mockTurnManager.requestChoice).toHaveBeenCalledWith(expect.objectContaining({
                type: ChoiceType.DISTRIBUTE_DAMAGE,
                context: expect.objectContaining({ totalDamage: 3 })
            }));

            // Verify application
            expect(target1.damage).toBe(2);
            expect(target2.damage).toBe(1);
        });
    });

    describe('Scry (Look and Distribute)', () => {
        let scryHandler: DeckManipulationFamilyHandler;

        beforeEach(() => {
            scryHandler = new DeckManipulationFamilyHandler({ turnManager: mockTurnManager });

            // Setup deck
            player.deck = [
                { instanceId: 'c1', name: 'Card 1', zone: ZoneType.Deck },
                { instanceId: 'c2', name: 'Card 2', zone: ZoneType.Deck },
                { instanceId: 'c3', name: 'Card 3', zone: ZoneType.Deck }
            ];
            // Top is end of array (pop) => [c1, c2, c3] -> Top is c3
        });

        it('should request SCRY and reorder deck based on payload', async () => {
            // Mock requestChoice response
            // Original Top 2: [c2, c3]
            // We put c3 on bottom, c2 on top.
            mockTurnManager.requestChoice.mockResolvedValue({
                selectedIds: [],
                payload: {
                    top: ['c2'],
                    bottom: ['c3']
                }
            });

            await scryHandler['handleLookAndDistribute'](player, 2, 'bottom');

            // Verify request
            expect(mockTurnManager.requestChoice).toHaveBeenCalledWith(expect.objectContaining({
                type: ChoiceType.SCRY,
                min: 2,
                max: 2
            }));

            // Verify Deck State
            // Bottom: c3 (unshifted) -> [c3, ... ]
            // Top: c2 (pushed) -> [ ..., c2 ]
            // Remaining in deck was [c1].
            // Result should be: [c3, c1, c2]

            expect(player.deck.length).toBe(3);
            expect(player.deck[0].instanceId).toBe('c3'); // Bottom
            expect(player.deck[1].instanceId).toBe('c1'); // Middle
            expect(player.deck[2].instanceId).toBe('c2'); // Top
        });
    });

    describe('Look and Choose', () => {
        let handler: DeckManipulationFamilyHandler;

        beforeEach(() => {
            handler = new DeckManipulationFamilyHandler({ turnManager: mockTurnManager });
            player.deck = [
                { instanceId: 'c1', name: 'Card 1', zone: ZoneType.Deck },
                { instanceId: 'c2', name: 'Card 2', zone: ZoneType.Deck },
                { instanceId: 'c3', name: 'Card 3', zone: ZoneType.Deck }
            ];
            // Top 2: c2, c3
        });

        it('should request CHOOSE_CARD_FROM_ZONE and move chosen to hand', async () => {
            // Look at top 2, choose 1 to hand. Rest to bottom.
            mockTurnManager.requestChoice.mockResolvedValue({
                selectedIds: ['c3'] // Choose c3
            });

            await handler['handleLookAndChoose'](player, 2, 1, 'bottom');

            // Verify request
            expect(mockTurnManager.requestChoice).toHaveBeenCalledWith(expect.objectContaining({
                type: ChoiceType.CHOOSE_CARD_FROM_ZONE,
                min: 1,
                max: 1
            }));

            // Verify Hand
            expect(player.hand.length).toBe(1);
            expect(player.hand[0].instanceId).toBe('c3');

            // Verify Deck (Rest c2 goes to bottom)
            // Remaining c1.
            // Result: [c2, c1]
            expect(player.deck.length).toBe(2);
            expect(player.deck[0].instanceId).toBe('c2');
            expect(player.deck[1].instanceId).toBe('c1');
        });
    });

    describe('Opponent Interaction (Reveal Hand)', () => {
        let handler: DeckManipulationFamilyHandler;

        beforeEach(() => {
            handler = new DeckManipulationFamilyHandler({ turnManager: mockTurnManager });
            opponent.hand = [
                { instanceId: 'oc1', name: 'Opponent Card 1', zone: ZoneType.Hand },
                { instanceId: 'oc2', name: 'Opponent Card 2', zone: ZoneType.Hand }
            ];
        });

        it('should request choice to discard from revealed opponent hand', async () => {
            mockTurnManager.requestChoice.mockResolvedValue({
                selectedIds: ['oc1']
            });

            // Mock context having player and satisfying GameContext
            const ctx = {
                player: player,
                game: mockTurnManager.game,
                card: null as any,
                gameState: {} as any,
                eventContext: undefined as any
            };

            await handler['handleRevealHandOpponentChoice'](ctx, {});

            // Verify request
            expect(mockTurnManager.requestChoice).toHaveBeenCalledWith(expect.objectContaining({
                type: ChoiceType.CHOOSE_CARD_FROM_ZONE,
                playerId: player.id
            }));

            // Verify Discard
            expect(opponent.discard.length).toBe(1);
            expect(opponent.discard[0].instanceId).toBe('oc1');
            expect(opponent.hand.length).toBe(1);
            expect(opponent.hand[0].instanceId).toBe('oc2');
        });
    });

});
