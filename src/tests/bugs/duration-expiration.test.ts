// // Jest globals are automatically available
import { TestHarness } from '../engine-test-utils';
import { CardType } from '../../engine/models';

describe('Effect Duration Bug', () => {
    it('should keep "until start of next turn" effects until the start of the source player\'s next turn', async () => {
        const testHarness = new TestHarness();
        await testHarness.initGame(['Mickey Mouse - Detective'], ['Mickey Mouse - Detective']);

        // Setup: P1 has a character with an ability that grants stats "until start of your next turn"
        const p1 = testHarness.getPlayer(testHarness.p1Id);

        const card = testHarness.createCard(p1, {
            name: 'Test Character',
            strength: 1,
            willpower: 1,
            lore: 1,
            cost: 1,
            inkwell: true,
            type: CardType.Character
        });
        p1.play.push(card);

        // Add "Ward" until start of next turn (simulating an active effect)
        testHarness.turnManager.addActiveEffect({
            id: 'test-ward-effect',
            type: 'modification',
            modificationType: 'grant_keyword',
            target: 'custom',
            targetCardIds: [card.instanceId],
            duration: 'until_source_next_start', // This maps to "until start of your next turn"
            sourcePlayerId: p1.id,
            sourceCardId: card.instanceId,
            params: {
                keyword: 'Ward'
            }
        });

        // Verify effect is active immediately (P1 Turn 1)
        expect(card.keywords).toContain('Ward');

        // Pass Turn -> P2 Turn 1
        testHarness.turnManager.passTurn(p1.id);

        // Verify effect is still active during opponent's turn
        expect(card.keywords).toContain('Ward');

        // Pass Turn -> P1 Turn 2 (Start of next turn)
        testHarness.turnManager.passTurn(testHarness.p2Id);

        // Verify effect has EXPIRED at start of P1's next turn
        expect(card.keywords).not.toContain('Ward');
    });

    it('should expire "until end of turn" effects correctly', async () => {
        const testHarness = new TestHarness();
        await testHarness.initGame(['Mickey Mouse - Detective'], ['Mickey Mouse - Detective']);

        const p1 = testHarness.getPlayer(testHarness.p1Id);
        const card = testHarness.createCard(p1, {
            name: 'Temp Boost',
            strength: 1,
            willpower: 1,
            lore: 1,
            cost: 1,
            type: CardType.Character
        });
        p1.play.push(card);

        testHarness.turnManager.addActiveEffect({
            id: 'test-boost-effect',
            type: 'modification',
            target: 'custom',
            targetCardIds: [card.instanceId],
            duration: 'until_end_of_turn',
            sourcePlayerId: p1.id,
            sourceCardId: card.instanceId,
            modification: {
                strength: 2
            }
        });

        expect(card.strength).toBe(3); // 1 + 2

        // Pass Turn -> P2 Turn 1
        testHarness.turnManager.passTurn(p1.id);

        expect(card.strength).toBe(1);
    });
});
