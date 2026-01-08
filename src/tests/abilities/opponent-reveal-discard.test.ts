import { EffectExecutor } from '../../engine/abilities/executor';
import { TurnManager } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { Player } from '../../engine/models';
import { CardType } from '../../engine/models';

describe('opponent_reveal_and_discard - Subtype Filtering', () => {
    let executor: EffectExecutor;
    let mockTurnManager: any;
    let mockGameState: any;
    let player1: any;
    let player2: any;

    beforeEach(() => {
        // Setup mock players
        player1 = {
            id: 'player1',
            name: 'Player 1',
            hand: [],
            discard: [],
            deck: [],
            play: [],
            inkwell: []
        };

        player2 = {
            id: 'player2',
            name: 'Player 2',
            hand: [
                {
                    name: 'Test Song',
                    type: 'Action' as CardType,
                    subtypes: ['Song'],
                    zone: 'hand'
                },
                {
                    name: 'Test Character',
                    type: 'Character' as CardType,
                    subtypes: ['Hero'],
                    zone: 'hand'
                },
                {
                    name: 'Test Action',
                    type: 'Action' as CardType,
                    subtypes: [],
                    zone: 'hand'
                },
                {
                    name: 'Test Princess',
                    type: 'Character' as CardType,
                    subtypes: ['Princess', 'Hero'],
                    zone: 'hand'
                }
            ],
            discard: [],
            deck: [],
            play: [],
            inkwell: []
        };

        mockGameState = {
            players: {
                'player1': player1,
                'player2': player2
            }
        };

        mockTurnManager = {
            game: {
                state: mockGameState
            },
            logger: {
                info: jest.fn(),
                debug: jest.fn()
            }
        };

        executor = new EffectExecutor(mockTurnManager);
    });

    describe('Song Card Filtering', () => {
        it('should discard only song cards when filter is "song"', async () => {
            const effect = {
                type: 'opponent_reveal_and_discard' as const,
                filter: { cardType: 'song' }
            };

            const context = {
                player: player1,
                card: null as any,
                source: null as any
            };

            await (executor as any).executeOpponentRevealAndDiscard(effect, context);

            // Song should be discarded
            expect(player2.discard.length).toBe(1);
            expect(player2.discard[0].name).toBe('Test Song');
            expect(player2.discard[0].type).toBe('Action');
            expect(player2.discard[0].subtypes).toContain('Song');

            // Hand should have 3 cards left (character, action, princess)
            expect(player2.hand.length).toBe(3);
            expect(player2.hand.find((c: any) => c.name === 'Test Song')).toBeUndefined();
        });

        it('should NOT discard characters when filter is "song"', async () => {
            // Remove song from hand to test character exclusion
            player2.hand = player2.hand.filter((c: any) => c.name !== 'Test Song');

            const effect = {
                type: 'opponent_reveal_and_discard' as const,
                filter: { cardType: 'song' }
            };

            const context = {
                player: player1,
                card: null as any,
                source: null as any
            };

            await (executor as any).executeOpponentRevealAndDiscard(effect, context);

            // Nothing should be discarded (no songs available)
            expect(player2.discard.length).toBe(0);
            expect(player2.hand.length).toBe(3); // All cards remain
        });

        it('should NOT discard non-song actions when filter is "song"', async () => {
            // Remove song, keep only non-song action
            player2.hand = [
                {
                    name: 'Test Action',
                    type: 'Action' as CardType,
                    subtypes: [],
                    zone: 'hand'
                }
            ];

            const effect = {
                type: 'opponent_reveal_and_discard' as const,
                filter: { cardType: 'song' }
            };

            const context = {
                player: player1,
                card: null as any,
                source: null as any
            };

            await (executor as any).executeOpponentRevealAndDiscard(effect, context);

            // Nothing should be discarded
            expect(player2.discard.length).toBe(0);
            expect(player2.hand.length).toBe(1);
        });
    });

    describe('Card Type Filtering', () => {
        it('should discard only characters when filter is "character"', async () => {
            const effect = {
                type: 'opponent_reveal_and_discard' as const,
                filter: { cardType: 'character' }
            };

            const context = {
                player: player1,
                card: null as any,
                source: null as any
            };

            await (executor as any).executeOpponentRevealAndDiscard(effect, context);

            // One of the characters should be discarded
            expect(player2.discard.length).toBe(1);
            expect(player2.discard[0].type).toBe('Character');

            // Should have 3 cards left
            expect(player2.hand.length).toBe(3);
        });

        it('should discard only actions when filter is "action"', async () => {
            const effect = {
                type: 'opponent_reveal_and_discard' as const,
                filter: { cardType: 'action' }
            };

            const context = {
                player: player1,
                card: null as any,
                source: null as any
            };

            await (executor as any).executeOpponentRevealAndDiscard(effect, context);

            // One action should be discarded (song or regular action)
            expect(player2.discard.length).toBe(1);
            expect(player2.discard[0].type).toBe('Action');
        });
    });

    describe('Subtype Filtering', () => {
        it('should discard cards with specific subtype', async () => {
            const effect = {
                type: 'opponent_reveal_and_discard' as const,
                filter: { subtype: 'Princess' }
            };

            const context = {
                player: player1,
                card: null as any,
                source: null as any
            };

            await (executor as any).executeOpponentRevealAndDiscard(effect, context);

            // Princess character should be discarded
            expect(player2.discard.length).toBe(1);
            expect(player2.discard[0].name).toBe('Test Princess');
            expect(player2.discard[0].subtypes).toContain('Princess');
        });

        it('should handle combined type and subtype filtering', async () => {
            const effect = {
                type: 'opponent_reveal_and_discard' as const,
                filter: {
                    cardType: 'character',
                    subtype: 'Hero'
                }
            };

            const context = {
                player: player1,
                card: null as any,
                source: null as any
            };

            await (executor as any).executeOpponentRevealAndDiscard(effect, context);

            // One of the Hero characters should be discarded
            expect(player2.discard.length).toBe(1);
            expect(player2.discard[0].type).toBe('Character');
            expect(player2.discard[0].subtypes).toContain('Hero');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty hand gracefully', async () => {
            player2.hand = [];

            const effect = {
                type: 'opponent_reveal_and_discard' as const,
                filter: { cardType: 'song' }
            };

            const context = {
                player: player1,
                card: null as any,
                source: null as any
            };

            await (executor as any).executeOpponentRevealAndDiscard(effect, context);

            expect(player2.discard.length).toBe(0);
            expect(mockTurnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('no cards')
            );
        });

        it('should handle no matching cards', async () => {
            player2.hand = [
                { name: 'Character Only', type: 'Character' as CardType, subtypes: [], zone: 'hand' }
            ];

            const effect = {
                type: 'opponent_reveal_and_discard' as const,
                filter: { cardType: 'song' }
            };

            const context = {
                player: player1,
                card: null as any,
                source: null as any
            };

            await (executor as any).executeOpponentRevealAndDiscard(effect, context);

            expect(player2.discard.length).toBe(0);
            expect(player2.hand.length).toBe(1);
            expect(mockTurnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('no matching cards')
            );
        });

        it('should reveal hand before discarding', async () => {
            const effect = {
                type: 'opponent_reveal_and_discard' as const,
                filter: { cardType: 'song' }
            };

            const context = {
                player: player1,
                card: null as any,
                source: null as any
            };

            await (executor as any).executeOpponentRevealAndDiscard(effect, context);

            // Should log the reveal
            expect(mockTurnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('reveals hand')
            );
        });
    });
});
