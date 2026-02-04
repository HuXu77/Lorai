import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';

describe('Mechanic: Shift', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should allow Shift onto same-name character at reduced cost', async () => {
        // Setup: P1 has Elsa - Snow Queen in play and Elsa - Spirit of Winter in hand
        await harness.setPlay(harness.p1Id, ['Elsa - Snow Queen']);
        await harness.setHand(harness.p1Id, ['Elsa - Spirit of Winter']);
        harness.setInk(harness.p1Id, 6); // Enough for Shift (6), not enough for normal play (8)

        const p1 = harness.game.getPlayer(harness.p1Id);
        const elsa1 = p1.play[0];
        const spiritCard = p1.hand[0];

        // Play Elsa - Spirit of Winter using Shift
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: spiritCard.instanceId,
            shiftTargetId: elsa1.instanceId
        } as any);

        expect(result).toBe(true);

        // Verify: Spirit of Winter is now in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play).toHaveLength(1);
        expect(p1After.play[0].fullName).toBe('Elsa - Spirit of Winter');

        // Verify: Original Elsa is stored in meta (not discarded)
        expect(p1After.play[0].meta?.shiftedUnder).toBeDefined();
        expect(p1After.play[0].meta?.shiftedUnder.fullName).toBe('Elsa - Snow Queen');

        // Verify: Only 6 ink was spent (Shift cost, not 8)
        const readyInk = p1After.inkwell.filter(c => c.ready).length;
        expect(readyInk).toBe(0); // All 6 ink used
    });

    it('should transfer damage from shifted character', async () => {
        // Setup: P1 has damaged Elsa - Snow Queen in play
        await harness.setPlay(harness.p1Id, ['Elsa - Snow Queen']);
        await harness.setHand(harness.p1Id, ['Elsa - Spirit of Winter']);
        harness.setInk(harness.p1Id, 6);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const elsa1 = p1.play[0];
        elsa1.damage = 2; // Damage the original Elsa

        const spiritCard = p1.hand[0];

        // Play Elsa - Spirit of Winter using Shift
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: spiritCard.instanceId,
            shiftTargetId: elsa1.instanceId
        } as any);

        // Verify: Spirit of Winter has inherited the 2 damage
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play[0].damage).toBe(2);
        expect(p1After.play[0].fullName).toBe('Elsa - Spirit of Winter');
    });

    it('should transfer exerted state from shifted character', async () => {
        // Setup: P1 has exerted Elsa - Snow Queen in play
        await harness.setPlay(harness.p1Id, ['Elsa - Snow Queen']);
        await harness.setHand(harness.p1Id, ['Elsa - Spirit of Winter']);
        harness.setInk(harness.p1Id, 6);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const elsa1 = p1.play[0];
        elsa1.ready = false; // Exert the original Elsa

        const spiritCard = p1.hand[0];

        // Play Elsa - Spirit of Winter using Shift
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: spiritCard.instanceId,
            shiftTargetId: elsa1.instanceId
        } as any);

        // Verify: Spirit of Winter is also exerted
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play[0].ready).toBe(false);
        expect(p1After.play[0].fullName).toBe('Elsa - Spirit of Winter');
    });

    it('should transfer ready state from shifted character', async () => {
        // Setup: P1 has ready Dr. Facilier - Charlatan in play
        // Using Dr. Facilier because he has Shift and no "When you play" ability
        await harness.setPlay(harness.p1Id, ['Dr. Facilier - Charlatan']);
        await harness.setHand(harness.p1Id, ['Dr. Facilier - Agent Provocateur']); // Shift 5
        harness.setInk(harness.p1Id, 5);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const facilier1 = p1.play[0];
        facilier1.ready = true; // Ensure ready

        const agentCard = p1.hand[0];

        // Play Dr. Facilier - Agent Provocateur using Shift
        await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: agentCard.instanceId,
            shiftTargetId: facilier1.instanceId
        } as any);

        // Verify: Agent Provocateur is ready
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play[0].ready).toBe(true);
        expect(p1After.play[0].fullName).toBe('Dr. Facilier - Agent Provocateur');
    });

    it('should NOT allow Shift onto different-name character', async () => {
        // Setup: P1 has Mickey in play, tries to Shift Elsa onto it
        await harness.setPlay(harness.p1Id, ['Mickey Mouse - Wayward Sorcerer']);
        await harness.setHand(harness.p1Id, ['Elsa - Spirit of Winter']);
        harness.setInk(harness.p1Id, 6);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const mickey = p1.play[0];
        const spiritCard = p1.hand[0];

        // Attempt to Shift Elsa onto Mickey (should fail)
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: spiritCard.instanceId,
            shiftTargetId: mickey.instanceId
        } as any);

        // Verify: Action failed
        expect(result).toBe(false);

        // Verify: Elsa is still in hand
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.hand).toHaveLength(1);
        expect(p1After.hand[0].fullName).toBe('Elsa - Spirit of Winter');

        // Verify: Mickey is still in play
        expect(p1After.play).toHaveLength(1);
        expect(p1After.play[0].fullName).toBe('Mickey Mouse - Wayward Sorcerer');
    });

    it('should NOT allow Shift with insufficient ink', async () => {
        // Setup: P1 has Elsa - Snow Queen in play but only 5 ink (need 6 for Shift)
        await harness.setPlay(harness.p1Id, ['Elsa - Snow Queen']);
        await harness.setHand(harness.p1Id, ['Elsa - Spirit of Winter']);
        harness.setInk(harness.p1Id, 5); // Not enough!

        const p1 = harness.game.getPlayer(harness.p1Id);
        const elsa1 = p1.play[0];
        const spiritCard = p1.hand[0];

        // Attempt to Shift (should fail)
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: spiritCard.instanceId,
            shiftTargetId: elsa1.instanceId
        } as any);

        // Verify: Action failed
        expect(result).toBe(false);

        // Verify: Spirit of Winter is still in hand
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.hand).toHaveLength(1);
        expect(p1After.hand[0].fullName).toBe('Elsa - Spirit of Winter');
    });

    it('should allow playing character normally if no Shift target available', async () => {
        // Setup: P1 has NO Elsa in play, but has enough ink to play normally
        await harness.setPlay(harness.p1Id, []);
        await harness.setHand(harness.p1Id, ['Elsa - Spirit of Winter']);
        harness.setInk(harness.p1Id, 8); // Enough for normal play

        const p1 = harness.game.getPlayer(harness.p1Id);
        const spiritCard = p1.hand[0];

        // Play normally (no shiftTargetId)
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: spiritCard.instanceId
        } as any);

        expect(result).toBe(true);

        // Verify: Spirit of Winter is in play
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.play).toHaveLength(1);
        expect(p1After.play[0].fullName).toBe('Elsa - Spirit of Winter');

        // Verify: 8 ink was spent (normal cost)
        const readyInk = p1After.inkwell.filter(c => c.ready).length;
        expect(readyInk).toBe(0); // All 8 ink used
    });
});
