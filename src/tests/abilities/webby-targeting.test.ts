import { HeuristicBot } from '../../ai/heuristic-bot';
import { TestHarness } from '../engine-test-utils';
import { CardInstance, CardType } from '../../engine/models';

describe('Bot Target Choice Heuristics', () => {
    let harness: TestHarness;
    let bot: HeuristicBot;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
        harness.initialize();
        bot = new HeuristicBot(harness.turnManager, harness.turnManager.logger);
    });

    test('Bot prioritizes damaged character (easy to remove)', () => {
        // Create 3 characters with different profiles
        const weakChar: CardInstance = harness.createCard(harness.p1Id, {
            name: 'Weak Character',
            type: CardType.Character,
            cost: 1,
            strength: 1,
            willpower: 2,
            lore: 0
        });

        const damagedChar: CardInstance = harness.createCard(harness.p1Id, {
            name: 'Damaged Character',
            type: CardType.Character,
            cost: 3,
            strength: 3,
            willpower: 4,
            lore: 1
        });
        damagedChar.damage = 3; // Almost dead! (1 HP left)

        const strongChar: CardInstance = harness.createCard(harness.p1Id, {
            name: 'Strong Character',
            type: CardType.Character,
            cost: 5,
            strength: 5,
            willpower: 6,
            lore: 2
        });

        // Create choice request for targeting
        const options = [
            { id: weakChar.instanceId, display: 'Weak Character', card: weakChar, valid: true },
            { id: damagedChar.instanceId, display: 'Damaged Character', card: damagedChar, valid: true },
            { id: strongChar.instanceId, display: 'Strong Character', card: strongChar, valid: true }
        ];

        const request = {
            id: 'test-choice-1',
            type: 'chosen_opposing_character',
            playerId: harness.p1Id,
            prompt: 'Choose a character to target',
            options: options
        };

        const response = bot.respondToChoiceRequest(request);

        // Should choose damaged character (easiest to remove)
        expect(response.selectedIds).toHaveLength(1);
        expect(response.selectedIds[0]).toBe(damagedChar.instanceId);
        expect(response.declined).toBe(false);
    });

    test('Bot chooses high-value threat when no damaged characters', () => {
        const weakChar: CardInstance = harness.createCard(harness.p1Id, {
            name: 'Weak 1/2',
            type: CardType.Character,
            cost: 1,
            strength: 1,
            willpower: 2,
            lore: 0
        });

        const loreChar: CardInstance = harness.createCard(harness.p1Id, {
            name: 'Lore Machine 2/3 with 3 Lore',
            type: CardType.Character,
            cost: 4,
            strength: 2,
            willpower: 3,
            lore: 3
        });

        const strongChar: CardInstance = harness.createCard(harness.p1Id, {
            name: 'Strong 5/6',
            type: CardType.Character,
            cost: 5,
            strength: 5,
            willpower: 6,
            lore: 1
        });

        const options = [
            { id: weakChar.instanceId, display: 'Weak 1/2', card: weakChar, valid: true },
            { id: loreChar.instanceId, display: 'Lore Machine', card: loreChar, valid: true },
            { id: strongChar.instanceId, display: 'Strong 5/6', card: strongChar, valid: true }
        ];

        const request = {
            id: 'test-choice-2',
            type: 'chosen_opposing_character',
            playerId: harness.p1Id,
            prompt: 'Choose a character to debuff',
            options: options
        };

        const response = bot.respondToChoiceRequest(request);

        // Bot should choose strongChar (highest combined score)
        // Strong 5/6: 6*10 + 5*8 + 1*15 = 115
        // Lore 2/3 with 3L: 3*10 + 2*8 + 3*15 = 91
        expect(response.selectedIds).toHaveLength(1);
        expect(response.selectedIds[0]).toBe(strongChar.instanceId);
    });

    test('Bot handles empty options gracefully', () => {
        const request = {
            id: 'test-choice-empty',
            type: 'chosen_character',
            playerId: harness.p1Id,
            prompt: 'Choose a character',
            options: []
        };

        const response = bot.respondToChoiceRequest(request);

        expect(response.selectedIds).toHaveLength(0);
        expect(response.declined).toBe(false);
    });

    test('Bot handles only invalid options', () => {
        const char: CardInstance = harness.createCard(harness.p1Id, {
            name: 'Invalid Target',
            type: CardType.Character,
            cost: 3,
            strength: 3,
            willpower: 4,
            lore: 1
        });

        const request = {
            id: 'test-choice-invalid',
            type: 'chosen_character',
            playerId: harness.p1Id,
            prompt: 'Choose a character',
            options: [
                { id: char.instanceId, display: 'Invalid Target', card: char, valid: false }
            ]
        };

        const response = bot.respondToChoiceRequest(request);

        expect(response.selectedIds).toHaveLength(0);
    });
});
