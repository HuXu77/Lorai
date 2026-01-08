/**
 * Integration Test: Opponent Interaction Effects
 * 
 * Tests opponent discard, reveal, and choice mechanics
 */

import { SharedTestFixture } from '../../test-fixtures';
import { CardType, ZoneType, ChoiceType } from '../../../engine/models';

describe('Opponent Interaction Integration', () => {
    let fixture: any;

    beforeAll(async () => {
        fixture = await SharedTestFixture.getInstance();
    });

    describe('Opponent Discard Effects', () => {
        it('should execute opponent discard effect', async () => {
            const { game, turnManager, p1Id, p2Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            const player2 = game.state.players[p2Id];

            // Setup: Opponent has cards in hand
            player2.hand = [
                { instanceId: 'opp-card-1', name: 'Card 1' },
                { instanceId: 'opp-card-2', name: 'Card 2' },
                { instanceId: 'opp-card-3', name: 'Card 3' }
            ] as any;
            player2.discard = [];

            const startingHand = player2.hand.length;

            // Execute opponent discard effect
            const discardEffect = {
                type: 'opponent_discard' as const,
                amount: 1
            };

            const context = {
                player: player1,
                card: null,
                gameState: game,
                eventContext: {
                    event: 'CARD_PLAYED',
                    timestamp: Date.now(),
                    player: player1
                }
            };

            await turnManager.abilitySystem.executor.execute(discardEffect, context);

            // Opponent should have discarded 1 card
            expect(player2.hand.length).toBe(startingHand - 1);
            expect(player2.discard.length).toBe(1);
        });
    });

    describe('Lore Manipulation', () => {
        it('should execute opponent lore loss', async () => {
            const { game, turnManager, p1Id, p2Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            const player2 = game.state.players[p2Id];

            // Setup: Opponent has lore
            player2.lore = 5;

            // Execute lose_lore effect
            const loreLossEffect = {
                type: 'lore_loss' as const,
                amount: 2,
                target: { type: 'opponent' as const }
            };

            const context = {
                player: player1,
                card: null,
                gameState: game,
                eventContext: {
                    event: 'CARD_PLAYED',
                    timestamp: Date.now(),
                    player: player1
                }
            };

            await turnManager.abilitySystem.executor.execute(loreLossEffect, context);

            // Opponent should lose 2 lore
            expect(player2.lore).toBe(3);
        });

        it('should not reduce lore below 0', async () => {
            const { game, turnManager, p1Id, p2Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            const player2 = game.state.players[p2Id];

            // Setup: Opponent has little lore
            player2.lore = 1;

            // Execute large lore loss
            const loreLossEffect = {
                type: 'lore_loss' as const,
                amount: 5,
                target: { type: 'opponent' as const }
            };

            const context = {
                player: player1,
                card: null,
                gameState: game,
                eventContext: {
                    event: 'CARD_PLAYED',
                    timestamp: Date.now(),
                    player: player1
                }
            };

            await turnManager.abilitySystem.executor.execute(loreLossEffect, context);

            // Lore should not go below 0
            expect(player2.lore).toBeGreaterThanOrEqual(0);
        });
    });

    describe('For Each Effects', () => {
        it('should execute effect for each matching card', async () => {
            const { game, turnManager, p1Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];

            // Setup: Multiple characters in play
            player1.play = [
                { instanceId: 'char-1', name: 'Char 1', type: CardType.Character, subtypes: ['Princess'] },
                { instanceId: 'char-2', name: 'Char 2', type: CardType.Character, subtypes: ['Princess'] },
                { instanceId: 'char-3', name: 'Char 3', type: CardType.Character, subtypes: ['Villain'] }
            ] as any;
            player1.lore = 0;

            // For each Princess character, gain 1 lore
            const forEachEffect = {
                type: 'for_each' as const,
                variable: 'card',
                source: { type: 'all_friendly_characters' as const, filter: { subtype: 'Princess' } },
                effect: { type: 'gain_lore' as const, amount: 1 }
            };

            const context = {
                player: player1,
                card: null,
                gameState: game,
                eventContext: {
                    event: 'CARD_PLAYED',
                    timestamp: Date.now(),
                    player: player1
                }
            };

            await turnManager.abilitySystem.executor.execute(forEachEffect, context);

            // Should gain lore for each eligible character found
            expect(player1.lore).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Area Effects', () => {
        it('should apply effect to all matching targets', async () => {
            const { game, turnManager, p1Id, p2Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            const player2 = game.state.players[p2Id];

            // Setup: Opponent has multiple characters
            const char1 = { instanceId: 'opp-char-1', name: 'Char 1', type: CardType.Character, damage: 0, willpower: 5, ownerId: p2Id };
            const char2 = { instanceId: 'opp-char-2', name: 'Char 2', type: CardType.Character, damage: 0, willpower: 5, ownerId: p2Id };
            const char3 = { instanceId: 'opp-char-3', name: 'Char 3', type: CardType.Character, damage: 0, willpower: 5, ownerId: p2Id };
            player2.play = [char1, char2, char3] as any;

            // Deal 1 damage to all opposing characters
            const areaEffect = {
                type: 'damage' as const,
                target: { type: 'each_opposing_character' as const },
                amount: 1
            };

            const context = {
                player: player1,
                card: null,
                gameState: game,
                eventContext: {
                    event: 'CARD_PLAYED',
                    timestamp: Date.now(),
                    player: player1
                }
            };

            await turnManager.abilitySystem.executor.execute(areaEffect, context);

            // All opponent characters should have 1 damage
            expect(char1.damage).toBe(1);
            expect(char2.damage).toBe(1);
            expect(char3.damage).toBe(1);
        });
    });
});
