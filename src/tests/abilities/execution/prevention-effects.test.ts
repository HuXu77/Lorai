import { EffectExecutor } from '../../../engine/abilities/executor';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { Player, ZoneType } from '../../../engine/models';
import { GameEvent } from '../../../engine/abilities/events';

// Mock dependencies
vi.mock('../../../engine/actions');

describe('Executor: Prevention & Restriction Effects', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let p1: Player;
    let p2: Player;

    const createCard = (id: string, name: string) => ({
        instanceId: id,
        name,
        type: 'character',
        zone: ZoneType.Play,
        ownerId: 'p1',
        strength: 3,
        willpower: 3
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
        p2 = setupPlayer('p2');
        game = new GameStateManager();
        game.state = {
            players: { [p1.id]: p1, [p2.id]: p2 },
            turnPlayerId: p1.id,
            activeEffects: []
        };

        game.getOpponents = vi.fn((id) => id === 'p1' ? [p2] : [p1]);

        turnManager = new TurnManager(game);
        turnManager.game = game;
        turnManager.logger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            action: vi.fn(),
            effect: vi.fn()
        };
        turnManager.addActiveEffect = vi.fn((effect) => {
            game.state.activeEffects.push(effect);
        });

        executor = new EffectExecutor(turnManager);
        executor.setTurnManager(turnManager);
    });

    describe('prevent_discard', () => {
        it('should register prevention for target cards', async () => {
            const card = createCard('c1', 'Protected Card');
            p1.play = [card];

            const effect = {
                type: 'prevent_discard',
                target: { type: 'self' }
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() }
            });

            expect(game.state.activeEffects.length).toBe(1);
            expect(game.state.activeEffects[0].type).toBe('prevent_discard');
            expect(game.state.activeEffects[0].targetIds).toContain('c1');

            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Preventing discard')
            );
        });
    });

    describe('prevent_play', () => {
        it('should register play prevention', async () => {
            const card = createCard('c1', 'Restrictive Card');
            p1.play = [card];

            const effect = {
                type: 'prevent_play',
                filter: { type: 'action' }
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() }
            });

            expect(game.state.activeEffects.length).toBe(1);
            expect(game.state.activeEffects[0].type).toBe('prevent_play');

            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Preventing play')
            );
        });
    });

    describe('play_trigger_draw_opponent', () => {
        it('should draw cards for opponent when played', async () => {
            const card = createCard('c1', 'Generous Card');
            const deckCard1 = createCard('d1', 'Deck Card 1');
            const deckCard2 = createCard('d2', 'Deck Card 2');
            p2.deck = [deckCard1, deckCard2];
            p1.play = [card];

            const effect = {
                type: 'play_trigger_draw_opponent',
                amount: 2
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() }
            });

            expect(p2.hand.length).toBe(2);
            expect(p2.deck.length).toBe(0);

            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Opponent drew 2 card(s)')
            );
        });
    });

    describe('play_action_trigger_buff', () => {
        it('should buff targets when action played', async () => {
            const card = createCard('c1', 'Action Card');
            const targetCard = createCard('c2', 'Target');
            p1.play = [card, targetCard];

            const effect = {
                type: 'play_action_trigger_buff',
                target: { type: 'self' },
                strength: 2,
                willpower: 1
            } as any;

            const initialStrength = card.strength;
            const initialWillpower = card.willpower;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() }
            });

            expect(card.strength).toBe(initialStrength + 2);
            expect(card.willpower).toBe(initialWillpower + 1);

            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Action play trigger'),
                expect.objectContaining({ strength: 2, willpower: 1 })
            );
        });
    });
});
