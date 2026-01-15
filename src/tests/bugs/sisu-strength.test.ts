import { TurnManager } from '../../engine/actions';
import { PlayerState, GameStateManager } from '../../engine/state';
import { CardType, ZoneType, GameState, InkColor } from '../../engine/models';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Sisu - Emboldened Warrior Strength Bug', () => {
    let gameState: GameState;
    let turnManager: TurnManager;
    let player: PlayerState;
    let opponent: PlayerState;

    beforeEach(() => {
        player = new PlayerState('player-1', 'Player');
        opponent = new PlayerState('player-2', 'Opponent');

        const stateManager = new GameStateManager();
        stateManager.state = {
            players: {
                [player.id]: player,
                [opponent.id]: opponent
            },
            turnPlayerId: player.id,
            turnCount: 1,
            phase: 'main',
            activeEffects: [],
            bag: []
        };

        turnManager = new TurnManager(stateManager);

        // Mock game accessor needed for TurnManager (it usually accesses this.game.state)
        // But TurnManager constructor sets this.game = stateManager.
        // So checking how TurnManager uses it. it uses this.game.getPlayer()

        // We don't need to overwrite (turnManager as any).game if we passed stateManager correctly.
        // But we DO need to assign gameState variable for the test to use.
        gameState = stateManager.state;
    });

    it('should calculate strength based on opponents hand size', () => {
        // Setup Sisu
        // "SURGE OF POWER This character gets +1 ¤ for each card in opponents' hands."
        const sisu = {
            instanceId: 'sisu-1',
            id: 2054, // Required for parser
            name: 'Sisu - Emboldened Warrior',
            title: 'Emboldened Warrior',
            cost: 3,
            inkwell: true,
            color: InkColor.Sapphire,
            type: CardType.Character,
            strength: 1, // Base strength
            willpower: 3, // Base willpower (guessed, doesn't matter for test)
            lore: 2,
            ready: true,
            ownerId: player.id,
            zone: ZoneType.Play,
            fullText: "SURGE OF POWER This character gets +1 ¤ for each card in opponents' hands.",
            fullTextSections: ["SURGE OF POWER This character gets +1 ¤ for each card in opponents' hands."],
            abilities: [],
            baseKeywords: []
        };

        // Add Sisu to player's play area
        const sisuInstance = player.addCardToZone(sisu as any, ZoneType.Play);
        turnManager.abilitySystem.registerCard(sisuInstance);

        // Scenario 1: Opponent has 0 cards
        opponent.hand = [];

        // We need to trigger a recalculation or check the getter. 
        // Typically strength is accessed via a getter or calculated via abilitySystem.
        // Let's assume turnManager.abilitySystem.getModifiedStat is used, 
        // or the card instance itself doesn't update, but the UI calls a helper.
        // In the engine, `getModifiedStat` is the source of truth.

        // First, check generic parsing.
        expect(sisuInstance.parsedEffects).toBeDefined();
        // If bug is real, it likely parsed as simple "+1 Strength" instead of dynamic.

        const strength0 = turnManager.abilitySystem.getModifiedStat(sisuInstance, 'strength');
        expect(strength0).toBe(1); // Base 1 + 0 = 1

        // Scenario 2: Opponent has 5 cards
        for (let i = 0; i < 5; i++) {
            opponent.addCardToZone({ name: 'Dummy', type: CardType.Action } as any, ZoneType.Hand);
        }

        const strength5 = turnManager.abilitySystem.getModifiedStat(sisuInstance, 'strength');
        // If default +1, it will be 2. If correct, it should be 1 + 5 = 6.
        expect(strength5).toBe(6);
    });
});
