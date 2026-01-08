import { TestHarness } from '../engine-test-utils';
import { HeuristicBot } from '../../ai/heuristic-bot';
import { CardInstance, CardType } from '../../engine/models';
import { EffectExecutor } from '../../engine/abilities/executor';

/**
 * Edge case and error handling tests for interactive targeting
 */
describe('Interactive Targeting - Edge Cases', () => {
    let harness: TestHarness;
    let bot: HeuristicBot;
    let executor: EffectExecutor;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
        bot = new HeuristicBot(harness.turnManager, harness.turnManager.logger);
        executor = new EffectExecutor(harness.turnManager);
    });

    describe('No Valid Targets', () => {
        test('Empty board - no targets available', () => {
            const player1 = harness.game.state.players[harness.p1Id];

            // Clear all play areas
            player1.play = [];
            harness.game.state.players[harness.p2Id].play = [];

            const request = {
                id: 'no-targets',
                type: 'chosen_character',
                playerId: harness.p1Id,
                prompt: 'Choose a character',
                options: []
            };

            const response = bot.respondToChoiceRequest(request);

            expect(response.selectedIds).toEqual([]);
            expect(response.declined).toBe(false);
        });

        test('Resolving targets on empty board returns empty', async () => {
            const player1 = harness.game.state.players[harness.p1Id];

            // Empty board
            player1.play = [];
            harness.game.state.players[harness.p2Id].play = [];

            const resolved = await (executor as any).resolveTargets(
                { type: 'chosen_character' },
                {
                    player: player1,
                    card: null,
                    eventContext: {},
                    abilityName: 'Test'
                }
            );

            expect(resolved).toEqual([]);
        });
    });

    describe('Single Target Available', () => {
        test('Bot chooses only available target', () => {
            const singleChar = harness.createCard(harness.p2Id, {
                name: 'Only Target',
                type: CardType.Character,
                cost: 3,
                strength: 3,
                willpower: 4,
                lore: 1
            });

            const options = [{
                id: singleChar.instanceId,
                display: singleChar.name,
                card: singleChar,
                valid: true
            }];

            const request = {
                id: 'single-target',
                type: 'chosen_character',
                playerId: harness.p1Id,
                prompt: 'Choose target',
                options: options
            };

            const response = bot.respondToChoiceRequest(request);

            expect(response.selectedIds).toEqual([singleChar.instanceId]);
        });
    });

    describe('Invalid Mock Choices', () => {
        test('Mock choice with non-existent card ID', async () => {
            const player1 = harness.game.state.players[harness.p1Id];

            player1.play = [];
            harness.game.state.players[harness.p2Id].play = [];

            (harness.turnManager as any).mockPendingChoice = ['non-existent-id-12345'];

            const resolved = await (executor as any).resolveTargets(
                { type: 'chosen_character' },
                {
                    player: player1,
                    card: null,
                    eventContext: {},
                    abilityName: 'Test'
                }
            );

            expect(resolved).toEqual([]);
        });

        test('Mock choice list includes mix of valid and invalid IDs', async () => {
            const player1 = harness.game.state.players[harness.p1Id];
            const player2 = harness.game.state.players[harness.p2Id];

            const validChar = harness.createCard(harness.p2Id, {
                name: 'Valid',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3,
                lore: 1
            });

            player2.play.push(validChar);

            // Mix of valid ID and fake IDs
            (harness.turnManager as any).mockPendingChoice = [
                'fake-id-1',
                validChar.instanceId,
                'fake-id-2'
            ];

            const resolved = await (executor as any).resolveTargets(
                { type: 'chosen_character' },
                {
                    player: player1,
                    card: null,
                    eventContext: {},
                    abilityName: 'Test'
                }
            );

            // Should only resolve the valid one
            expect(resolved).toHaveLength(1);
            expect(resolved[0].instanceId).toBe(validChar.instanceId);
        });
    });

    describe('Bot with Edge Case Values', () => {
        test('Bot handles card with zero stats gracefully', () => {
            const zeroCard = harness.createCard(harness.p1Id, {
                name: 'Zero Stats Card',
                type: CardType.Character,
                cost: 0,
                strength: 0,
                willpower: 1, // At least 1 to exist
                lore: 0
            });

            const options = [{
                id: zeroCard.instanceId,
                display: zeroCard.name,
                card: zeroCard,
                valid: true
            }];

            const request = {
                id: 'zero-stats',
                type: 'chosen_character',
                playerId: harness.p1Id,
                prompt: 'Choose target',
                options: options
            };

            // Should not crash
            expect(() => {
                bot.respondToChoiceRequest(request);
            }).not.toThrow();
        });

        test('Bot handles null card reference in option', () => {
            const options = [{
                id: 'some-id',
                display: 'Null Card',
                card: null as any,
                valid: true
            }];

            const request = {
                id: 'null-card',
                type: 'chosen_character',
                playerId: harness.p1Id,
                prompt: 'Choose target',
                options: options
            };

            // Should not crash
            expect(() => {
                const response = bot.respondToChoiceRequest(request);
                expect(response).toBeDefined();
            }).not.toThrow();
        });
    });

    describe('Concurrent Targeting', () => {
        test('Multiple targeting abilities in sequence', async () => {
            const player1 = harness.game.state.players[harness.p1Id];
            const player2 = harness.game.state.players[harness.p2Id];

            const target1 = harness.createCard(harness.p2Id, {
                name: 'Target 1',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3,
                lore: 1
            });

            const target2 = harness.createCard(harness.p2Id, {
                name: 'Target 2',
                type: CardType.Character,
                cost: 3,
                strength: 3,
                willpower: 4,
                lore: 1
            });

            player2.play.push(target1, target2);

            // First targeting
            (harness.turnManager as any).mockPendingChoice = [target1.instanceId];

            const resolved1 = await (executor as any).resolveTargets(
                { type: 'chosen_character' },
                {
                    player: player1,
                    card: null,
                    eventContext: {},
                    abilityName: 'Ability 1'
                }
            );

            expect(resolved1[0].instanceId).toBe(target1.instanceId);

            // Second targeting (different choice)
            (harness.turnManager as any).mockPendingChoice = [target2.instanceId];

            const resolved2 = await (executor as any).resolveTargets(
                { type: 'chosen_character' },
                {
                    player: player1,
                    card: null,
                    eventContext: {},
                    abilityName: 'Ability 2'
                }
            );

            expect(resolved2[0].instanceId).toBe(target2.instanceId);
        });
    });
});
