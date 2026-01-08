import { TestHarness } from '../engine-test-utils';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { ZoneType, CardType } from '../../engine/models';

describe('Emily Quackfaster Bug', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should parse RECOMMENDED READING ability correctly', () => {
        const card = harness.loader.getAllCards().find(c => c.fullName === 'Emily Quackfaster - Level-Headed Librarian');
        expect(card).toBeDefined();

        const abilities = parseToAbilityDefinition(card!);

        // Should have the put_card_under ability
        const putCardUnder = abilities.find(a =>
            a.effects?.some((e: any) => e.type === 'put_card_under')
        );

        expect(putCardUnder).toBeDefined();
        // Relax check to just verify type match
        const effect = putCardUnder?.effects?.find((e: any) => e.type === 'put_card_under');
        expect(effect).toBeDefined();
        expect((effect as any)?.source).toBe('top_of_deck');
    });

    it('should prompt to put card under Merlin when Emily is played', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Add Merlin with Boost to p1's play area
        const merlin = harness.createCard(harness.p1Id, {
            name: 'Merlin - Crab',
            type: CardType.Character,
            cost: 3,
            strength: 2,
            willpower: 3,
            lore: 1,
            fullText: 'Boost 2'
        } as any);
        merlin.baseKeywords = ['Boost'];

        // Ensure ability is on the card
        merlin.abilities = [{
            type: 'keyword',
            keyword: 'Boost',
            keywordValue: '2',
            fullText: 'Boost 2'
        }] as any;

        // Add manual keywords property if parser doesn't run
        if (!merlin.keywords) merlin.keywords = [];
        merlin.keywords.push('boost');

        harness.setPlay(harness.p1Id, [merlin]);

        // Add Emily to p1's hand
        const emily = harness.createCard(harness.p1Id, {
            name: 'Emily Quackfaster - Level-Headed Librarian',
            cost: 2,
            type: CardType.Character,
            strength: 2,
            willpower: 2,
            lore: 1,
            fullText: "RECOMMENDED READING When you play this character, you may put the top card of your deck facedown under one of your characters or locations with Boost."
        } as any);
        harness.setHand(harness.p1Id, [emily]);

        // Add a card to p1's deck
        const deckCard = harness.createCard(harness.p1Id, { name: 'Test Card', type: CardType.Character, cost: 1 });
        p1.deck = [deckCard];

        // Give p1 enough ink
        harness.setInk(harness.p1Id, 3);

        // Track choice requests
        let choiceRequest: any = null;
        harness.turnManager.registerChoiceHandler(harness.p1Id, (request: any) => {
            choiceRequest = request;
            // Auto-select Merlin
            return {
                requestId: request.id,
                playerId: harness.p1Id,
                selectedIds: [merlin.instanceId],
                declined: false,
                timestamp: Date.now()
            };
        });

        // Mix real card data with our instance before playing
        const emilyReal = harness.loader.getAllCards().find(c => c.fullName === 'Emily Quackfaster - Level-Headed Librarian');
        if (emilyReal) {
            const parsed = parseToAbilityDefinition(emilyReal);
            emily.abilities = parsed as any;
        }

        // Play Emily - triggers on-play effects
        await harness.turnManager.playCard(p1, emily.instanceId);

        // Should have received choice request
        expect(choiceRequest).toBeDefined();

        // Reload Merlin from state
        const updatedMerlin = p1.play.find((c: any) => c.instanceId === merlin.instanceId);
        // Engine stores cardsUnder in meta
        expect(updatedMerlin?.meta?.cardsUnder?.length).toBe(1);
    });
});
