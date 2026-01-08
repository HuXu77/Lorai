/**
 * Banish Effect Execution Tests
 * 
 * Tests that banish effects parse correctly.
 * Uses real cards from allCards.json.
 */

import { SharedTestFixture } from '../../test-fixtures';
import { GameEvent } from '../../../engine/abilities/events';

describe('Banish Effect Execution', () => {
    let fixture: SharedTestFixture;

    beforeAll(async () => {
        fixture = await SharedTestFixture.getInstance();

    });

    describe('Direct Banish - Actions', () => {
        it('should parse "banish chosen character" abilities', async () => {
            const allCards = fixture.getAllCards();

            const banishCards = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a =>
                    a.effects?.some((e: any) => e.type === 'banish')
                );
            });

            console.log(`\n✓ Found ${banishCards.length} cards with banish effects`);
            if (banishCards.length > 0) {
                console.log('  Examples:');
                banishCards.slice(0, 5).forEach(card => {
                    const abilities = fixture.parseAbilities(card);
                    const banishAbility = abilities.find(a =>
                        a.effects?.some((e: any) => e.type === 'banish')
                    );
                    console.log(`    - ${card.fullName || card.name} (${card.type})`);
                    console.log(`      "${banishAbility?.rawText?.substring(0, 60)}..."`);
                });
            }

            expect(banishCards.length).toBeGreaterThan(10);
        });
    });

    describe('Conditional Banish', () => {
        it('should parse banish with conditions', async () => {
            const allCards = fixture.getAllCards();

            const conditionalBanish = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a => {
                    const hasBanish = a.effects?.some((e: any) => e.type === 'banish');
                    const hasCondition = a.rawText?.toLowerCase().includes('if') ||
                        a.rawText?.toLowerCase().includes('with cost');
                    return hasBanish && hasCondition;
                });
            });

            console.log(`\n✓ Found ${conditionalBanish.length} cards with conditional banish`);
            if (conditionalBanish.length > 0) {
                console.log('  Examples:');
                conditionalBanish.slice(0, 3).forEach(card => {
                    const abilities = fixture.parseAbilities(card);
                    const ability = abilities.find(a =>
                        a.effects?.some((e: any) => e.type === 'banish')
                    );
                    console.log(`    - ${card.fullName || card.name}`);
                    console.log(`      "${ability?.rawText}"`);
                });
            }

            expect(conditionalBanish.length).toBeGreaterThan(3);
        });
    });

    describe('Banish Triggers', () => {
        it('should parse "when banished" triggers', async () => {
            const allCards = fixture.getAllCards();

            const banishTriggers = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a => {
                    const text = a.rawText?.toLowerCase() || '';
                    return text.includes('when') && text.includes('banish');
                });
            });

            console.log(`\n✓ Found ${banishTriggers.length} cards with banish-related triggers`);
            if (banishTriggers.length > 0) {
                console.log('  Examples:');
                banishTriggers.slice(0, 3).forEach(card => {
                    console.log(`    - ${card.fullName || card.name}`);
                });
            }

            expect(banishTriggers.length).toBeGreaterThan(5);
        });
    });

    describe('Banish Categories', () => {
        it('should categorize banish effects by card type', async () => {
            const allCards = fixture.getAllCards();

            const banishCards = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a =>
                    a.effects?.some((e: any) => e.type === 'banish')
                );
            });

            const actions = banishCards.filter(c => c.type === 'Action');
            const characters = banishCards.filter(c => c.type === 'Character');
            const songs = banishCards.filter(c => c.type && c.type.toString().toLowerCase() === 'song');

            console.log(`\n✓ Banish Effect Categories:`);
            console.log(`  - Total: ${banishCards.length}`);
            console.log(`  - Actions: ${actions.length}`);
            console.log(`  - Characters: ${characters.length}`);
            console.log(`  - Songs: ${songs.length}`);

            expect(banishCards.length).toBeGreaterThan(10);
        });
    });

    describe('Execution Tests', () => {
        let harness: any;

        beforeEach(async () => {
            const { TestHarness } = await import('../../engine-test-utils');
            harness = new TestHarness();
            await harness.initialize();
        });

        it('should remove character from play when banished', async () => {
            await harness.initGame(['Dragon Fire', 'Mickey Mouse - Brave Little Tailor'], []);
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Setup: Dragon Fire in hand, Mickey in play
            harness.setPlay(harness.p1Id, ['Mickey Mouse - Brave Little Tailor'], false);
            const mickey = p1.play[0];
            harness.setHand(harness.p1Id, ['Dragon Fire']);
            const dragonFire = p1.hand[0];

            harness.setInk(harness.p1Id, 5); // Dragon Fire costs 5

            // Play Dragon Fire targeting Mickey
            harness.turnManager.registerChoiceHandler(harness.p1Id, (request: any) => {
                if (request.type === 'select_target') {
                    return { selectedIds: [mickey.instanceId] };
                }
                return { selectedIds: [] };
            });

            await harness.turnManager.resolveAction({
                type: 'PlayCard',
                playerId: harness.p1Id,
                cardId: dragonFire.instanceId,
                targetId: mickey.instanceId // Explicit target for PlayCard
            });

            // Verify Mickey is in discard
            const inDiscard = p1.discard.find((c: any) => c.instanceId === mickey.instanceId);
            const inPlay = p1.play.find((c: any) => c.instanceId === mickey.instanceId);

            expect(inPlay).toBeUndefined();
            expect(inDiscard).toBeDefined();
        });

        it('should trigger "when banished" effects', async () => {
            await harness.initGame(['Dragon Fire', 'Gramma Tala - Storyteller'], []);
            const p1 = harness.game.getPlayer(harness.p1Id);

            harness.setPlay(harness.p1Id, ['Gramma Tala - Storyteller'], false);
            const tala = p1.play[0];

            // MOCK: Ensure Tala has on_banish trigger
            tala.parsedEffects = [
                {
                    trigger: 'on_banished',
                    effects: [
                        {
                            type: 'put_into_inkwell',
                            target: { type: 'self' },
                            exerted: true
                        }
                    ],
                    target: { type: 'self' }, // For the trigger filter
                    rawText: "When this character is banished, you may put this card into your inkwell facedown and exerted."
                } as any
            ];

            harness.setHand(harness.p1Id, ['Dragon Fire']);
            const dragonFire = p1.hand[0];
            harness.setInk(harness.p1Id, 5);

            harness.turnManager.registerChoiceHandler(harness.p1Id, (request: any) => {
                if (request.type === 'select_target') {
                    return { selectedIds: [tala.instanceId] };
                }
                // Handle optional ability ("you may")
                if (request.type === 'yes_no') {
                    return { choice: 'yes' };
                }
                return { selectedIds: [] };
            });

            const initialInk = p1.inkwell.length;

            await harness.turnManager.resolveAction({
                type: 'PlayCard',
                playerId: harness.p1Id,
                cardId: dragonFire.instanceId,
                targetId: tala.instanceId
            });
            // Verify Tala is in Inkwell (Trigger ran)
            // Dragon Fire costs 5, but we set ink to 5 using setInk which sets available ink?
            // Helper `setInk` usually creates ink cards.
            // initGame creates ink.
            // p1.inkwell.length should increase by 1 (Tala).
            const talaInInk = p1.inkwell.find((c: any) => c.instanceId === tala.instanceId);

            expect(p1.inkwell.length).toBe(initialInk + 1);
            expect(talaInInk).toBeDefined();
        });

        it('should respect targeting restrictions (cost, opposing, etc.)', async () => {
            // "World's Greatest Criminal Mind" - Banish char with 5+ Strength
            await harness.initGame(["World's Greatest Criminal Mind"], []);
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Setup: Mickey (8 str) and Olaf (1 str)
            // Assuming Olaf exists. If not, mocked low stat card.
            harness.setPlay(harness.p1Id, ['Mickey Mouse - Brave Little Tailor', 'Olaf - Friendly Snowman'], false);
            const mickey = p1.play[0]; // 8 str
            const olaf = p1.play[1];   // 1 str (assumed)

            // Ensure stats are correct
            mickey.strength = 8;
            olaf.strength = 1;

            harness.setHand(harness.p1Id, ["World's Greatest Criminal Mind"]);
            const wgcm = p1.hand[0];
            harness.setInk(harness.p1Id, 3); // Cost 3 (Action)

            // MOCK: Ensure WGCM has correct targeting filter
            wgcm.parsedEffects = [
                {
                    type: 'static',
                    effects: [
                        {
                            type: 'banish',
                            target: {
                                type: 'chosen_character',
                                filter: {
                                    stats: {
                                        stat: 'strength',
                                        operator: '>=',
                                        value: 5
                                    }
                                }
                            }
                        }
                    ]
                } as any
            ];

            // 1. Try to target Olaf (Invalid)
            // PlayCard validation checks isTargetValid.
            // We need to bypass TurnManager choice if PlayCard takes explicit target?
            // TurnManager.playCard takes targetId. 
            // If targetId provided, it validates specific target.

            const resultInvalid = await harness.turnManager.resolveAction({
                type: 'PlayCard',
                playerId: harness.p1Id,
                cardId: wgcm.instanceId,
                targetId: olaf.instanceId
            });

            // Verify Olaf was NOT banished (effect fizzled or play blocked)
            const olafInDiscard = p1.discard.find((c: any) => c.instanceId === olaf.instanceId);
            expect(olafInDiscard).toBeUndefined();

            // RESET for Step 2
            // Move WGCM back to hand (it was played/discarded) to reuse the mocked instance
            const wgcmInDiscardIdx = p1.discard.findIndex((c: any) => c.instanceId === wgcm.instanceId);
            if (wgcmInDiscardIdx >= 0) p1.discard.splice(wgcmInDiscardIdx, 1);
            p1.hand.push(wgcm);
            wgcm.zone = 'hand';
            harness.setInk(harness.p1Id, 3); // Reset ink

            // 2. Target Mickey (Valid)
            const resultValid = await harness.turnManager.resolveAction({
                type: 'PlayCard',
                playerId: harness.p1Id,
                cardId: wgcm.instanceId,
                targetId: mickey.instanceId
            });

            expect(resultValid).toBe(true);
            // Verify Mickey banished
            const mickeyInDiscard = p1.discard.find((c: any) => c.instanceId === mickey.instanceId);
            expect(mickeyInDiscard).toBeDefined();
        });
    });
});
