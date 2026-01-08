import { TestHarness } from '../engine-test-utils';
import { ZoneType } from '../../engine/models';

describe('Pete - Games Referee Expiration', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should clear restriction at the start of the next turn', async () => {
        const p1Id = harness.p1Id;
        const p2Id = harness.p2Id;
        const p1 = harness.game.getPlayer(p1Id);
        const p2 = harness.game.getPlayer(p2Id);

        harness.setInk(p1Id, 3);
        harness.setHand(p1Id, ['Pete - Games Referee']);
        harness.setInk(p2Id, 2);
        harness.setHand(p2Id, ['Develop Your Brain']);

        const pete = p1.hand.find(c => c.fullName === 'Pete - Games Referee' || c.name === 'Pete');
        if (!pete) throw new Error('Pete not found in hand');

        await harness.turnManager.playCard(p1, pete.instanceId);
        await harness.turnManager.passTurn(p1.id);

        // P2 Turn
        console.log('--- P2 Turn Start ---');
        console.log('Active Effects:', JSON.stringify(harness.game.state.activeEffects, null, 2));

        const action = p2.hand[0];
        const success = await harness.turnManager.playCard(p2, action.instanceId);

        expect(success).toBe(false); // Should be blocked

        await harness.turnManager.passTurn(p2.id);
        await harness.turnManager.passTurn(p1.id); // P1 Turn Starts (should expire here)

        console.log('--- P2 Turn 2 Start ---');
        console.log('Active Effects:', JSON.stringify(harness.game.state.activeEffects, null, 2));

        const action2 = p2.hand[0];
        const success2 = await harness.turnManager.playCard(p2, action2.instanceId);

        expect(success2).toBe(true); // Should NOT be blocked
        expect(action2.zone).toBe(ZoneType.Discard);
    });
});
