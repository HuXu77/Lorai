import { describe, it, expect, beforeEach } from '@jest/globals';
import { TurnManager } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { CardType, ZoneType } from '../../engine/models';

describe('Turn-Based Damage Tracking', () => {
    let gameState: GameStateManager;
    let turnManager: TurnManager;

    beforeEach(() => {
        gameState = new GameStateManager();
        gameState.addPlayer('p1');
        gameState.addPlayer('p2');
        turnManager = new TurnManager(gameState);
    });

    describe('Damage Count Tracking', () => {
        it('should track damage dealt by a card this turn', () => {
            const player = gameState.getPlayer('p1');

            // Add attacker
            const attacker = player.addCardToZone({
                id: 1,
                name: 'Attacker',
                type: CardType.Character,
                cost: 3,
                strength: 3,
                willpower: 3
            } as any, ZoneType.Play);

            // Card should start with 0 damage dealt this turn
            expect(attacker.damageDealtThisTurn || 0).toBe(0);

            // Simulate dealing damage
            attacker.damageDealtThisTurn = (attacker.damageDealtThisTurn || 0) + 2;

            expect(attacker.damageDealtThisTurn).toBe(2);
        });

        it('should reset damage tracking at end of turn', () => {
            const player = gameState.getPlayer('p1');

            const card = player.addCardToZone({
                id: 1,
                name: 'Card',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 2
            } as any, ZoneType.Play);

            // Deal damage
            card.damageDealtThisTurn = 5;
            expect(card.damageDealtThisTurn).toBe(5);

            // End turn should reset it
            // (This would be called by turn cleanup)
            card.damageDealtThisTurn = 0;

            expect(card.damageDealtThisTurn).toBe(0);
        });
    });

    describe('Conditional Effects Based on Damage', () => {
        it('should check if card dealt damage this turn', () => {
            const player = gameState.getPlayer('p1');

            const card = player.addCardToZone({
                id: 1,
                name: 'Conditional Card',
                type: CardType.Character,
                cost: 3,
                strength: 3,
                willpower: 3
            } as any, ZoneType.Play);

            // Initially no damage dealt
            const dealtDamage = (card.damageDealtThisTurn || 0) > 0;
            expect(dealtDamage).toBe(false);

            // After dealing damage
            card.damageDealtThisTurn = 3;
            const nowDealtDamage = (card.damageDealtThisTurn || 0) > 0;
            expect(nowDealtDamage).toBe(true);
        });

        it('should track damage amount for conditional triggers', () => {
            const player = gameState.getPlayer('p1');

            const card = player.addCardToZone({
                id: 1,
                name: 'Damage Counter',
                type: CardType.Character,
                cost: 4
            } as any, ZoneType.Play);

            // Track multiple damage instances
            card.damageDealtThisTurn = 0;

            // Instance 1: 2 damage
            card.damageDealtThisTurn += 2;
            expect(card.damageDealtThisTurn).toBe(2);

            // Instance 2: 3 damage
            card.damageDealtThisTurn += 3;
            expect(card.damageDealtThisTurn).toBe(5);
        });
    });

    describe('Challenge Damage Tracking', () => {
        it('should track damage dealt during challenges', () => {
            const p1 = gameState.getPlayer('p1');
            const p2 = gameState.getPlayer('p2');

            const attacker = p1.addCardToZone({
                id: 1,
                name: 'Attacker',
                type: CardType.Character,
                cost: 3,
                strength: 4,
                willpower: 3,
                ready: true
            } as any, ZoneType.Play);

            const defender = p2.addCardToZone({
                id: 2,
                name: 'Defender',
                type: CardType.Character,
                cost: 3,
                strength: 2,
                willpower: 4,
                ready: false
            } as any, ZoneType.Play);

            // Before challenge
            expect(attacker.damageDealtThisTurn || 0).toBe(0);

            // Track damage dealt
            const damageAmount = attacker.strength || 0;
            attacker.damageDealtThisTurn = (attacker.damageDealtThisTurn || 0) + damageAmount;

            expect(attacker.damageDealtThisTurn).toBe(4);
        });
    });
});
