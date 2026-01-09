import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../engine-test-utils';
import { CardInstance, ZoneType } from '../../engine/models';

describe('Undamaged Condition Bug', () => {
    let testHarness: TestHarness;

    beforeEach(async () => {
        testHarness = new TestHarness();
        await testHarness.initGame([], []);
    });

    it('should apply buff only when character has no damage', () => {
        const p1 = testHarness.getPlayer(testHarness.p1Id);

        // Create a card with "While undamaged, gets +4 Strength" (e.g. Beast - Hardheaded)
        // We'll simulate this by adding a static effect manually
        const beast = testHarness.createCard(p1, {
            name: 'Beast - Hardheaded',
            cost: 3,
            inkable: true,
            type: 'Character', // Cast to any to avoid test linting issues if strict
            strength: 2,
            willpower: 4,
            lore: 1,
            parsedEffects: [
                {
                    type: 'static',
                    condition: { type: 'no_damage' },
                    effects: [
                        { type: 'modify_stats', stat: 'strength', amount: 4, target: 'self' }
                    ]
                }
            ]
        });

        p1.play.push(beast);
        beast.zone = ZoneType.Play;

        // Recalculate to apply the static effect
        testHarness.turnManager.recalculateEffects();

        // Verify initial strength (2 base + 4 buff = 6)
        expect(beast.strength, 'Should have +4 strength initially (undamaged)').toBe(6);

        // Apply 1 damage
        testHarness.turnManager.applyDamage(p1, beast, 1, 'test-source');
        testHarness.turnManager.recalculateEffects();

        // Verify strength reverts to base (2)
        expect(beast.strength, 'Should lose buff when damaged').toBe(2);

        // Heal the damage
        beast.damage = 0;
        testHarness.turnManager.recalculateEffects();

        // Verify strength returns (6)
        expect(beast.strength, 'Should regain buff when healed').toBe(6);
    });
});
