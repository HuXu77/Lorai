import { EffectExecutor } from '../../../engine/abilities/executor';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { Player, ZoneType } from '../../../engine/models';
import { GameEvent } from '../../../engine/abilities/events';

// Mock dependencies
vi.mock('../../../engine/actions');

describe('Executor: Utility & Miscellaneous Effects', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let p1: Player;
    let p2: Player;

    const createCard = (id: string, name: string, cost: number = 3) => ({
        instanceId: id,
        name,
        type: 'character',
        zone: ZoneType.Play,
        ownerId: 'p1',
        cost,
        strength: 2,
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
            deckLimits: {},
            deckSizeLimit: 60
        };

        game.getOpponents = vi.fn((id) => id === 'p1' ? [p2] : [p1]);

        turnManager = new TurnManager(game);
        turnManager.game = game;
        turnManager.logger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        };

        executor = new EffectExecutor(turnManager);
        executor.setTurnManager(turnManager);
    });

    describe('cards_in_hand', () => {
        it('should query hand size and store in context', async () => {
            const card = createCard('c1', 'Test Card');
            p1.hand = [createCard('h1', 'Hand1'), createCard('h2', 'Hand2'), createCard('h3', 'Hand3')];

            const contextWithVars = {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() },
                variables: {}
            };

            const effect = { type: 'cards_in_hand' } as any;

            await executor.execute(effect, contextWithVars);

            expect((contextWithVars.variables as any).cards_in_hand).toBe(3);
            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Cards in hand: 3')
            );
        });
    });

    describe('attribute_of_target', () => {
        it('should query attribute from target', async () => {
            const card = createCard('c1', 'Querier', 5);
            const target = createCard('c2', 'Target', 7);
            p1.play = [card, target];

            const contextWithVars = {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() },
                variables: {}
            };

            const effect = {
                type: 'attribute_of_target',
                target: { type: 'self' },
                attribute: 'cost'
            } as any;

            await executor.execute(effect, contextWithVars);

            expect((contextWithVars.variables as any).attribute_value).toBe(5);
        });
    });

    describe('deck_limit_increase', () => {
        it('should increase deck size limit', async () => {
            const card = createCard('c1', 'Limit Increaser');
            p1.play = [card];

            const effect = {
                type: 'deck_limit_increase',
                amount: 10
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() }
            });

            expect(game.state.deckSizeLimit).toBe(70);
            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Deck size limit increased by 10 to 70')
            );
        });
    });

    describe('ink', () => {
        it('should add ink by moving cards from deck to inkwell', async () => {
            const card = createCard('c1', 'Ink Gainer');
            const deckCard1 = createCard('d1', 'Deck1');
            const deckCard2 = createCard('d2', 'Deck2');
            p1.deck = [deckCard1, deckCard2];
            p1.play = [card];

            const effect = {
                type: 'ink',
                amount: 2
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() }
            });

            expect(p1.deck.length).toBe(0);
            expect(p1.inkwell.length).toBe(2);
            expect(p1.inkwell[0].zone).toBe('inkwell');

            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Gained 2 ink')
            );
        });
    });

    describe('lore', () => {
        it('should grant lore directly', async () => {
            const card = createCard('c1', 'Lore Gainer');
            p1.play = [card];
            p1.lore = 5;

            const effect = {
                type: 'lore',
                amount: 3
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() }
            });

            expect(p1.lore).toBe(8);
            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Gained 3 lore (total: 8)')
            );
        });
    });

    describe('grant_activated_ability', () => {
        it('should grant activated ability to target', async () => {
            const card = createCard('c1', 'Ability Granter');
            const target = createCard('c2', 'Target');
            p1.play = [card, target];

            const newAbility = { type: 'exert', cost: 1 };

            const effect = {
                type: 'grant_activated_ability',
                target: { type: 'self' },
                ability: newAbility
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() }
            });

            expect(card.grantedAbilities).toBeDefined();
            expect(card.grantedAbilities.length).toBe(1);
            expect(card.grantedAbilities[0]).toEqual(newAbility);
        });
    });
});
