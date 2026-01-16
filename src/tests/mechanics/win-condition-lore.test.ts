import { TestHarness } from "../engine-test-utils";
import { CardType } from "../../engine/models";
import { parseToAbilityDefinition } from "../../engine/ability-parser";

describe('Reproduction: Lore Victory via Ability', () => {
    let testHarness: TestHarness;

    beforeEach(async () => {
        testHarness = new TestHarness();
        await testHarness.initialize();
    });

    it('should trigger victory when reaching 20 lore via ability', async () => {
        const player = testHarness.getPlayer(testHarness.p1Id);

        // 1. Set Lore to 19
        player.lore = 19;

        // 2. Create a card that gains 1 Lore on play
        const loreGainer = testHarness.createCard(player, {
            name: 'Lore Gainer',
            type: CardType.Action,
            cost: 1,
            inkwell: true,
            abilities: [
                {
                    type: 'triggered',
                    fullText: "When you play this action, gain 1 lore."
                }
            ]
        });

        // Force parse
        loreGainer.parsedEffects = parseToAbilityDefinition(loreGainer) as any;
        player.hand.push(loreGainer);
        testHarness.setInk(player.id, 10);

        // 3. Play the card
        await testHarness.playCard(player, loreGainer);

        // 4. Verify Lore is 20
        expect(player.lore).toBe(20);

        // 5. Verify Winner is set
        expect(testHarness.turnManager.game.state.winnerId).toBe(player.id);
    });
});
