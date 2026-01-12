import { EffectExecutor } from '../../../engine/abilities/executor';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { Player, ZoneType } from '../../../engine/models';
import { GameEvent } from '../../../engine/abilities/events';

// Mock dependencies
vi.mock('../../../engine/actions');

describe('Executor: Static Abilities & Conditional Buffs', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let p1: Player;

    const createCard = (id: string, name: string, type: string = 'character', subtypes: string[] = []) => ({
        instanceId: id,
        name,
        type,
        subtypes,
        zone: ZoneType.Play,
        ownerId: 'p1',
        damage: 0,
        strength: 2,
        willpower: 2,
        ready: true
    } as any);

    const setupPlayer = (id: string) => ({
        id,
        name: `Player ${id}`,
        deck: [],
        hand: [],
        discard: [],
        inkwell: [],
        play: [],
        lore: 0
    } as any);

    beforeEach(() => {
        vi.clearAllMocks();

        p1 = setupPlayer('p1');
        game = new GameStateManager();
        game.state = {
            players: { [p1.id]: p1 },
            turnPlayerId: p1.id,
            activeEffects: []
        };

        turnManager = new TurnManager(game);
        turnManager.game = game;
        turnManager.logger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        };
        turnManager.addActiveEffect.mockImplementation((effect: any) => {
            game.state.activeEffects.push(effect);
        });

        executor = new EffectExecutor(turnManager);
        executor.setTurnManager(turnManager);
    });

    describe('conditional_buff_subtype_in_play', () => {
        it('should register passive buff while subtype in play', async () => {
            const card = createCard('c1', 'Test Card', 'character', ['Hero']);
            p1.play = [card];

            const effect = {
                type: 'conditional_buff_subtype_in_play',
                subtype: 'Princess',
                strength: 2,
                willpower: 1
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() }
            });

            expect(game.state.activeEffects.length).toBe(1);
            expect(game.state.activeEffects[0].type).toBe('conditional_buff_subtype_in_play');
            expect(game.state.activeEffects[0].subtype).toBe('Princess');

            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('conditional buff while Princess'),
                expect.anything()
            );
        });
    });

    describe('stat_buff_per_damage', () => {
        it('should register damage-scaling buff', async () => {
            const card = createCard('c1', 'Growing Beast');
            card.damage = 3;
            p1.play = [card];

            const effect = {
                type: 'stat_buff_per_damage',
                strengthPerDamage: 1,
                willpowerPerDamage: 0
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() }
            });

            expect(game.state.activeEffects.length).toBe(1);
            expect(game.state.activeEffects[0].type).toBe('stat_buff_per_damage');
            expect(game.state.activeEffects[0].strengthPerDamage).toBe(1);

            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('damage-scaling buff'),
                expect.anything()
            );
        });
    });

    describe('conditional_gain_keyword_while_damaged', () => {
        it('should register conditional keyword', async () => {
            const card = createCard('c1', 'Angry Character');
            p1.play = [card];

            const effect = {
                type: 'conditional_gain_keyword_while_damaged',
                keyword: 'Challenger'
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() }
            });

            expect(game.state.activeEffects.length).toBe(1);
            expect(game.state.activeEffects[0].keyword).toBe('Challenger');

            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Challenger while damaged')
            );
        });
    });

    describe('singing_power_buff', () => {
        it('should register singing power buff', async () => {
            const card = createCard('c1', 'Vocalist');
            p1.play = [card];

            const effect = {
                type: 'singing_power_buff',
                amount: 3
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() }
            });

            expect(game.state.activeEffects.length).toBe(1);
            expect(game.state.activeEffects[0].amount).toBe(3);

            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('singing power buff: +3')
            );
        });
    });
});
