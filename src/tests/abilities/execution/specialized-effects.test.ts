import { EffectExecutor } from '../../../engine/abilities/executor';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { Player, ZoneType } from '../../../engine/models';
import { GameEvent } from '../../../engine/abilities/events';

// Mock dependencies
vi.mock('../../../engine/actions');

describe('Executor: Specialized Effects - Final 100% Coverage', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let p1: Player;

    const createCard = (id: string, name: string, opts: any = {}) => ({
        instanceId: id,
        name,
        type: opts.type || 'character',
        zone: opts.zone || ZoneType.Play,
        ownerId: 'p1',
        damage: opts.damage || 0,
        cost: opts.cost || 3,
        ...opts
    } as any);

    const setupPlayer = (id: string) => ({
        id,
        name: `Player ${id}`,
        deck: [],
        hand: [],
        discard: [],
        inkwell: [],
        play: [],
        lore: 10
    } as any);

    beforeEach(() => {
        vi.clearAllMocks();

        p1 = setupPlayer('p1');
        game = new GameStateManager();
        game.state = {
            players: { [p1.id]: p1 },
            turnPlayerId: p1.id,
            activeEffects: [],
            winCondition: 'lore'
        };

        game.getOpponents = vi.fn(() => []);

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

        executor = new EffectExecutor(turnManager);
        executor.setTurnManager(turnManager);
    });

    describe('Return Mechanics', () => {
        it('should return damaged characters to hand', async () => {
            const damaged = createCard('c1', 'Damaged', { damage: 3 });
            const healthy = createCard('c2', 'Healthy', { damage: 0 });
            p1.play = [damaged, healthy];

            await executor.execute({
                type: 'return_damaged_character_to_hand',
                target: { type: 'self' }
            }, {
                player: p1,
                card: damaged,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.hand.length).toBe(1);
            expect(p1.hand[0].instanceId).toBe('c1');
            expect(p1.play.length).toBe(1);
        });

        it('should return multiple items to hand', async () => {
            const item1 = createCard('i1', 'Item 1', { type: 'item' });
            const item2 = createCard('i2', 'Item 2', { type: 'item' });
            const char = createCard('c1', 'Character');
            p1.play = [item1, item2, char];

            await executor.execute({ type: 'return_multiple_items', amount: 2 }, {
                player: p1,
                card: char,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.hand.length).toBe(2);
            expect(p1.play.length).toBe(1);
        });
    });

    describe('Reveal & Play Mechanics', () => {
        it('should reveal and put multiple cards', async () => {
            const topCard1 = createCard('d1', 'Top1');
            const topCard2 = createCard('d2', 'Top2');
            p1.deck = [topCard1, topCard2];

            await executor.execute({
                type: 'reveal_and_put_multiple',
                amount: 2,
                destination: 'hand'
            }, {
                player: p1,
                card: createCard('c1', 'Revealer'),
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.hand.length).toBe(2);
            expect(p1.deck.length).toBe(0);
        });

        it('should reveal top and play if name matches', async () => {
            const topCard = createCard('d1', 'Mickey Mouse');
            p1.deck = [topCard];

            await executor.execute({
                type: 'reveal_top_and_play_if_name',
                cardName: 'Mickey Mouse'
            }, {
                player: p1,
                card: createCard('c1', 'Revealer'),
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.play.length).toBe(1);
            expect(p1.play[0].name).toBe('Mickey Mouse');
            expect(p1.deck.length).toBe(0);
        });
    });

    describe('Conditional Play', () => {
        it('should play card from hand', async () => {
            const handCard = createCard('h1', 'Hand Card', { zone: ZoneType.Hand });
            p1.hand = [handCard];

            await executor.execute({ type: 'play_from_hand' }, {
                player: p1,
                card: createCard('c1', 'Player'),
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.play.length).toBe(1);
            expect(p1.hand.length).toBe(0);
        });

        it('should play named card for free', async () => {
            const elsa = createCard('h1', 'Elsa', { zone: ZoneType.Hand });
            p1.hand = [elsa];

            await executor.execute({
                type: 'play_named_card_free',
                cardName: 'Elsa'
            }, {
                player: p1,
                card: createCard('c1', 'Player'),
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.play.length).toBe(1);
            expect(p1.play[0].name).toBe('Elsa');
        });
    });

    describe('Lore & Challenge', () => {
        it('should lose lore equal to stat', async () => {
            const card = createCard('c1', 'Costly', { cost: 5 });
            p1.play = [card];
            p1.lore = 10;

            await executor.execute({
                type: 'lose_lore_equal_to_stat',
                stat: 'cost'
            }, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.lore).toBe(5); // 10 - 5 = 5
        });
    });
});
