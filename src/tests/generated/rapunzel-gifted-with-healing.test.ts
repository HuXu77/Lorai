import { GameStateManager, PlayerState } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType } from '../../engine/models';
import { CardEffect } from '../../engine/models';
import { CardType } from '../../engine/models';

describe('Rapunzel - Gifted with Healing', () => {

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
            name: 'Rapunzel',
            fullName: 'Rapunzel - Gifted with Healing',
            id: 18,
            cost: 4,
            type: 'Character' as CardType,
            color: 'Steel', // Default, should fetch from card data
            subtypes: [],
            abilities: [],
            strength: 1,
            willpower: 5,
            lore: 2,
            inkwell: true,
            parsedEffects: [{"trigger":"on_play","action":"heal_and_draw","target":"chosen_character","amount":3,"rawText":"GLEAM AND GLOW When you play this character, remove up to 3 damage from one of your characters. Draw a card for each 1 damage removed this way."}]
        } as any, ZoneType.Hand);
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
        // TODO: Verify specific effect: heal_and_draw
        // Example: expect(player.hand).toHaveLength(X);
    });
});
