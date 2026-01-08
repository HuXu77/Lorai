import { GameStateManager, PlayerState } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType } from '../../engine/models';
import { CardEffect } from '../../engine/models';
import { CardType } from '../../engine/models';

describe('Tinker Bell - Giant Fairy', () => {

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
            name: 'Tinker Bell',
            fullName: 'Tinker Bell - Giant Fairy',
            id: 193,
            cost: 6,
            type: 'Character' as CardType,
            color: 'Steel', // Default, should fetch from card data
            subtypes: [],
            abilities: [],
            strength: 4,
            willpower: 5,
            lore: 2,
            inkwell: true,
            parsedEffects: [{ "trigger": "static", "action": "keyword_shift", "target": "self", "amount": 4, "rawText": "Shift 4 (You may pay 4 ⬡ to play this on top of one of your\ncharacters named Tinker Bell.)", "params": { "targetName": "Tinker Bell" } }, { "trigger": "on_play", "action": "deal_damage", "target": "all_opposing_characters", "amount": 1, "rawText": "ROCK THE BOAT When you play this character, deal 1 damage to each opposing character." }]
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
        const result = await(turnManager as any).playCard(player, card.instanceId);
        expect(result).toBe(true);

        // Assert
        // TODO: Verify specific effect: deal_damage
        // Example: expect(player.hand).toHaveLength(X);
    });
});
