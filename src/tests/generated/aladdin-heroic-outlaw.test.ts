import { GameStateManager, PlayerState } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType } from '../../engine/models';
import { CardEffect } from '../../engine/models';
import { CardType } from '../../engine/models';

describe('Aladdin - Heroic Outlaw', () => {

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
            name: 'Aladdin',
            fullName: 'Aladdin - Heroic Outlaw',
            id: 104,
            cost: 7,
            type: 'Character' as CardType,
            color: 'Steel', // Default, should fetch from card data
            subtypes: [],
            abilities: [],
            strength: 5,
            willpower: 5,
            lore: 2,
            inkwell: true,
            parsedEffects: [{"trigger":"static","action":"keyword_shift","target":"self","amount":5,"rawText":"Shift 5 (You may pay 5 ⬡ to play this on top of one\nof your characters named Aladdin.)","params":{"targetName":"Aladdin"}},{"trigger":"on_play","action":"lore_loss","target":"opponent","amount":2,"rawText":"DARING EXPLOIT During your turn, whenever this character banishes another character in a challenge, you gain 2 lore and each opponent loses 2 lore."}]
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
        // TODO: Verify specific effect: lore_loss
        // Example: expect(player.hand).toHaveLength(X);
    });
});
