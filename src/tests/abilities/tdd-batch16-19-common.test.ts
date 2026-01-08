import { EffectExecutor } from '../../engine/abilities/executor';
import { CardType } from '../../engine/models';

describe('TDD Batches 16-19: Common & Final Patterns', () => {
    let executor: EffectExecutor;
    let turnManager: any;
    let game: any;
    let player: any;
    let opponent: any;

    beforeEach(() => {
        player = {
            id: 'p1',
            name: 'Player 1',
            hand: [],
            play: [],
            deck: [],
            discard: [],
            inkwell: [],
            lore: 0
        };

        opponent = {
            id: 'p2',
            name: 'Player 2',
            hand: [],
            play: [],
            deck: [],
            discard: [],
            inkwell: []
        };

        game = {
            state: {
                players: { 'p1': player, 'p2': opponent },
                activeEffects: [],
                turnCount: 1,
                activePlayerId: 'p1'
            },
            getPlayer: (id: string) => id === 'p1' ? player : opponent
        };

        turnManager = {
            game: game,
            logger: {
                info: jest.fn(),
                debug: jest.fn(),
                warn: jest.fn(),
                action: jest.fn()
            },
            trackZoneChange: jest.fn(),
            applyDamage: jest.fn((player, target, amount) => {
                target.damage = (target.damage || 0) + amount;
            }),
            checkWinCondition: jest.fn(),
            addActiveEffect: jest.fn((effect) => {
                game.state.activeEffects.push(effect);
            })
        };

        // Add addCardToZone to game
        game.addCardToZone = jest.fn((player, card, zone) => {
            if (zone === 'hand') {
                const index = player.discard.findIndex((c: any) => c.instanceId === card.instanceId);
                if (index !== -1) {
                    player.discard.splice(index, 1);
                }
                player.hand.push(card);
                card.zone = 'hand';
            }
        });

        executor = new EffectExecutor(turnManager);
    });

    describe('Batch 16-17: Common Patterns', () => {
        describe('Gain Lore (Basic)', () => {
            it('should execute basic gain_lore', async () => {
                player.lore = 0;

                const effect = {
                    type: 'gain_lore',
                    amount: 1
                };

                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                await executor.execute(effect as any, context);

                expect(player.lore).toBe(1);
            });
        });

        describe('Return from Discard with Keyword Filter', () => {
            it('should return card with keyword from discard', async () => {
                const cardWithSupport = {
                    instanceId: 'c1',
                    name: 'Support Card',
                    zone: 'discard',
                    keywords: ['Support']
                };

                const cardWithoutSupport = {
                    instanceId: 'c2',
                    name: 'Normal Card',
                    zone: 'discard',
                    keywords: []
                };

                player.discard = [cardWithSupport, cardWithoutSupport];

                const effect = {
                    type: 'return_from_discard',
                    target: {
                        type: 'card_in_discard',
                        filter: {
                            keyword: 'support'
                        }
                    },
                    destination: 'hand'
                };

                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                // Mock the choice to select the Support card
                turnManager.mockPendingChoice = ['c1'];

                await executor.execute(effect as any, context);

                // Should have moved support card to hand
                expect(player.hand.length).toBe(1);
                expect(player.hand[0].instanceId).toBe('c1');
                expect(player.discard.length).toBe(1);
            });
        });

        describe('Can Challenge Ready Ability', () => {
            it('should grant can_challenge_ready ability', async () => {
                const target = {
                    instanceId: 't1',
                    name: 'Target',
                    abilities: []
                };

                const effect = {
                    type: 'grant_ability',
                    ability: 'can_challenge_ready',
                    target: { type: 'chosen' },
                    duration: 'turn'
                };

                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                // Mock resolveTargets
                jest.spyOn(executor as any, 'resolveTargets').mockReturnValue([target]);

                await executor.execute(effect as any, context);

                // Should add to activeEffects or target.abilities
                expect(game.state.activeEffects.length).toBeGreaterThan(0);
            });
        });

        describe('Gain Lore For Each (Variable)', () => {
            it('should gain lore for each damaged opponent character', async () => {
                player.lore = 0;

                // Add damaged opponent characters
                opponent.play = [
                    { instanceId: 'o1', name: 'Damaged 1', type: 'Character' as CardType, damage: 1, willpower: 2 },
                    { instanceId: 'o2', name: 'Damaged 2', type: 'Character' as CardType, damage: 1, willpower: 2 },
                    { instanceId: 'o3', name: 'Healthy', type: 'Character' as CardType, damage: 0, willpower: 2 }
                ];

                const effect = {
                    type: 'gain_lore',
                    amount: {
                        type: 'count',
                        count: 'damaged_opponent_characters'
                    }
                };

                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                await executor.execute(effect as any, context);

                // Should gain 2 lore (2 damaged opponents)
                expect(player.lore).toBe(2);
            });
        });
    });

    describe('Batch 18-19: Final Patterns', () => {
        describe('Damage to Each Opposing Character', () => {
            it('should damage all opposing characters', async () => {
                opponent.play = [
                    { instanceId: 'o1', name: 'Opponent 1', type: 'Character' as CardType, damage: 0, willpower: 3 },
                    { instanceId: 'o2', name: 'Opponent 2', type: 'Character' as CardType, damage: 0, willpower: 2 }
                ];

                const effect = {
                    type: 'damage',
                    amount: 1,
                    target: {
                        type: 'each_opposing_character'
                    }
                };

                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                await executor.execute(effect as any, context);

                // All opposing characters should have 1 damage
                expect(opponent.play[0].damage).toBe(1);
                expect(opponent.play[1].damage).toBe(1);
            });
        });

        describe('Mass Keyword Grant', () => {
            it('should grant keyword to all friendly characters', async () => {
                player.play = [
                    { instanceId: 'p1', name: 'Char 1', type: 'Character' as CardType },
                    { instanceId: 'p2', name: 'Char 2', type: 'Character' as CardType }
                ];

                const effect = {
                    type: 'grant_keyword',
                    keyword: 'evasive',
                    target: {
                        type: 'all_friendly_characters'
                    },
                    duration: 'turn'
                };

                const context = {
                    player,
                    card: { instanceId: 'source', name: 'Source' },
                    gameState: game.state,
                    eventContext: {} as any
                };

                await executor.execute(effect as any, context);

                // Should add keyword to each target's meta
                expect(player.play[0].meta?.grantedKeywords).toContain('evasive');
                expect(player.play[1].meta?.grantedKeywords).toContain('evasive');
            });
        });
    });
});
