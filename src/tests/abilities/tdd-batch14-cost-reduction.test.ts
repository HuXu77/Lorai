
import { ActionType, CardInstance, ZoneType } from '../../engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { TestHarness } from '../engine-test-utils';

describe('TDD Batch 14: Cost Reduction (Kristoff - Reindeer Keeper)', () => {
    let harness: TestHarness;

    beforeEach(() => {
        harness = new TestHarness();
    });

    const createInZone = (player: any, cardName: string, zone: ZoneType) => {
        const base = harness.getCard(cardName);
        if (!base) throw new Error(`Card not found: ${cardName}`);

        const card: CardInstance = {
            ...base,
            instanceId: `${base.name.replace(/\s/g, '_')}_${Date.now()}_${Math.random()}`,
            ownerId: player.id,
            zone,
            ready: true,
            damage: 0,
            turnPlayed: -1,
            meta: {},
            baseStrength: base.strength,
            baseWillpower: base.willpower,
            baseLore: base.lore,
            baseCost: base.cost,
            subtypes: base.subtypes || [],
            parsedEffects: []
        };

        if (card.abilities && card.abilities.length > 0) {
            card.parsedEffects = parseToAbilityDefinition(card) as any;
        } else {
            card.parsedEffects = [];
        }

        if (zone === ZoneType.Hand) player.hand.push(card);
        else if (zone === ZoneType.Discard) player.discard.push(card);
        else if (zone === ZoneType.Play) {
            player.play.push(card);
            harness.turnManager.abilitySystem.registerCard(card);
        }

        return card;
    };

    it('Kristoff - Reindeer Keeper should cost 1 less for each song in discard', async () => {
        await harness.initGame([], []);
        const p1 = harness.getPlayer(harness.p1Id);

        // 1. Add Songs to Discard
        createInZone(p1, 'A Whole New World', ZoneType.Discard); // Song 1
        createInZone(p1, 'Grab Your Sword', ZoneType.Discard);   // Song 2
        createInZone(p1, 'One Jump Ahead', ZoneType.Discard);    // Song 3

        // Add non-song to discard (control)
        createInZone(p1, 'Mickey Mouse - True Friend', ZoneType.Discard);

        // 2. Add Kristoff to Hand
        const kristoff = createInZone(p1, 'Kristoff - Reindeer Keeper', ZoneType.Hand);
        // Base Cost: 8 (from allCards.json check, need to verify exact cost, grep didn't show cost but likely high)
        // Assume base cost is high. Ability says "pay 1 less".

        // 3. Check Cost
        const cost = harness.turnManager.abilitySystem.getModifiedCost(kristoff, p1);

        // If base cost is X, modified should be X - 3.
        // Let's verify base cost first.
        const baseCost = kristoff.cost;
        expect(cost).toBe(baseCost - 3);
    });
});
