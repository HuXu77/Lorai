import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType } from '../../engine/models';

describe('Tramp/Lady Cost Reduction Bug', () => {
    let stateManager: GameStateManager;
    let turnManager: TurnManager;
    let player1: any;

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
        zone: ZoneType.Hand,
        turnPlayed: 0,
        meta: {},
        abilities: [],
        ...overrides
    } as CardInstance);

    beforeEach(() => {
        stateManager = new GameStateManager();
        const mockLogger = {
            info: vi.fn(),
            action: vi.fn(),
            effect: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            getLogs: () => []
        };
        turnManager = new TurnManager(stateManager, mockLogger as any);

        player1 = stateManager.addPlayer('player1', 'Player 1');
        player1 = stateManager.getPlayer('player1');
        stateManager.addPlayer('player2', 'Player 2');
    });

    it('should maintain cost reduction for second Tramp after first is played', () => {
        // 1. Setup Lady in play
        const ladyCard = createCard({
            fullName: "Lady - Elegant Spaniel",
            name: "Lady",
            cost: 1,
            ownerId: 'player1',
            zone: ZoneType.Play
        });
        player1.play.push(ladyCard);
        turnManager.abilitySystem.registerCard(ladyCard);

        // 2. Create TWO Tramp cards
        const tramp1 = createCard({
            fullName: "Tramp - Enterprising Dog",
            name: "Tramp",
            cost: 2,
            ownerId: 'player1',
            zone: ZoneType.Hand,
            abilities: [
                {
                    fullText: "HEY, PIDGE If you have a character named Lady in play, you pay 1 ⬡ less to play this character.",
                    name: "HEY, PIDGE",
                    type: "static"
                }
            ]
        });
        tramp1.parsedEffects = parseToAbilityDefinition(tramp1) as any;

        const tramp2 = createCard({
            fullName: "Tramp - Enterprising Dog",
            name: "Tramp",
            cost: 2,
            ownerId: 'player1',
            zone: ZoneType.Hand,
            abilities: [
                {
                    fullText: "HEY, PIDGE If you have a character named Lady in play, you pay 1 ⬡ less to play this character.",
                    name: "HEY, PIDGE",
                    type: "static"
                }
            ]
        });
        // INTENTIONALLY SKIP MANUAL PARSING for tramp2
        // tramp2.parsedEffects = parseToAbilityDefinition(tramp2);

        player1.hand.push(tramp1, tramp2);

        // Register abilities (crucial step often handled by game engine)
        // Usually abilitySystem.registerCard is for cards in PLAY, but for static hand cost reductions,
        // the system might need to know about them or they generate transient modifiers.
        // Let's see how cost calculation works.
        // turnManager.abilitySystem.registerCard usually registers listeners. 
        // Static abilities in hand are often evaluated on the fly by `getModifiedCost`.

        // 3. Verify FIRST Tramp cost
        let cost1 = turnManager.abilitySystem.getModifiedCost(tramp1, player1);
        expect(cost1).toBe(1); // Should be reduced

        // 4. "Play" the first Tramp (Move to play zone)
        player1.hand = player1.hand.filter((c: any) => c.instanceId !== tramp1.instanceId);
        tramp1.zone = ZoneType.Play;
        player1.play.push(tramp1);
        turnManager.abilitySystem.registerCard(tramp1); // Register it as being in play

        // 5. Verify SECOND Tramp cost
        // This relies on getModifiedCost triggering on-demand parsing
        let cost2 = turnManager.abilitySystem.getModifiedCost(tramp2, player1);

        console.log('Tramp 2 Parsed Effects:', JSON.stringify(tramp2.parsedEffects, null, 2));

        // This is the expected failure point:
        expect(cost2).toBe(1); // Should STILL be reduced
    });
});
