import { TurnManager } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { ActionType, ZoneType } from '../../engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Global Triggers (Whenever you play)', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let player1: any;
    let player2: any;

    beforeEach(() => {
        game = new GameStateManager();
        game.addPlayer('Player 1');
        game.addPlayer('Player 2');

        const p1Id = Object.keys(game.state.players)[0];
        const p2Id = Object.keys(game.state.players)[1];

        player1 = game.getPlayer(p1Id);
        player2 = game.getPlayer(p2Id);

        turnManager = new TurnManager(game);
    });

    it('should trigger when playing a character', async () => {
        // "Whenever you play a character, draw a card."
        const abilityText = "Whenever you play a character, draw a card.";
        const abilities = [{ type: 'ability', fullText: abilityText }];

        const source: any = {
            id: 'source-card',
            name: 'Source',
            cost: 2,
            inkwell: true,
            type: 'character',
            abilities: abilities
        };
        source.parsedEffects = parseToAbilityDefinition(source);

        const playedChar = { name: 'Played Char', cost: 1, type: 'character' };

        const sourceCard = player1.addCardToZone(source, ZoneType.Play);
        // Register ability
        (turnManager as any).abilitySystem.registerCard(sourceCard);

        const playedCard = player1.addCardToZone(playedChar as any, ZoneType.Hand);

        // Give ink
        for (let i = 0; i < 5; i++) {
            const ink = player1.addCardToZone({ name: 'Ink', inkwell: true }, ZoneType.Inkwell);
            ink.ready = true;
        }

        // Add card to deck to draw
        player1.addCardToZone({ name: 'Card to Draw' }, ZoneType.Deck);

        turnManager.startGame(player1.id);

        // Play Played Char
        await turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: player1.id,
            cardId: playedCard.instanceId
        });

        // Check hand size. Started with Played Char (played). Added 'Card to Draw' to deck.
        // Hand should have 'Card to Draw' if effect triggered.
        expect(player1.hand.length).toBe(1);
        expect(player1.hand[0].name).toBe('Card to Draw');
    });

    it('should trigger when playing an action', async () => {
        // "Whenever you play an action, this character gets +1 ¤ this turn."
        const abilityText = "Whenever you play an action, this character gets +1 ¤ this turn.";
        const abilities = [{ type: 'ability', fullText: abilityText }];

        const observer: any = {
            id: 'observer-card',
            name: 'Observer',
            cost: 2,
            inkwell: true,
            type: 'character',
            strength: 1,
            abilities: abilities
        };
        observer.parsedEffects = parseToAbilityDefinition(observer);

        const actionCard = { name: 'Action', cost: 1, type: 'action' };

        const observerCard = player1.addCardToZone(observer, ZoneType.Play);
        // Register ability
        (turnManager as any).abilitySystem.registerCard(observerCard);

        const playedAction = player1.addCardToZone(actionCard as any, ZoneType.Hand);

        // Give ink
        for (let i = 0; i < 5; i++) {
            const ink = player1.addCardToZone({ name: 'Ink', inkwell: true }, ZoneType.Inkwell);
            ink.ready = true;
        }

        turnManager.startGame(player1.id);

        // Play Action targeting Observer (for the buff)
        // Note: Action card itself might need a target, but here it's generic.
        // The TRIGGERED ability needs a target ("chosen character").
        // TurnManager should handle auto-targeting or we need to pass target for the triggered ability?
        // Usually triggered abilities with "chosen" require user selection.
        // For now, let's see if auto-select works or if we need to mock input.
        // Assuming simple auto-select for now or random.

        await turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: player1.id,
            cardId: playedAction.instanceId,
        });

        // Check Observer strength
        // Base 1 + 1 = 2.
        expect(observerCard.strength).toBe(2);
    });
});
