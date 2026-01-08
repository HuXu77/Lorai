import { GameStateManager, PlayerState } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType } from '../../engine/models';
import { CardEffect } from '../../engine/models';
import { CardType } from '../../engine/models';

describe('Elsa - Spirit of Winter', () => {

    let game: GameStateManager;
    let player: PlayerState;
    let opponent: PlayerState;
    let turnManager: TurnManager;
    let card: CardInstance;

    beforeEach(() => {
        game = new GameStateManager();
        player = game.getPlayer(game.addPlayer('Player 1'));
        opponent = game.getPlayer(game.addPlayer('Player 2'));
        turnManager = new TurnManager(game);
        turnManager.startGame(player.id);
        
        // Setup card
        card = player.addCardToZone({
            name: 'Elsa',
            fullName: 'Elsa - Spirit of Winter',
            id: 42,
            cost: 8,
            type: 'Character' as CardType,
            color: 'Steel', // Default, should fetch from card data
            subtypes: [],
            abilities: [],
            strength: 4,
            willpower: 6,
            lore: 3,
            inkwell: false,
            parsedEffects: [{"trigger":"static","action":"keyword_shift","target":"self","amount":6,"rawText":"Shift 6 (You may pay 6 ⬡ to play this on top of one of\nyour characters named Elsa.)","params":{"targetName":"Elsa"}},{"trigger":"on_play","action":"exert_and_freeze","target":"chosen_character","amount":2,"duration":"until_next_turn","rawText":"DEEP FREEZE When you play this character, exert up to 2 chosen characters. They can't ready at the start of their next turn."}]
        } as any, ZoneType.Hand);
    });

    it('should apply static effect', async () => {
        // Arrange
        card.zone = ZoneType.Play;
        
        // Act
        // Static effects are usually applied continuously or on state updates
        // You might need to trigger a state update or check a property
        
        // Assert
        // TODO: Verify specific effect: keyword_shift
    });

    it('should trigger on play', async () => {
        // Arrange
        const initialInk = (card.cost || 0) + 1;
        for (let i = 0; i < initialInk; i++) {
            player.inkwell.push({ ready: true } as any);
        }

        // Add cards to deck for ramp/draw effects
        player.deck.push({ name: 'Deck Card 1' } as any);
        player.deck.push({ name: 'Deck Card 2' } as any);
        player.deck.push({ name: 'Deck Card 3' } as any);

        // Act
        const result = await (turnManager as any).playCard(player, card.instanceId);
        expect(result).toBe(true);

        // Assert
        // TODO: Verify specific effect: exert_and_freeze
        // Example: expect(player.hand).toHaveLength(X);
    });
});
