
import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../engine-test-utils';
import { CardType, ZoneType } from '../../engine/models';

describe('Gaston - TOP THAT Ability', () => {
    let harness: TestHarness;
    let gastonCardData: any;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();

        gastonCardData = {
            name: "Gaston - Frightful Bully",
            type: CardType.Character,
            cost: 6,
            inkwell: true,
            abilities: [
                {
                    fullText: "Boost 2 ⬡ (Pay 2 ⬡ to put the top card of your deck facedown under this character.)"
                },
                {
                    fullText: "TOP THAT! Whenever this character quests, if there's a card under him, chosen opposing character can't challenge and must quest if able during their next turn."
                }
            ],
            strength: 4,
            willpower: 4,
            lore: 2
        };
    });

    it('should trigger ability on quest when card is under', async () => {
        const player = harness.game.getPlayer(harness.p1Id);
        const opponent = harness.game.getPlayer(harness.p2Id);

        // 1. Setup Gaston in Play
        const gastonInstance = harness.createCard(player, gastonCardData);
        gastonInstance.zone = ZoneType.Play;
        gastonInstance.ready = true;
        player.play.push(gastonInstance);

        // 2. Setup Opponent Character
        const oppChar = harness.createCard(opponent, { name: "Victim", type: CardType.Character, strength: 1, willpower: 1, lore: 1 });
        oppChar.zone = ZoneType.Play;
        opponent.play.push(oppChar);

        // 3. Put logic to add card under Gaston (Simulate manual Boost)
        const buriedCard = harness.createCard(player, { name: "Buried", type: CardType.Character });
        gastonInstance.meta.cardsUnder = [buriedCard];

        // 4. Register effects
        // Manually register with AbilitySystem because we manually added it to play
        harness.turnManager.abilitySystem.registerCard(gastonInstance);

        // 5. Quest with Gaston
        const success = await harness.turnManager.quest(player, gastonInstance.instanceId);
        expect(success).toBe(true);

        // 6. Verification
        // TestHarness auto-resolves choices by picking the first valid option.
        // Since "Victim" is the only opponent character, it should have been chosen.

        // Check active effects on oppChar
        // Global effects targeting specific cards are in game.state.activeEffects
        // Check active effects on oppChar
        // Global effects targeting specific cards are in game.state.activeEffects
        // PreventionFamilyHandler uses 'targetCardIds' and 'restrictionType'
        const effects = harness.game.state.activeEffects.filter(e =>
            (e.targetCardIds && e.targetCardIds.includes(oppChar.instanceId)) ||
            (e.targetId === oppChar.instanceId) ||
            (e.targetIds && e.targetIds.includes(oppChar.instanceId))
        );

        const cantChallenge = effects.find(e => (e as any).restrictionType === 'cant_challenge' || (e as any).restriction === 'cant_challenge');

        expect(cantChallenge).toBeDefined();

        // Check for force_quest? static-effect-parser uses type: 'force_quest'
        // But PreventionFamilyHandler converts valid types. force_quest is NOT in PreventionFamilyHandler exceptions list yet?
        // Check for force_quest
        // PreventionFamilyHandler pushes to target.restrictions with type 'force_quest'
        // Unlike restriction type, this does not create a global active effect in my implementation.

        const charRestrictions = (oppChar as any).restrictions || [];
        const forceQuestRestriction = charRestrictions.find((r: any) => r.type === 'force_quest');

        expect(forceQuestRestriction).toBeDefined();

        // This was previously checking activeEffects, which is wrong for how I implemented it.
        // const mustQuest = effects.find(e => e.type === 'force_quest' || (e as any).restrictionType === 'force_quest');
        // expect(mustQuest).toBeDefined();
    });
});
