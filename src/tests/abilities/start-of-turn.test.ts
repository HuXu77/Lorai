import { TurnManager } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { ActionType, ZoneType } from '../../engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Start of Turn Triggers', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let player1: any;

    beforeEach(() => {
        game = new GameStateManager();
        game.addPlayer('Player 1');
        game.addPlayer('Player 2');

        const p1Id = Object.keys(game.state.players)[0];
        player1 = game.getPlayer(p1Id);

        turnManager = new TurnManager(game);
    });

    it('should trigger "gain lore" at start of turn', async () => {
        // "At the start of your turn, gain 1 lore."
        const abilityText = "At the start of your turn, gain 1 lore.";
        const abilities = [{ type: 'ability', fullText: abilityText }];

        const source: any = {
            id: 'source-card',
            name: 'Lore Gainer',
            cost: 2,
            inkwell: true,
            type: 'character',
            abilities: abilities
        };
        source.parsedEffects = parseToAbilityDefinition(source);

        const sourceInstance = player1.addCardToZone(source, ZoneType.Play);
        // Register ability
        (turnManager as any).abilitySystem.registerCard(sourceInstance);
        player1.lore = 0;

        // Start turn 1 (Player 1)
        turnManager.startGame(player1.id);

        // Wait for async triggers to execute
        await new Promise(resolve => setTimeout(resolve, 10));

        // Should trigger immediately on start of turn
        expect(player1.lore).toBe(1);
    });

    it('should trigger "draw a card" at start of turn', async () => {
        // "At the start of your turn, draw a card."
        const abilityText = "At the start of your turn, draw a card.";
        const abilities = [{ type: 'ability', fullText: abilityText }];

        const card: any = {
            id: 'card-drawer',
            name: 'Card Drawer',
            cost: 2,
            inkwell: true,
            type: 'character',
            abilities: abilities
        };
        card.parsedEffects = parseToAbilityDefinition(card);

        const cardInstance = player1.addCardToZone(card, ZoneType.Play);
        // Register ability
        (turnManager as any).abilitySystem.registerCard(cardInstance);
        player1.addCardToZone({ name: 'Deck Card' }, ZoneType.Deck);
        const initialHandSize = player1.hand.length;

        // Start turn 1 (Player 1)
        turnManager.startGame(player1.id);

        // Wait for async triggers to execute
        await new Promise(resolve => setTimeout(resolve, 10));

        // Should trigger immediately on start of turn
        // Note: Start of turn also includes draw phase (except turn 1 player 1, but effect triggers separately)
        // Turn 1 Player 1 skips draw phase. So only effect draw should happen.
        expect(player1.hand.length).toBe(initialHandSize + 1);
    });
});
