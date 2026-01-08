import { TestHarness } from '../engine-test-utils';
import { HeuristicBot } from '../../ai/heuristic-bot';
import { CardInstance, CardType } from '../../engine/models';
import { EffectExecutor } from '../../engine/abilities/executor';

/**
 * Integration tests for interactive targeting system
 * Tests executor and bot working together through public interfaces
 */
describe('Interactive Targeting - Integration Tests', () => {
    let harness: TestHarness;
    let bot: HeuristicBot;
    let executor: EffectExecutor;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
        bot = new HeuristicBot(harness.turnManager, harness.turnManager.logger);
        executor = new EffectExecutor(harness.turnManager);
    });

    describe('Bot Choice + Executor Integration', () => {
        test('Bot chooses damaged enemy for targeting', () => {
            const player2 = harness.game.state.players[harness.p2Id];

            // Create enemy characters
            const enemyChar1 = harness.createCard(harness.p2Id, {
                name: 'Enemy 1',
                type: CardType.Character,
                cost: 3,
                strength: 3,
                willpower: 4,
                lore: 1
            });

            const enemyChar2 = harness.createCard(harness.p2Id, {
                name: 'Enemy 2 - Damaged',
                type: CardType.Character,
                cost: 4,
                strength: 4,
                willpower: 5,
                lore: 2
            });
            enemyChar2.damage = 4; // 1 HP left

            // Put characters in play
            player2.play.push(enemyChar1, enemyChar2);

            // Test bot choice
            const options = [
                { id: enemyChar1.instanceId, display: 'Enemy 1', card: enemyChar1, valid: true },
                { id: enemyChar2.instanceId, display: 'Enemy 2 - Damaged', card: enemyChar2, valid: true }
            ];

            const request = {
                id: 'targeting-test',
                type: 'chosen_opposing_character',
                playerId: harness.p1Id,
                prompt: 'Choose a character to target',
                options: options
            };

            const response = bot.respondToChoiceRequest(request);

            // Bot should choose damaged enemy (easy to kill)
            expect(response.selectedIds).toHaveLength(1);
            expect(response.selectedIds[0]).toBe(enemyChar2.instanceId);
        });

        test('Resolve targets with mock choice', async () => {
            const player1 = harness.game.state.players[harness.p1Id];
            const player2 = harness.game.state.players[harness.p2Id];

            const char1 = harness.createCard(harness.p2Id, {
                name: 'Character 1',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3,
                lore: 1
            });

            const char2 = harness.createCard(harness.p2Id, {
                name: 'Character 2',
                type: CardType.Character,
                cost: 4,
                strength: 4,
                willpower: 5,
                lore: 2
            });

            player2.play.push(char1, char2);

            // Mock choice - choose character1
            (harness.turnManager as any).mockPendingChoice = [char1.instanceId];

            const resolved = await (executor as any).resolveTargets(
                { type: 'chosen_character' },
                {
                    player: player1,
                    card: null,
                    eventContext: {},
                    abilityName: 'Test'
                }
            );

            // Should resolve to char1
            expect(resolved).toHaveLength(1);
            expect(resolved[0].instanceId).toBe(char1.instanceId);
        });

        test('Resolve targets with filter', async () => {
            const player1 = harness.game.state.players[harness.p1Id];
            const player2 = harness.game.state.players[harness.p2Id];

            const cheapChar = harness.createCard(harness.p2Id, {
                name: 'Cheap Character',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3,
                lore: 1
            });

            const expensiveChar = harness.createCard(harness.p2Id, {
                name: 'Expensive Character',
                type: CardType.Character,
                cost: 6,
                strength: 5,
                willpower: 6,
                lore: 2
            });

            player2.play.push(cheapChar, expensiveChar);

            // Mock choosing the cheap one
            (harness.turnManager as any).mockPendingChoice = [cheapChar.instanceId];

            const resolved = await (executor as any).resolveTargets(
                {
                    type: 'chosen_character',
                    filter: { maxCost: 4 }
                },
                {
                    player: player1,
                    card: null,
                    eventContext: {},
                    abilityName: 'Test'
                }
            );

            // Should only resolve cheap character (expensive filtered out)
            expect(resolved).toHaveLength(1);
            expect(resolved[0].cost).toBeLessThanOrEqual(4);
        });

        test('No valid targets returns empty', async () => {
            const player1 = harness.game.state.players[harness.p1Id];

            // Empty board
            harness.game.state.players[harness.p1Id].play = [];
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

        test('Bot chooses among multiple valid targets', () => {
            const chars = [
                { name: 'Weak 1/2', str: 1, will: 2, lore: 0, damage: 0, cost: 1 },
                { name: 'Damaged 3/4', str: 3, will: 4, lore: 1, damage: 3, cost: 3 },
                { name: 'Strong 5/6', str: 5, will: 6, lore: 1, damage: 0, cost: 5 },
                { name: 'Lore 2/3', str: 2, will: 3, lore: 3, damage: 0, cost: 4 }
            ];

            const charInstances = chars.map(c => {
                const card = harness.createCard(harness.p2Id, {
                    name: c.name,
                    type: CardType.Character,
                    cost: c.cost,
                    strength: c.str,
                    willpower: c.will,
                    lore: c.lore
                });
                card.damage = c.damage;
                return card;
            });

            const damaged = charInstances.find(c => c.damage > 0);

            const options = charInstances.map(c => ({
                id: c.instanceId,
                display: c.name,
                card: c,
                valid: true
            }));

            const request = {
                id: 'multi-target',
                type: 'chosen_opposing_character',
                playerId: harness.p1Id,
                prompt: 'Choose target',
                options: options
            };

            const response = bot.respondToChoiceRequest(request);

            // Should choose damaged character (highest priority)
            expect(response.selectedIds).toHaveLength(1);
            expect(response.selectedIds[0]).toBe(damaged?.instanceId);
        });

        test('eventContext.targetCard takes precedence over mock', async () => {
            const player1 = harness.game.state.players[harness.p1Id];
            const player2 = harness.game.state.players[harness.p2Id];

            const char1 = harness.createCard(harness.p2Id, {
                name: 'Mock Target',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3,
                lore: 1
            });

            const char2 = harness.createCard(harness.p2Id, {
                name: 'Event Target',
                type: CardType.Character,
                cost: 3,
                strength: 3,
                willpower: 4,
                lore: 1
            });

            player2.play.push(char1, char2);

            // Set mock to char1 but eventContext to char2
            (harness.turnManager as any).mockPendingChoice = [char1.instanceId];

            const resolved = await (executor as any).resolveTargets(
                { type: 'chosen_character' },
                {
                    player: player1,
                    card: null,
                    eventContext: { targetCard: char2 }, // This should win
                    abilityName: 'Test'
                }
            );

            // Should resolve to char2 from eventContext
            expect(resolved).toHaveLength(1);
            expect(resolved[0].instanceId).toBe(char2.instanceId);
        });
    });
});
