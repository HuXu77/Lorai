import { TestHarness } from './engine-test-utils';
import { CardInstance, ZoneType, CardType } from '../engine/models';
import { parseToAbilityDefinition } from '../engine/ability-parser';

describe('Reproduction: Quest Victory', () => {
    let testHarness: TestHarness;

    beforeEach(async () => {
        testHarness = new TestHarness();
        await testHarness.initialize();
    });

    it('should trigger victory when reaching 20 lore via questing', async () => {
        const player = testHarness.getPlayer(testHarness.p1Id);

        // 1. Set Lore to 18
        player.lore = 18;

        // 2. Create a character with 2 Lore
        const quester = testHarness.createCard(player, {
            name: 'Quester',
            type: CardType.Character,
            cost: 1,
            inkwell: true,
            lore: 2,
            strength: 1,
            willpower: 1
        });

        player.play.push(quester);
        quester.ready = true; // Ensure ready
        quester.turnPlayed = -1; // Ensure dry

        // 3. Quest
        await testHarness.turnManager.quest(player, quester.instanceId);

        // 4. Verify Lore is 20
        expect(player.lore).toBe(20);

        // 5. Verify Winner is set
        expect(testHarness.turnManager.game.state.winnerId).toBe(player.id);
    });
});
