
import { TurnManager, Phase } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { GameLogger } from '../../engine/logger';
import { AbilitySystemManager } from '../../engine/abilities/ability-system';
import { CardInstance, ZoneType } from '../../engine/models';
import { EffectExecutor } from '../../engine/abilities/executor';

describe('Lady - Miss Park Avenue Discard Return Bug', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let player: any;
    let executor: EffectExecutor;

    beforeEach(() => {
        game = new GameStateManager();
        player = game.getPlayer(game.addPlayer('player1', 'Player'));
        turnManager = new TurnManager(game, new GameLogger());
        (turnManager as any).eventBus = { emit: vi.fn() };
        turnManager.abilitySystem = new AbilitySystemManager(turnManager);
        executor = new EffectExecutor(turnManager);

        // Mock requestChoice to simulate user input
        turnManager.requestChoice = vi.fn();
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
        zone: ZoneType.Discard,
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

    it('should return chosen card from discard to hand', async () => {
        // 1. Setup Lady in play (source of effect)
        const lady = createCard('lady-instance', 'Lady - Miss Park Avenue', 1);
        lady.zone = ZoneType.Play;
        player.play = [lady];

        // 2. Setup setup target in discard
        const targetCard = createCard('target-card', 'Target Character', 2);
        player.discard = [targetCard];

        // 3. Define the effect (Exactly as parser output)
        const effect = {
            type: 'return_from_discard',
            // amount removed from root
            target: {
                type: 'chosen_card_in_discard', // Fixed Type!
                count: 1, // Fixed Count!
                upTo: true, // Fixed upTo!
                filter: { cardType: 'character', maxCost: 2, subtype: undefined }
            },
            destination: 'hand',
            optional: true
        };

        // 4. Mock the choice response
        // First choice: Optional "Yes"
        // Second choice: Target selection
        let choiceCallCount = 0;
        (turnManager.requestChoice as any).mockImplementation(async (req: any) => {
            choiceCallCount++;
            if (req.type === 'yes_no') return { selectedIds: ['yes'], declined: false };

            // Validate that we are getting the correct choice request type
            if (req.type === 'target_card_in_discard' || req.type === 'general_select') {
                return { selectedIds: [targetCard.instanceId], declined: false };
            }

            return { selectedIds: [], declined: true };
        });

        // 5. Execute effect
        await executor.execute(effect as any, {
            player,
            card: lady,
            gameState: game,
            eventContext: { event: 'TEST' } as any
        });

        // 6. Verify
        expect(player.hand).toHaveLength(1);
        expect(player.hand[0].instanceId).toBe(targetCard.instanceId);
        expect(player.discard).toHaveLength(0);
    });
});
