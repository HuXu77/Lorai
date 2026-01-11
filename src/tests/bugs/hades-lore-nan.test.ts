
// Jest globals are automatically available
import { TestHarness } from '../engine-test-utils';
import { CardType, ZoneType } from '../../engine/models';

describe('Hades Lore NaN Bug', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should correctly calculate Hades lore with other villains', async () => {
        const player = harness.game.getPlayer(harness.p1Id);

        // 1. Setup Hades (Shift 6, 6/7/1, +1 lore per other villain)
        const hades = harness.createCard(player, {
            name: "Hades - King of Olympus",
            type: CardType.Character,
            strength: 6,
            willpower: 7,
            lore: 1,
            subtypes: ["Floodborn", "Villain", "King", "Deity"],
            abilities: [
                {
                    fullText: "SINISTER PLOT This character gets +1 ◊ for each other Villain character you have in play."
                }
            ]
        });
        hades.zone = ZoneType.Play;
        player.play.push(hades);

        // 2. Setup another Villain (e.g. Cruella)
        const villain2 = harness.createCard(player, {
            name: "Cruella De Vil - Miserable as Usual",
            type: CardType.Character,
            subtypes: ["Storyborn", "Villain"],
            strength: 1,
            willpower: 3,
            lore: 1
        });
        villain2.zone = ZoneType.Play;
        player.play.push(villain2);

        // 3. Register cards to ensure calculate effects run
        // (TestHarness.createCard doesn't auto-register with ability system, but recalculate likely iterates all cards)

        // Force recalculate
        harness.turnManager.recalculateEffects();

        // 4. Verify Lore
        // Base 1 + 1 (for Cruella) = 2.
        // If bug exists, it might be NaN or "1[object Object]"

        // Check raw value first to see what it is
        console.log(`Hades Lore: ${hades.lore} (Type: ${typeof hades.lore})`);

        expect(hades.lore).toBe(2);
    });
});
