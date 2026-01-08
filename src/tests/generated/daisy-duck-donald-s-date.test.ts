import { GameStateManager, PlayerState } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType } from '../../engine/models';
import { CardEffect } from '../../engine/models';
import { CardType } from '../../engine/models';

describe('Daisy Duck - Donald\'s Date', () => {

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
            name: 'Daisy Duck',
            fullName: 'Daisy Duck - Donald\'s Date',
            id: 972,
            cost: 1,
            type: 'Character' as CardType,
            color: 'Steel', // Default, should fetch from card data
            subtypes: [],
            abilities: [],
            strength: 1,
            willpower: 4,
            lore: 2,
            inkwell: false,
            parsedEffects: [{"trigger":"on_quest","action":"opponent_reveal_top_deck_conditional","target":"all_opponents","rawText":"BIG PRIZE Whenever this character quests, each opponent reveals the top card of their deck. If it's a character card, they may put it into their hand. Otherwise, they put it on the bottom of their deck.","params":{"condition":{"type":"Character"},"trueEffect":"hand","falseEffect":"bottom_deck"}}]
        } as any, ZoneType.Hand);
    });

    it('should trigger on quest', () => {
        // Arrange
        card.zone = ZoneType.Play;
        card.ready = true;
        card.turnPlayed = -1; // Not drying

        // Act
        (turnManager as any).quest(player, card.instanceId);

        // Assert
        // TODO: Verify specific effect: opponent_reveal_top_deck_conditional
    });
});
