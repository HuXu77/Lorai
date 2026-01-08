
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType, ZoneType } from '../../engine/models';
import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';

describe('Daisy Duck - Donald\'s Date Execution', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let executor: any;
    let p1Id: string;
    let p2Id: string;

    beforeEach(() => {
        game = new GameStateManager();
        p1Id = game.addPlayer('Player 1');
        p2Id = game.addPlayer('Player 2');
        turnManager = new TurnManager(game);
        executor = turnManager.abilitySystem.executor;
    });

    it('should execute reveal flow correctly', async () => {
        const p1 = game.getPlayer(p1Id);
        const p2 = game.getPlayer(p2Id);

        if (!p1) throw new Error(`Player 1 (id=${p1Id}) not found`);
        if (!p2) throw new Error(`Player 2 (id=${p2Id}) not found`);

        // Setup opponent deck
        const charCard = { instanceId: 'c1', name: 'Mickey', type: 'Character', zone: ZoneType.Deck, cost: 1 };

        // Scenario 1: Reveal Character -> Put in Hand
        p2.deck = [charCard] as any;
        p2.hand = [];

        const context = {
            player: p1,
            card: { instanceId: 'daisy', name: 'Daisy' },
            gameState: game
        };

        const effect = {
            type: 'opponent_reveal_top',
            target: { type: 'all_opponents' },
            conditional_put: { if_type: 'character', then: 'hand', else: 'bottom_of_deck' }
        };

        // Mock requestChoice
        turnManager.requestChoice = jest.fn().mockResolvedValue({
            selectedIds: ['hand']
        });

        await executor.execute(effect, context);

        expect(turnManager.requestChoice).toHaveBeenCalled();
        const call = (turnManager.requestChoice as jest.Mock).mock.calls[0][0];
        expect(call.type).toBe('reveal_and_decide');
        expect(call.context.revealedCard.name).toBe('Mickey');
        // New behavior: opponent gets 'acknowledge' option (informational reveal)
        // Card placement happens automatically based on card type
        expect(call.options).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: 'acknowledge' })
        ]));

        // Verify state update
        expect(p2.hand).toContain(charCard);
        expect(p2.deck).toHaveLength(0);
    });

    it('should force bottom of deck for non-character', async () => {
        const p1 = game.getPlayer(p1Id);
        const p2 = game.getPlayer(p2Id);

        if (!p1) throw new Error(`Player 1 (id=${p1Id}) not found`);

        // Setup opponent deck with Action
        const actionCard = { instanceId: 'a1', name: 'Smash', type: 'Action', zone: ZoneType.Deck, cost: 3 } as any;
        p2.deck = [actionCard];
        p2.hand = [];

        const context = {
            player: p1,
            card: { instanceId: 'daisy', name: 'Daisy' },
            gameState: game
        };

        const effect = {
            type: 'opponent_reveal_top',
            target: { type: 'all_opponents' },
            conditional_put: { if_type: 'character', then: 'hand', else: 'bottom_of_deck' }
        };

        // Mock requestChoice
        turnManager.requestChoice = jest.fn().mockResolvedValue({
            selectedIds: ['bottom']
        });

        await executor.execute(effect, context);

        const call = (turnManager.requestChoice as jest.Mock).mock.calls[0][0];
        // Expect only bottom option or visual confirmation
        // New behavior: opponent gets 'acknowledge' option (informational reveal)
        expect(call.options[0].id).toBe('acknowledge');

        // Verify state update
        expect(p2.hand).toHaveLength(0);
        expect(p2.deck[0]).toBe(actionCard);
    });
});
