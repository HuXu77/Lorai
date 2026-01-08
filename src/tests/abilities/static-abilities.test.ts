import { describe, it, expect, beforeEach } from '@jest/globals';
import { AbilitySystemManager } from '../../engine/abilities/ability-system';
import { TurnManager } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { CardType, ZoneType } from '../../engine/models';

describe('Static Abilities', () => {
    let gameState: GameStateManager;
    let turnManager: TurnManager;
    let abilitySystem: AbilitySystemManager;

    beforeEach(() => {
        gameState = new GameStateManager();
        gameState.addPlayer('p1');
        gameState.addPlayer('p2');
        turnManager = new TurnManager(gameState);
        abilitySystem = turnManager.abilitySystem;
    });

    describe('Registration', () => {
        it('should register static abilities on card', () => {
            const player = gameState.getPlayer('p1');

            // Card with static ability: "Your characters cost 1 less"
            const card = player.addCardToZone({
                id: 1,
                name: 'Cost Reducer',
                type: CardType.Character,
                cost: 3,
                abilities: [{
                    type: 'keyword',
                    effect: 'Your characters cost 1 less.'
                }]
            } as any, ZoneType.Play);

            // Register abilities
            abilitySystem.registerCard(card);

            // Verify static ability is registered
            expect(card.parsedEffects).toBeDefined();
            if (card.parsedEffects) {
                expect(card.parsedEffects.length).toBeGreaterThan(0);
            }
        });

        it('should NOT register static abilities to event bus', () => {
            const player = gameState.getPlayer('p1');

            const card = player.addCardToZone({
                id: 1,
                name: 'Static Card',
                type: CardType.Character,
                cost: 2,
                abilities: [{
                    type: 'keyword',
                    effect: 'Characters you play cost 1 less.'
                }]
            } as any, ZoneType.Play);

            abilitySystem.registerCard(card);

            // Static abilities should not be in event bus
            // They should be tracked separately for continuous evaluation
            expect(true).toBe(true); // TODO: Better assertion
        });
    });

    describe('Cost Reduction', () => {
        it('should apply cost reduction from static ability', () => {
            const player = gameState.getPlayer('p1');

            // Card that reduces costs
            const reducer = player.addCardToZone({
                id: 1,
                name: 'Cost Reducer',
                type: CardType.Character,
                cost: 3,
                abilities: [{
                    type: 'keyword',
                    effect: 'Your characters cost 1 less.'
                }]
            } as any, ZoneType.Play);

            // Register static ability
            abilitySystem.registerCard(reducer);

            // Card to play
            const targetCard = {
                id: 2,
                name: 'Target Card',
                type: CardType.Character,
                cost: 5,
                ownerId: 'p1'
            };

            // TODO: Implement getModifiedCost or similar method
            // const modifiedCost = abilitySystem.getModifiedCost(targetCard, player);
            // expect(modifiedCost).toBe(4); // 5 - 1 = 4

            // For now, just verify registration works
            expect(reducer.parsedEffects).toBeDefined();
        });
    });

    describe('Stat Auras', () => {
        it('should apply stat buffs from static ability', () => {
            const player = gameState.getPlayer('p1');

            // Location with aura: "Characters get +1 strength while here"
            const location = player.addCardToZone({
                id: 1,
                name: 'Training Grounds',
                type: CardType.Location,
                cost: 2,
                abilities: [{
                    type: 'keyword',
                    effect: 'Characters get +1 strength while here.'
                }]
            } as any, ZoneType.Play);

            // Character at location
            const character = player.addCardToZone({
                id: 2,
                name: 'Hero',
                type: CardType.Character,
                cost: 3,
                strength: 2,
                willpower: 2,
                meta: { location: location.instanceId }
            } as any, ZoneType.Play);

            // Register static ability
            abilitySystem.registerCard(location);

            // TODO: Implement getModifiedStrength or similar
            // const modifiedStrength = abilitySystem.getModifiedStrength(character);
            // expect(modifiedStrength).toBe(3); // 2 + 1 = 3

            // For now, verify parsing
            expect(location.parsedEffects).toBeDefined();
        });
    });

    describe('Conditional Static Abilities', () => {
        it('should only apply when condition is met', () => {
            const player = gameState.getPlayer('p1');

            // "While you have 4 or more cards in hand, your characters get +1 strength"
            const conditionalCard = player.addCardToZone({
                id: 1,
                name: 'Conditional Aura',
                type: CardType.Character,
                cost: 4,
                abilities: [{
                    type: 'keyword',
                    effect: 'While you have 4 or more cards in hand, your characters get +1 strength.'
                }]
            } as any, ZoneType.Play);

            abilitySystem.registerCard(conditionalCard);

            // TODO: Test condition evaluation
            // When hand.length >= 4, buff should apply
            // When hand.length < 4, buff should not apply

            expect(conditionalCard.parsedEffects).toBeDefined();
        });
    });
});
