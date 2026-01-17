import { TestHarness } from '../engine-test-utils';
import { CardType, ZoneType } from '../../engine/models';

describe('Bug Report: Chernabog Cost Reduction', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should reduce cost by 1 for each character in discard', async () => {
        const player = harness.getPlayer(harness.p1Id);

        // Setup: 8 Ink
        harness.setInk(player.id, 8);

        // Setup: 4 Characters in Discard
        // We can just add dummy cards
        for (let i = 0; i < 4; i++) {
            // Create a dummy character card in discard
            const card = harness.createCard(player, {
                name: 'Mickey Mouse - Brave Little Tailor',
                type: CardType.Character,
                cost: 8,
                inkwell: true
            });
            card.zone = ZoneType.Discard;
            player.discard.push(card);
        }

        // Setup: Chernabog in Hand (Cost 10)
        // We need to ensure the card loader knows about Chernabog, or we mock it if it's not in the small subset loaded by TestHarness?
        // TestHarness loads ALL cards via CardLoader, so it should be fine.
        // But createCard doesn't look up by name from DB unless we use harness.getCard()

        // Let's use harness.getCard via the loader
        const chernabogBase = harness.getCard('Chernabog - Evildoer');
        if (!chernabogBase) throw new Error('Chernabog not found in DB');

        const chernabog = harness.createCard(player, {
            ...chernabogBase,
            name: chernabogBase.fullName,
            type: CardType.Character
        });
        player.hand.push(chernabog);

        // Verify Base Cost
        expect(chernabog.cost).toBe(10);

        // Verify Modified Cost (Should be 10 - 4 = 6)
        const modifiedCost = harness.turnManager.abilitySystem.getModifiedCost(chernabog, player);
        expect(modifiedCost).toBe(6);

        // Play Card
        const result = await harness.turnManager.playCard(player, chernabog.instanceId);
        expect(result).toBe(true);
        expect(chernabog.zone).toBe(ZoneType.Play);

        // Verify Ink Used (Cost 6)
        const spentInk = player.inkwell.filter(c => !c.ready).length;
        expect(spentInk).toBe(6);
    });
});
