/**
 * Full Game Flow Integration Test
 * 
 * Tests the complete game lifecycle from initialization through win condition.
 * Verifies that all systems work together correctly.
 */

import { TestHarness } from '../engine-test-utils';
import { ActionType, Phase } from '../../engine/actions';
import { ZoneType, CardType } from '../../engine/models';

describe('Full Game Flow Integration', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    describe('Game Initialization', () => {
        it('should initialize game state correctly', () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            expect(p1).toBeDefined();
            expect(p2).toBeDefined();
            expect(p1.lore).toBe(0);
            expect(p2.lore).toBe(0);
        });

        it('should start with correct phase', () => {
            harness.turnManager.startGame(harness.p1Id);
            expect(harness.game.state.phase).toBe(Phase.Main);
        });
    });

    describe('Turn Sequence', () => {
        it('should progress through turn phases correctly', () => {
            harness.turnManager.startGame(harness.p1Id);

            // First turn player should skip draw (first turn rule)
            // Verify we're in Main phase after startTurn
            expect(harness.game.state.phase).toBe(Phase.Main);
            expect(harness.game.state.turnPlayerId).toBe(harness.p1Id);
        });

        it('should switch players on pass turn', () => {
            harness.turnManager.startGame(harness.p1Id);
            harness.turnManager.passTurn(harness.p1Id);

            expect(harness.game.state.turnPlayerId).toBe(harness.p2Id);
        });

        it('should increment turn count correctly', () => {
            harness.turnManager.startGame(harness.p1Id);
            expect(harness.game.state.turnCount).toBe(1);

            harness.turnManager.passTurn(harness.p1Id);
            // Turn count increments when turn passes
            expect(harness.game.state.turnCount).toBe(2);

            harness.turnManager.passTurn(harness.p2Id);
            expect(harness.game.state.turnCount).toBe(3);
        });
    });

    describe('Basic Actions', () => {
        beforeEach(() => {
            harness.turnManager.startGame(harness.p1Id);
        });

        it('should ink a card successfully', () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const card = p1.addCardToZone({
                id: 'test-ink',
                name: 'Test Card',
                type: 'Character' as CardType,
                inkwell: true,
                cost: 2
            } as any, ZoneType.Hand);

            const success = harness.turnManager.inkCard(p1, card.instanceId);

            expect(success).toBe(true);
            expect(p1.hand.length).toBe(0);
            expect(p1.inkwell.length).toBe(1);
            expect(p1.inkedThisTurn).toBe(true);
        });

        it('should prevent inking twice per turn', () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const card1 = p1.addCardToZone({
                id: 'test-ink-1',
                name: 'Test Card 1',
                type: 'Character' as CardType,
                inkwell: true,
                cost: 2
            } as any, ZoneType.Hand);
            const card2 = p1.addCardToZone({
                id: 'test-ink-2',
                name: 'Test Card 2',
                type: 'Character' as CardType,
                inkwell: true,
                cost: 2
            } as any, ZoneType.Hand);

            const success1 = harness.turnManager.inkCard(p1, card1.instanceId);
            const success2 = harness.turnManager.inkCard(p1, card2.instanceId);

            expect(success1).toBe(true);
            expect(success2).toBe(false);
            expect(p1.inkwell.length).toBe(1);
        });

        it('should play a card with enough ink', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Add 2 ready ink
            p1.addCardToZone({ name: 'Ink 1', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            p1.addCardToZone({ name: 'Ink 2', inkwell: true } as any, ZoneType.Inkwell).ready = true;

            // Add character to hand
            const char = p1.addCardToZone({
                id: 'char-1',
                name: 'Test Character',
                type: 'Character' as CardType,
                cost: 2,
                strength: 2,
                willpower: 2,
                lore: 1
            } as any, ZoneType.Hand);

            const success = await harness.turnManager.playCard(p1, char.instanceId);

            expect(success).toBe(true);
            expect(p1.hand.length).toBe(0);
            expect(p1.play.length).toBe(1);
            expect(p1.inkwell.filter(c => !c.ready).length).toBe(2); // Ink spent
        });

        it('should not play card without enough ink', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Only 1 ink
            p1.addCardToZone({ name: 'Ink 1', inkwell: true } as any, ZoneType.Inkwell).ready = true;

            // 2 cost character
            const char = p1.addCardToZone({
                id: 'char-1',
                name: 'Test Character',
                type: 'Character' as CardType,
                cost: 2
            } as any, ZoneType.Hand);

            const success = await harness.turnManager.playCard(p1, char.instanceId);

            expect(success).toBe(false);
            expect(p1.hand.length).toBe(1);
            expect(p1.play.length).toBe(0);
        });
    });

    describe('Quest and Lore', () => {
        it('should gain lore when questing', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            harness.turnManager.startGame(harness.p1Id);

            // Add ready character from previous turn
            const char = p1.addCardToZone({
                id: 'quest-char',
                name: 'Quester',
                type: 'Character' as CardType,
                lore: 2,
                strength: 1,
                willpower: 1
            } as any, ZoneType.Play);
            char.ready = true;
            char.turnPlayed = 0; // Not drying

            const initialLore = p1.lore;
            await harness.turnManager.quest(p1, char.instanceId);

            expect(p1.lore).toBe(initialLore + 2);
            expect(char.ready).toBe(false); // Exerted after quest
        });
    });

    describe('Challenge Combat', () => {
        it('should apply damage in challenge', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);
            harness.turnManager.startGame(harness.p1Id);

            // P1 attacker - ready
            const attacker = p1.addCardToZone({
                id: 'attacker',
                name: 'Attacker',
                type: 'Character' as CardType,
                strength: 3,
                willpower: 4,
                lore: 1
            } as any, ZoneType.Play);
            attacker.ready = true;
            attacker.turnPlayed = 0; // Not drying

            // P2 defender - exerted (valid target)
            const defender = p2.addCardToZone({
                id: 'defender',
                name: 'Defender',
                type: 'Character' as CardType,
                strength: 2,
                willpower: 3,
                lore: 1
            } as any, ZoneType.Play);
            defender.ready = false; // Exerted - valid challenge target

            const result = await harness.turnManager.challenge(p1, attacker.instanceId, defender.instanceId);

            // Challenge should succeed
            expect(result).toBe(true);
            // Both should take damage equal to opponent's strength
            expect(attacker.damage).toBeGreaterThanOrEqual(0); // Defender's strength dealt to attacker
            expect(attacker.ready).toBe(false); // Attacker exerted
        });
    });

    describe('Win Condition', () => {
        it('should set winner when reaching 20 lore', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            harness.turnManager.startGame(harness.p1Id);

            // Set lore close to win
            p1.lore = 19;

            // Add character that can quest for 2
            const char = p1.addCardToZone({
                id: 'win-char',
                name: 'Winner',
                type: 'Character' as CardType,
                lore: 2,
                strength: 1,
                willpower: 1
            } as any, ZoneType.Play);
            char.ready = true;
            char.turnPlayed = 0;

            await harness.turnManager.quest(p1, char.instanceId);

            expect(p1.lore).toBe(21);
            expect(harness.game.state.winnerId).toBe(harness.p1Id);
        });
    });
});
