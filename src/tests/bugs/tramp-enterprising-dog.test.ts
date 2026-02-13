import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../engine-test-utils';

describe('Bug: Tramp - Enterprising Dog (NO TIME FOR WISECRACKS)', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should give +1 strength per OTHER character in play', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Setup: P1 has 4 characters in play
        await harness.setPlay(harness.p1Id, [
            'Mickey Mouse - Wayward Sorcerer',
            'Pongo - Determined Father',
            'Lady - Decisive Dog',
            'Simba - Protective Cub'
        ]);

        expect(p1.play.length).toBe(4);

        // Setup: Tramp in hand
        await harness.setInk(harness.p1Id, 10);
        await harness.setHand(harness.p1Id, ['Tramp - Enterprising Dog']);
        const tramp = p1.hand[0];

        // Intercept choice request for target selection
        let choicePrompt: any = null;
        harness.turnManager.emitChoiceRequest = async (choice: any) => {
            choicePrompt = choice;
            // Choose Mickey Mouse as the target
            const mickeyOption = choice.options.find((opt: any) =>
                opt.label?.includes('Mickey') || opt.id.includes('Mickey')
            );
            return {
                requestId: choice.id,
                playerId: choice.playerId,
                selectedIds: mickeyOption ? [mickeyOption.id] : [choice.options[0].id],
                timestamp: Date.now()
            };
        };

        // Play Tramp
        await harness.playCard(p1, tramp);
        harness.turnManager.recalculateEffects();

        // Verify choice was requested
        expect(choicePrompt).toBeDefined();
        expect(choicePrompt.prompt).toContain('Choose'); // Capital C

        // Find the chosen character (Mickey)
        const mickey = p1.play.find(c => c.name === 'Mickey Mouse');
        expect(mickey).toBeDefined();

        // BUG FIX: Should give +4 strength (4 OTHER characters in play)
        // Tramp is now in play, so there are 5 total characters
        // Mickey should get +4 (for the 4 OTHER characters: Pongo, Lady, Simba, Tramp)
        const expectedBonus = 4;
        expect(mickey.strength).toBe(mickey.baseStrength + expectedBonus);
    });

    it('should give +0 strength if no other characters in play', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Setup: No characters in play
        expect(p1.play.length).toBe(0);

        // Setup: Tramp in hand
        await harness.setInk(harness.p1Id, 10);
        await harness.setHand(harness.p1Id, ['Tramp - Enterprising Dog']);
        const tramp = p1.hand[0];

        // Intercept choice request
        harness.turnManager.emitChoiceRequest = async (choice: any) => {
            // Choose Tramp himself as the target
            const trampOption = choice.options.find((opt: any) =>
                opt.label?.includes('Tramp') || opt.id.includes('Tramp')
            );
            return {
                requestId: choice.id,
                playerId: choice.playerId,
                selectedIds: trampOption ? [trampOption.id] : [choice.options[0].id],
                timestamp: Date.now()
            };
        };

        // Play Tramp
        await harness.playCard(p1, tramp);
        harness.turnManager.recalculateEffects();

        // Tramp is now in play, but there are no OTHER characters
        // So he should get +0 strength
        const trampInPlay = p1.play.find(c => c.name === 'Tramp');
        expect(trampInPlay).toBeDefined();
        expect(trampInPlay.strength).toBe(trampInPlay.baseStrength); // No bonus
    });

    it('should give +2 strength with 2 other characters in play', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Setup: P1 has 2 characters in play
        await harness.setPlay(harness.p1Id, [
            'Mickey Mouse - Wayward Sorcerer',
            'Pongo - Determined Father'
        ]);

        expect(p1.play.length).toBe(2);

        // Setup: Tramp in hand
        await harness.setInk(harness.p1Id, 10);
        await harness.setHand(harness.p1Id, ['Tramp - Enterprising Dog']);
        const tramp = p1.hand[0];

        const mickey = p1.play[0];
        const mickeyBaseStrength = mickey.baseStrength || mickey.strength;

        // Intercept choice request
        harness.turnManager.emitChoiceRequest = async (choice: any) => {
            // Choose Mickey as target
            return {
                requestId: choice.id,
                playerId: choice.playerId,
                selectedIds: [choice.options[0].id],
                timestamp: Date.now()
            };
        };

        // Play Tramp
        await harness.playCard(p1, tramp);
        harness.turnManager.recalculateEffects();

        // Mickey should get +2 strength (2 OTHER characters: Pongo and Tramp)
        expect(mickey.strength).toBe(mickeyBaseStrength + 2);
    });
});
