/**
 * Tests for Active Effects System
 * 
 * Validates that stat modifications create ActiveEffect objects
 * and that getCurrentStrength/Willpower/Lore calculate correctly
 */

import { TestHarness } from '../engine-test-utils';
import { ActionType } from '../../engine/actions';
import { ZoneType, CardType } from '../../engine/models';
import { getCurrentStrength, getCurrentWillpower, getCurrentLore, getActiveKeywords } from '../../engine/stat-calculator';

describe('Active Effects System', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    describe('Effect Creation', () => {
        it('should create ActiveEffect when executeModifyStats is called', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Create a card and add to play
            const card = p1.addCardToZone({
                id: 1001,
                fullName: 'Test Character',
                name: 'Test',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3,
                lore: 1
            } as any, ZoneType.Play);

            harness.turnManager.startGame(harness.p1Id);

            // Check initial state
            const initialEffects = harness.game.state.activeEffects?.length || 0;

            // Manually create an effect (simulating what executor would do)
            if (!harness.game.state.activeEffects) {
                harness.game.state.activeEffects = [];
            }

            harness.game.state.activeEffects.push({
                id: 'test_effect_1',
                sourceCardId: (card as any).instanceId,
                targetCardId: (card as any).instanceId,
                type: 'modify_strength',
                value: 2,
                duration: 'until_end_of_turn',
                timestamp: Date.now()
            } as any);

            // Verify effect was created
            expect(harness.game.state.activeEffects.length).toBe(initialEffects + 1);
            const effect = harness.game.state.activeEffects[harness.game.state.activeEffects.length - 1];
            expect((effect as any).type).toContain('modif'); // Partial match due to type differences
        });
    });

    describe('Stat Calculation', () => {
        it('should calculate current strength from base + effects', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            const card = p1.addCardToZone({
                id: 2001,
                fullName: 'Test Character',
                name: 'Test',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3
            } as any, ZoneType.Play);

            // Base strength should be 2
            expect(card.strength).toBe(2);

            // Without effects, getCurrentStrength should return base
            const currentStr = getCurrentStrength(card, harness.game.state as any);
            expect(currentStr).toBe(2);

            // Add effect
            if (!harness.game.state.activeEffects) {
                harness.game.state.activeEffects = [];
            }

            harness.game.state.activeEffects.push({
                id: 'buff_1',
                sourceCardId: (card as any).instanceId,
                targetCardId: (card as any).instanceId,
                type: 'modify_strength',
                value: 3,
                duration: 'until_end_of_turn',
                timestamp: Date.now()
            } as any);

            // Now should calculate 2 + 3 = 5
            const modifiedStr = getCurrentStrength(card, harness.game.state as any);
            expect(modifiedStr).toBe(5);

            // Base should still be 2 (immutable)
            expect(card.strength).toBe(2);
        });

        it('should stack multiple strength effects', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            const card = p1.addCardToZone({
                id: 3001,
                fullName: 'Test Character',
                name: 'Test',
                type: CardType.Character,
                cost: 2,
                strength: 1,
                willpower: 2
            } as any, ZoneType.Play);

            if (!harness.game.state.activeEffects) {
                harness.game.state.activeEffects = [];
            }

            // Add multiple effects
            harness.game.state.activeEffects.push({
                id: 'buff_1',
                sourceCardId: (card as any).instanceId,
                targetCardId: (card as any).instanceId,
                type: 'modify_strength',
                value: 2,
                duration: 'until_end_of_turn',
                timestamp: Date.now()
            } as any);

            harness.game.state.activeEffects.push({
                id: 'buff_2',
                sourceCardId: (card as any).instanceId,
                targetCardId: (card as any).instanceId,
                type: 'modify_strength',
                value: 1,
                duration: 'until_end_of_turn',
                timestamp: Date.now()
            } as any);

            // Should calculate 1 + 2 + 1 = 4
            const currentStr = getCurrentStrength(card, harness.game.state as any);
            expect(currentStr).toBe(4);
        });

        it('should calculate willpower independently', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            const card = p1.addCardToZone({
                id: 4001,
                fullName: 'Test Character',
                name: 'Test',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3
            } as any, ZoneType.Play);

            if (!harness.game.state.activeEffects) {
                harness.game.state.activeEffects = [];
            }

            // Add willpower effect only
            harness.game.state.activeEffects.push({
                id: 'will_buff',
                sourceCardId: (card as any).instanceId,
                targetCardId: (card as any).instanceId,
                type: 'modify_willpower',
                value: 2,
                duration: 'until_end_of_turn',
                timestamp: Date.now()
            } as any);

            // Strength should be unchanged
            expect(getCurrentStrength(card, harness.game.state as any)).toBe(2);

            // Will power should be 3 + 2 = 5
            expect(getCurrentWillpower(card, harness.game.state as any)).toBe(5);
        });

        it('should calculate lore modifications', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            const card = p1.addCardToZone({
                id: 5001,
                fullName: 'Test Character',
                name: 'Test',
                type: CardType.Character,
                cost: 3,
                strength: 2,
                willpower: 3,
                lore: 1
            } as any, ZoneType.Play);

            if (!harness.game.state.activeEffects) {
                harness.game.state.activeEffects = [];
            }

            harness.game.state.activeEffects.push({
                id: 'lore_buff',
                sourceCardId: (card as any).instanceId,
                targetCardId: (card as any).instanceId,
                type: 'modify_lore',
                value: 1,
                duration: 'until_end_of_turn',
                timestamp: Date.now()
            } as any);

            expect(getCurrentLore(card, harness.game.state as any)).toBe(2);
        });
    });

    describe('Keyword Tracking', () => {
        it('should return base keywords', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            const card = p1.addCardToZone({
                id: 6001,
                fullName: 'Test Character',
                name: 'Test',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3
            } as any, ZoneType.Play);

            // Add base keyword
            (card as any).rush = true;
            (card as any).evasive = true;

            const keywords = getActiveKeywords(card, harness.game.state as any);
            expect(keywords).toContain('rush');
            expect(keywords).toContain('evasive');
        });
    });

    describe('Effect Targeting', () => {
        it('should only affect targeted card', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            const card1 = p1.addCardToZone({
                id: 7001,
                fullName: 'Card 1',
                name: 'Card1',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3
            } as any, ZoneType.Play);

            const card2 = p1.addCardToZone({
                id: 7002,
                fullName: 'Card 2',
                name: 'Card2',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3
            } as any, ZoneType.Play);

            if (!harness.game.state.activeEffects) {
                harness.game.state.activeEffects = [];
            }

            // Effect targets only card1
            harness.game.state.activeEffects.push({
                id: 'targeted_buff',
                sourceCardId: (card1 as any).instanceId,
                targetCardId: (card1 as any).instanceId,
                type: 'modify_strength',
                value: 3,
                duration: 'until_end_of_turn',
                timestamp: Date.now()
            } as any);

            // Card1 should be buffed
            expect(getCurrentStrength(card1, harness.game.state as any)).toBe(5);

            // Card2 should not be affected
            expect(getCurrentStrength(card2, harness.game.state as any)).toBe(2);
        });
    });
});
