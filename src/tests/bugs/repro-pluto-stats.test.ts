
import { TestHarness } from '../engine-test-utils';

describe('Bug: Pluto - Guard Dog Conditional Stats', () => {
    it('should have +4 strength while having no damage, and lose it when damaged', async () => {
        const harness = new TestHarness();
        await harness.initialize();

        const p1 = harness.getPlayer(harness.p1Id);

        // Setup P1 with Pluto
        harness.setPlay(harness.p1Id, ['Pluto - Guard Dog']);

        const pluto = p1.play[0];
        const abilitySystem = (harness.turnManager as any).abilitySystem;

        // Verify bonus is applied initially (0 damage)
        const initialStrength = abilitySystem.getModifiedStat(pluto, 'strength');
        console.log(`Pluto Initial Strength: ${initialStrength}`);

        // Base is 1, bonus is 4 -> 5
        expect(initialStrength).toBe(5);

        // Damage Pluto
        pluto.damage = 1;

        // Verify bonus is LOST
        const damagedStrength = abilitySystem.getModifiedStat(pluto, 'strength');
        console.log(`Pluto Damaged Strength: ${damagedStrength}`);

        expect(damagedStrength).toBe(1);

        // Heal Pluto
        pluto.damage = 0;
        const healedStrength = abilitySystem.getModifiedStat(pluto, 'strength');
        console.log(`Pluto Healed Strength: ${healedStrength}`);

        expect(healedStrength).toBe(initialStrength);
    });
});
