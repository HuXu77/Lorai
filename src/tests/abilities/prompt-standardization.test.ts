
import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { ZoneType } from '../../engine/models';

describe('Prompt Standardization Tests', () => {
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

        // Mock requestChoice globally
        turnManager.requestChoice = vi.fn().mockResolvedValue({ selectedIds: ['yes'], declined: false });
    });

    const runEffect = async (effect: any, abilityName: string = 'TEST_ABILITY') => {
        const p1 = game.getPlayer(p1Id);
        const p2 = game.getPlayer(p2Id);

        // Setup dummy cards
        const card = { instanceId: 'c1', name: 'Source Card', ownerId: p1Id };
        const targetCard = { instanceId: 't1', name: 'Target Card', ownerId: p2Id, zone: ZoneType.Play, ready: true };
        p2.play = [targetCard];

        const context = {
            player: p1,
            card: card,
            gameState: game,
            abilityName: abilityName,
            abilityText: 'Full ability text here'
        };

        // If target is opponent card (common for banish/damage)
        if (effect.target === 'opponent_character') {
            // Mock target resolution
            executor.resolveTargets = vi.fn().mockResolvedValue([targetCard]);
        }

        // Run execution
        await executor.execute(effect, context);

        return turnManager.requestChoice;
    };

    it('should include ability name in Damage prompt', async () => {
        const effect = { type: 'damage', amount: 1, optional: true, target: 'opponent_character' };

        const mockFn = await runEffect(effect, 'FIREBALL');

        expect(mockFn).toHaveBeenCalled();
        const call = (mockFn as vi.Mock).mock.calls[0][0];

        console.log('Damage Prompt:', call.prompt);
        expect(call.prompt).toContain('FIREBALL');
        expect(call.prompt).toContain('deal 1 damage');
    });

    it('should include ability name in Banish prompt', async () => {
        const effect = { type: 'banish', optional: true, target: 'opponent_character' };

        const mockFn = await runEffect(effect, 'BANISHMENT');

        expect(mockFn).toHaveBeenCalled();
        const call = (mockFn as vi.Mock).mock.calls[0][0];

        console.log('Banish Prompt:', call.prompt);
        expect(call.prompt).toContain('BANISHMENT');
        expect(call.prompt).toContain('banish');
    });

    it('should include ability name in Exert prompt', async () => {
        const effect = { type: 'exert', optional: true, target: 'opponent_character' };

        const mockFn = await runEffect(effect, 'FREEZE');

        expect(mockFn).toHaveBeenCalled();
        const call = (mockFn as vi.Mock).mock.calls[0][0];

        console.log('Exert Prompt:', call.prompt);
        expect(call.prompt).toContain('FREEZE');
        expect(call.prompt).toContain('exert');
    });

    it('should include ability name in Ready prompt', async () => {
        const effect = { type: 'ready_card', optional: true, target: 'opponent_character' }; // usually own character, but logic same

        const mockFn = await runEffect(effect, 'UNTAP');

        expect(mockFn).toHaveBeenCalled();
        const call = (mockFn as vi.Mock).mock.calls[0][0];

        console.log('Ready Prompt:', call.prompt);
        expect(call.prompt).toContain('UNTAP');
        expect(call.prompt).toContain('ready');
    });

    it('should include ability name in PlayForFree prompt', async () => {
        const p1 = game.getPlayer(p1Id);
        p1.hand = [{ instanceId: 'h1', name: 'Hand Card', cost: 1, type: 'Character' }];

        const effect = { type: 'play_for_free', filter: { cardType: 'Character' } };

        // Manually setup context without helper to inject hand cards
        const context = {
            player: p1,
            card: { instanceId: 'c1', name: 'Source' },
            gameState: game,
            abilityName: 'FREE_PLAY'
        };

        // Mock requestTargetChoice (which calls requestChoice internally, OR effectively is the prompt source)
        // Wait, requestTargetChoice calls requestChoice.
        // We spied on turnManager.requestChoice.

        // We need to ensure requestTargetChoice actually triggers requestChoice.
        // It relies on turnManager being present.

        await executor.execute(effect, context);

        expect(turnManager.requestChoice).toHaveBeenCalled();
        const call = (turnManager.requestChoice as vi.Mock).mock.calls[0][0];

        console.log('PlayForFree Prompt:', call.prompt);
        expect(call.prompt).toContain('FREE_PLAY');
        expect(call.prompt).toContain('play for free');
    });
});
