
import { TestHarness } from '../engine-test-utils';
import { ActionType } from '../../engine/models';

describe('Lady - The Singer Bug', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initGame([], []);
    });

    it('should grant +1 Lore to SELF only when Tramp is in play', async () => {
        const player1 = harness.game.getPlayer(harness.p1Id);

        await harness.setPlay(harness.p1Id, [
            {
                id: 'lady-the-singer-123',
                name: 'Lady - The Singer',
                type: 'Character',
                strength: 2, willpower: 2, lore: 1, cost: 2,
                abilities: [
                    { fullText: "While you have a character named Tramp in play, this character gets +1 Lore." }
                ]
            },
            { name: 'Pongo', type: 'Character', strength: 2, willpower: 2, lore: 1 }
        ]);

        const lady = player1.play[0];
        const pongo = player1.play[1];

        // Play Tramp
        await harness.setInk(harness.p1Id, 10);
        await harness.setHand(harness.p1Id, [{ name: 'Tramp - Loyal Stray', type: 'Character', strength: 5, willpower: 3, lore: 2, cost: 3 }]);
        const tramp = player1.hand[0];

        // Resolve Play
        await harness.turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: player1.id,
            cardId: tramp.instanceId
        });

        harness.turnManager.recalculateEffects();

        expect(lady.lore).toBe(2);
        expect(pongo.lore).toBe(1);
    });
});
