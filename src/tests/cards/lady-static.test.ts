import { TestHarness } from './engine-test-utils';
import { ZoneType } from '../engine/models';

describe('Lady - Elegant Spaniel Static Ability', () => {
    let testHarness: TestHarness;

    beforeEach(async () => {
        testHarness = new TestHarness();
        await testHarness.initialize();
    });

    it('should have parsed static ability and condition correctly', async () => {
        const player1 = testHarness.getPlayer(testHarness.p1Id);

        // Lady - Elegant Spaniel
        // "While you have a character named Tramp in play, this character gets +1 ◊."
        const lady = testHarness.getCard('Lady - Elegant Spaniel');
        if (!lady) throw new Error('Lady not found');

        // Tramp - Enterprising Dog
        const tramp = testHarness.getCard('Tramp - Enterprising Dog');
        if (!tramp) throw new Error('Tramp not found');

        // Setup: Lady in play, no Tramp
        testHarness.setPlay(testHarness.p1Id, [lady]);
        const ladyInstance = player1.play[0];

        // Check Initial Parse
        console.log('[DEBUG] Lady Parsed Effects:', JSON.stringify(ladyInstance.parsedEffects, null, 2));

        // Use AbilitySystem to check lore
        let lore = testHarness.turnManager.abilitySystem.getModifiedStat(ladyInstance, 'lore');
        expect(lore).toBe(lady.lore); // Base lore (1?)
        console.log('[DEBUG] Lore without Tramp:', lore);

        // CLEAR static abilities map to avoid duplicates from previous setPlay (test harness artifact)
        (testHarness.turnManager.abilitySystem as any).staticAbilities.clear();

        // Add Tramp to play
        testHarness.setPlay(testHarness.p1Id, [lady, tramp]);

        // Re-fetch instances from play (setPlay recreates them)
        const ladyInstance2 = player1.play[0];
        const trampInstance = player1.play[1];

        console.log('[DEBUG] Tramp Name:', trampInstance.name);

        // Check Lore with Tramp
        lore = testHarness.turnManager.abilitySystem.getModifiedStat(ladyInstance2, 'lore');
        console.log('[DEBUG] Lore with Tramp:', lore);

        expect(lore).toBe(lady.lore + 1);
    });
});
