import { TestHarness } from '../engine-test-utils';
import { ZoneType } from '../../engine/models';

/**
 * Tests for Hades - King of Olympus bug fix:
 * "This character gets +1 ◊ for each other Villain character you have in play."
 */
describe('Hades - King of Olympus Lore Boost', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initGame([], []);
    });

    it('should give +1 lore for each other Villain character in play', async () => {
        const player = harness.getPlayer(harness.p1Id);

        // Create Hades - King of Olympus with the per_character lore boost
        const hades1 = {
            instanceId: 'hades-1',
            name: 'Hades',
            fullName: 'Hades - King of Olympus',
            type: 'Character',
            lore: 2, // Base lore
            strength: 4,
            willpower: 6,
            cost: 6,
            zone: ZoneType.Play,
            ownerId: harness.p1Id,
            classifications: ['Storyborn', 'Villain', 'Deity'],
            ready: true,
            damage: 0,
            parsedEffects: [{
                type: 'static',
                effects: [{
                    type: 'modify_stats',
                    stat: 'lore',
                    amount: { type: 'per_character', subtype: 'villain', yours: true, other: true },
                    multiplier: 1,
                    target: { type: 'self' }
                }]
            }]
        };

        // Create another Villain character
        const villain2 = {
            instanceId: 'villain-2',
            name: 'Scar',
            fullName: 'Scar - Mastermind',
            type: 'Character',
            lore: 1,
            strength: 3,
            willpower: 3,
            cost: 4,
            zone: ZoneType.Play,
            ownerId: harness.p1Id,
            classifications: ['Storyborn', 'Villain', 'King'],
            ready: true,
            damage: 0,
            parsedEffects: []
        };

        // Create a non-Villain character
        const nonVillain = {
            instanceId: 'hero-1',
            name: 'Mickey',
            fullName: 'Mickey Mouse - Detective',
            type: 'Character',
            lore: 1,
            strength: 2,
            willpower: 2,
            cost: 3,
            zone: ZoneType.Play,
            ownerId: harness.p1Id,
            classifications: ['Storyborn', 'Hero'],
            ready: true,
            damage: 0,
            parsedEffects: []
        };

        // Add all characters to play
        player.play = [hades1, villain2, nonVillain] as any[];

        // Register static abilities for Hades
        harness.turnManager.abilitySystem.registerCard(hades1 as any);

        // Get modified lore for Hades
        const modifiedLore = harness.turnManager.abilitySystem.getModifiedStat(hades1 as any, 'lore');

        // Hades should have base 2 + 1 (for Scar, the other Villain) = 3 lore
        // Mickey is not a Villain so doesn't count
        expect(modifiedLore).toBe(3);
    });

    it('should give +2 lore when two other Villains are in play', async () => {
        const player = harness.getPlayer(harness.p1Id);

        // Create Hades
        const hades1 = {
            instanceId: 'hades-1',
            name: 'Hades',
            fullName: 'Hades - King of Olympus',
            type: 'Character',
            lore: 2,
            strength: 4,
            willpower: 6,
            cost: 6,
            zone: ZoneType.Play,
            ownerId: harness.p1Id,
            classifications: ['Storyborn', 'Villain', 'Deity'],
            ready: true,
            damage: 0,
            parsedEffects: [{
                type: 'static',
                effects: [{
                    type: 'modify_stats',
                    stat: 'lore',
                    amount: { type: 'per_character', subtype: 'villain', yours: true, other: true },
                    multiplier: 1,
                    target: { type: 'self' }
                }]
            }]
        };

        // Create two other Villain characters
        const villain2 = {
            instanceId: 'villain-2',
            name: 'Scar',
            fullName: 'Scar - Mastermind',
            type: 'Character',
            lore: 1,
            classifications: ['Storyborn', 'Villain', 'King'],
            zone: ZoneType.Play,
            ownerId: harness.p1Id,
            ready: true,
            damage: 0,
            parsedEffects: []
        };

        const villain3 = {
            instanceId: 'villain-3',
            name: 'Jafar',
            fullName: 'Jafar - Royal Vizier',
            type: 'Character',
            lore: 1,
            classifications: ['Storyborn', 'Villain', 'Sorcerer'],
            zone: ZoneType.Play,
            ownerId: harness.p1Id,
            ready: true,
            damage: 0,
            parsedEffects: []
        };

        player.play = [hades1, villain2, villain3] as any[];

        harness.turnManager.abilitySystem.registerCard(hades1 as any);

        const modifiedLore = harness.turnManager.abilitySystem.getModifiedStat(hades1 as any, 'lore');

        // Hades should have base 2 + 2 (for Scar and Jafar) = 4 lore
        expect(modifiedLore).toBe(4);
    });

    it('should give +1 lore to each Hades when two are in play (each counts the other)', async () => {
        const player = harness.getPlayer(harness.p1Id);

        // Create two Hades characters
        const hades1 = {
            instanceId: 'hades-1',
            name: 'Hades',
            fullName: 'Hades - King of Olympus',
            type: 'Character',
            lore: 2,
            strength: 4,
            willpower: 6,
            cost: 6,
            zone: ZoneType.Play,
            ownerId: harness.p1Id,
            classifications: ['Storyborn', 'Villain', 'Deity'],
            ready: true,
            damage: 0,
            parsedEffects: [{
                type: 'static',
                effects: [{
                    type: 'modify_stats',
                    stat: 'lore',
                    amount: { type: 'per_character', subtype: 'villain', yours: true, other: true },
                    multiplier: 1,
                    target: { type: 'self' }
                }]
            }]
        };

        const hades2 = {
            instanceId: 'hades-2',
            name: 'Hades',
            fullName: 'Hades - King of Olympus',
            type: 'Character',
            lore: 2,
            strength: 4,
            willpower: 6,
            cost: 6,
            zone: ZoneType.Play,
            ownerId: harness.p1Id,
            classifications: ['Storyborn', 'Villain', 'Deity'],
            ready: true,
            damage: 0,
            parsedEffects: [{
                type: 'static',
                effects: [{
                    type: 'modify_stats',
                    stat: 'lore',
                    amount: { type: 'per_character', subtype: 'villain', yours: true, other: true },
                    multiplier: 1,
                    target: { type: 'self' }
                }]
            }]
        };

        player.play = [hades1, hades2] as any[];

        // Register static abilities for both
        harness.turnManager.abilitySystem.registerCard(hades1 as any);
        harness.turnManager.abilitySystem.registerCard(hades2 as any);

        // Each Hades should count the other as a Villain
        const hades1Lore = harness.turnManager.abilitySystem.getModifiedStat(hades1 as any, 'lore');
        const hades2Lore = harness.turnManager.abilitySystem.getModifiedStat(hades2 as any, 'lore');

        // Each Hades should have base 2 + 1 (for the other Hades) = 3 lore
        expect(hades1Lore).toBe(3);
        expect(hades2Lore).toBe(3);
    });

    it('should give 0 bonus when no other Villains are in play', async () => {
        const player = harness.getPlayer(harness.p1Id);

        // Create Hades alone
        const hades1 = {
            instanceId: 'hades-1',
            name: 'Hades',
            fullName: 'Hades - King of Olympus',
            type: 'Character',
            lore: 2,
            strength: 4,
            willpower: 6,
            cost: 6,
            zone: ZoneType.Play,
            ownerId: harness.p1Id,
            classifications: ['Storyborn', 'Villain', 'Deity'],
            ready: true,
            damage: 0,
            parsedEffects: [{
                type: 'static',
                effects: [{
                    type: 'modify_stats',
                    stat: 'lore',
                    amount: { type: 'per_character', subtype: 'villain', yours: true, other: true },
                    multiplier: 1,
                    target: { type: 'self' }
                }]
            }]
        };

        // Only Hades in play
        player.play = [hades1] as any[];

        harness.turnManager.abilitySystem.registerCard(hades1 as any);

        const modifiedLore = harness.turnManager.abilitySystem.getModifiedStat(hades1 as any, 'lore');

        // Hades should have base 2 + 0 (no other Villains) = 2 lore
        expect(modifiedLore).toBe(2);
    });
});
