/**
 * @file boost-implementation.test.ts
 * @description Implementation tests for Boost mechanic and conditional stat buffs
 * 
 * Tests verify:
 * 1. Boost places a card underneath the character
 * 2. has_card_under condition is evaluated correctly
 * 3. Stat modifications are applied when condition is met
 * 4. Card stats (strength, lore) update correctly for UI display
 */

import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { TurnManager } from '../../engine/actions';
import { evaluateCondition } from '../../engine/effects';

import { GameStateManager } from '../../engine/state';
import { getBoostCost } from '../../utils/ability-helpers';

// Inline Flynn Rider card data (from allCards.json format)
const flynnRiderData = {
    id: 2270,
    name: 'Flynn Rider',
    fullName: 'Flynn Rider - Spectral Scoundrel',
    type: 'Character',
    keywordAbilities: ['Boost'],
    fullTextSections: [
        'Boost 2 ⬡ (Once during your turn, you may pay 2 ⬡ to put the top card of your deck facedown under this character.)',
        "I'LL TAKE THAT While there's a card under this character, he gets +2 ¤ and +1 ◊."
    ],
    strength: 1,
    willpower: 2,
    lore: 1,
    cost: 3
};

describe('Boost Implementation', () => {
    describe('Flynn Rider - Spectral Scoundrel Parsing', () => {
        it('should have Boost 2 keyword parsed correctly', () => {
            const abilities = parseToAbilityDefinition(flynnRiderData);
            expect(abilities).toBeDefined();

            // Check Boost is parsed
            const boostAbility = abilities.find((a: any) =>
                a.keyword === 'boost' || a.action === 'keyword_boost'
            );
            expect(boostAbility).toBeDefined();

            // Verify Boost cost
            const cardWithAbilities = { ...flynnRiderData, parsedEffects: abilities };
            const boostCost = getBoostCost(cardWithAbilities as any);
            expect(boostCost).toBe(2);
        });

        it('should have static ability with has_card_under condition', () => {
            const abilities = parseToAbilityDefinition(flynnRiderData);

            // Find the static ability with effects array
            const staticAbility = abilities.find((a: any) =>
                a.type === 'static' && a.effects && Array.isArray(a.effects)
            );
            expect(staticAbility).toBeDefined();

            const effects = (staticAbility as any).effects;
            expect(effects).toBeDefined();
            expect(effects.length).toBeGreaterThan(0);

            // Check for has_card_under condition on effects
            const hasConditionedEffect = effects.some((e: any) =>
                e.condition?.type === 'has_card_under'
            );
            expect(hasConditionedEffect).toBe(true);
        });

        it('should have modify_stats effects with self target', () => {
            const abilities = parseToAbilityDefinition(flynnRiderData);

            const staticAbility = abilities.find((a: any) =>
                a.type === 'static' && a.effects
            );
            const effects = (staticAbility as any).effects;

            // Find stat modification effects
            const modifyStatEffects = effects.filter((e: any) => e.type === 'modify_stats');
            expect(modifyStatEffects.length).toBeGreaterThan(0);

            // Each should target self
            modifyStatEffects.forEach((effect: any) => {
                expect(effect.target?.type).toBe('self');
            });

            // Check for strength and lore buffs
            const stats = modifyStatEffects.map((e: any) => e.stat);
            expect(stats).toContain('strength');
            expect(stats).toContain('lore');
        });
    });

    describe('Boost Execution and Stat Buffs', () => {
        let stateManager: GameStateManager;
        let turnManager: TurnManager;

        beforeEach(() => {
            // Create a minimal game state for testing
            stateManager = new GameStateManager();
            turnManager = new TurnManager(stateManager);

            // Set up players
            stateManager.state.players = {
                player1: {
                    id: 'player1',
                    name: 'Test Player',
                    hand: [],
                    play: [],
                    discard: [],
                    inkwell: [],
                    deck: [],
                    lore: 0,
                    inkedThisTurn: false
                } as any,
                player2: {
                    id: 'player2',
                    name: 'Opponent',
                    hand: [],
                    play: [],
                    discard: [],
                    inkwell: [],
                    deck: [],
                    lore: 0,
                    inkedThisTurn: false
                } as any
            };
            stateManager.state.turnPlayerId = 'player1';
            stateManager.state.turnCount = 1;
            stateManager.state.activeEffects = [];
        });

        it('should apply +2 strength and +1 lore when card is under Flynn Rider', () => {
            const player = stateManager.state.players['player1'];
            const abilities = parseToAbilityDefinition(flynnRiderData);

            const flynnRider: any = {
                instanceId: 'flynn_1',
                name: 'Flynn Rider',
                fullName: 'Flynn Rider - Spectral Scoundrel',
                type: 'Character',
                cost: 3,
                strength: 1,
                baseStrength: 1,
                willpower: 2,
                baseWillpower: 2,
                lore: 1,
                baseLore: 1,
                ready: true,
                damage: 0,
                ownerId: 'player1',
                turnPlayed: 0,
                meta: {
                    usedAbilities: {},
                    cardsUnder: [{ instanceId: 'boosted_card', name: 'Hidden Card' }]
                },
                parsedEffects: abilities
            };

            player.play.push(flynnRider);

            // Trigger recalculateEffects
            turnManager.recalculateEffects();

            // Verify Flynn's stats are buffed: +2 strength, +1 lore
            expect(flynnRider.strength).toBe(3); // 1 base + 2 buff
            expect(flynnRider.lore).toBe(2);     // 1 base + 1 buff
            expect(flynnRider.willpower).toBe(2); // Unchanged
        });

        it('should NOT apply stat buffs when no card is underneath', () => {
            const player = stateManager.state.players['player1'];
            const abilities = parseToAbilityDefinition(flynnRiderData);

            const flynnRider: any = {
                instanceId: 'flynn_1',
                name: 'Flynn Rider',
                fullName: 'Flynn Rider - Spectral Scoundrel',
                type: 'Character',
                cost: 3,
                strength: 1,
                baseStrength: 1,
                willpower: 2,
                baseWillpower: 2,
                lore: 1,
                baseLore: 1,
                ready: true,
                damage: 0,
                ownerId: 'player1',
                turnPlayed: 0,
                meta: {
                    usedAbilities: {},
                    cardsUnder: [] // No cards underneath
                },
                parsedEffects: abilities
            };

            player.play.push(flynnRider);

            // Trigger recalculateEffects
            turnManager.recalculateEffects();

            // Verify Flynn's stats are NOT buffed
            expect(flynnRider.strength).toBe(1); // Still base
            expect(flynnRider.lore).toBe(1);     // Still base
        });

        it('should show stat modification in UI calculations when buffed', () => {
            const player = stateManager.state.players['player1'];
            const abilities = parseToAbilityDefinition(flynnRiderData);

            const flynnRider: any = {
                instanceId: 'flynn_1',
                name: 'Flynn Rider',
                type: 'Character',
                strength: 1,
                baseStrength: 1,
                willpower: 2,
                baseWillpower: 2,
                lore: 1,
                baseLore: 1,
                meta: {
                    usedAbilities: {},
                    cardsUnder: [{ instanceId: 'boosted_card' }]
                },
                parsedEffects: abilities,
                ownerId: 'player1'
            };

            player.play.push(flynnRider);

            // Trigger recalculateEffects
            turnManager.recalculateEffects();

            // Calculate stat modifications (same logic as Card.tsx)
            const strengthMod = flynnRider.strength - flynnRider.baseStrength;
            const loreMod = flynnRider.lore - flynnRider.baseLore;

            // These should show as positive modifications in UI
            expect(strengthMod).toBe(2);  // +2 strength
            expect(loreMod).toBe(1);      // +1 lore
        });
    });

    describe('has_card_under condition evaluation', () => {
        let stateManager: GameStateManager;
        let turnManager: TurnManager;

        beforeEach(() => {
            stateManager = new GameStateManager();
            turnManager = new TurnManager(stateManager);
            stateManager.state.players = {
                player1: { id: 'player1', play: [], inkwell: [], deck: [], hand: [], discard: [], lore: 0 } as any
            };
            stateManager.state.activeEffects = [];
        });

        it('should return true when card has cardsUnder in meta', () => {
            const player = stateManager.state.players['player1'];
            const card: any = {
                instanceId: 'test_1',
                meta: { cardsUnder: [{ instanceId: 'under_card' }] }
            };

            // Use evaluateCondition method
            const condition = { type: 'has_card_under' };
            const result = evaluateCondition(player, condition, card);

            expect(result).toBe(true);
        });

        it('should return false when cardsUnder is empty', () => {
            const player = stateManager.state.players['player1'];
            const card: any = {
                instanceId: 'test_1',
                meta: { cardsUnder: [] }
            };

            const condition = { type: 'has_card_under' };
            const result = evaluateCondition(player, condition, card);

            expect(result).toBe(false);
        });

        it('should return false when cardsUnder is undefined', () => {
            const player = stateManager.state.players['player1'];
            const card: any = {
                instanceId: 'test_1',
                meta: {}
            };

            const condition = { type: 'has_card_under' };
            const result = evaluateCondition(player, condition, card);

            expect(result).toBe(false);
        });
    });
});
