import { GameStateManager, PlayerState } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType } from '../../engine/models';
import { CardEffect } from '../../engine/models';
import { CardType } from '../../engine/models';

describe('Cheshire Cat - Not All There', () => {

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
            name: 'Cheshire Cat',
            fullName: 'Cheshire Cat - Not All There',
            id: 71,
            cost: 3,
            type: 'Character' as CardType,
            color: 'Steel', // Default, should fetch from card data
            subtypes: [],
            abilities: [],
            strength: 0,
            willpower: 3,
            lore: 2,
            inkwell: true,
            parsedEffects: [{"trigger":"on_play","action":"none","target":"self","rawText":"Default play test"}]
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
        // TODO: Verify specific effect: none
        // Example: expect(player.hand).toHaveLength(X);
    });
});
