/**
 * Return to Hand Effect Execution Tests
 * 
 * Tests that bounce/return to hand effects parse correctly.
 * Uses real cards from allCards.json.
 */

import { SharedTestFixture } from '../../test-fixtures';
import { TestHarness } from '../../engine-test-utils';
import { ActionType, ZoneType } from '../../../engine/models';

describe('Return to Hand Effect Execution', () => {
    let fixture: SharedTestFixture;

    beforeAll(async () => {
        fixture = await SharedTestFixture.getInstance();

    });

    describe('Return Character to Hand', () => {
        it('should parse "return to hand" abilities', async () => {
            const allCards = fixture.getAllCards();

            const bounceCards = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a => {
                    const text = a.rawText?.toLowerCase() || '';
                    return text.includes('return') && text.includes('hand');
                });
            });

            console.log(`\n✓ Found ${bounceCards.length} cards with return to hand effects`);
            if (bounceCards.length > 0) {
                console.log('  Examples:');
                bounceCards.slice(0, 5).forEach(card => {
                    const abilities = fixture.parseAbilities(card);
                    const bounceAbility = abilities.find(a =>
                        a.rawText?.toLowerCase().includes('return') &&
                        a.rawText?.toLowerCase().includes('hand')
                    );
                    console.log(`    - ${card.fullName || card.name} (${card.type})`);
                    console.log(`      "${bounceAbility?.rawText}"`);
                });
            }

            expect(bounceCards.length).toBeGreaterThan(10);
        });
    });

    describe('Bounce Targets', () => {
        it('should parse different bounce targets', async () => {
            const allCards = fixture.getAllCards();

            const targetTypes: Record<string, number> = {
                'chosen character': 0,
                'opposing character': 0,
                'your character': 0,
                'all characters': 0
            };

            allCards.forEach(card => {
                const abilities = fixture.parseAbilities(card);
                abilities.forEach(a => {
                    const text = a.rawText?.toLowerCase() || '';
                    if (text.includes('return') && text.includes('hand')) {
                        if (text.includes('chosen') && text.includes('character')) targetTypes['chosen character']++;
                        if (text.includes('opposing') && text.includes('character')) targetTypes['opposing character']++;
                        if (text.includes('your') && text.includes('character')) targetTypes['your character']++;
                        if (text.includes('all') && text.includes('character')) targetTypes['all characters']++;
                    }
                });
            });

            console.log(`\n✓ Bounce Target Distribution:`);
            Object.entries(targetTypes).forEach(([target, count]) => {
                console.log(`  - ${target}: ${count} abilities`);
            });

            const total = Object.values(targetTypes).reduce((a, b) => a + b, 0);
            expect(total).toBeGreaterThan(10);
        });
    });

    describe('Conditional Bounce', () => {
        it('should parse bounce with conditions', async () => {
            const allCards = fixture.getAllCards();

            const conditionalBounce = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a => {
                    const text = a.rawText?.toLowerCase() || '';
                    const hasBounce = text.includes('return') && text.includes('hand');
                    const hasCondition = text.includes('if') ||
                        text.includes('with cost') ||
                        text.includes('you may');
                    return hasBounce && hasCondition;
                });
            });

            console.log(`\n✓ Found ${conditionalBounce.length} cards with conditional bounce`);
            if (conditionalBounce.length > 0) {
                console.log('  Examples:');
                conditionalBounce.slice(0, 3).forEach(card => {
                    const abilities = fixture.parseAbilities(card);
                    const ability = abilities.find(a => {
                        const text = a.rawText?.toLowerCase() || '';
                        return text.includes('return') && text.includes('hand');
                    });
                    console.log(`    - ${card.fullName || card.name}`);
                    console.log(`      "${ability?.rawText}"`);
                });
            }

            expect(conditionalBounce.length).toBeGreaterThan(3);
        });
    });

    describe('Bounce by Card Type', () => {
        it('should categorize bounce effects by card type', async () => {
            const allCards = fixture.getAllCards();

            const bounceCards = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a => {
                    const text = a.rawText?.toLowerCase() || '';
                    return text.includes('return') && text.includes('hand');
                });
            });

            const actions = bounceCards.filter(c => c.type === 'Action');
            const characters = bounceCards.filter(c => c.type === 'Character');
            const songs = bounceCards.filter(c => c.type && c.type.toString().toLowerCase() === 'song');

            console.log(`\n✓ Bounce Effect Categories:`);
            console.log(`  - Total: ${bounceCards.length}`);
            console.log(`  - Actions: ${actions.length}`);
            console.log(`  - Characters: ${characters.length}`);
            console.log(`  - Songs: ${songs.length}`);

            expect(bounceCards.length).toBeGreaterThan(10);
        });
    });

    describe('Execution Tests', () => {
        let harness: TestHarness;

        beforeEach(async () => {
            harness = new TestHarness();
            await harness.initialize();
        });

        it('should return character from play to hand', async () => {
            // Setup: P1 has Genie, P2 has Aladdin
            await harness.initGame(['Genie - On the Job'], ['Aladdin - Street Rat']);
            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            harness.setPlay(harness.p2Id, ['Aladdin - Street Rat'], true);
            const aladdin = p2.play[0];

            harness.setHand(harness.p1Id, ['Genie - On the Job']);
            const genie = p1.hand[0];
            harness.setInk(harness.p1Id, 6);

            // Mock Genie's effect if parser not ready
            if (!genie.parsedEffects) genie.parsedEffects = [];
            genie.parsedEffects.push({
                trigger: 'on_play',
                effects: [{
                    type: 'return_to_hand',
                    target: { type: 'chosen_opposing_character' }
                }]
            } as any);

            // Play Genie, targeting Aladdin
            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: harness.p1Id,
                cardId: genie.instanceId,
                targetId: aladdin.instanceId
            });

            // Verify Aladdin is in P2's HAND
            const aladdinInHand = p2.hand.find(c => c.instanceId === aladdin.instanceId);
            expect(aladdinInHand).toBeDefined();
            expect(p2.play.length).toBe(0);
        });

        it('should return character from discard to hand', async () => {
            // Setup: P1 has Part of Your World, and a card in discard
            await harness.initGame(['Part of Your World'], []);
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Add card to discard
            const stitch = harness.createCard(p1.id, {
                name: 'Stitch - New Dog',
                type: 'Character' as any // Cast to fix type if needed 
            });
            stitch.zone = ZoneType.Discard;
            p1.discard.push(stitch);

            harness.setHand(harness.p1Id, ['Part of Your World']);
            const actionCard = p1.hand[0];
            harness.setInk(harness.p1Id, 3);

            // Mock Effect
            actionCard.parsedEffects = [{
                type: 'static',
                effects: [{
                    type: 'return_to_hand',
                    target: { type: 'chosen_card_in_discard' }
                }]
            }] as any;

            // Play Action
            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: harness.p1Id,
                cardId: actionCard.instanceId,
                targetId: stitch.instanceId
            });

            // Verify Stitch in Hand
            const stitchInHand = p1.hand.find((c: any) => c.instanceId === stitch.instanceId);
            expect(stitchInHand).toBeDefined();

            // Verify Stitch removed from discard (action card still there)
            const stitchInDiscard = p1.discard.find((c: any) => c.instanceId === stitch.instanceId);
            expect(stitchInDiscard).toBeUndefined();
            expect(p1.discard.length).toBe(1); // Only action card remains
        });

        it('should respect targeting restrictions (opposing only)', async () => {
            // Mock an effect that targets 'chosen_opposing_character'
            // Try to target SELF. Should fail.
            await harness.initGame(['Mother Knows Best'], ['Stitch - New Dog']);
            const p1 = harness.game.getPlayer(harness.p1Id);

            harness.setPlay(harness.p1Id, ['Stitch - New Dog'], true);
            const myStitch = p1.play[0];

            harness.setHand(harness.p1Id, ['Mother Knows Best']);
            const mkb = p1.hand[0];
            harness.setInk(harness.p1Id, 3);

            mkb.parsedEffects = [{
                type: 'static',
                effects: [{
                    type: 'return_to_hand',
                    target: { type: 'chosen_opposing_character' }
                }]
            }] as any;

            // Try to target MY Stitch
            const result = await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: harness.p1Id,
                cardId: mkb.instanceId,
                targetId: myStitch.instanceId
            });

            // Should fail/fizzle or return false because target invalid
            // checkFilter for 'chosen_opposing_character' includes check for ownerId !== player.id
            if (result) {
                // If it succeeded, check if Stitch actually moved (should not)
                const stitchStillInPlay = p1.play.find(c => c.instanceId === myStitch.instanceId);
                expect(stitchStillInPlay).toBeDefined();
            } else {
                expect(result).toBe(false);
            }
        });
    });
});
