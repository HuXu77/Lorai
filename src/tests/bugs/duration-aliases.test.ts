import { TestHarness } from '../engine-test-utils';

describe('Duration Aliases Expiration', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should expire until_next_turn effects at start of source player turn', async () => {
        const p1Id = harness.p1Id;
        const p1 = harness.game.getPlayer(p1Id);

        // Manually add an effect with 'until_next_turn'
        harness.game.state.activeEffects.push({
            type: 'restriction',
            restrictionType: 'cant_quest',
            targetPlayerIds: [p1Id],
            duration: 'until_next_turn',
            sourcePlayerId: p1Id,
            sourceCardId: 'test-source'
        } as any);

        expect(harness.game.state.activeEffects.length).toBe(1);

        // Pass P1 turn -> P2 Turn
        await harness.turnManager.passTurn(p1Id);
        // Should still be active (it's "until YOUR next turn" usually implied, checks source start)
        expect(harness.game.state.activeEffects.length).toBe(1);

        // Pass P2 turn -> P1 Turn Start (should expire)
        await harness.turnManager.passTurn(harness.p2Id);

        expect(harness.game.state.activeEffects.length).toBe(0);
    });

    it('should expire until_next_turn_start effects at start of source player turn', async () => {
        const p1Id = harness.p1Id;
        const p1 = harness.game.getPlayer(p1Id);

        // Manually add an effect with 'until_next_turn_start'
        harness.game.state.activeEffects.push({
            type: 'restriction',
            restrictionType: 'cant_quest',
            targetPlayerIds: [p1Id],
            duration: 'until_next_turn_start',
            sourcePlayerId: p1Id,
            sourceCardId: 'test-source'
        } as any);

        expect(harness.game.state.activeEffects.length).toBe(1);

        // Pass P1 turn -> P2 Turn
        await harness.turnManager.passTurn(p1Id);
        expect(harness.game.state.activeEffects.length).toBe(1);

        // Pass P2 turn -> P1 Turn Start (should expire)
        await harness.turnManager.passTurn(harness.p2Id);

        expect(harness.game.state.activeEffects.length).toBe(0);
    });
});
