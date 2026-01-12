
import { TestHarness } from '../engine-test-utils';
import { CardType } from '../../engine/models';

describe('Ability Prompts Integration', () => {
    let harness: TestHarness;

    beforeEach(() => {
        harness = new TestHarness();
        // Mock loader
        harness.loader.getAllCards = () => [];
    });

    it('Webby generates a target selection prompt when played', async () => {
        await harness.initialize();
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Create Webby
        // For Webby, we rely on the parser or manual parsedEffects. 
        // Let's use manual parsedEffects to be safe and consistent with Flynn fix.
        const webby = harness.createCard(p1, {
            name: 'Webby Vanderquack',
            type: 'Character' as CardType,
            cost: 1,
            inkwell: true,
            parsedEffects: [{
                fullText: "When you play this character, chosen character gets +1 ¤ this turn.",
                type: 'triggered',
                event: 'card_played',
                trigger: 'on_play',
                triggerFilter: { target: 'self' }, // Important fix we made earlier
                effect: 'When you play this character, chosen character gets +1 ¤ this turn.',
                effects: [{
                    type: 'modify_stats',
                    target: { type: 'chosen_character', opposing: false },
                    stat: 'lore',
                    amount: 1,
                    duration: 'turn'
                }]
            }]
        });

        // Create a target character
        const targetChar = harness.createCard(p1, {
            name: 'Target Dummy',
            type: 'Character' as CardType,
            cost: 1
        });
        targetChar.zone = 'play';
        p1.play.push(targetChar);

        harness.setHand(harness.p1Id, [webby]);
        harness.setInk(harness.p1Id, 10);
        harness.setTurn(harness.p1Id);

        // Spy on requestChoice
        const requestChoiceSpy = vi.spyOn(harness.turnManager, 'requestChoice').mockReturnValue({
            selectedIds: [targetChar.instanceId]
        } as any);

        // Play Webby
        await harness.playCard(p1, webby);

        // Verify prompt (choice request) happened
        expect(requestChoiceSpy).toHaveBeenCalledTimes(1);
        const choiceRequest = requestChoiceSpy.mock.calls[0][0];

        expect(choiceRequest.playerId).toBe(p1.id);
        expect(choiceRequest.type).toBe('target_character');
        // Both Webby (self) and Target Dummy should be valid options for "chosen character"
        expect(choiceRequest.options.length).toBeGreaterThanOrEqual(1);

        const optionNames = choiceRequest.options.map((o: any) => o.display);
        // Uses flexible matching because display names usually include "(Player 1)" etc.
        expect(optionNames.some((o: string) => o.includes('Target Dummy'))).toBe(true);
    });

    it('Flynn Rider Boost ability can be executed', async () => {
        await harness.initialize();
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Create Flynn with Boost
        const flynn = harness.createCard(p1, {
            name: 'Flynn Rider',
            fullName: 'Flynn Rider - Spectral Scoundrel',
            type: 'Character' as CardType,
            cost: 2,
            // Pass parsedEffects directly to bypass parser overwrite in TestHarness
            parsedEffects: [
                {
                    fullText: "Boost 2 ⬡",
                    keyword: "Boost",
                    keywordValue: "2",
                    keywordValueNumber: 2,
                    type: "activated", // Wrap as activated ability so useAbility can trigger it
                    effect: "Boost 2",
                    effects: [{
                        type: 'keyword',
                        keyword: 'Boost',
                        keywordValueNumber: 2,
                        keywordValue: '2'
                    }]
                }
            ]
        });

        // Setup state directly
        flynn.zone = 'play';
        flynn.ready = true;
        p1.play.push(flynn);

        // Initial ink
        harness.setInk(harness.p1Id, 2);

        // Setup deck for boost (top card)
        const topDeckCard = harness.createCard(p1, { name: 'Hidden Ace', type: 'Character' as CardType, cost: 1 });
        p1.deck = [topDeckCard];

        // Verify parsedEffects structure
        expect(flynn.parsedEffects).toBeDefined();
        expect(flynn.parsedEffects).toHaveLength(1);
        expect(flynn.parsedEffects![0].effects).toHaveLength(1);
        expect((flynn.parsedEffects![0].effects[0] as any).keyword).toBe('Boost');

        // Execute "Use Ability" (Index 0)
        await harness.turnManager.useAbility(p1, flynn.instanceId, 0);

        // Verify ink paid
        const readyInk = p1.inkwell.filter(c => c.ready).length;
        expect(readyInk).toBe(0);

        // Verify card under flynn
        expect(flynn.meta?.cardsUnder).toBeDefined();
        expect(flynn.meta?.cardsUnder).toHaveLength(1);
        expect(flynn.meta?.cardsUnder?.[0].name).toBe('Hidden Ace');
        expect(flynn.meta?.cardsUnder?.[0].facedown).toBe(true);

        // Verify deck empty
        expect(p1.deck).toHaveLength(0);
    });
});
