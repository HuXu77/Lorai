import { EffectExecutor } from '../../engine/abilities/executor';
import { TurnManager } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { Player } from '../../engine/models';
import { CardType } from '../../engine/models';

describe('Opponent Reveal and Discard Family', () => {
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
                    zone: 'hand',
                    instanceId: 'c1'
                },
                {
                    name: 'Test Character',
                    type: 'Character' as CardType,
                    subtypes: ['Hero'],
                    zone: 'hand',
                    instanceId: 'c2'
                },
                {
                    name: 'Test Action',
                    type: 'Action' as CardType,
                    subtypes: [],
                    zone: 'hand',
                    instanceId: 'c3'
                },
                {
                    name: 'Test Princess',
                    type: 'Character' as CardType,
                    subtypes: ['Princess', 'Hero'],
                    zone: 'hand',
                    instanceId: 'c4'
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
                info: vi.fn(),
                debug: vi.fn(),
                warn: vi.fn()
            },
            trackZoneChange: vi.fn(),
            requestChoice: vi.fn().mockImplementation(async (request) => {
                // Default behavior: pick the first VALID option
                const validOptions = request.options.filter((o: any) => o.valid);
                if (validOptions.length > 0) {
                    return { selectedIds: [validOptions[0].id] };
                }
                return { selectedIds: [] };
            }),
            eventBus: {
                emit: vi.fn()
            }
        };

        executor = new EffectExecutor(mockTurnManager);
    });

    describe('opponent_reveal_and_discard - Subtype Filtering', () => {
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

                // Mock choice to pick the song if asked
                // (Though with filter it might pick automatically if logic was different, 
                // but currently it asks player to choose from valid cards if interactive, 
                // or random if not. Test environment usually interactive=false unless mocked requestChoice)
                // BUT wait, in my previous edit I made it interactive if requestChoice exists.
                // And I mocked requestChoice in the specific test case but not globally here properly for auto-tests?
                // The new logic ALWAYS calls requestChoice if available. 
                // So I need to mock requestChoice responses for these existing tests too?
                // Or I can let them fail and fix them?
                // Actually, existing tests didn't fail on requestChoice because it wasn't mocked on the object 
                // SO `this.turnManager.requestChoice` was undefined, triggering the "else" (random/fallback) path.
                // Which effectively mimics "auto-discard" or "random discard" behavior for non-interactive.
                // That is fine for these tests as long as the random pick hits the only valid target or I control randomness.
                // In these tests, valid targets are implicitly 1. 
                // So random pick works.

                await executor.execute(effect as any, context);

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

                await executor.execute(effect as any, context);

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
                        zone: 'hand',
                        instanceId: 'c3'
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

                await executor.execute(effect as any, context);

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

                await executor.execute(effect as any, context);

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

                await executor.execute(effect as any, context);

                // One action should be discarded (song or regular action)
                expect(player2.discard.length).toBe(1);
                expect(player2.discard[0].type).toBe('Action');
            });

            it('should include ALL cards in options but mark non-matching ones as invalid', async () => {
                // Setup mock requestChoice
                const choiceSpy = vi.fn().mockResolvedValue({
                    selectedIds: [player2.hand[0].instanceId] // Select valid card
                });
                mockTurnManager.requestChoice = choiceSpy;

                const effect = {
                    type: 'opponent_reveal_and_discard' as const,
                    filter: { cardType: 'song' }
                };

                const context = {
                    player: player1,
                    card: null as any,
                    source: null as any
                };

                // Execute
                await executor.execute(effect as any, context);

                // Verify requestChoice was called
                expect(choiceSpy).toHaveBeenCalled();
                const choiceRequest = choiceSpy.mock.calls[0][0];

                // Should show all 4 cards
                expect(choiceRequest.options).toHaveLength(4);

                // Find song option -> should be valid
                const songOption = choiceRequest.options.find((o: any) => o.display === 'Test Song');
                expect(songOption).toBeDefined();
                expect(songOption.valid).toBe(true);

                // Find character option -> should be invalid
                const charOption = choiceRequest.options.find((o: any) => o.display === 'Test Character');
                expect(charOption).toBeDefined();
                expect(charOption.valid).toBe(false);

                // Find non-song action -> should be invalid
                const actionOption = choiceRequest.options.find((o: any) => o.display === 'Test Action');
                expect(actionOption).toBeDefined();
                expect(actionOption.valid).toBe(false);
            });
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

            await executor.execute(effect as any, context);

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

            await executor.execute(effect as any, context);

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

            await executor.execute(effect as any, context);

            expect(player2.discard.length).toBe(0);
            expect(mockTurnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('no cards')
            );
        });

        it('should handle no matching cards', async () => {
            player2.hand = [
                { name: 'Character Only', type: 'Character' as CardType, subtypes: [], zone: 'hand', instanceId: 'c-unique' }
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

            await executor.execute(effect as any, context);

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

            await executor.execute(effect as any, context);

            // Should log the reveal
            expect(mockTurnManager.logger.info).toHaveBeenCalledWith(
                expect.stringContaining('reveals hand')
            );
        });
    });
});
