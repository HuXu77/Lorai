/**
 * Ability Integration Tests using Debug State Builder
 * 
 * These tests demonstrate how to use the debug state builder to quickly
 * set up specific board states and test card abilities.
 */

import { createDebugGameState, putCardIntoPlay, addCardsToDiscard, addCardToHand } from '../test-utils/debug-state-builder';
import { executePlayCard } from '../../engine/game-actions/play-card-action';
import { Phase } from '../../engine/actions';

describe('Ability Integration Tests', () => {

    describe('Debug State Builder Validation', () => {
        it('creates game state with cards in correct zones', async () => {
            const { game, p1Id, p2Id, getP1Card, getP2Card } = await createDebugGameState({
                player1: {
                    hand: ['Mickey Mouse - Brave Little Tailor'],
                    play: ['Stitch - Rock Star'],
                    discard: ['Aladdin - Street Rat'],
                    deck: ['Elsa - Spirit of Winter'],
                    ink: 5,
                    lore: 3
                },
                player2: {
                    play: ['Moana - Of Motunui'],
                    ink: 4,
                    lore: 2
                }
            });

            const p1 = game.getPlayer(p1Id)!;
            const p2 = game.getPlayer(p2Id)!;

            // Verify zones
            expect(p1.hand).toHaveLength(1);
            expect(p1.hand[0].name).toBe('Mickey Mouse');

            expect(p1.play).toHaveLength(1);
            expect(getP1Card('Stitch')).toBeDefined();

            expect(p1.discard).toHaveLength(1);
            expect(p1.deck).toHaveLength(1);
            expect(p1.inkwell).toHaveLength(5);
            expect(p1.lore).toBe(3);

            expect(p2.play).toHaveLength(1);
            expect(getP2Card('Moana')).toBeDefined();
            expect(p2.lore).toBe(2);
        });

        it('supports adding cards dynamically', async () => {
            const result = await createDebugGameState({
                player1: { ink: 10 },
                player2: { ink: 5 }
            });

            const p1 = result.game.getPlayer(result.p1Id)!;
            expect(p1.hand).toHaveLength(0);

            // Add card to hand
            await addCardToHand(result, result.p1Id, 'Mickey Mouse - Brave Little Tailor');
            expect(p1.hand).toHaveLength(1);

            // Add card to play
            await putCardIntoPlay(result, result.p1Id, 'Stitch - Rock Star');
            expect(p1.play).toHaveLength(1);

            // Add cards to discard
            await addCardsToDiscard(result, result.p1Id, ['Aladdin - Street Rat', 'Elsa - Spirit of Winter']);
            expect(p1.discard).toHaveLength(2);
        });
    });

    describe('Basic Play Actions', () => {
        it('can play a character from hand', async () => {
            const { game, turnManager, p1Id } = await createDebugGameState({
                player1: {
                    hand: ['Stitch - Rock Star'],
                    ink: 10
                },
                player2: { ink: 5 }
            });

            game.state.phase = Phase.Main;
            const player = game.getPlayer(p1Id)!;
            const stitch = player.hand[0];

            const result = await executePlayCard(turnManager, player, stitch.instanceId);

            expect(result).toBe(true);
            expect(player.play.some(c => c.name === 'Stitch')).toBe(true);
            expect(player.hand).toHaveLength(0);
        });

        it('cannot play a card without enough ink', async () => {
            const { game, turnManager, p1Id } = await createDebugGameState({
                player1: {
                    hand: ['Stitch - Rock Star'], // Costs more than 1 ink
                    ink: 1
                },
                player2: { ink: 5 }
            });

            game.state.phase = Phase.Main;
            const player = game.getPlayer(p1Id)!;
            const stitch = player.hand[0];

            const result = await executePlayCard(turnManager, player, stitch.instanceId);

            // Should fail due to insufficient ink
            expect(result).toBe(false);
            expect(player.hand).toHaveLength(1); // Card still in hand
        });
    });

    describe('Quest Actions', () => {
        it('character gains lore when questing', async () => {
            const { game, turnManager, p1Id, getP1Card } = await createDebugGameState({
                player1: {
                    play: ['Stitch - Rock Star'],
                    lore: 0,
                    ink: 10
                },
                player2: { ink: 5 }
            });

            game.state.phase = Phase.Main;
            const player = game.getPlayer(p1Id)!;
            const stitch = getP1Card('Stitch')!;
            stitch.ready = true;
            stitch.turnPlayed = 0; // Not fresh/drying

            const initialLore = player.lore;
            const stitchLore = stitch.lore || 0;

            await turnManager.quest(player, stitch.instanceId);

            expect(player.lore).toBe(initialLore + stitchLore);
            expect(stitch.ready).toBe(false); // Exerted after quest
        });

        it('fresh characters cannot quest (ink drying)', async () => {
            const { game, turnManager, p1Id, getP1Card } = await createDebugGameState({
                player1: {
                    play: ['Stitch - Rock Star'],
                    lore: 0,
                    ink: 10
                },
                player2: { ink: 5 },
                turnCount: 1
            });

            game.state.phase = Phase.Main;
            const player = game.getPlayer(p1Id)!;
            const stitch = getP1Card('Stitch')!;
            stitch.ready = true;
            stitch.turnPlayed = 1; // Played this turn = drying

            const initialLore = player.lore;

            const result = await turnManager.quest(player, stitch.instanceId);

            // Should not gain lore (card is drying)
            expect(player.lore).toBe(initialLore);
        });
    });

    describe('Challenge Actions', () => {
        it('characters deal damage when challenging', async () => {
            const { game, turnManager, p1Id, p2Id, getP1Card, getP2Card } = await createDebugGameState({
                player1: {
                    play: ['Captain Hook - Forceful Duelist'],
                    ink: 10
                },
                player2: {
                    play: ['Stitch - Rock Star'],
                    ink: 5
                },
                turnCount: 5
            });

            game.state.phase = Phase.Main;
            const player = game.getPlayer(p1Id)!;
            const hook = getP1Card('Hook')!;
            hook.ready = true;
            hook.turnPlayed = 1; // Not drying

            const stitch = getP2Card('Stitch')!;
            stitch.ready = false; // Must be exerted to be challenged

            const initialDamage = stitch.damage || 0;
            const hookStrength = hook.strength || 0;

            const result = await turnManager.challenge(player, hook.instanceId, stitch.instanceId);

            // Challenge should succeed
            expect(result).toBe(true);
            // Stitch should have taken damage (Hook has Challenger +2, so 1 base + 2 = 3)
            expect(stitch.damage).toBeGreaterThan(initialDamage);
        });
    });

    describe('Shift Actions', () => {
        it('can shift onto a matching character', async () => {
            const { game, turnManager, p1Id } = await createDebugGameState({
                player1: {
                    hand: ['Stitch - Rock Star'],
                    play: ['Stitch - Carefree Surfer'], // Base Stitch to shift onto
                    ink: 10
                },
                player2: { ink: 5 },
                turnCount: 5
            });

            game.state.phase = Phase.Main;
            const player = game.getPlayer(p1Id)!;
            const shiftStitch = player.hand[0];
            const baseStitch = player.play[0];
            baseStitch.turnPlayed = 1; // Not drying

            // Register choice handler for optional ability prompts
            turnManager.registerChoiceHandler(p1Id, async (choice: any) => ({
                requestId: choice.id,
                playerId: p1Id,
                selectedIds: choice.optional ? ['no'] : [], // Decline optional effects
                declined: choice.optional,
                timestamp: Date.now()
            }));

            const result = await executePlayCard(
                turnManager,
                player,
                shiftStitch.instanceId,
                undefined, // singerId
                baseStitch.instanceId // shiftTargetId
            );

            expect(result).toBe(true);
            // Rock Star should be in play
            expect(player.play.some(c => c.fullName?.includes('Rock Star'))).toBe(true);
        });
    });

    describe('Exerted State Management', () => {
        it('exerted characters cannot quest', async () => {
            const { game, turnManager, p1Id, getP1Card } = await createDebugGameState({
                player1: {
                    play: ['Stitch - Rock Star'],
                    exerted: ['Stitch - Rock Star'],
                    lore: 0,
                    ink: 10
                },
                player2: { ink: 5 }
            });

            game.state.phase = Phase.Main;
            const player = game.getPlayer(p1Id)!;
            const stitch = getP1Card('Stitch')!;
            stitch.turnPlayed = 0;

            expect(stitch.ready).toBe(false);

            const initialLore = player.lore;
            const result = await turnManager.quest(player, stitch.instanceId);

            // Should not gain lore (card is exerted)
            expect(player.lore).toBe(initialLore);
        });
    });
});
