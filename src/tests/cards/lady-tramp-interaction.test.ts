import { TestHarness } from "../engine-test-utils";
import { GameEvent } from '../engine/abilities/events';
import { CardType, ZoneType } from "../../engine/models";

describe('Lady - Elegant Spaniel & Tramp Interaction', () => {
    let testHarness: TestHarness;

    beforeEach(async () => {
        testHarness = new TestHarness();
        // Silence logger to avoid "Cannot log after tests are done" errors and noise
        // while preserving critical errors
        (testHarness.turnManager as any).logger = {
            log: () => { },
            debug: () => { },
            info: () => { },
            warn: () => { },
            error: (msg: any, data: any) => console.error(msg, data),
            action: () => { },
            effect: () => { }
        };
        await testHarness.initialize();
    });

    it('should update Lady\'s lore when Tramp is played', async () => {
        const player1 = testHarness.getPlayer(testHarness.p1Id);

        // Setup Lady in play
        const lady = testHarness.createCard(testHarness.p1Id, {
            instanceId: 'lady-elegant-spaniel',
            name: 'Lady',
            fullName: 'Lady - Elegant Spaniel',
            cost: 2,
            inkwell: true,
            strength: 2,
            willpower: 3,
            lore: 1, // Base lore
            type: CardType.Character,
            parsedEffects: [{
                type: 'static',
                source: 'ability',
                text: 'While you have a character named Tramp in play, this character gets +1 lore.',
                effects: [{
                    type: 'modify_stats',
                    modifiers: {
                        lore: 1
                    },
                    condition: {
                        type: 'presence',
                        filter: {
                            name: 'Tramp',
                            zone: 'play',
                            controller: 'self'
                        }
                    }
                } as any]
            } as any]
        });

        // Setup Tramp in hand
        const tramp = testHarness.createCard(testHarness.p1Id, {
            instanceId: 'tramp-card',
            name: 'Tramp',
            fullName: 'Tramp - Charming Mutt',
            cost: 3,
            inkwell: true,
            strength: 3,
            willpower: 3,
            lore: 1,
            type: CardType.Character
        });

        // Set up board state
        testHarness.setHand(testHarness.p1Id, [tramp]);
        testHarness.setInk(testHarness.p1Id, 10); // Plenty of ink to play Tramp

        // Manually place Lady in play
        lady.zone = ZoneType.Play;
        player1.play.push(lady);
        // CRITICAL: Register Lady's abilities
        testHarness.turnManager.abilitySystem.registerCard(lady);

        // Initial Check
        const initialLore = testHarness.turnManager.abilitySystem.getModifiedStat(lady, 'lore');
        expect(initialLore).toBe(1);

        // Play Tramp
        await testHarness.playCard(testHarness.p1Id, tramp.instanceId);

        // Verify Tramp is in play
        const trampInPlay = player1.play.find(c => c.instanceId === tramp.instanceId);
        expect(trampInPlay).toBeDefined();

        // Final Check
        const finalLore = testHarness.turnManager.abilitySystem.getModifiedStat(lady, 'lore');
        expect(finalLore).toBe(2);
    });
});
