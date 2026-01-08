import { GameStateManager, PlayerState } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType } from '../../engine/models';
import { CardEffect } from '../../engine/models';
import { CardType } from '../../engine/models';

describe('Bestow a Gift', () => {

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
            name: 'Bestow a Gift',
            fullName: 'Bestow a Gift',
            id: 496,
            cost: 1,
            type: 'Action' as CardType,
            color: 'Steel', // Default, should fetch from card data
            subtypes: [],
            abilities: [],
            strength: 0,
            willpower: 0,
            lore: 0,
            inkwell: true,
            parsedEffects: [{"trigger":"on_play","action":"move_damage","target":"two_chosen_characters","amount":1,"rawText":"Move 1 damage counter from chosen character to chosen opposing character.","params":{"fromTarget":"chosen_character","toTarget":"chosen_opposing_character"}}]
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
        // TODO: Verify specific effect: move_damage
    });
});
