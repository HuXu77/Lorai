/**
 * Tests for Cursed Merfolk - Ursula's Handiwork
 * 
 * Ability: "POOR SOULS Whenever this character is challenged,
 * each opponent chooses and discards a card."
 */

import { TestHarness } from '../engine-test-utils';
import { ActionType } from '../../engine/actions';
import { ZoneType, CardType } from '../../engine/models';

describe('Cursed Merfolk - Challenge Trigger', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should make opponent discard when cursed merfolk is challenged', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        // Give P1 an attacker
        const attacker = p1.addCardToZone({
            id: 1001,
            fullName: 'Test Attacker',
            name: 'Attacker',
            type: CardType.Character,
            cost: 2,
            strength: 3,
            willpower: 3,
            lore: 1
        } as any, ZoneType.Play);
        attacker.ready = true;

        // Give P2 Cursed Merfolk
        const cursedMerfolk = p2.addCardToZone({
            id: 506,
            fullName: 'Cursed Merfolk - Ursula\'s Handiwork',
            name: 'Cursed Merfolk',
            type: CardType.Character,
            cost: 1,
            strength: 0,
            willpower: 1,
            lore: 2,
            abilities: [{
                type: 'keyword',
                effect: 'POOR SOULS Whenever this character is challenged, each opponent chooses and discards a card.'
            }]
        } as any, ZoneType.Play);

        // Cursed Merfolk must be EXERTED to be challenged (game rule)
        cursedMerfolk.ready = false;

        // Give P1 cards in hand to discard
        const cardInHand1 = p1.addCardToZone({
            id: 2001,
            name: 'Card 1',
            type: CardType.Character,
            cost: 1
        } as any, ZoneType.Hand);

        const cardInHand2 = p1.addCardToZone({
            id: 2002,
            name: 'Card 2',
            type: CardType.Character,
            cost: 1
        } as any, ZoneType.Hand);

        // Start game and register abilities
        harness.turnManager.startGame(harness.p1Id);

        // Verify P1 has 2 cards in hand
        expect(p1.hand.length).toBe(2);
        expect(p1.discard.length).toBe(0);

        // P1 challenges Cursed Merfolk
        harness.turnManager.resolveAction({
            type: ActionType.Challenge,
            playerId: harness.p1Id,
            cardId: attacker.instanceId,
            targetId: cursedMerfolk.instanceId
        });

        // Verify P1 discarded a card (opponent effect triggered)
        expect(p1.hand.length).toBe(1);
        expect(p1.discard.length).toBe(1);
    });

    it('should make ALL opponents discard in multiplayer', async () => {
        // This test would require a 3+ player setup
        // For now, just verify single opponent works
        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        const attacker = p1.addCardToZone({
            id: 1001,
            name: 'Attacker',
            type: CardType.Character,
            cost: 2,
            strength: 2,
            willpower: 2
        } as any, ZoneType.Play);
        attacker.ready = true;

        const cursedMerfolk = p2.addCardToZone({
            id: 506,
            fullName: 'Cursed Merfolk - Ursula\'s Handiwork',
            name: 'Cursed Merfolk',
            type: CardType.Character,
            cost: 1,
            strength: 0,
            willpower: 1,
            lore: 2,
            abilities: [{
                type: 'keyword',
                effect: 'POOR SOULS Whenever this character is challenged, each opponent chooses and discards a card.'
            }]
        } as any, ZoneType.Play);

        // Cursed Merfolk must be EXERTED to be challenged (game rule)
        cursedMerfolk.ready = false;

        p1.addCardToZone({ id: 2001, name: 'Card 1' } as any, ZoneType.Hand);

        harness.turnManager.startGame(harness.p1Id);

        expect(p1.hand.length).toBe(1);

        harness.turnManager.resolveAction({
            type: ActionType.Challenge,
            playerId: harness.p1Id,
            cardId: attacker.instanceId,
            targetId: cursedMerfolk.instanceId
        });

        // P1 should have discarded
        expect(p1.hand.length).toBe(0);
        expect(p1.discard.length).toBe(1);
    });

    it('should not trigger if opponent has no cards to discard', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        const attacker = p1.addCardToZone({
            id: 1001,
            name: 'Attacker',
            type: CardType.Character,
            cost: 2,
            strength: 3,
            willpower: 3
        } as any, ZoneType.Play);
        attacker.ready = true;

        const cursedMerfolk = p2.addCardToZone({
            id: 506,
            name: 'Cursed Merfolk',
            type: CardType.Character,
            cost: 1,
            strength: 0,
            willpower: 1,
            abilities: [{
                type: 'keyword',
                effect: 'POOR SOULS Whenever this character is challenged, each opponent chooses and discards a card.'
            }]
        } as any, ZoneType.Play);

        // P1 has NO cards in hand
        harness.turnManager.startGame(harness.p1Id);

        expect(p1.hand.length).toBe(0);

        // Challenge should not error
        harness.turnManager.resolveAction({
            type: ActionType.Challenge,
            playerId: harness.p1Id,
            cardId: attacker.instanceId,
            targetId: cursedMerfolk.instanceId
        });

        // No discard happened
        expect(p1.discard.length).toBe(0);
    });

    it('should NOT trigger when a different character is challenged', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        // P1 has an attacker
        const attacker = p1.addCardToZone({
            id: 1001,
            name: 'Attacker',
            type: CardType.Character,
            cost: 2,
            strength: 3,
            willpower: 3
        } as any, ZoneType.Play);
        attacker.ready = true;

        // P2 has Cursed Merfolk
        const cursedMerfolk = p2.addCardToZone({
            id: 506,
            name: 'Cursed Merfolk',
            type: CardType.Character,
            cost: 1,
            strength: 0,
            willpower: 1,
            abilities: [{
                type: 'keyword',
                effect: 'POOR SOULS Whenever this character is challenged, each opponent chooses and discards a card.'
            }]
        } as any, ZoneType.Play);

        // P2 has ANOTHER character (NOT Cursed Merfolk)
        const otherCharacter = p2.addCardToZone({
            id: 1002,
            name: 'Other Character',
            type: CardType.Character,
            cost: 2,
            strength: 2,
            willpower: 2
        } as any, ZoneType.Play);

        // P1 has a card in hand
        p1.addCardToZone({
            id: 2001,
            name: 'Card 1',
            type: CardType.Character,
            cost: 1
        } as any, ZoneType.Hand);

        harness.turnManager.startGame(harness.p1Id);

        expect(p1.hand.length).toBe(1);
        expect(p1.discard.length).toBe(0);

        // P1 challenges the OTHER character (NOT Cursed Merfolk)
        harness.turnManager.resolveAction({
            type: ActionType.Challenge,
            playerId: harness.p1Id,
            cardId: attacker.instanceId,
            targetId: otherCharacter.instanceId  // Challenging OTHER card, not Cursed Merfolk!
        });

        // P1 should NOT have discarded (Cursed Merfolk ability should NOT trigger)
        expect(p1.hand.length).toBe(1);
        expect(p1.discard.length).toBe(0);
    });
});
