import { TurnManager, Phase } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { GameLogger } from '../../engine/logger';
import { AbilitySystemManager } from '../../engine/abilities/ability-system';
import { CardInstance, ZoneType } from '../../engine/models';

describe('Modal Card Rendering Bug', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let player: any;
    let opponent: any;

    beforeEach(() => {
        game = new GameStateManager();
        player = game.getPlayer(game.addPlayer('player1', 'Player'));
        opponent = game.getPlayer(game.addPlayer('player2', 'Opponent'));
        turnManager = new TurnManager(game, new GameLogger());
        (turnManager as any).eventBus = { emit: jest.fn() };
        turnManager.abilitySystem = new AbilitySystemManager(turnManager);
    });

    const createCard = (id: string, name: string, ownerId: string, type: string = 'Character'): CardInstance => ({
        instanceId: id,
        id: 1,
        number: 1,
        setCode: 'TST',
        name,
        fullName: name,
        cost: 1,
        type,
        color: 'Ruby',
        inkwell: true,
        subtypes: [],
        ownerId,
        zone: ZoneType.Hand,
        ready: true,
        lore: 0,
        strength: 0,
        willpower: 0,
        damage: 0,
        turnPlayed: 0,
        meta: {},
        abilities: [],
        parsedEffects: []
    } as any);

    it('should include full card object in opponent_reveal_and_discard options', async () => {
        // Setup Opponent Hand
        const charCard = createCard('card1', 'Opponent Character', opponent.id, 'Character');
        const actionCard = createCard('card2', 'Opponent Action', opponent.id, 'Action');
        opponent.hand = [charCard, actionCard];

        // Mock requestChoice to capture the options
        let capturedChoice: any = null;
        turnManager.requestChoice = async (choiceRequest: any) => {
            capturedChoice = choiceRequest;
            // Auto-respond to unblock execution
            return {
                requestId: choiceRequest.id,
                playerId: choiceRequest.playerId,
                selectedIds: [actionCard.instanceId],
                declined: false,
                timestamp: Date.now()
            };
        };

        // Trigger the effect directly via AbilitySystem or ChoiceFamilyHandler
        // We'll use ChoiceFamilyHandler directly to simulate the effect execution
        const context = {
            player: player,
            source: { card: createCard('source', 'Mowgli', player.id), player }
        };

        const effect = {
            type: 'opponent_reveal_and_discard',
            filter: { excludeCardType: 'Character' } // Filter out characters
        };

        // We need to access the handler. 
        // Since it's private in TurnManager/AbilitySystem, we instantiate one.
        // Or we can rely on AbilitySystem to delegate if we mock the executor.
        // But easier to just hack the call or replicate logical flow?
        // Let's use the actual AbilitySystem if possible, or direct instantiation.

        // Since we want to test ChoiceFamilyHandler specifically:
        const { ChoiceFamilyHandler } = require('../../engine/abilities/families/choice-family');
        const handler = new ChoiceFamilyHandler({ turnManager });

        await handler.execute(effect, context);

        expect(capturedChoice).not.toBeNull();
        expect(capturedChoice.type).toBe('target_card_in_hand');
        expect(capturedChoice.options.length).toBe(2);

        // Verify the bug fix: check if 'card' property exists on options
        const actionOption = capturedChoice.options.find((o: any) => o.id === actionCard.instanceId);
        expect(actionOption).toBeDefined();
        expect(actionOption.card).toBeDefined(); // This triggered the bug report (was undefined)
        expect(actionOption.card.instanceId).toBe(actionCard.instanceId);
        expect(actionOption.valid).toBe(true);

        const charOption = capturedChoice.options.find((o: any) => o.id === charCard.instanceId);
        expect(charOption).toBeDefined();
        expect(charOption.card).toBeDefined(); // Ensure even invalid options have the card for display
        expect(charOption.valid).toBe(false); // Should be false due to filter
    });
});
