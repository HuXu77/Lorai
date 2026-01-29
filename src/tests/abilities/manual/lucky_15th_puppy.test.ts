
import { TestHarness } from '../../engine-test-utils';
import { CardType, ActionType, ZoneType } from '../../../engine/models';
import { getCurrentLore } from '../../../engine/stat-calculator';

describe('Ability: Lucky - The 15th Puppy (Puppy Love)', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should give other characters +1 lore when questing IF you have 4+ other characters', async () => {
        const player = harness.game.getPlayer(harness.p1Id);

        // 1. Setup Lucky
        const lucky = harness.createCard(player, {
            id: 444,
            name: 'Lucky - The 15th Puppy',
            type: CardType.Character,
            cost: 4,
            lore: 1,
            abilities: [
                {
                    type: 'triggered',
                    fullText: "PUPPY LOVE Whenever this character quests, if you have 4 or more other characters in play, your other characters get +1 ◊ this turn.",
                    effect: "Whenever this character quests, if you have 4 or more other characters in play, your other characters get +1 ◊ this turn."
                }
            ]
        });

        // Manual add to play AND register
        lucky.zone = ZoneType.Play;
        player.play.push(lucky);
        lucky.ready = true;
        harness.turnManager.abilitySystem.registerCard(lucky);

        // 2. Setup 4 other characters
        const others = [];
        for (let i = 0; i < 4; i++) {
            const char = harness.createCard(player, { name: `Other ${i}`, type: CardType.Character, cost: 1, lore: 1 });
            char.zone = ZoneType.Play; // ZoneType.Play
            player.play.push(char);
            others.push(char);
            // Register others just in case (though they have no abilities)
            harness.turnManager.abilitySystem.registerCard(char);
        }

        // 3. Quest with Lucky
        await harness.turnManager.resolveAction({
            type: ActionType.Quest,
            playerId: player.id,
            cardId: lucky.instanceId
        });

        // 4. Verify Lore Buff
        // Others should have +1 lore (Total 2)
        others.forEach((char, idx) => {
            const currentLore = getCurrentLore(char, harness.game.state);
            if (currentLore !== 2) {
                console.log(`Character ${char.name} has lore ${currentLore}, expected 2`);
            }
            expect(currentLore).toBe(2);
        });

        // Lucky himself should NOT get the buff
        expect(getCurrentLore(lucky, harness.game.state)).toBe(1);
    });

    it('should NOT give lore buff if fewer than 4 other characters', async () => {
        const player = harness.game.getPlayer(harness.p1Id);

        // 1. Setup Lucky
        const lucky = harness.createCard(player, {
            name: 'Lucky - The 15th Puppy',
            type: CardType.Character,
            lore: 1,
            abilities: [
                {
                    type: 'triggered',
                    fullText: "PUPPY LOVE Whenever this character quests, if you have 4 or more other characters in play, your other characters get +1 ◊ this turn.",
                    effect: "Whenever this character quests, if you have 4 or more other characters in play, your other characters get +1 ◊ this turn."
                }
            ]
        });
        lucky.zone = ZoneType.Play;
        player.play.push(lucky);
        lucky.ready = true;
        harness.turnManager.abilitySystem.registerCard(lucky);

        // 2. Setup 3 other characters (One less than required)
        const others = [];
        for (let i = 0; i < 3; i++) {
            const char = harness.createCard(player, { name: `Other ${i}`, type: CardType.Character, cost: 1, lore: 1 });
            char.zone = ZoneType.Play;
            player.play.push(char);
            others.push(char);
            harness.turnManager.abilitySystem.registerCard(char);
        }

        // 3. Quest with Lucky
        await harness.turnManager.resolveAction({
            type: ActionType.Quest,
            playerId: player.id,
            cardId: lucky.instanceId
        });

        // 4. Verify NO Buff
        others.forEach(char => {
            expect(getCurrentLore(char, harness.game.state)).toBe(1);
        });
    });
});
