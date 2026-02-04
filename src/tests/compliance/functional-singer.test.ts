
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { TestHarness } from '../engine-test-utils';
import { loadAllCards, getCardsWithKeyword } from './compliance-utils';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType, ZoneType } from '../../engine/models';

describe('Functional Compliance: Singer', () => {
    let harness: TestHarness;
    let singerCards: any[] = [];

    beforeAll(() => {
        const allCards = loadAllCards();
        // Get cards that have the Singer keyword ability parsed
        singerCards = getCardsWithKeyword(allCards, 'Singer').filter(card => {
            // Re-verify it has the actual mechanic
            const cardInput = { ...card, id: 0, type: 'Character' as CardType } as any;
            const abilities = parseToAbilityDefinition(cardInput);
            return abilities.some(a => (a as any).keyword?.toLowerCase() === 'singer');
        });

        console.log(`[SINGER-COMPLIANCE] Found ${singerCards.length} Singer cards.`);
    });

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    // Run a subset to avoid timeout during pilot (e.g., first 5)
    // In a real full rune, we'd loop all
    it('should verify first 5 cards can sing', async () => {
        const subset = singerCards.slice(0, 5);

        for (const cardData of subset) {
            console.log(`Testing Singer: ${cardData.fullName}`);

            // 1. Determine Singer Value
            const cardInput = { ...cardData, id: 0, type: 'Character' as CardType } as any;
            const abilities = parseToAbilityDefinition(cardInput);
            const singerAbility = abilities.find(a => (a as any).keyword?.toLowerCase() === 'singer');
            const singerValue = (singerAbility as any).value || 0;

            if (singerValue === 0) {
                console.warn(`Skipping ${cardData.fullName} - Singer value 0?`);
                continue;
            }

            // 2. Setup Board
            // P1 has the character in play, ready
            // P1 has NO ink (to force singing)
            harness.setInk(harness.p1Id, 0);

            await harness.setPlay(harness.p1Id, [cardData.fullName]);
            const singerInstance = harness.game.getPlayer(harness.p1Id).play[0];
            expect(singerInstance).toBeDefined();
            expect(singerInstance.ready).toBe(true);

            // 3. Create a Song with Cost == Singer Value
            // We inject a mock card into hand
            const songName = `Song for ${cardData.name}`;
            const mockSong = {
                name: songName,
                fullName: songName,
                type: 'Action' as CardType,
                subtypes: ['Song'], // Crucial for Singing
                cost: singerValue,
                inkwell: false,
                abilities: [],
                fullText: "Do something."
            };

            // Use setHand with card object
            harness.setHand(harness.p1Id, [mockSong]);
            const songInstance = harness.game.getPlayer(harness.p1Id).hand[0];

            // 4. Play the song using direct resolveAction to pass singerIds
            try {
                // harness.playCard doesn't support singerIds yet, so we call resolveAction directly
                const result = await harness.turnManager.resolveAction({
                    type: 'PlayCard' as any, // Cast to avoid import issues if ActionType not exported
                    playerId: harness.p1Id,
                    cardId: songInstance.instanceId,
                    singerIds: [singerInstance.instanceId]
                } as any);

                if (!result) {
                    throw new Error("resolveAction returned false");
                }
            } catch (e) {
                throw new Error(`Failed to sing with ${cardData.fullName} (Singer ${singerValue}): ${e}`);
            }

            // 5. Assertions
            // Song should be in discard (played)
            const p1 = harness.game.getPlayer(harness.p1Id);
            const playedSong = p1.discard.find(c => c.instanceId === songInstance.instanceId);
            expect(playedSong).toBeDefined();

            // Singer should be EXERTED
            const singerAfter = p1.play.find(c => c.instanceId === singerInstance.instanceId);
            expect(singerAfter?.ready).toBe(false);

            console.log(`✅ ${cardData.fullName} successfully sang cost ${singerValue}.`);
        }
    });
});
