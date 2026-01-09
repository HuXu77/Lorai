import { TurnManager, Phase } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { CardInstance, ZoneType } from '../../engine/models';
import { GameLogger } from '../../engine/logger';
import { AbilitySystemManager } from '../../engine/abilities/ability-system';

describe('Variable Victory Condition', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let player: any;
    let opponent: any;

    beforeEach(() => {
        game = new GameStateManager();
        player = game.getPlayer(game.addPlayer('player1', 'Player'));
        opponent = game.getPlayer(game.addPlayer('player2', 'Opponent'));
        turnManager = new TurnManager(game, new GameLogger());
        // Initialize ability system
        turnManager.abilitySystem = new AbilitySystemManager(turnManager);
    });

    const createDonaldDuck = (ownerId: string): CardInstance => ({
        instanceId: `donald-${ownerId}`,
        id: 999,
        number: 999,
        setCode: 'TST',
        name: 'Donald Duck',
        fullName: 'Donald Duck - Flustered Sorcerer',
        version: 'Flustered Sorcerer',
        cost: 7,
        type: 'Character', // Correct casing for CardType enum map if needed, but string usually works
        color: 'Ruby',
        inkwell: true,
        subtypes: ['Storyborn', 'Sorcerer'],
        strength: 3,
        willpower: 4,
        lore: 1,
        damage: 0,
        ready: true,
        ownerId: ownerId,
        zone: ZoneType.Play,
        turnPlayed: 0,
        meta: {},
        abilities: [],
        parsedEffects: [
            {
                type: 'modify_win_condition',
                loreRequired: 25,
                target: { type: 'opponents' },
                trigger: 'static'
            }
        ]
    } as any);

    it('should default loreGoal to 20', () => {
        turnManager.recalculateEffects();
        expect(player.loreGoal).toBe(20);
        expect(opponent.loreGoal).toBe(20);
    });

    it('should increase opponent loreGoal when Player has Donald Duck', () => {
        const donald = createDonaldDuck(player.id);
        player.play.push(donald);

        turnManager.recalculateEffects();

        expect(player.loreGoal).toBe(20); // Player not affected
        expect(opponent.loreGoal).toBe(25); // Opponent affected
    });

    it('should increase player loreGoal when Opponent has Donald Duck', () => {
        const donald = createDonaldDuck(opponent.id);
        opponent.play.push(donald);

        turnManager.recalculateEffects();

        expect(player.loreGoal).toBe(25); // Player affected
        expect(opponent.loreGoal).toBe(20); // Opponent not affected
    });

    it('should set both goals to 25 if both have Donald Duck', () => {
        const donaldP1 = createDonaldDuck(player.id);
        const donaldP2 = createDonaldDuck(opponent.id);
        player.play.push(donaldP1);
        opponent.play.push(donaldP2);

        turnManager.recalculateEffects();

        expect(player.loreGoal).toBe(25);
        expect(opponent.loreGoal).toBe(25);
    });

    it('should revert goal to 20 when Donald Duck leaves play', () => {
        const donald = createDonaldDuck(player.id);
        player.play.push(donald);

        turnManager.recalculateEffects();
        expect(opponent.loreGoal).toBe(25);

        // Remove from play
        player.play = [];
        turnManager.recalculateEffects();

        expect(opponent.loreGoal).toBe(20);
    });

    it('should not let player win at 20 lore if goal is 25', () => {
        const donald = createDonaldDuck(opponent.id); // Opponent makes Player need 25
        opponent.play.push(donald);
        turnManager.recalculateEffects();

        player.lore = 20; // Reached normal win con
        const wins = turnManager.checkWinCondition(player);

        expect(wins).toBe(false);
    });

    it('should let player win at 25 lore if goal is 25', () => {
        const donald = createDonaldDuck(opponent.id);
        opponent.play.push(donald);
        turnManager.recalculateEffects();

        player.lore = 25;
        const wins = turnManager.checkWinCondition(player);

        expect(wins).toBe(true);
    });
});
