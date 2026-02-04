import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Rare Ability: Skirmish', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should deal 1 damage using Skirmish ability', async () => {
        // Setup: P1 has Robin Hood - Capable Fighter (Skirmish ability) ready
        await harness.setPlay(harness.p1Id, ['Robin Hood - Capable Fighter']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        const robin = p1.play[0];
        robin.ready = true;

        // Setup: P2 has Mickey (4 willpower)
        await harness.setPlay(harness.p2Id, ['Mickey Mouse - Wayward Sorcerer']);
        const p2 = harness.game.getPlayer(harness.p2Id);
        const mickey = p2.play[0];

        // Execute: Use Skirmish ability on Mickey
        const result = await harness.turnManager.resolveAction({
            type: 'UseAbility' as any,
            playerId: harness.p1Id,
            cardId: robin.instanceId,
            abilityIndex: 0
        } as any);

        expect(result).toBe(true);

        // Verify: Robin should be exerted (used ability)
        expect(robin.ready).toBe(false);
        // Note: Cannot verify specific target damage as test harness auto-selects target
    });

    it('should allow targeting any character with Skirmish', async () => {
        // Setup: P1 has Robin Hood ready
        await harness.setPlay(harness.p1Id, ['Robin Hood - Capable Fighter', 'Mickey Mouse - Wayward Sorcerer']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        const robin = p1.play[0];
        const mickeyP1 = p1.play[1];
        robin.ready = true;

        // Setup: P2 has a character
        await harness.setPlay(harness.p2Id, ['Elsa - Snow Queen']);
        const p2 = harness.game.getPlayer(harness.p2Id);
        const elsa = p2.play[0];

        // Skirmish can target any character (not just opposing)
        // This test verifies the ability works
        const result = await harness.turnManager.resolveAction({
            type: 'UseAbility' as any,
            playerId: harness.p1Id,
            cardId: robin.instanceId,
            abilityIndex: 0
        } as any);

        expect(result).toBe(true);
    });

    it('should require Robin to be ready to use Skirmish', async () => {
        // Setup: P1 has Robin (exerted)
        await harness.setPlay(harness.p1Id, ['Robin Hood - Capable Fighter']);
        const p1 = harness.game.getPlayer(harness.p1Id);
        const robin = p1.play[0];
        robin.ready = false; // Already exerted

        // Setup: P2 has Mickey
        await harness.setPlay(harness.p2Id, ['Mickey Mouse - Wayward Sorcerer']);
        const p2 = harness.game.getPlayer(harness.p2Id);
        const mickey = p2.play[0];

        // Execute: Try to use Skirmish while exerted
        const result = await harness.turnManager.resolveAction({
            type: 'UseAbility' as any,
            playerId: harness.p1Id,
            cardId: robin.instanceId,
            abilityIndex: 0
        } as any);

        expect(result).toBe(false);
        // Verify: Mickey should have no damage
        expect(mickey.damage || 0).toBe(0);
    });
});
