import { TestHarness } from '../engine-test-utils';
import { CardInstance, CardType } from '../../engine/models';
import { EffectExecutor } from '../../engine/abilities/executor';

/**
 * Unit tests for executor's targeting via resolveTargets
 * Tests public resolveTargets method with various scenarios
 */
describe('Executor Targeting Methods', () => {
    let harness: TestHarness;
    let executor: EffectExecutor;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
        executor = new EffectExecutor(harness.turnManager);
    });

    describe('resolveTargets with mockPendingChoice', () => {
        test('Resolves chosen_character with mock choice', async () => {
            const player1 = harness.game.state.players[harness.p1Id];
            const player2 = harness.game.state.players[harness.p2Id];

            const targetChar = harness.createCard(harness.p2Id, {
                name: 'Target Character',
                type: CardType.Character,
                cost: 3,
                strength: 3,
                willpower: 4,
                lore: 1
            });

            player2.play.push(targetChar);

            // Set mock choice
            (harness.turnManager as any).mockPendingChoice = [targetChar.instanceId];

            const resolved = await (executor as any).resolveTargets(
                { type: 'chosen_character' },
                {
                    player: player1,
                    card: null,
                    eventContext: {},
                    abilityName: 'Test'
                }
            );

            expect(resolved).toHaveLength(1);
            expect(resolved[0].instanceId).toBe(targetChar.instanceId);
        });

        test('Resolves multiple targets with mock choice', async () => {
            const player1 = harness.game.state.players[harness.p1Id];
            const player2 = harness.game.state.players[harness.p2Id];

            const char1 = harness.createCard(harness.p2Id, {
                name: 'Target 1',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3,
                lore: 1
            });

            const char2 = harness.createCard(harness.p2Id, {
                name: 'Target 2',
                type: CardType.Character,
                cost: 3,
                strength: 3,
                willpower: 4,
                lore: 1
            });

            player2.play.push(char1, char2);

            // Mock choosing both
            (harness.turnManager as any).mockPendingChoice = [char1.instanceId, char2.instanceId];

            const resolved = await (executor as any).resolveTargets(
                { type: 'chosen_character' },
                {
                    player: player1,
                    card: null,
                    eventContext: {},
                    abilityName: 'Test'
                }
            );

            expect(resolved).toHaveLength(2);
            expect(resolved.map((r: any) => r.instanceId).sort()).toEqual(
                [char1.instanceId, char2.instanceId].sort()
            );
        });

        test('Mock choice honors filter during resolution', async () => {
            const player1 = harness.game.state.players[harness.p1Id];
            const player2 = harness.game.state.players[harness.p2Id];

            const validChar = harness.createCard(harness.p2Id, {
                name: 'Valid Target',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3,
                lore: 1
            });

            player2.play.push(validChar);

            // Mock choosing only the valid one
            (harness.turnManager as any).mockPendingChoice = [validChar.instanceId];

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

            // Should resolve the valid character
            expect(resolved).toHaveLength(1);
            expect(resolved[0].instanceId).toBe(validChar.instanceId);
            expect(resolved[0].cost).toBeLessThanOrEqual(4);
        });

        test('Returns empty for invalid mock choice IDs', async () => {
            const player1 = harness.game.state.players[harness.p1Id];

            // No characters on board
            player1.play = [];
            harness.game.state.players[harness.p2Id].play = [];

            // Mock choice with non-existent ID
            (harness.turnManager as any).mockPendingChoice = ['fake-id-123'];

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

    describe('resolveTargets with eventContext', () => {
        test('Uses targetCard from eventContext when provided', async () => {
            const player1 = harness.game.state.players[harness.p1Id];

            const targetChar = harness.createCard(harness.p2Id, {
                name: 'Event Target',
                type: CardType.Character,
                cost: 3,
                strength: 3,
                willpower: 4,
                lore: 1
            });

            const resolved = await (executor as any).resolveTargets(
                { type: 'chosen_character' },
                {
                    player: player1,
                    card: null,
                    eventContext: { targetCard: targetChar }, // Pre-provided target
                    abilityName: 'Test'
                }
            );

            expect(resolved).toHaveLength(1);
            expect(resolved[0].instanceId).toBe(targetChar.instanceId);
        });

        test('Event context target must pass filter', async () => {
            const player1 = harness.game.state.players[harness.p1Id];

            const validChar = harness.createCard(harness.p2Id, {
                name: 'Valid Target',
                type: CardType.Character,
                cost: 3,
                strength: 3,
                willpower: 4,
                lore: 1
            });

            const resolved = await (executor as any).resolveTargets(
                {
                    type: 'chosen_character',
                    filter: { maxCost: 4 } // Filter should accept cost 3
                },
                {
                    player: player1,
                    card: null,
                    eventContext: { targetCard: validChar },
                    abilityName: 'Test'
                }
            );

            // Should accept the target since it passes filter
            expect(resolved).toHaveLength(1);
            expect(resolved[0].instanceId).toBe(validChar.instanceId);
        });
    });

    describe('Filter handling', () => {
        test('Filters by cost correctly', async () => {
            const player1 = harness.game.state.players[harness.p1Id];
            const player2 = harness.game.state.players[harness.p2Id];

            const cheap = harness.createCard(harness.p2Id, {
                name: 'Cheap',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3,
                lore: 1
            });

            const expensive = harness.createCard(harness.p2Id, {
                name: 'Expensive',
                type: CardType.Character,
                cost: 6,
                strength: 5,
                willpower: 6,
                lore: 2
            });

            player2.play.push(cheap, expensive);

            // Mock choosing cheap one
            (harness.turnManager as any).mockPendingChoice = [cheap.instanceId];

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

            expect(resolved).toHaveLength(1);
            expect(resolved[0].cost).toBeLessThanOrEqual(4);
        });

        test('Empty board returns no targets', async () => {
            const player1 = harness.game.state.players[harness.p1Id];

            // Clear all play areas
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
});
