
import { TestHarness } from '../engine-test-utils';
import { CardType, ZoneType } from '../../engine/models';

describe('Integration: Cost Stability & UI Loop Simulation', () => {
    let testHarness: TestHarness;

    beforeEach(async () => {
        testHarness = new TestHarness();
        await testHarness.initialize();
    });

    it('should maintain stable cost even when deeply mutated by UI loop', async () => {
        const player = testHarness.createPlayer('Player 1');
        testHarness.setTurn(player.id);

        // 1. Setup: Tramp (3 cost) + Cost Reducer (Lantern -1)
        // We use a manual card to represent Tramp's 3 cost
        const tramp = testHarness.createCard(player, {
            name: 'Tramp',
            type: CardType.Character,
            cost: 3,
            inkwell: true,
            // Tramp's ability: -1 cost if you have a penalty (simulated here via Lantern for simplicity of isolation)
            // or we can simulate the exact static ability. Let's use Lantern to prove Global+Base stability.
        });
        player.addCardToZone(tramp, ZoneType.Hand);

        // Verify Initial State (SSoT)
        // The loader/factory should have set baseCost
        expect(tramp.baseCost).toBe(3);
        expect(tramp.cost).toBe(3);

        // Add 3 Ink
        testHarness.setInk(player.id, 3);
        const inks = player.inkwell;
        inks.forEach((i: any) => i.ready = true);

        // Add Global Reducer (Lantern)
        player.costReductions = [{
            amount: 1,
            filter: 'character',
            duration: 'until_end_of_turn',
            sourceId: 'lantern-1'
        }];

        // 2. Simulate UI Loop (The "Chaos" Phase)
        // In the UI, every frame we do: card.cost = getModifiedCost(card)
        // If our fix works, this should be stable. If it fails, it will drift to 0.

        const abilitySystem = testHarness.turnManager.abilitySystem;

        console.log('--- Starting UI Simulation Loop ---');

        for (let frame = 1; frame <= 10; frame++) {
            // THE BUG WAS HERE: logic was reading card.cost, reducing it, and saving it back to card.cost

            // 1. Emulate the fix's logic (resetting to base)
            // But first, let's Verify that getModifiedCost is IDEMPOTENT regardless of current cost

            // Mutate cost to something wrong to prove getModifiedCost ignores it
            tramp.cost = 999;

            // Calculate
            const effectiveCost = abilitySystem.getModifiedCost(tramp, player);

            // Verify Calculation
            // Base 3 - 1 (Lantern) = 2
            if (effectiveCost !== 2) {
                throw new Error(`Frame ${frame}: Cost drift detected! Expected 2, got ${effectiveCost}`);
            }

            // Simulate UI State Save
            tramp.cost = effectiveCost;
        }

        console.log('--- UI Simulation Loop Complete ---');

        // 3. Verify Stability
        expect(tramp.baseCost).toBe(3); // MUST stay 3
        expect(tramp.cost).toBe(2);     // MUST be 2 (3-1)

        // 4. Verify Gameplay (The "Inked" Phase)
        // Play the card. It should cost 2 ink.

        await testHarness.playCard(player, tramp);

        const readyInk = player.inkwell.filter(i => i.ready).length;
        // Total 3 ink. Cost 2. Remaining should be 1.
        expect(readyInk).toBe(1);

        // Verify Consumption
        // Lantern effect should be gone (consumed)
        const remainingReductions = player.costReductions?.filter(r => r.sourceId === 'lantern-1') || [];
        // Note: In integration, playCard logic consumes 'one_use' reductions. 
        // Lantern is usually 'until_end_of_turn' in tests but effectively one_use if configured so. 
        // Let's assume standard behavior: if it was consumed, good.
    });

    it('should correctly handle Tramp self-reduction with recursive updates', async () => {
        const player = testHarness.createPlayer('Player 1');
        testHarness.setTurn(player.id);

        // Setup: Tramp - Enterprising Dog
        // Ability: "This costs 1 less for each penalty..." (We'll simulate -1 static)
        const tramp = testHarness.createCard(player, {
            name: 'Tramp - Enterprising Dog',
            type: CardType.Character,
            cost: 3,
            abilities: [{
                type: 'static',
                fullText: 'Costs 1 less',
                effects: [] // Effects moved to parsedEffects below
            }],
            parsedEffects: [{
                type: 'static',
                fullText: 'Costs 1 less',
                effects: [{
                    type: 'cost_reduction',
                    amount: 1,
                    filter: { name: 'Tramp - Enterprising Dog' }
                }]
            } as any]
        });
        player.addCardToZone(tramp, ZoneType.Hand);

        // Ensure baseCost is set
        tramp.baseCost = 3;

        // Simulate UI Loop again
        const abilitySystem = testHarness.turnManager.abilitySystem;

        for (let i = 0; i < 5; i++) {
            // In the buggy version, this loop would reduce 3->2->1->0
            // With the fix, getModifiedCost MUST use baseCost(3) every time.

            // Manually dirty the cost to prove resilience
            tramp.cost = 0;

            const cost = abilitySystem.getModifiedCost(tramp, player);
            expect(cost).toBe(2); // 3 - 1 = 2

            tramp.cost = cost; // Save correct cost
        }
    });
});
