
import { TestHarness } from '../../engine-test-utils';
import { CardInstance, ZoneType, CardType } from '../../../engine/models';
import { parseToAbilityDefinition } from '../../../engine/ability-parser';

describe('Bug Fix Verification: Pete - Steamboat Rival', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('Pete - Steamboat Rival should only banish if another Pete is in play', async () => {
        const player = harness.game.getPlayer(harness.p1Id);
        const opponent = harness.game.getPlayer(harness.p2Id);

        // 1. Setup Pete - Steamboat Rival (Subject)
        const peteSteamboat = harness.createCard(player, {
            id: 1072,
            name: 'Pete - Steamboat Rival',
            type: CardType.Character,
            cost: 6,
            subtypes: ['Storyborn', 'Villain'],
            strength: 6,
            willpower: 6,
            abilities: [
                {
                    type: 'triggered',
                    fullText: "SCRAM! When you play this character, if you have another character named Pete in play, you may banish chosen opposing character.",
                    effect: "When you play this character, if you have another character named Pete in play, you may banish chosen opposing character."
                }
            ]
        });
        player.hand.push(peteSteamboat);
        harness.setInk(harness.p1Id, 10);

        // 2. Setup Opponent Target
        const target = harness.createCard(opponent, {
            id: 999,
            name: 'Target Dummy',
            type: CardType.Character,
            cost: 1,
            strength: 1,
            willpower: 1
        });
        opponent.play.push(target);

        // CASE 1: No other Pete - Effect should NOT trigger
        await harness.playCard(player, peteSteamboat);

        // Check 1: No banish choice should have happened (or it should auto-resolve to nothing)
        // If the parser fails completely, it might be a no-op which is correct for THIS state, 
        // but we need to verify the parsing structure.

        const abilities = parseToAbilityDefinition({
            id: 'mock-pete',
            name: 'Pete - Steamboat Rival',
            type: CardType.Character,
            abilities: [{
                type: 'triggered',
                fullText: "SCRAM! When you play this character, if you have another character named Pete in play, you may banish chosen opposing character.",
                effect: "When you play this character, if you have another character named Pete in play, you may banish chosen opposing character."
            }]
        });

        const ability = abilities[0];
        expect(ability).toBeDefined();
        const effect = ability.effects[0];

        // Using the new generic conditional parser we want to implement:
        // Expect nested effect structure
        if (effect.type === 'conditional') {
            expect(effect.condition).toBeDefined();
            expect(effect.condition.type).toBe('presence');
            expect(effect.condition.filter.name).toBe('Pete');
            expect(effect.effect.type).toBe('banish');
        } else {
            // Currently it will likely fail or parse as something else
            console.log('Parsed effect type:', effect.type);
            // We want it to be conditional
            expect(effect.type).toBe('conditional');
        }
    });

    it('Pete - Steamboat Rival should banish if another Pete IS in play', async () => {
        const player = harness.game.getPlayer(harness.p1Id);
        const opponent = harness.game.getPlayer(harness.p2Id);

        // 1. Setup "Another Pete"
        const otherPete = harness.createCard(player, {
            id: 1073, // Different ID, simulating another Pete card
            name: 'Pete - Bad Guy',
            type: CardType.Character,
            cost: 3
        });
        player.play.push(otherPete);

        // 2. Setup Pete - Steamboat Rival
        const peteSteamboat = harness.createCard(player, {
            id: 1072,
            name: 'Pete - Steamboat Rival',
            type: CardType.Character,
            cost: 6,
            abilities: [
                {
                    type: 'triggered',
                    fullText: "SCRAM! When you play this character, if you have another character named Pete in play, you may banish chosen opposing character.",
                    effect: "When you play this character, if you have another character named Pete in play, you may banish chosen opposing character."
                }
            ]
        });
        player.hand.push(peteSteamboat);
        harness.setInk(harness.p1Id, 10);

        // 3. Setup Target
        const target = harness.createCard(opponent, {
            id: 999,
            name: 'Target Dummy',
            type: CardType.Character,
            cost: 1,
            zone: ZoneType.Play
        });
        opponent.play.push(target);

        // 4. Register Choice Handler
        harness.turnManager.registerChoiceHandler(harness.p1Id, (choice: any) => {
            if (choice.type === 'optional_trigger' || choice.type === 'optional' || choice.type === 'yes_no') return { requestId: choice.id, selectedIds: ['yes'], playerId: harness.p1Id };
            // Handle optional effects (generic 'optional' prompt often used for "You may...")
            if (choice.type === 'optional') return { requestId: choice.id, selectedIds: ['yes'], playerId: harness.p1Id };

            if (choice.type === 'chosen_opposing_character' || choice.type === 'target_opposing_character') {
                const option = choice.options.find((o: any) => o.card.instanceId === target.instanceId);
                return { requestId: choice.id, selectedIds: [option.id], playerId: harness.p1Id };
            }
            return { requestId: choice.id, selectedIds: [], playerId: harness.p1Id };
        });

        // 5. Play
        await harness.playCard(player, peteSteamboat);

        // 6. Verify Banish
        console.log("Opponent Discard:", opponent.discard.map(c => c.name));
        console.log("Opponent Play:", opponent.play.map(c => c.name));
        console.log("Player Discard:", player.discard.map(c => c.name));
        console.log("Player Play:", player.play.map(c => c.name));

        expect(opponent.discard.find(c => c.instanceId === target.instanceId)).toBeDefined();
    });
});
