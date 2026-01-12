import { TestHarness } from '../engine-test-utils';
import { CardType, ZoneType } from '../../engine/models';

describe('Blessed Bagpipes Bug', () => {
    let harness: TestHarness;

    beforeEach(() => {
        harness = new TestHarness();
    });

    it('should prompt to put top card under a character with Boost', async () => {
        await harness.initialize();
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Mock deck
        harness.setDeck(harness.p1Id, ['Magic Broom - Bucket Brigade']);

        // Create Flynn with Boost
        const flynn = harness.createCard(p1, {
            name: 'Flynn Rider - Spectral Scoundrel',
            type: CardType.Character,
            cost: 5,
            inkwell: true,
            abilities: [{
                type: 'keyword',
                keyword: 'Boost',
                fullText: 'Boost 1 \u2B21',
                reminderText: 'Check boost logic'
            } as any],
            baseKeywords: ['Boost']
        });
        flynn.keywords = ['Boost']; // RESTORED: Parsing flaky in test env, ensure keyword present

        // Create Blessed Bagpipes
        const bagpipes = harness.createCard(p1, {
            name: 'Blessed Bagpipes',
            type: CardType.Item,
            cost: 2,
            inkwell: true,
            abilities: [
                {
                    "effect": "When you play this item, you may put the top card of your deck facedown under one of your characters or locations with Boost.",
                    "fullText": "MCDUCK HEIRLOOM When you play this item, you may\nput the top card of your deck facedown under one of\nyour characters or locations with Boost.",
                    "name": "MCDUCK HEIRLOOM",
                    "type": "triggered",
                    "trigger": "on_play"
                }
            ]
        });

        // Setup board using harness helpers to ensure registration
        harness.setHand(harness.p1Id, [bagpipes]);
        harness.setPlay(harness.p1Id, [flynn]);

        // Re-fetch Flynn from play to get the registered instance
        const flynnInPlay = p1.play[0];

        harness.setInk(harness.p1Id, 10);
        harness.setTurn(harness.p1Id);

        // Mock requestChoice to select Flynn
        const requestChoiceSpy = vi.spyOn(harness.turnManager, 'requestChoice').mockResolvedValue({
            selectedIds: [flynnInPlay.instanceId]
        } as any);

        // Play Bagpipes
        console.log('Bagpipes Parsed Effects:', JSON.stringify(bagpipes.parsedEffects, null, 2));
        await harness.playCard(p1, bagpipes);

        // Check if choice was requested
        expect(requestChoiceSpy).toHaveBeenCalled();

        const callArgs = requestChoiceSpy.mock.calls[0];
        if (callArgs) {
            const request = callArgs[0];
            // Should target Flynn
            expect(request.options.some((o: any) => o.id === flynnInPlay.instanceId)).toBe(true);
        }

        // Assert card was actually put under
        expect(flynnInPlay.meta?.cardsUnder?.length).toBe(1);
    });
});
