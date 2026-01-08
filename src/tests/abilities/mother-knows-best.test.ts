/**
 * Tests for Mother Knows Best - Song Card
 * 
 * This test verifies that song cards with sing_cost are properly handled
 * without warnings or errors when played as actions.
 */

import { TestHarness } from '../engine-test-utils';
import { CardType, ZoneType } from '../../engine/models';

describe('Mother Knows Best - Song Sing Cost', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should play Mother Knows Best action without warnings', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        // Give P2 a character to target
        const targetChar = p2.addCardToZone({
            id: 2001,
            fullName: 'Test Character',
            name: 'Test Character',
            type: CardType.Character,
            cost: 3,
            strength: 2,
            willpower: 3,
            lore: 1
        } as any, ZoneType.Play);

        // Give P1 Mother Knows Best
        const motherKnowsBest = p1.addCardToZone({
            id: 1001,
            fullName: 'Mother Knows Best',
            name: 'Mother Knows Best',
            type: CardType.Action,
            cost: 3,
            subtypes: ['Song'],
            abilities: [
                {
                    effect: 'A character with cost 3 or more can ⟳ to sing this song for free.',
                    type: 'keyword'
                },
                {
                    effect: 'Return chosen character to their player\'s hand.',
                    type: 'effect'
                }
            ]
        } as any, ZoneType.Hand);

        // Give P1 enough ink
        for (let i = 0; i < 3; i++) {
            const inkCard = p1.addCardToZone({
                id: 3000 + i,
                name: `Ink ${i}`,
                type: CardType.Character,
                cost: 1
            } as any, ZoneType.Inkwell);
            inkCard.ready = true;
        }

        harness.turnManager.startGame(harness.p1Id);

        // Spy on logger to detect warnings
        const loggerSpy = jest.spyOn(harness.turnManager.logger, 'warn');

        // Play Mother Knows Best
        const played = await harness.turnManager.playCard(
            p1,
            motherKnowsBest.instanceId,
            undefined, // no singer
            undefined, // no shift
            targetChar.instanceId // target for return effect
        );

        expect(played).toBe(true);

        // Verify NO warnings about sing_cost
        const singCostWarnings = loggerSpy.mock.calls.filter(call =>
            call[0]?.toString().includes('sing_cost') ||
            call[0]?.toString().includes('Unknown effect type')
        );

        expect(singCostWarnings.length).toBe(0);

        // Clean up spy
        loggerSpy.mockRestore();
    });

    it('should parse sing_cost correctly for different cost values', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);

        const songCards = [
            { cost: 2, songText: 'A character with cost 2 or more can ⟳ to sing this song for free.' },
            { cost: 3, songText: 'A character with cost 3 or more can ⟳ to sing this song for free.' },
            { cost: 5, songText: 'A character with cost 5 or more can ⟳ to sing this song for free.' }
        ];

        for (const { cost, songText } of songCards) {
            const song = p1.addCardToZone({
                id: 5000 + cost,
                name: `Test Song ${cost}`,
                type: CardType.Action,
                cost: cost,
                subtypes: ['Song'],
                abilities: [
                    {
                        effect: songText,
                        type: 'keyword'
                    }
                ]
            } as any, ZoneType.Hand);

            // Give enough ink
            for (let i = 0; i < cost; i++) {
                const inkCard = p1.addCardToZone({
                    id: 6000 + cost * 10 + i,
                    name: `Ink ${cost}-${i}`,
                    type: CardType.Character,
                    cost: 1
                } as any, ZoneType.Inkwell);
                inkCard.ready = true;
            }

            harness.turnManager.startGame(harness.p1Id);

            const loggerSpy = jest.spyOn(harness.turnManager.logger, 'warn');

            // Play the song
            await harness.turnManager.playCard(p1, song.instanceId);

            // Verify NO warnings
            const warnings = loggerSpy.mock.calls.filter(call =>
                call[0]?.toString().includes('Unknown effect type')
            );

            expect(warnings.length).toBe(0);

            loggerSpy.mockRestore();

            // Reset for next iteration
            p1.hand = [];
            p1.inkwell = [];
            p1.discard = [];
        }
    });

    it('should not execute sing_cost when song is played normally', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Add some cards to deck so there are cards to draw
        for (let i = 0; i < 5; i++) {
            p1.addCardToZone({
                id: 7200 + i,
                name: `Deck Card ${i}`,
                type: CardType.Character,
                cost: 2
            } as any, ZoneType.Deck);
        }

        const song = p1.addCardToZone({
            id: 7001,
            name: 'Test Song',
            type: CardType.Action,
            cost: 3,
            subtypes: ['Song'],
            abilities: [
                {
                    effect: 'A character with cost 4 or more can ⟳ to sing this song for free.',
                    type: 'keyword'
                },
                {
                    effect: 'Draw 2 cards.',
                    type: 'effect'
                }
            ]
        } as any, ZoneType.Hand);

        for (let i = 0; i < 3; i++) {
            const inkCard = p1.addCardToZone({
                id: 7100 + i,
                name: `Ink ${i}`,
                type: CardType.Character,
                cost: 1
            } as any, ZoneType.Inkwell);
            inkCard.ready = true;
        }

        harness.turnManager.startGame(harness.p1Id);

        const initialHandSize = p1.hand.length;

        // Play the song
        await harness.turnManager.playCard(p1, song.instanceId);

        // Verify song went to discard
        expect(p1.discard.length).toBe(1);
        expect(p1.discard[0].name).toBe('Test Song');

        // sing_cost should not have affected the game state
        // (it's just metadata for WHO can sing, not an effect)
        // The draw effect should have executed though
        expect(p1.hand.length).toBeGreaterThanOrEqual(initialHandSize);
    });
});
