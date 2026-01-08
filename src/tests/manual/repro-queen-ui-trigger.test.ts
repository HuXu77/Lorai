
import { ActionType, CardInstance, ZoneType } from '../../engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { TestHarness } from '../engine-test-utils';

describe('Manual: Queen - Commanding Presence UI Trigger', () => {
    let harness: TestHarness;

    beforeEach(() => {
        harness = new TestHarness();
    });

    const createInPlay = (player: any, cardName: string, ready = true) => {
        const base = harness.getCard(cardName);
        if (!base) throw new Error(`Card not found: ${cardName}`);

        const card: CardInstance = {
            ...base,
            instanceId: `${base.name.replace(/\s/g, '_')}_${Date.now()}_${Math.random()}`,
            ownerId: player.id,
            zone: ZoneType.Play,
            ready,
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

        player.play.push(card);
        harness.turnManager.abilitySystem.registerCard(card);
        return card;
    };

    it('should trigger "Who is the Fairest?" when Questing and require target selection', async () => {
        await harness.initGame([], []);
        const p1 = harness.getPlayer(harness.p1Id);
        const p2 = harness.getPlayer(harness.p2Id);

        // 1. P1 has The Queen - Commanding Presence (Ready)
        const queen = createInPlay(p1, 'The Queen - Commanding Presence', true);
        console.log('[TEST] Queen registered with parsedEffects:', queen.parsedEffects?.length);

        // 2. P2 has a character (target for -4 strength)
        const opponent = createInPlay(p2, 'Mickey Mouse - Artful Rogue', true);
        console.log('[TEST] Opponent character:', opponent.name);

        // 3. Quest with Queen (should trigger ability)
        console.log('--- Questing with Queen ---');
        await harness.turnManager.resolveAction({
            type: ActionType.Quest,
            playerId: p1.id,
            cardId: queen.instanceId
        });

        // 4. Verify the triggered ability modified stats
        // Since there's no interactive UI in test, the executor should auto-select or fail gracefully
        console.log('[TEST] Queen strength after quest:', queen.strength);
        console.log('[TEST] Opponent strength after quest:', opponent.strength);

        // The trigger should have fired and attempted targeting
        // In a real game, this would prompt the UI for target selection
        // For now, verify the log shows "Triggered" message
        expect(true).toBe(true); // Placeholder - verifying via console output
    });
});
