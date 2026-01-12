import { TurnManager, Phase } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { GameLogger } from '../../engine/logger';
import { AbilitySystemManager } from '../../engine/abilities/ability-system';
import { CardInstance, ZoneType, ChoiceRequest } from '../../engine/models';
import { executePlayCard } from '../../engine/game-actions/play-card-action';
import { GameEvent } from '../../engine/abilities/events';

describe('Lady - Miss Park Avenue Shift Bug', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let player: any;
    let opponent: any;

    beforeEach(() => {
        game = new GameStateManager();
        player = game.getPlayer(game.addPlayer('player1', 'Player'));
        opponent = game.getPlayer(game.addPlayer('player2', 'Opponent'));
        turnManager = new TurnManager(game, new GameLogger());
        (turnManager as any).eventBus = { emit: vi.fn() }; // Mock eventBus
        turnManager.abilitySystem = new AbilitySystemManager(turnManager);

        // Set phase to Main
        game.state.phase = Phase.Main;
        game.state.turnPlayerId = player.id;
    });

    const createCard = (id: string, name: string, cost: number, type: string = 'Character'): CardInstance => ({
        instanceId: id,
        id: 1,
        number: 1,
        setCode: 'TST',
        name,
        fullName: name,
        cost,
        type,
        color: 'Amber',
        inkwell: true,
        subtypes: [],
        ownerId: player.id,
        zone: ZoneType.Hand,
        ready: true,
        lore: 1,
        strength: 1,
        willpower: 1,
        damage: 0,
        turnPlayed: 0,
        meta: {},
        abilities: [],
        parsedEffects: []
    } as any);

    it('should trigger on-play ability when shifted (via event)', async () => {
        // 1. Setup Base Lady in play
        const baseLady = createCard('lady-base', 'Lady', 1);
        baseLady.zone = ZoneType.Play;
        baseLady.turnPlayed = 1; // Not drying
        player.play = [baseLady];

        // 2. Setup Lady - Miss Park Avenue in Hand with Shift keyword and on-play ability
        const shiftedLady = createCard('lady-shift', 'Lady - Miss Park Avenue', 5);
        shiftedLady.name = 'Lady'; // Name must match for shift
        shiftedLady.fullName = 'Lady - Miss Park Avenue';
        shiftedLady.parsedEffects = [
            // Shift keyword
            {
                action: 'keyword_shift',
                type: 'static',
                keyword: 'shift',
                amount: 3 // Shift cost
            },
            // On-play triggered ability (using event format from parser)
            {
                id: 'test-ability',
                cardId: '1',
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'return_from_discard',
                    amount: 2,
                    target: {
                        zone: 'discard',
                        destination: 'hand',
                        filter: { cardType: 'character', maxCost: 2 }
                    },
                    optional: true
                }],
                rawText: 'When you play this character, you may return up to 2 character cards with cost 2 or less each from your discard to your hand.'
            }
        ];
        player.hand = [shiftedLady];

        // 3. Setup Discard targets
        const target1 = createCard('t1', 'Target 1', 1);
        target1.zone = ZoneType.Discard;
        const target2 = createCard('t2', 'Target 2', 2);
        target2.zone = ZoneType.Discard;
        player.discard = [target1, target2];

        // 4. Setup Inkwell
        for (let i = 0; i < 5; i++) {
            const ink = createCard(`ink-${i}`, `Ink ${i}`, 1);
            ink.zone = ZoneType.Inkwell;
            ink.ready = true;
            player.inkwell.push(ink);
        }

        // 5. Track if resolveEffect was called
        let resolveEffectCalled = false;
        const originalResolveEffect = turnManager.resolveEffect.bind(turnManager);
        turnManager.resolveEffect = vi.fn(async (...args: any[]) => {
            resolveEffectCalled = true;
            // Don't actually execute, just track
            return undefined;
        });

        // 6. Perform Shift
        const result = await executePlayCard(
            turnManager,
            player,
            shiftedLady.instanceId,
            undefined, // singerId
            baseLady.instanceId, // shiftTargetId
            undefined, // targetId
            undefined  // payload
        );

        // 7. Verify
        expect(result).toBe(true);
        expect(resolveEffectCalled).toBe(true);

        // Verify the shifted card is in play
        expect(player.play.some((c: any) => c.instanceId === shiftedLady.instanceId)).toBe(true);

        // Verify base lady is no longer in play directly (replaced)
        expect(player.play.some((c: any) => c.instanceId === baseLady.instanceId)).toBe(false);
    });

    it('should emit CARD_PLAYED event when shifting', async () => {
        // 1. Setup Base Lady in play
        const baseLady = createCard('lady-base', 'Lady', 1);
        baseLady.zone = ZoneType.Play;
        baseLady.turnPlayed = 1;
        player.play = [baseLady];

        // 2. Setup Lady - Miss Park Avenue in Hand with Shift
        const shiftedLady = createCard('lady-shift', 'Lady - Miss Park Avenue', 5);
        shiftedLady.name = 'Lady';
        shiftedLady.parsedEffects = [
            { action: 'keyword_shift', type: 'static', keyword: 'shift', amount: 3 }
        ];
        player.hand = [shiftedLady];

        // 3. Setup Inkwell
        for (let i = 0; i < 5; i++) {
            const ink = createCard(`ink-${i}`, `Ink ${i}`, 1);
            ink.zone = ZoneType.Inkwell;
            ink.ready = true;
            player.inkwell.push(ink);
        }

        // 4. Spy on emitEvent
        const emitSpy = vi.spyOn(turnManager.abilitySystem, 'emitEvent');

        // 5. Perform Shift
        await executePlayCard(
            turnManager,
            player,
            shiftedLady.instanceId,
            undefined,
            baseLady.instanceId
        );

        // 6. Verify CARD_PLAYED was emitted
        expect(emitSpy).toHaveBeenCalledWith(
            GameEvent.CARD_PLAYED,
            expect.objectContaining({
                card: shiftedLady,
                player: player,
                wasShifted: true
            })
        );
    });
});
