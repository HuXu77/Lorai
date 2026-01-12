
import { EffectExecutor } from '../../../engine/abilities/executor';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { Player, ZoneType } from '../../../engine/models';
import { GameEvent } from '../../../engine/abilities/events';

// Mock dependencies
vi.mock('../../../engine/actions');

describe('Executor: Challenge & Combat Mechanics', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let p1: Player;
    let p2: Player;

    // Test Helpers
    const createCard = (id: string, name: string, ownerId: string, strength: number = 1, willpower: number = 2) => ({
        instanceId: id,
        name,
        type: 'character',
        cost: 1,
        zone: ZoneType.Play,
        ready: true,
        damage: 0,
        strength,
        willpower,
        ownerId,
        keywords: []
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
            players: {
                [p1.id]: p1,
                [p2.id]: p2
            },
            turnPlayerId: p1.id
        };

        turnManager = new TurnManager(game);
        turnManager.game = game;
        turnManager.logger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        };

        // Mock game.addCardToZone
        game.addCardToZone = vi.fn((player, card, zone) => {
            card.zone = zone;
            if (zone === ZoneType.Discard) {
                // Remove from play
                const idx = player.play.indexOf(card);
                if (idx > -1) player.play.splice(idx, 1);

                player.discard.push(card);
            }
            return card;
        });

        // Mock getPlayer
        game.getPlayer = vi.fn((id) => game.state.players[id]);

        executor = new EffectExecutor(turnManager);
        executor.setTurnManager(turnManager);
    });

    describe('challenge_banish_both', () => {
        it('should banish both attacker and defender', async () => {
            const attacker = createCard('c1', 'Attacker', 'p1');
            const defender = createCard('c2', 'Defender', 'p2');

            p1.play = [attacker];
            p2.play = [defender];

            const effect = {
                type: 'challenge_banish_both'
            } as any;

            // Assume effect happens during challenge
            // context.card = source (attacker? or defender?)
            // eventContext.attacker / defender set.

            await executor.execute(effect, {
                player: p1,
                card: attacker,
                gameState: game,
                eventContext: {
                    event: GameEvent.CARD_CHALLENGES, // or resolved
                    timestamp: Date.now(),
                    attacker: attacker,
                    defender: defender
                }
            });

            expect(game.addCardToZone).toHaveBeenCalledWith(p1, attacker, ZoneType.Discard);
            expect(game.addCardToZone).toHaveBeenCalledWith(p2, defender, ZoneType.Discard);
        });
    });

    describe('damage_on_being_challenged', () => {
        it('should deal damage to challenger', async () => {
            const attacker = createCard('c1', 'Challenger', 'p1', 2, 4);
            const defender = createCard('c2', 'Defender', 'p2', 1, 4); // Has the ability

            p1.play = [attacker];
            p2.play = [defender];

            const effect = {
                type: 'damage_on_being_challenged',
                amount: 2
            } as any;

            await executor.execute(effect, {
                player: p2, // Defender owns effect
                card: defender,
                gameState: game,
                eventContext: {
                    event: GameEvent.CARD_CHALLENGED,
                    timestamp: Date.now(),
                    attacker: attacker,
                    defender: defender
                }
            });

            expect(attacker.damage).toBe(2);
            expect(turnManager.logger.info).toHaveBeenCalledWith(expect.stringContaining('Dealing 2 damage'));
        });
    });
});
