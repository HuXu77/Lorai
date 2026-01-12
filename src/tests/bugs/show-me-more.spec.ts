
import { AbilitySystemManager } from '../../engine/abilities/ability-system';
import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { GameContext } from '../../engine/abilities/executor';

describe('Show Me More! - Each player draws', () => {
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

        // Setup initial state
        player.deck = [
            { id: 'c1', name: 'Card1', zone: 'deck', ownerId: player.id },
            { id: 'c2', name: 'Card2', zone: 'deck', ownerId: player.id },
            { id: 'c3', name: 'Card3', zone: 'deck', ownerId: player.id },
            { id: 'c4', name: 'Card4', zone: 'deck', ownerId: player.id },
            { id: 'c5', name: 'Card5', zone: 'deck', ownerId: player.id }
        ];
        player.hand = []; // Ensure hand is empty

        opponent.deck = [
            { id: 'oc1', name: 'OppCard1', zone: 'deck', ownerId: opponent.id },
            { id: 'oc2', name: 'OppCard2', zone: 'deck', ownerId: opponent.id },
            { id: 'oc3', name: 'OppCard3', zone: 'deck', ownerId: opponent.id },
            { id: 'oc4', name: 'OppCard4', zone: 'deck', ownerId: opponent.id },
            { id: 'oc5', name: 'OppCard5', zone: 'deck', ownerId: opponent.id }
        ];
        opponent.hand = [];
    });

    it('should draw 3 cards for BOTH players when effect executes', async () => {
        // Mock the Show Me More! card
        const showMeMore = {
            id: 'show-me-more-1',
            name: 'Show Me More!',
            ownerId: player.id,
            zone: 'play', // Technically Action cards go to discard but context uses card
        };

        // The effect as parsed by the engine (we verified the parser produces this)
        const effect = {
            type: 'draw',
            amount: 3,
            target: { type: 'all_players' }
        };

        const context: GameContext = {
            player: player,
            gameState: game,
            card: showMeMore as any,
            eventContext: null as any // Bypass TS check
        };

        // Execute the effect
        await abilitySystem.executor.execute(effect as any, context);

        // Verify Player 1 drew 3 cards
        expect(player.hand.length).toBe(3);
        expect(player.deck.length).toBe(2);

        // Verify Player 2 drew 3 cards (THIS CONFIRMS THE FIX)
        expect(opponent.hand.length).toBe(3);
        expect(opponent.deck.length).toBe(2);
    });
});
