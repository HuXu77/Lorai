import { GameStateManager, PlayerState } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType } from '../../engine/models';
import { CardEffect } from '../../engine/models';
import { CardType } from '../../engine/models';

describe('Mickey Mouse - Detective', () => {

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
            name: 'Mickey Mouse',
            fullName: 'Mickey Mouse - Detective',
            id: 154,
            cost: 3,
            type: 'Character' as CardType,
            color: 'Steel', // Default, should fetch from card data
            subtypes: [],
            abilities: [],
            strength: 1,
            willpower: 3,
            lore: 1,
            inkwell: false,
            parsedEffects: [{
                "event": "card_played",
                "type": "triggered",
                "trigger": "on_play",
                "effects": [{
                    "type": "put_into_inkwell",
                    "source": "deck_top",
                    "target": "player",
                    "amount": 1,
                    "exerted": true,
                    "facedown": true
                }],
                "rawText": "GET A CLUE When you play this character, you may put the top card of your deck into your inkwell facedown and exerted."
            }]
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
        // TODO: Verify specific effect: ramp
        // Example: expect(player.hand).toHaveLength(X);

        // Check ramp
        expect(player.inkwell.length).toBeGreaterThan(initialInk);
    });
});
