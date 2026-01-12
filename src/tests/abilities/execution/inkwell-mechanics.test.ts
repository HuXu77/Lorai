import { EffectExecutor } from '../../../engine/abilities/executor';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { Player, ZoneType } from '../../../engine/models';
import { GameEvent } from '../../../engine/abilities/events';

// Mock dependencies
vi.mock('../../../engine/actions');

describe('Executor: Inkwell & Special Mechanics', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let p1: Player;

    const createCard = (id: string, name: string) => ({
        instanceId: id,
        name,
        type: 'character',
        zone: ZoneType.Hand,
        ownerId: 'p1',
        exerted: false,
        inkable: false
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
            namedCards: []
        };

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

    describe('hand_to_inkwell_all', () => {
        it('should move all hand cards to inkwell', async () => {
            const card1 = createCard('c1', 'Card 1');
            const card2 = createCard('c2', 'Card 2');
            const card3 = createCard('c3', 'Card 3');
            p1.hand = [card1, card2, card3];

            const effect = {
                type: 'hand_to_inkwell_all'
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card1,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() }
            });

            expect(p1.hand.length).toBe(0);
            expect(p1.inkwell.length).toBe(3);
            expect(p1.inkwell[0].zone).toBe(ZoneType.Inkwell);

            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Moved 3 cards from hand to inkwell')
            );
        });
    });

    describe('grant_inkable', () => {
        it('should grant inkable to target cards', async () => {
            const card1 = createCard('c1', 'Target Card');
            card1.zone = ZoneType.Play;
            p1.play = [card1];

            const effect = {
                type: 'grant_inkable',
                target: { type: 'self' }
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card1,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() }
            });

            expect(card1.inkable).toBe(true);

            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Granted inkable')
            );
        });
    });

    describe('add_name', () => {
        it('should track named cards for shift', async () => {
            const card = createCard('c1', 'Namer');
            p1.play = [card];

            const effect = {
                type: 'add_name',
                name: 'Mickey Mouse'
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() }
            });

            expect(game.state.namedCards).toContain('Mickey Mouse');

            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Added name: Mickey Mouse')
            );
        });
    });

    describe('name_and_reveal', () => {
        it('should log name and reveal action', async () => {
            const card = createCard('c1', 'Guesser');
            p1.play = [card];

            const effect = {
                type: 'name_and_reveal'
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: card,
                gameState: game,
                eventContext: { event: GameEvent.CARD_PLAYED, timestamp: Date.now() },
                payload: { name: 'Elsa' }
            });

            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Named "Elsa"')
            );
        });
    });
});
