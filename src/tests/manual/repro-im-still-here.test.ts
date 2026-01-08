import { ActionType, CardInstance, ZoneType } from '../../engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { TestHarness } from '../engine-test-utils';

describe('Manual: I\'m Still Here (Resist +2)', () => {
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

        // Parse abilities
        if (card.abilities && card.abilities.length > 0) {
            card.parsedEffects = parseToAbilityDefinition(card) as any;
        } else {
            card.parsedEffects = [];
        }

        player.play.push(card);
        harness.turnManager.abilitySystem.registerCard(card);
        return card;
    };

    it('should grant Resist +2 and reduce incoming damage', async () => {
        await harness.initGame([], []);
        const p1 = harness.getPlayer(harness.p1Id);
        const p2 = harness.getPlayer(harness.p2Id);

        // 1. Setup Board
        // P1 has Mickey Mouse (3/3) - Exerted so he can be challenged
        const mickey = createInPlay(p1, 'Mickey Mouse - True Friend', false);

        // P2 has Aladdin - Prince Ali (3/3) - Attacker. Ready to challenge.
        const aladdin = createInPlay(p2, 'Aladdin - Prince Ali', true);
        // 3 Strength

        // 2. Play "I'm Still Here"
        // Target Mickey
        harness.setHand(p1.id, ['I\'m Still Here']);
        harness.setInkwell(p1.id, ['Ink', 'Ink', 'Ink']);
        const songToPlay = p1.hand.find(c => c.fullName === 'I\'m Still Here');
        if (!songToPlay) throw new Error('Song not found in hand');

        // Resolve Play Action
        await harness.turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: p1.id,
            cardId: songToPlay.instanceId
        });

        // 3. Pass turn to P2
        await harness.turnManager.passTurn(p1.id);

        // 4. P2 Challenges Mickey
        // Aladdin (3) vs Mickey (3, Resist +2)
        await harness.turnManager.resolveAction({
            type: ActionType.Challenge,
            playerId: p2.id,
            cardId: aladdin.instanceId,
            targetId: mickey.instanceId
        });

        expect(mickey.damage).toBe(0);
    });
});
