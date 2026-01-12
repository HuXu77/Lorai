import { EffectExecutor } from '../../../engine/abilities/executor';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { Player, ZoneType } from '../../../engine/models';
import { GameEvent } from '../../../engine/abilities/events';

// Mock dependencies
vi.mock('../../../engine/actions');

describe('Executor: Aliases and Combos', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let p1: Player;
    let p2: Player;

    // Test Helpers
    const createCard = (id: string, name: string, type: string = 'character', damage: number = 0) => ({
        instanceId: id,
        name,
        type,
        zone: ZoneType.Play,
        ready: true,
        damage,
        subtypes: [],
        ownerId: 'p1' // Defaulting to p1 for simplicity in this test suite
    } as any);

    const setupPlayer = (id: string, name: string) => ({
        id,
        name,
        deck: [],
        hand: [],
        discard: [],
        inkwell: [],
        play: []
    } as any);

    beforeEach(() => {
        vi.clearAllMocks();

        p1 = setupPlayer('p1', 'Player 1');
        p2 = setupPlayer('p2', 'Player 2');

        game = new GameStateManager();
        game.state = {
            players: { [p1.id]: p1, [p2.id]: p2 }
        };

        turnManager = new TurnManager(game);
        turnManager.game = game;
        turnManager.logger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        };
        turnManager.drawCards = vi.fn((playerOrId, amt) => {
            // Handler passes player.id, not player object
            const p = typeof playerOrId === 'string' ? (playerOrId === p1.id ? p1 : p2) : playerOrId;
            if (!p || !p.deck) return; // Guard against undefined player
            for (let i = 0; i < amt; i++) {
                if (p.deck.length > 0) p.hand.push(p.deck.pop());
            }
        });

        executor = new EffectExecutor(turnManager);
        executor.setTurnManager(turnManager);
    });

    describe('Alias: remove_damage -> heal', () => {
        it('should treat remove_damage as heal', async () => {
            const card = createCard('c1', 'Damaged Card', 'character', 3);
            p1.play = [card];

            // Mock resolveTargets to return the card
            // Mock resolveTargets directly on executor
            vi.spyOn(executor as any, 'resolveTargets').mockReturnValue([card]);

            const effect = {
                type: 'remove_damage',
                amount: 2,
                target: { type: 'chosen' }
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() } // ANY because actual enum might be different logic
            });

            // The executor should map 'remove_damage' to 'heal' logic.
            // If 'executeHeal' is called, damage should decrease.
            // Note: We need to implement the alias in executor.ts first for this to work.
            // Assuming we will implement: case 'remove_damage': await this.executeHeal(effect, context);

            // However, heal handler usually checks for 'heal' type?
            // If we alias, we might need to change effect.type or have handler support both.
            // Let's verify expectation:
            expect(card.damage).toBe(1); // 3 - 2 = 1
        });
    });

    describe('Alias: return_self -> return_to_hand', () => {
        it('should return self to hand', async () => {
            const card = createCard('c1', 'Self Card', 'character');
            p1.play = [card];

            const effect = {
                type: 'return_self'
            } as any;

            // Mock resolveTargets for return_to_hand if necessary, but 'return_self' implies target is source.
            // The alias implementation should probably synthesize a target or direct call.

            expect(card.ownerId).toBe('p1');
            expect(game.getPlayer('p1')).toBeDefined();

            await executor.execute(effect, {
                player: p1,
                card: card, // The source card
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            expect(p1.play).not.toContain(card);
            expect(p1.hand).toContain(card);
            expect(card.zone).toBe(ZoneType.Hand);
        });
    });

    describe('Combo: headless_horseman_combo', () => {
        it('should shuffle hand into deck and draw 3', async () => {
            // Setup: Hand has 2 cards, Deck has 5.
            const h1 = createCard('h1', 'Hand 1', 'action');
            const h2 = createCard('h2', 'Hand 2', 'action');
            p1.hand = [h1, h2];

            const d1 = createCard('d1', 'Deck 1', 'character');
            const d2 = createCard('d2', 'Deck 2', 'character');
            const d3 = createCard('d3', 'Deck 3', 'character');
            const d4 = createCard('d4', 'Deck 4', 'character');
            const d5 = createCard('d5', 'Deck 5', 'character');
            p1.deck = [d1, d2, d3, d4, d5];

            const effect = {
                type: 'headless_horseman_combo'
            } as any;

            await executor.execute(effect, {
                player: p1,
                card: {} as any,
                gameState: game,
                eventContext: { event: GameEvent.ABILITY_ACTIVATED, timestamp: Date.now() }
            });

            // Expectation:
            // 1. Hand shuffled into deck. Total deck size was 5 + 2 = 7.
            // 2. Then draw 3. Remaining deck = 4. Hand size = 3.

            expect(p1.hand).toHaveLength(3);
            expect(p1.deck).toHaveLength(4);

            // Verify h1/h2 are potentially in deck or hand (they were moved to deck).
            // We can't strictly assert where they are due to shuffle/draw random, but total counts match.
            expect(turnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('Headless Horseman Combo'),
                expect.anything()
            );
        });
    });
});
