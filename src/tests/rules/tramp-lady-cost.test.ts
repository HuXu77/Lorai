import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType } from '../../engine/models';

describe('Tramp/Lady Cost Reduction Bug', () => {
    let stateManager: GameStateManager;
    let turnManager: TurnManager;
    let player1: any;
    let player2: any;

    const createCard = (overrides: Partial<CardInstance> = {}): CardInstance => ({
        instanceId: `card_${Math.random().toString(36).substr(2, 9)}`,
        id: 1,
        number: 1,
        setCode: '1',
        fullName: 'Test Card',
        name: 'Test',
        version: 'Test',
        cost: 1,
        type: 'Character',
        color: 'Amber',
        inkwell: true,
        subtypes: [],
        strength: 1,
        willpower: 1,
        lore: 1,
        damage: 0,
        ready: true,
        ownerId: 'player1',
        zone: 'Hand' as any,
        turnPlayed: 0,
        meta: {},
        abilities: [],
        ...overrides
    } as CardInstance);

    beforeEach(() => {
        stateManager = new GameStateManager();
        const mockLogger = {
            info: jest.fn(),
            action: jest.fn(),
            effect: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            getLogs: () => []
        };
        turnManager = new TurnManager(stateManager, mockLogger as any);

        player1 = stateManager.addPlayer('player1', 'Player 1');
        player1 = stateManager.getPlayer('player1');
        player2 = stateManager.addPlayer('player2', 'Player 2');
        player2 = stateManager.getPlayer('player2');
    });

    it('should parse Tramp cost reduction ability correctly', () => {
        const trampCard = createCard({
            fullName: "Tramp - Enterprising Dog",
            name: "Tramp",
            cost: 2,
            abilities: [
                {
                    fullText: "HEY, PIDGE If you have a character named Lady in play, you pay 1 ⬡ less to play this character.",
                    name: "HEY, PIDGE",
                    type: "static"
                }
            ]
        });

        const parsed = parseToAbilityDefinition(trampCard);
        console.log('Parsed Tramp abilities:', JSON.stringify(parsed, null, 2));

        expect(parsed.length).toBeGreaterThan(0);

        const staticAbility = parsed.find(a => a.type === 'static');
        expect(staticAbility).toBeDefined();

        // Check effects array
        expect(staticAbility?.effects).toBeDefined();
        expect(staticAbility?.effects?.length).toBeGreaterThan(0);

        const effect = staticAbility?.effects?.[0];
        console.log('Cost reduction effect:', JSON.stringify(effect, null, 2));

        // Should have condition of type 'presence'
        expect(effect?.condition).toBeDefined();
        expect(effect?.condition?.type).toBe('presence');
        expect(effect?.condition?.filter?.name).toBe('Lady');
    });

    it('should reduce Tramp cost when Lady is in play', () => {
        // Create Lady card and put in play
        const ladyCard = createCard({
            fullName: "Lady - Elegant Spaniel",
            name: "Lady",
            cost: 1,
            ownerId: 'player1',
            zone: 'Play' as any
        });
        player1.play.push(ladyCard);
        turnManager.abilitySystem.registerCard(ladyCard);

        // Create Tramp card with parsed effects
        const trampCard = createCard({
            fullName: "Tramp - Enterprising Dog",
            name: "Tramp",
            cost: 2,
            ownerId: 'player1',
            zone: 'Hand' as any,
            abilities: [
                {
                    fullText: "HEY, PIDGE If you have a character named Lady in play, you pay 1 ⬡ less to play this character.",
                    name: "HEY, PIDGE",
                    type: "static"
                }
            ]
        });

        // Parse and attach effects
        trampCard.parsedEffects = parseToAbilityDefinition(trampCard);
        console.log('Tramp parsedEffects:', JSON.stringify(trampCard.parsedEffects, null, 2));

        player1.hand.push(trampCard);

        // Check modified cost
        const modifiedCost = turnManager.abilitySystem.getModifiedCost(trampCard, player1);
        console.log(`Base cost: ${trampCard.cost}, Modified cost: ${modifiedCost}`);
        console.log(`Lady in play: ${player1.play.map((c: any) => c.fullName).join(', ')}`);

        // Should be 1 (base 2 - 1 reduction)
        expect(modifiedCost).toBe(1);
    });

    it('should NOT reduce Tramp cost when Lady is NOT in play', () => {
        // Create Tramp card with parsed effects (no Lady in play)
        const trampCard = createCard({
            fullName: "Tramp - Enterprising Dog",
            name: "Tramp",
            cost: 2,
            ownerId: 'player1',
            zone: 'Hand' as any,
            abilities: [
                {
                    fullText: "HEY, PIDGE If you have a character named Lady in play, you pay 1 ⬡ less to play this character.",
                    name: "HEY, PIDGE",
                    type: "static"
                }
            ]
        });

        trampCard.parsedEffects = parseToAbilityDefinition(trampCard);
        player1.hand.push(trampCard);

        // Check modified cost
        const modifiedCost = turnManager.abilitySystem.getModifiedCost(trampCard, player1);
        console.log(`Base cost: ${trampCard.cost}, Modified cost: ${modifiedCost} (no Lady)`);

        // Should still be 2 (no reduction)
        expect(modifiedCost).toBe(2);
    });
});
