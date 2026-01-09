import { AbilitySystemManager } from '../../engine/abilities/ability-system';
import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { GameEvent } from '../../engine/abilities/events';

describe('Emerald Chromicon Bug', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let abilitySystem: AbilitySystemManager;
    let player: any;
    let opponent: any;

    beforeEach(() => {
        game = new GameStateManager();
        turnManager = new TurnManager(game);
        abilitySystem = new AbilitySystemManager(turnManager);
        const p1Id = game.addPlayer('Player 1');
        const p2Id = game.addPlayer('Player 2');
        player = game.getPlayer(p1Id);
        opponent = game.getPlayer(p2Id);
    });

    it('should NOT trigger when opponent banishes their OWN character', async () => {
        // Setup: Emerald Chromicon in play for Player 1
        const chromicon = {
            id: 'chromicon-1',
            name: 'Emerald Chromicon',
            zone: 'play',
            ownerId: player.id,
            parsedEffects: [
                {
                    id: 'abil-1',
                    cardId: 'chromicon-1',
                    type: 'triggered',
                    event: GameEvent.CARD_BANISHED,
                    eventConditions: [
                        { type: 'opponents_turn' }
                    ],
                    triggerFilter: {
                        targetOwner: 'self', // "your character"
                        targetType: 'character'
                    },
                    effects: [
                        { type: 'return_to_hand', target: { type: 'chosen' } }
                    ],
                    rawText: "During opponents' turns, whenever one of your characters is banished..."
                }
            ]
        };

        abilitySystem.registerCard(chromicon);
        const executeSpy = jest.spyOn(abilitySystem['executor'], 'execute');

        // Simulating Opponent's Turn
        game.state.turnPlayerId = opponent.id;

        // Opponent banishes THEIR OWN character
        const opponentChar = {
            id: 'opp-char-1',
            name: 'Opponent Minion',
            zone: 'play',
            type: 'Character',
            ownerId: opponent.id
        };

        await abilitySystem.emitEvent(GameEvent.CARD_BANISHED, {
            card: opponentChar as any,
            player: opponent,
            targetCard: opponentChar as any
        });

        // Should NOT trigger - opponent's character, not player's
        expect(executeSpy).not.toHaveBeenCalled();
    });

    it('should TRIGGER when opponent banishes PLAYER character', async () => {
        // Setup: Emerald Chromicon in play for Player 1
        const chromicon = {
            id: 'chromicon-1',
            name: 'Emerald Chromicon',
            zone: 'play',
            ownerId: player.id,
            parsedEffects: [
                {
                    id: 'abil-2',
                    cardId: 'chromicon-1',
                    type: 'triggered',
                    event: GameEvent.CARD_BANISHED,
                    eventConditions: [
                        { type: 'opponents_turn' }
                    ],
                    triggerFilter: {
                        targetOwner: 'self',
                        targetType: 'character'
                    },
                    effects: [
                        { type: 'return_to_hand', target: { type: 'chosen' } }
                    ],
                    rawText: "During opponents' turns, whenever one of your characters is banished..."
                }
            ]
        };

        abilitySystem.registerCard(chromicon);
        const executeSpy = jest.spyOn(abilitySystem['executor'], 'execute');

        // Simulating Opponent's Turn
        game.state.turnPlayerId = opponent.id;

        // Opponent banishes PLAYER character
        const playerChar = {
            id: 'player-char-1',
            name: 'My Hero',
            zone: 'play',
            type: 'Character',
            ownerId: player.id
        };

        await abilitySystem.emitEvent(GameEvent.CARD_BANISHED, {
            card: playerChar as any,
            player: opponent,
            targetCard: playerChar as any
        });

        // Should trigger - player's character banished during opponent's turn
        expect(executeSpy).toHaveBeenCalled();
    });
});
