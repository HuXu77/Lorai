
import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';
import { Card } from '../../../engine/models';

describe('Mechanic: Support', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should add strength to chosen character when questing', async () => {
        // Setup: 
        // P1 has HeiHei - Boat Snack (1/2, Support) and Stitch - Rock Star (3/5)
        // P1 quests with HeiHei, targets Stitch

        // HeiHei - Boat Snack ID check required? assuming standard mocks or valid card lookup
        // Using 'HeiHei - Boat Snack' and 'Stitch - Rock Star' which are in the mock dataset/allCards

        await harness.setPlay(harness.p1Id, [
            { name: 'HeiHei - Boat Snack', ready: true }, // 1 Strength
            { name: 'Stitch - Rock Star', ready: true }   // 3 Strength
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const heihei = p1.play.find(c => c.name === 'HeiHei - Boat Snack')!;
        const stitch = p1.play.find(c => c.name === 'Stitch - Rock Star')!;

        // Initial check
        expect(heihei.strength).toBe(1);
        expect(stitch.strength).toBe(3);

        // Quest with HeiHei
        // Support is "Whenever this character quests, you MAY add their strength..."
        // This should trigger a choice.

        const result = await harness.turnManager.quest(harness.game.getPlayer(harness.p1Id), heihei.instanceId);

        // Verify lore
        const updatedP1 = harness.game.getPlayer(harness.p1Id);
        expect(updatedP1.lore).toBe(1); // HeiHei has 1 lore

        // Verify Stitch strength increase
        // Stitch 3 + HeiHei 1 = 4
        expect(stitch.strength).toBe(4);

        // Pass turn to verify expiration
        harness.turnManager.passTurn(harness.p1Id);

        // Stitch should revert to 3
        expect(stitch.strength).toBe(3);
    });


    it('should not apply support when no valid targets exist', async () => {
        // Setup: Only HeiHei in play (no other characters to support)
        await harness.setPlay(harness.p1Id, [
            { name: 'HeiHei - Boat Snack', ready: true }
        ]);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const heihei = p1.play.find(c => c.name === 'HeiHei - Boat Snack')!;

        // Quest with HeiHei
        await harness.turnManager.quest(harness.game.getPlayer(harness.p1Id), heihei.instanceId);

        // Verify lore was gained but no support effect was applied (no targets)
        const updatedP1 = harness.game.getPlayer(harness.p1Id);
        expect(updatedP1.lore).toBe(1);

        // Verify no active effects were created (since there were no valid targets)
        const supportEffects = harness.game.state.activeEffects.filter((e: any) =>
            e.type === 'modify_strength' && e.sourceCardId === heihei.instanceId
        );
        expect(supportEffects.length).toBe(0);
    });
});
