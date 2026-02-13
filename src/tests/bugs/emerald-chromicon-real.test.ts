
import { AbilitySystemManager } from '../../engine/abilities/ability-system';
import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { GameEvent } from '../../engine/abilities/events';
import { parseTriggered } from '../../engine/parsers/triggered-parser';

describe('Emerald Chromicon Real Parser Bug', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let abilitySystem: AbilitySystemManager;
    let player: any;
    let opponent: any;

    beforeEach(() => {
        game = new GameStateManager();
        turnManager = new TurnManager(game);
        abilitySystem = new AbilitySystemManager(turnManager);

        const p1Id = game.addPlayer('Player 1');
        const p2Id = game.addPlayer('Player 2');
        player = game.getPlayer(p1Id);
        opponent = game.getPlayer(p2Id);
    });

    it('should correctly parse and execute "During opponents\' turns" restriction', async () => {
        // Setup: Emerald Chromicon
        const chromicon = {
            id: 'chromicon-1',
            name: 'Emerald Chromicon',
            zone: 'play',
            ownerId: player.id,
            abilities: [] as any[]
        };

        const rawText = "During opponents' turns, whenever one of your characters is banished, you may return chosen character to their player's hand.";

        // Parse the ability
        const abilities: any[] = [];
        const parsed = parseTriggered(rawText, chromicon as any, abilities);

        expect(parsed).toBe(true);
        expect(abilities.length).toBeGreaterThan(0);

        const ability = abilities[0];
        console.log("Parsed Ability:", JSON.stringify(ability, null, 2));

        // Register with ability system
        chromicon.abilities = abilities; // Attach parsed abilities
        // We need to register the ability separately usually, or via registerCard if it processes abilities?
        // AbilitySystemManager.registerCard iterates abilities.
        // It expects card.parsedEffects usually, but let's check what registerCard does.
        // Assuming registerCard handles ability objects if present in `abilities` or `parsedEffects`.

        // Manually registering ability via internal method or mock card structure
        // The AbilitySystemManager.registerCard takes `card` and looks for `parsedEffects`.
        // Let's attach it there.
        chromicon['parsedEffects'] = abilities;

        abilitySystem.registerCard(chromicon);
        const executeSpy = vi.spyOn(abilitySystem['executor'], 'execute');

        // --- SCENARIO 1: My Turn, My Character Banished ---
        // Should NOT trigger because of "During opponents' turns"
        game.state.turnPlayerId = player.id;

        const playerChar = {
            id: 'player-char-1',
            name: 'My Hero',
            zone: 'play',
            type: 'Character',
            ownerId: player.id
        };

        await abilitySystem.emitEvent(GameEvent.CARD_BANISHED, {
            card: playerChar as any,
            player: player, // I banished it? Or just event happened.
            targetCard: playerChar as any
        });

        // Bug: If "During opponents' turns" is not parsed correctly, this might trigger.
        expect(executeSpy).not.toHaveBeenCalled();
        executeSpy.mockClear();

        // --- SCENARIO 2: Opponent's Turn, My Character Banished ---
        // Should TRIGGER
        game.state.turnPlayerId = opponent.id;

        await abilitySystem.emitEvent(GameEvent.CARD_BANISHED, {
            card: playerChar as any,
            player: opponent,
            targetCard: playerChar as any
        });

        expect(executeSpy).toHaveBeenCalled();
        executeSpy.mockClear();

        // --- SCENARIO 3: My Turn, Opponent's Character Banished ---
        // Should NOT trigger
        game.state.turnPlayerId = player.id;

        const opponentChar = {
            id: 'opp-char-1',
            name: 'Big Baddie',
            zone: 'play',
            type: 'Character',
            ownerId: opponent.id
        };

        await abilitySystem.emitEvent(GameEvent.CARD_BANISHED, {
            card: opponentChar as any,
            player: player,
            targetCard: opponentChar as any
        });

        expect(executeSpy).not.toHaveBeenCalled();
        executeSpy.mockClear();

        // --- SCENARIO 4: Opponent's Turn, Opponent's Character Banished ---
        // Should NOT trigger (it's their turn, but not MY character)
        game.state.turnPlayerId = opponent.id;

        await abilitySystem.emitEvent(GameEvent.CARD_BANISHED, {
            card: opponentChar as any,
            player: opponent,
            targetCard: opponentChar as any
        });

        expect(executeSpy).not.toHaveBeenCalled();
    });
});
