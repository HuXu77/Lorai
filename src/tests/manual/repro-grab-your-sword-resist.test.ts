
import { ActionType, CardInstance, ZoneType } from '../../engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { TestHarness } from '../engine-test-utils';

describe('Manual: Grab Your Sword vs Resist', () => {
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

    it('should reduce damage from Grab Your Sword when target has Resist', async () => {
        await harness.initGame([], []);
        const p1 = harness.getPlayer(harness.p1Id);
        const p2 = harness.getPlayer(harness.p2Id);

        // 1. Setup Board
        // P1 has Mickey Mouse (Target)
        const mickey = createInPlay(p1, 'Mickey Mouse - True Friend', true);

        // P2 has Grab Your Sword in hand
        harness.setHand(p2.id, ['Grab Your Sword']);
        harness.setInkwell(p2.id, ['Ink', 'Ink', 'Ink', 'Ink', 'Ink']); // Cost 5
        harness.setInkwell(p2.id, ['Ink', 'Ink', 'Ink', 'Ink', 'Ink']); // Cost 5
        const gys = p2.hand.find(c => c.fullName === 'Grab Your Sword');
        if (!gys) throw new Error('Grab Your Sword not found');

        // 2. P1 Plays "I'm Still Here" on Mickey (Resist +2)
        harness.setHand(p1.id, ['I\'m Still Here']);
        harness.setInkwell(p1.id, ['Ink', 'Ink', 'Ink']);
        const songInstance = p1.hand[0];

        await harness.turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: p1.id,
            cardId: songInstance.instanceId
        });

        // Verify Resist applied
        expect(mickey.meta.resist).toBe(2);

        // Pass turn to P2
        await harness.turnManager.passTurn(p1.id);

        // 3. P2 plays Grab Your Sword
        await harness.turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: p2.id,
            cardId: gys.instanceId
        });

        // 4. Verify Damage
        // GYS deals 2 damage. Resist +2 should reduce it to 0.
        console.log(`Mickey Damage: ${mickey.damage}`);
        expect(mickey.damage).toBe(0);
    });
    it('should reduce damage from Grab Your Sword when target has Resist (Troubadour)', async () => {
        await harness.initGame([], []);
        const p1 = harness.getPlayer(harness.p1Id);
        const p2 = harness.getPlayer(harness.p2Id);

        // 1. Setup Board
        // P1 has The Troubadour (Resist +1)
        const troubadour = createInPlay(p1, 'The Troubadour - Musical Narrator', true);
        console.log('[DEBUG] Troubadour meta IMMEDIATELY after createInPlay:', JSON.stringify(troubadour.meta));

        // Also check the card in play array
        const inPlayCard = p1.play.find(c => c.fullName === 'The Troubadour - Musical Narrator');
        console.log('[DEBUG] Card in p1.play meta:', inPlayCard ? JSON.stringify(inPlayCard.meta) : 'NOT FOUND');
        console.log('[DEBUG] Same reference?', troubadour === inPlayCard);

        // P2 has Grab Your Sword in hand
        harness.setHand(p2.id, ['Grab Your Sword']);
        harness.setInkwell(p2.id, ['Ink', 'Ink', 'Ink', 'Ink', 'Ink']);
        const gys = p2.hand.find(c => c.fullName === 'Grab Your Sword');
        if (!gys) throw new Error('Grab Your Sword not found in hand');

        // Pass turn to P2
        await harness.turnManager.passTurn(p1.id);
        console.log('[DEBUG] After passTurn - Troubadour meta:', JSON.stringify(troubadour.meta));

        // 3. P2 plays Grab Your Sword
        await harness.turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: p2.id,
            cardId: gys.instanceId
        });
        console.log('[DEBUG] After GYS - Troubadour meta:', JSON.stringify(troubadour.meta));

        // 4. Verify Damage
        // GYS deals 2 damage. Resist +1 -> 1 damage.
        console.log(`Troubadour Damage: ${troubadour.damage}`);
        console.log(`Troubadour Meta:`, JSON.stringify(troubadour.meta || {}));
        expect(troubadour.meta.resist).toBe(1);
        expect(troubadour.damage).toBe(1);
    });
});
