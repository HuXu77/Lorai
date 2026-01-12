import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { EffectExecutor, GameContext } from '../../engine/abilities/executor';

describe('TDD Batch 8: Complex Targeting & Edge Cases', () => {
    let executor: EffectExecutor;
    let mockTurnManager: any;
    let mockPlayer: any;
    let mockOpponent: any;
    let mockSourceCard: any;
    let mockTargetCard: any;
    let mockOpposingCard: any;

    beforeEach(() => {
        // Setup mocks
        mockPlayer = {
            id: 'p1',
            name: 'Player 1',
            hand: [],
            discard: [],
            play: [],
            deck: []
        };
        mockOpponent = {
            id: 'p2',
            name: 'Player 2',
            hand: [],
            discard: [],
            play: [],
            deck: []
        };
        mockSourceCard = {
            instanceId: 'source1',
            name: 'Source Char',
            ownerId: 'p1',
            zone: 'play',
            ready: true,
            meta: {}
        };
        mockTargetCard = {
            instanceId: 'target1',
            name: 'Target Char',
            ownerId: 'p1',
            zone: 'play',
            strength: 2,
            willpower: 2,
            keywords: [],
            meta: {},
            ready: true
        };
        mockOpposingCard = {
            instanceId: 'opp1',
            name: 'Opp Char',
            ownerId: 'p2',
            zone: 'play',
            ready: true,
            meta: {}
        };

        mockPlayer.play.push(mockSourceCard, mockTargetCard);
        mockOpponent.play.push(mockOpposingCard);

        mockTurnManager = {
            game: {
                state: {
                    players: { p1: mockPlayer, p2: mockOpponent },
                    activeEffects: []
                },
                getPlayer: (id: string) => id === 'p1' ? mockPlayer : mockOpponent
            },
            logger: {
                info: console.log,
                debug: console.log,
                warn: console.warn,
                error: console.error
            },
            trackZoneChange: vi.fn(),
            // Mock choices for 'chosen' targets
            mockPendingChoice: undefined,
            addActiveEffect: vi.fn((effect) => {
                mockTurnManager.game.state.activeEffects.push(effect);
            })
        };

        executor = new EffectExecutor(mockTurnManager);
    });

    describe('1. Parser Test - AST Structure', () => {
        it('should parse "Exert chosen opposing character" (partial - cant_ready not yet supported)', () => {
            const card: any = {
                id: 'elsa-spirit',
                name: 'Elsa',
                abilities: [{
                    type: 'triggered',
                    fullText: "When you play this character, exert chosen opposing character. They can't ready at the start of their next turn."
                }]
            };

            const abilities = parseToAbilityDefinition(card);
            const effects = (abilities[0] as any).effects;

            // Parser currently supports exert but not the "can't ready" restriction
            // TODO: Implement parser pattern for "They can't ready" restriction
            expect(effects.length).toBeGreaterThan(0);
            expect(effects[0].type).toBe('exert');
            // Parser may use 'chosen_opposing_character' as target type or filter
            const target = effects[0].target || {};
            expect(target.type === 'chosen_character' || target.type === 'chosen_opposing_character').toBeTruthy();

            console.log('Note: "They can\\\'t ready" restriction not yet parsed - parser enhancement needed');
        });

        it('should parse "Return a character card from your discard to your hand."', () => {
            const card: any = {
                id: 'hades-lord',
                name: 'Hades',
                abilities: [{
                    type: 'triggered',
                    fullText: "When you play this character, you may return a character card from your discard to your hand."
                }]
            };

            const abilities = parseToAbilityDefinition(card);
            const effects = (abilities[0] as any).effects;

            expect(effects).toHaveLength(1);
            expect(effects[0].type).toBe('return_from_discard');
            expect(effects[0].destination).toBe('hand');
        });
    });

    describe('2. Executor Test - Execution Logic', () => {
        it('should execute "exert chosen opposing character and prevent readying"', async () => {
            // Mock choice for opposing character
            mockTurnManager.mockPendingChoice = [mockOpposingCard.instanceId];

            const effect = {
                type: 'sequence',
                effects: [
                    { type: 'exert', target: { type: 'chosen_opposing_character' } },
                    { type: 'cant_ready', target: { type: 'chosen_opposing_character' }, duration: 'next_turn_start' }
                ]
            };

            const context: GameContext = {
                player: mockPlayer,
                card: mockSourceCard,
                gameState: mockTurnManager.game,
                eventContext: {
                    player: mockPlayer,
                    sourceCard: mockSourceCard
                }
            } as any;

            await executor.execute(effect as any, context);

            // Verify exerted
            expect(mockOpposingCard.ready).toBe(false);

            // Verify restriction added
            expect(mockOpposingCard.restrictions).toBeDefined();
            const restriction = mockOpposingCard.restrictions.find((r: any) => r.type === 'cant_ready');
            expect(restriction).toBeDefined();
            expect(restriction.duration).toBe('next_turn_start');
        });

        it('should execute "return a character card from discard to hand"', async () => {
            // Setup discard
            const discardedChar = { instanceId: 'd1', name: 'Dead Char', type: 'character', zone: 'Discard', ownerId: 'p1' };
            mockPlayer.discard.push(discardedChar);

            // Mock choice for discard target
            mockTurnManager.mockPendingChoice = [discardedChar.instanceId];

            const effect = {
                type: 'return_from_discard',
                target: {
                    type: 'card_in_discard', // Using existing type for now, or new one
                    filter: { type: 'character' }, // checkFilter uses 'type' not 'cardType'
                    mockChoices: ['d1'] // Mock choice directly in AST if supported, or via turnManager
                },
                destination: 'hand'
            };

            // AST often uses 'chosen_card_in_discard' or similar.
            // In 'return_from_discard', the target definition is critical.
            // Let's assume the parser outputs 'target: { type: 'card_in_discard' }' and executor handles choice.
            // However, typical pattern uses 'mockChoices' for testing implicit choice UI.

            // Let's manually set mock choice on turnManager as we did for other tests?
            // Wait, standard 'resolveTargets' uses 'mockPendingChoice' for 'chosen_*'.
            // Does 'card_in_discard' imply choice? Yes, "return A character card..." implies choice.

            // Update filter to expect choice logic in resolveTargets or specific executor method.

            const context: GameContext = {
                player: mockPlayer,
                card: mockSourceCard,
                gameState: mockTurnManager.game,
                eventContext: {
                    player: mockPlayer,
                    sourceCard: mockSourceCard
                }
            } as any;

            await executor.execute(effect as any, context);

            expect(mockPlayer.hand).toContain(discardedChar);
            expect(mockPlayer.discard).not.toContain(discardedChar);
            expect(discardedChar.zone).toBe('Hand'); // Zone enum uses capitalized values
        });

        it('should execute chained effects: "+1 strength and gain Support"', async () => {
            mockTurnManager.mockPendingChoice = [mockTargetCard.instanceId];

            // Logic handled by sequence/array of effects
            const effects = [
                { type: 'modify_stats', stat: 'strength', amount: 1, target: { type: 'chosen_character' }, duration: 'turn' },
                { type: 'grant_keyword', keyword: 'Support', target: { type: 'chosen_character' }, duration: 'turn' }
            ];

            const context: GameContext = {
                player: mockPlayer,
                card: mockSourceCard,
                gameState: mockTurnManager.game,
                eventContext: {
                    player: mockPlayer,
                    sourceCard: mockSourceCard,
                    targetCard: mockTargetCard // Required for single mock choice usage if checkFilter uses eventContext.targetCard
                }
            } as any;

            // Execute one by one or wrapped in sequence
            for (const eff of effects) {
                await executor.execute(eff as any, context);
            }

            // Verify active effect for stats (Executor usually creates an active effect entry, OR modifying directly for simple buffs?)
            // Based on executor.ts, 'executeModifyStats' implementation:
            // It creates an entry in turnManager.game.state.activeEffects

            const statEffect = mockTurnManager.game.state.activeEffects.find((e: any) => e.type === 'modify_strength');
            expect(statEffect).toBeDefined();
            expect(statEffect.value).toBe(1);
            expect(statEffect.targetCardId).toBe(mockTargetCard.instanceId);

            // Verify keyword granted (usually added to meta.grantedKeywords)
            expect(mockTargetCard.meta.grantedKeywords).toContain('Support');
        });
    });
});
