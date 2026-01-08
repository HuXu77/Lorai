import { GameStateManager, PlayerState } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType } from '../../engine/models';
import { CardEffect } from '../../engine/models';
import { CardType } from '../../engine/models';

describe('Work Together', () => {

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
            name: 'Work Together',
            fullName: 'Work Together',
            id: 165,
            cost: 1,
            type: 'Action' as CardType,
            color: 'Steel', // Default, should fetch from card data
            subtypes: [],
            abilities: [],
            strength: 0,
            willpower: 0,
            lore: 0,
            inkwell: true,
            parsedEffects: [{"trigger":"on_play","action":"grant_keyword_temporary","target":"chosen_character","duration":"until_end_of_turn","rawText":"Chosen character gains Support this turn. (Whenever they quest, you may add their ¤ to another chosen character's ¤ this turn.)","params":{"keyword":"Support","duration":"until_end_of_turn"}}]
        } as any, ZoneType.Hand);
    });

    it('should trigger on play', async () => {
        // Arrange
        const initialInk = (card.cost || 0) + 1;
        for (let i = 0; i < initialInk; i++) {
            player.inkwell.push({ ready: true } as any);
        }

        // Add cards to deck for ramp/draw effects
        player.deck.push({ name: 'Deck Card 1', type: 'Character' as CardType, subtypes: [] } as any);
        player.deck.push({ name: 'Deck Card 2', type: 'Action' as CardType, subtypes: [] } as any);
        player.deck.push({ name: 'Deck Card 3', type: 'Item' as CardType, subtypes: [] } as any);

        // Act
        const result = await (turnManager as any).playCard(player, card.instanceId);
        expect(result).toBe(true);

        // Assert
        // TODO: Verify specific effect: grant_keyword_temporary
    });
});
