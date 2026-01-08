import { TurnManager } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { ActionType, ZoneType } from '../../engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Banish Chosen Effects', () => {
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

    it('should banish chosen opposing character', async () => {
        // Dragon Fire: "When you play this character, banish chosen opposing character."
        const dragonFireAbilities = [{
            type: 'ability',
            fullText: "When you play this character, banish chosen opposing character."
        }];

        const dragonFire: any = {
            id: 'dragon-fire',
            name: 'Dragon Fire',
            cost: 5,
            inkwell: true,
            type: 'character',
            abilities: dragonFireAbilities
        };
        dragonFire.parsedEffects = parseToAbilityDefinition(dragonFire);

        const victim = {
            name: 'Victim',
            cost: 1,
            inkwell: true,
            type: 'character',
            willpower: 1
        };

        // Setup
        const dfCard = player1.addCardToZone(dragonFire, ZoneType.Hand);
        // Register ability? No, playCard registers it.

        const victimCard = player2.addCardToZone(victim as any, ZoneType.Play);

        // Give P1 enough ink
        for (let i = 0; i < 5; i++) {
            const ink = player1.addCardToZone({ name: 'Ink', inkwell: true }, ZoneType.Inkwell);
            ink.ready = true;
        }

        turnManager.startGame(player1.id);

        // Play Dragon Fire targeting Victim
        await turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: player1.id,
            cardId: dfCard.instanceId,
            targetId: victimCard.instanceId // Target for the effect
        });

        // Check Victim is banished
        expect(player2.discard.find((c: any) => c.instanceId === victimCard.instanceId)).toBeDefined();
        expect(player2.play.find((c: any) => c.instanceId === victimCard.instanceId)).toBeUndefined();
    });

    it('should banish chosen character with cost 2 or less', async () => {
        // "When you play this character, banish chosen opposing character with cost 3 or less."
        const abilityText = "When you play this character, banish chosen opposing character with cost 3 or less.";
        const abilities = [{ type: 'ability', fullText: abilityText }];

        const banisher: any = {
            id: 'banisher-card',
            name: 'Banisher',
            cost: 5,
            inkwell: true,
            type: 'character',
            strength: 3,
            willpower: 3,
            lore: 1,
            abilities: abilities
        };
        banisher.parsedEffects = parseToAbilityDefinition(banisher);

        const cheapVictim = { name: 'Cheap', cost: 2, type: 'character', willpower: 1 };
        const expensiveVictim = { name: 'Expensive', cost: 5, type: 'character', willpower: 1 };

        const banisherCard = player1.addCardToZone(banisher, ZoneType.Hand);
        const cheapCard = player2.addCardToZone(cheapVictim as any, ZoneType.Play);
        const expensiveCard = player2.addCardToZone(expensiveVictim as any, ZoneType.Play);

        // Give ink
        for (let i = 0; i < 5; i++) {
            const ink = player1.addCardToZone({ name: 'Ink', inkwell: true }, ZoneType.Inkwell);
            ink.ready = true;
        }

        turnManager.startGame(player1.id);

        // Try to banish expensive card (Should fail/log error and not banish)
        // Note: In real game, UI filters valid targets. Here we try to force it.
        // The effect logic should check cost limit.
        turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: player1.id,
            cardId: banisherCard.instanceId,
            targetId: expensiveCard.instanceId
        });

        // Expensive card should still be in play
        expect(player2.play.find((c: any) => c.instanceId === expensiveCard.instanceId)).toBeDefined();

        // Reset and try cheap card
        // We need to reset banisher to hand or add another one
        const banisherCard2 = player1.addCardToZone(banisher, ZoneType.Hand);
        // Refill ink (since we spent it)
        player1.inkwell.forEach((c: any) => c.ready = true);

        turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: player1.id,
            cardId: banisherCard2.instanceId,
            targetId: cheapCard.instanceId
        });

        // Cheap card should be banished
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(player2.discard.find((c: any) => c.instanceId === cheapCard.instanceId)).toBeDefined();
    });
});
