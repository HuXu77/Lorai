
import { TestHarness } from './engine-test-utils';
import { CardInstance } from '../engine/models';

describe('Reproduction: Lady - Elegant Spaniel Lore Update', () => {
    let testHarness: TestHarness;

    beforeEach(async () => {
        testHarness = new TestHarness();
        await testHarness.initialize();
    });

    it('should update Lady lore immediately when Tramp is played', async () => {
        const player = testHarness.getPlayer(testHarness.p1Id);

        // Setup State
        testHarness.setInk(player.id, 10);
        testHarness.setDeck(player.id, ['Lady - Elegant Spaniel', 'Tramp - Enterprising Dog']);
        testHarness.setHand(player.id, ['Lady - Elegant Spaniel', 'Tramp - Enterprising Dog']);

        // 1. Play Lady
        const lady = player.hand.find(c => c.name.includes('Lady'));
        if (!lady) throw new Error('Lady not found in hand');
        await testHarness.playCard(player.id, lady.instanceId);

        // Base Lore Check
        const baseLore = lady.lore || 0;

        // 2. Play Tramp
        const tramp = player.hand.find(c => c.name.includes('Tramp'));
        if (!tramp) throw new Error('Tramp not found in hand');
        await testHarness.playCard(player.id, tramp.instanceId);

        // 3. Assert Lore Increased (Engine Level)
        expect(lady.lore).toBe(baseLore + 1);

        // 4. Verify Serialized State (What UI sees)
        const serializedState = JSON.parse(testHarness.game.serialize());
        const p1State = serializedState.players[player.id];
        const ladyState = p1State.play.find((c: any) => c.instanceId === lady.instanceId);

        expect(ladyState).toBeDefined();
        if (ladyState) {
            expect(ladyState.lore).toBe((baseLore || 0) + 1);
        }
    });
});
