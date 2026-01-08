
import { TestHarness } from '../../engine-test-utils';
import { CardInstance, ZoneType, CardType } from '../../../engine/models';

describe('Bug Fix Verification: Benja', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('Benja - Guardian of the Dragon Gem should target items and be optional', async () => {
        const player = harness.game.getPlayer(harness.p1Id);
        const opponent = harness.game.getPlayer(harness.p2Id);

        // 1. Setup Benja
        const benja = harness.createCard(player, {
            id: 390,
            name: 'Benja - Guardian of the Dragon Gem',
            type: CardType.Character,
            cost: 3,
            abilities: [
                {
                    type: 'triggered',
                    fullText: "WE HAVE A CHOICE When you play this character, you may banish chosen item.",
                    effect: "When you play this character, you may banish chosen item."
                }
            ]
        });

        // 2. Setup Opponent Item
        const item = harness.createCard(opponent, {
            id: 888,
            name: 'Target Item',
            type: CardType.Item,
            cost: 1
        });
        opponent.play.push(item);

        // 3. Setup Opponent Character (Distraction)
        const char = harness.createCard(opponent, {
            id: 889,
            name: 'Target Character',
            type: CardType.Character,
            cost: 1
        });
        opponent.play.push(char);

        // 4. Reparse to get the ability
        // We rely on the parser to generate the correct AST
        // We need to access the parser logic. 
        // In this harness, we manually set parsedEffects on cards usually. 
        // But for this bug, we need to verify the PARSER output.

        const { parseToAbilityDefinition } = require('../../../engine/ability-parser');
        const mockCard = {
            id: 'mock-benja',
            name: 'Benja - Guardian of the Dragon Gem',
            type: CardType.Character,
            abilities: [
                {
                    type: 'triggered',
                    fullText: "WE HAVE A CHOICE When you play this character, you may banish chosen item.",
                    effect: "When you play this character, you may banish chosen item."
                }
            ]
        };
        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities).toHaveLength(1);
        const ability = abilities[0];
        const effect = ability.effects[0];

        // CHECK 1: Optionality
        expect(effect.optional).toBe(true);

        // CHECK 2: Target Type
        expect(effect.type).toBe('banish');
        expect(effect.target.type).toBe('chosen_item'); // Failing here likely
        expect(effect.target.type).not.toContain('character');
    });

    it('Benja - Guardian of the Dragon Gem should target items and be optional (E2E Execution)', async () => {
        const player = harness.game.getPlayer(harness.p1Id);
        const opponent = harness.game.getPlayer(harness.p2Id);

        // 1. Setup Benja in hand (using real ID 390)
        // Note: We need a loader that has the REAL card definition including the ability text we rely on.
        // Since we patched the code, the real loader should parse it correctly now.
        // We'll create a card mocking the ID but we can also just rely on the harness creating it.

        // Let's create Benja with the correct text to ensure it uses our patched parser
        const benja = harness.createCard(player, {
            id: 390,
            name: 'Benja - Guardian of the Dragon Gem',
            type: CardType.Character,
            cost: 3,
            abilities: [
                {
                    type: 'triggered',
                    fullText: "WE HAVE A CHOICE When you play this character, you may banish chosen item.",
                    effect: "When you play this character, you may banish chosen item."
                }
            ]
        });
        player.hand.push(benja);
        harness.setInk(harness.p1Id, 10);

        // 2. Setup Opponent Item and Character
        const item = harness.createCard(opponent, {
            id: 888, // Changed to numeric ID to match harness expectations
            name: 'Target Item',
            type: CardType.Item,
            cost: 1
        });
        opponent.play.push(item);

        const char = harness.createCard(opponent, {
            id: 889, // Changed to numeric ID to match harness expectations
            name: 'Target Character',
            type: CardType.Character,
            cost: 1
        });
        opponent.play.push(char);

        // 3. Register Choice Handler: Handle both optional and target selection
        harness.turnManager.registerChoiceHandler(harness.p1Id, (choice: any) => {
            console.log('TEST HANDLER RECEIVED CHOICE:', JSON.stringify(choice, null, 2));
            if (choice.type === 'optional' || choice.type === 'yes_no') {
                return {
                    requestId: choice.id,
                    playerId: harness.p1Id,
                    selectedIds: ['yes'],
                    timestamp: Date.now()
                };
            }

            if (choice.type === 'optional_trigger') {
                // Confirm "Yes"
                return {
                    requestId: choice.id,
                    playerId: harness.p1Id,
                    selectedIds: [], // Not canceling
                    timestamp: Date.now()
                };
            }

            if (choice.type === 'chosen_item' || choice.type === 'target_item') {
                // Should see the item in options
                const itemOption = choice.options.find((o: any) => o.card.instanceId === item.instanceId);
                // Should NOT see character
                const charOption = choice.options.find((o: any) => o.card.instanceId === char.instanceId);

                if (!itemOption) throw new Error("Item not found in choices");
                if (charOption) throw new Error("Character found in choices (should filter to items)");

                return {
                    requestId: choice.id,
                    playerId: harness.p1Id,
                    selectedIds: [itemOption.id],
                    timestamp: Date.now()
                };
            }

            // Default fallback
            return {
                requestId: choice.id,
                playerId: harness.p1Id,
                selectedIds: [],
                timestamp: Date.now()
            };
        });

        // 4. Play Benja
        await harness.playCard(player, benja);

        // 5. Verify Item is Banished (in discard)
        // Re-fetch item from opponent discard to check status
        const banishedItem = opponent.discard.find(c => c.instanceId === item.instanceId);

        expect(banishedItem).toBeDefined();

        // Verify Character is untouched
        const remainingChar = opponent.play.find(c => c.instanceId === char.instanceId);
        expect(remainingChar).toBeDefined();
    });
});
