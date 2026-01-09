
import { TestHarness } from '../engine-test-utils';
import { CardInstance, ZoneType } from '../../engine/models';
import { executeChallenge } from '../../engine/combat/challenge';
import { banishCard } from '../../engine/combat/banishment';

describe('Item Mechanics', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('Items cannot be challenged', async () => {
        const p1 = harness.getPlayer(harness.p1Id);
        const p2 = harness.getPlayer(harness.p2Id);

        harness.setPlay(p2.id, ['Dinglehopper', 'Captain Hook - Forceful Duelist']);
        const dinglehopper = p2.play.find(c => c.name === 'Dinglehopper');
        const hook = p2.play.find(c => c.name.includes('Captain Hook'));

        expect(dinglehopper).toBeDefined();
        if (!dinglehopper) return;
        expect(dinglehopper.type).toBe('Item');

        harness.setPlay(p1.id, ['Mickey Mouse - Detective']);
        const mickey = p1.play[0];
        mickey.ready = true;

        const result = await executeChallenge(
            harness.turnManager,
            p1,
            mickey.instanceId,
            dinglehopper.instanceId
        );

        expect(result).toBe(false);
        expect(mickey.ready).toBe(true);
    });

    it('Items should be able to use activated abilities', async () => {
        const p1 = harness.getPlayer(harness.p1Id);

        harness.setPlay(p1.id, ['Magic Mirror']);
        harness.setInk(p1.id, 4);
        // Need a deck to draw from
        harness.setDeck(p1.id, ['Mickey Mouse - Detective']);

        const mirror = p1.play[0];
        mirror.ready = true;
        mirror.turnPlayed = harness.game.state.turnCount;

        // Use Ability 0 (Draw card)
        const success = await harness.turnManager.useAbility(p1, mirror.instanceId, 0);

        expect(success).toBe(true);
        expect(mirror.ready).toBe(false);
        expect(p1.inkwell.filter(i => i.ready).length).toBe(0);
        expect(p1.hand.length).toBe(1);
    });

    it('Items can be banished by effects', async () => {
        const p2 = harness.getPlayer(harness.p2Id);

        harness.setPlay(p2.id, ['Dinglehopper']);
        const dinglehopper = p2.play[0];

        // Use imported banishCard with proper arguments
        await banishCard(harness.turnManager, p2, dinglehopper);

        const dinglehopperInPlay = p2.play.find(c => c.instanceId === dinglehopper.instanceId);
        expect(dinglehopperInPlay).toBeUndefined();

        const dinglehopperInDiscard = p2.discard.find(c => c.instanceId === dinglehopper.instanceId);
        expect(dinglehopperInDiscard).toBeDefined();
    });
});
