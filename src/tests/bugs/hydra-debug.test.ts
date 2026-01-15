
import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType, CardType, ChoiceType } from '../../engine/models';
import { GameEvent } from '../../engine/abilities/events';
import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Hydra - Deadly Serpent Bug', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let p1: any;
    let p2: any;
    let hydra: CardInstance;
    let enemy: CardInstance;
    let attacker: CardInstance;

    beforeEach(() => {
        game = new GameStateManager();
        turnManager = new TurnManager(game);
        p1 = game.getPlayer(game.addPlayer('Player 1')); // Hydra Controller
        p2 = game.getPlayer(game.addPlayer('Player 2')); // Enemy Controller

        turnManager.startGame('Player 1');

        const hydraDef = {
            id: 'hydra-1',
            name: 'Hydra',
            fullName: 'Hydra - Deadly Serpent',
            cost: 6,
            inkwell: false,
            type: 'Character' as CardType,
            color: 'Ruby',
            strength: 6,
            willpower: 5,
            lore: 2,
            fullTextSections: [
                "WATCH THE TEETH Whenever this character is dealt damage, deal that much damage to chosen opposing character."
            ]
        };

        const enemyDef = {
            id: 'enemy-1',
            name: 'Target Dummy',
            fullName: 'Target Dummy',
            cost: 1,
            inkwell: true,
            type: 'Character' as CardType,
            color: 'Steel',
            strength: 1,
            willpower: 10,
            lore: 0,
            fullTextSections: []
        };

        const attackerDef = {
            id: 'attacker-1',
            name: 'Poking Stick',
            fullName: 'Poking Stick',
            cost: 1,
            inkwell: true,
            type: 'Character' as CardType,
            color: 'Steel',
            strength: 3,
            willpower: 3,
            lore: 0,
            fullTextSections: []
        };

        // Parse and setup Hydra
        hydra = { ...hydraDef, instanceId: 'hydra-instance', ownerId: p1.id, zone: ZoneType.Play, ready: false, damage: 0 } as any;
        hydra.parsedEffects = parseToAbilityDefinition(hydraDef);
        console.log('Hydra Parsed Effects:', JSON.stringify(hydra.parsedEffects, null, 2));

        turnManager.abilitySystem.registerCard(hydra);
        p1.play.push(hydra);

        // Enemy Character to damage Hydra
        attacker = { ...attackerDef, instanceId: 'attacker-instance', ownerId: p2.id, zone: ZoneType.Play, ready: true, damage: 0 } as any;
        p2.play.push(attacker);

        // Enemy Character to be targeted by Hydra
        enemy = { ...enemyDef, instanceId: 'enemy-instance', ownerId: p2.id, zone: ZoneType.Play, ready: true, damage: 0 } as any;
        p2.play.push(enemy);
    });

    it('should trigger "Watch the Teeth" when dealt combat damage', async () => {
        // Attack Hydra with Poking Stick
        // Hydra takes 3 damage. Should deal 3 damage to chosen target.

        // Mock choice handler for P1 to select 'enemy'
        let choiceRequest: any;
        turnManager.registerChoiceHandler(p1.id, async (req) => {
            choiceRequest = req;
            return {
                requestId: req.id,
                playerId: req.playerId,
                selectedIds: [enemy.instanceId],
                timestamp: Date.now()
            };
        });

        // Execute challenge
        await turnManager.challenge(p2, attacker.instanceId, hydra.instanceId);

        // 1. Verify damage to Hydra
        expect(hydra.damage).toBe(3);

        // 2. Verify Choice Request happened
        expect(choiceRequest).toBeDefined();
        if (choiceRequest) {
            expect(choiceRequest.prompt).toMatch(/choose/i);
        }

        // 3. Verify Damage Transfer to Enemy
        expect(enemy.damage).toBe(3);
    });

    it('should trigger correctly via manual applyDamage', async () => {
        // Mock choice handler for P1 to select 'enemy'
        let choiceRequest: any;
        turnManager.registerChoiceHandler(p1.id, async (req) => {
            choiceRequest = req;
            return {
                requestId: req.id,
                playerId: req.playerId,
                selectedIds: [enemy.instanceId],
                timestamp: Date.now()
            };
        });

        // Apply direct damage
        turnManager.applyDamage(p2, hydra, 2, 'debug-source');

        // 1. Verify damage
        expect(hydra.damage).toBe(2);

        // We need to wait for the event loop
        await new Promise(resolve => setTimeout(resolve, 10));

        // 2. Verify effect trigger
        expect(choiceRequest).toBeDefined();
        expect(enemy.damage).toBe(2);
    });
});
