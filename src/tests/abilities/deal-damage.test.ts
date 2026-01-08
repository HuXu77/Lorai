import { TurnManager } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { ActionType, ZoneType } from '../../engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Deal Damage Effects', () => {
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

    it('should deal damage equal to strength', async () => {
        // "When you play this character, deal damage equal to their strength to chosen opposing character."
        const abilityText = "When you play this character, deal damage equal to their strength to chosen opposing character.";
        const abilities = [{ type: 'ability', fullText: abilityText }];

        const attacker: any = {
            id: 'attacker-card',
            name: 'Attacker',
            cost: 5,
            inkwell: true,
            type: 'character',
            strength: 4,
            willpower: 3,
            lore: 1,
            abilities: abilities
        };
        attacker.parsedEffects = parseToAbilityDefinition(attacker);

        const victim = {
            name: 'Victim',
            cost: 1,
            inkwell: true,
            type: 'character',
            willpower: 5,
            damage: 0
        };

        const attackerCard = player1.addCardToZone(attacker, ZoneType.Hand);
        const victimCard = player2.addCardToZone(victim as any, ZoneType.Play);

        // Give ink
        for (let i = 0; i < 5; i++) {
            const ink = player1.addCardToZone({ name: 'Ink', inkwell: true }, ZoneType.Inkwell);
            ink.ready = true;
        }

        turnManager.startGame(player1.id);

        // Play Attacker targeting Victim
        await turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: player1.id,
            cardId: attackerCard.instanceId,
            targetId: victimCard.instanceId
        });

        // Check Victim took 4 damage
        expect(victimCard.damage).toBe(4);
    });

    it('should deal damage equal to count of Broom characters', async () => {
        // "When you play this character, deal damage equal to the number of Broom characters you have in play to chosen opposing character."
        const abilityText = "When you play this character, deal damage equal to the number of Broom characters you have in play to chosen opposing character.";
        const abilities = [{ type: 'ability', fullText: abilityText }];

        const attacker: any = {
            id: 'broom-master',
            name: 'Broom Master',
            cost: 5,
            inkwell: true,
            type: 'character',
            subtypes: ['Broom'], // Counts itself? Usually yes if "you have in play" and it's in play.
            abilities: abilities
        };
        attacker.parsedEffects = parseToAbilityDefinition(attacker);

        const broom1 = { name: 'Broom 1', cost: 2, type: 'character', subtypes: ['Broom'] };
        const broom2 = { name: 'Broom 2', cost: 2, type: 'character', subtypes: ['Broom'] };
        const nonBroom = { name: 'Other', cost: 2, type: 'character', subtypes: ['Villain'] };

        const victim = { name: 'Victim', cost: 1, type: 'character', willpower: 5, damage: 0 };

        const attackerCard = player1.addCardToZone(attacker, ZoneType.Hand);
        player1.addCardToZone(broom1 as any, ZoneType.Play);
        player1.addCardToZone(broom2 as any, ZoneType.Play);
        player1.addCardToZone(nonBroom as any, ZoneType.Play);

        const victimCard = player2.addCardToZone(victim as any, ZoneType.Play);

        // Give ink
        for (let i = 0; i < 5; i++) {
            const ink = player1.addCardToZone({ name: 'Ink', inkwell: true }, ZoneType.Inkwell);
            ink.ready = true;
        }

        turnManager.startGame(player1.id);

        // Play Attacker targeting Victim
        // Attacker enters play, so count should be 3 (Broom 1, Broom 2, Attacker)
        await turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: player1.id,
            cardId: attackerCard.instanceId,
            targetId: victimCard.instanceId
        });

        // Check Victim took 3 damage
        expect(victimCard.damage).toBe(3);
    });
});
