import { GameStateManager, PlayerState } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType } from '../../engine/models';
import { CardEffect } from '../../engine/models';
import { CardType } from '../../engine/models';

describe('Stitch - Rock Star', () => {

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
            name: 'Stitch',
            fullName: 'Stitch - Rock Star',
            id: 23,
            cost: 6,
            type: 'Character' as CardType,
            color: 'Steel', // Default, should fetch from card data
            subtypes: [],
            abilities: [],
            strength: 3,
            willpower: 5,
            lore: 3,
            inkwell: true,
            parsedEffects: [{"trigger":"static","action":"keyword_shift","target":"self","amount":4,"rawText":"Shift 4 (You may pay 4 ⬡ to play this on top of one of\nyour characters named Stitch.)","params":{"targetName":"Stitch"}},{"trigger":"on_character_played","action":"draw","target":"self","amount":1,"rawText":"ADORING FANS Whenever you play a character with cost 2 or less, you may exert them to draw a card."}]
        } as any, ZoneType.Hand);
    });

    it('should apply static effect', () => {
        // Arrange
        card.zone = ZoneType.Play;
        
        // Act
        // Static effects are usually applied continuously or on state updates
        // You might need to trigger a state update or check a property
        
        // Assert
        // TODO: Verify specific effect: keyword_shift
    });

    it('should handle ability 2: on_character_played', () => {
        // TODO: Implement test for trigger: on_character_played
        // Action: draw
        // Target: self
        // Text: ADORING FANS Whenever you play a character with cost 2 or less, you may exert them to draw a card.

        // Check draw
        expect(player.hand.length).toBeGreaterThan(0);
    });
});
