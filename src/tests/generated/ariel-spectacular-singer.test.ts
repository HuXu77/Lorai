import { GameStateManager, PlayerState } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType } from '../../engine/models';
import { CardEffect } from '../../engine/models';
import { CardType } from '../../engine/models';

describe('Ariel - Spectacular Singer', () => {

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
            name: 'Ariel',
            fullName: 'Ariel - Spectacular Singer',
            id: 2,
            cost: 3,
            type: 'Character' as CardType,
            color: 'Steel', // Default, should fetch from card data
            subtypes: [],
            abilities: [],
            strength: 2,
            willpower: 3,
            lore: 1,
            inkwell: true,
            parsedEffects: [{"trigger":"static","action":"keyword_singer","target":"self","amount":5,"rawText":"Singer 5 (This character counts as cost 5 to sing songs.)"},{"trigger":"on_play","action":"look_top_deck","target":"deck","amount":4,"rawText":"MUSICAL DEBUT When you play this character, look at the top 4 cards of your deck. You may reveal a song card and put it into your hand. Put the rest on the bottom of your deck in any order.","params":{"filter":"song","destination":"hand","restDestination":"bottom_deck"}}]
        } as any, ZoneType.Hand);
    });

    it('should apply static effect', async () => {
        // Arrange
        card.zone = ZoneType.Play;
        
        // Act
        // Static effects are usually applied continuously or on state updates
        // You might need to trigger a state update or check a property
        
        // Assert
        // TODO: Verify specific effect: keyword_singer
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
        // TODO: Verify specific effect: look_top_deck
        // Example: expect(player.hand).toHaveLength(X);
    });
});
