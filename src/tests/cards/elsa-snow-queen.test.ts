import { TestHarness } from '../engine-test-utils';
import { CardType, ZoneType } from '../../engine/models';
import { getActivatedAbilities } from '../../utils/ability-helpers';

describe('Card: Elsa - Snow Queen', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should exert chosen opposing character when activated', async () => {
        const p1 = harness.getPlayer(harness.p1Id);
        const p2 = harness.getPlayer(harness.p2Id);

        // Setup P1: Elsa - Snow Queen in play
        const elsaBase = harness.getCard('Elsa - Snow Queen');
        if (!elsaBase) throw new Error('Elsa - Snow Queen not found in DB');

        const elsa = harness.createCard(p1, elsaBase);
        elsa.zone = ZoneType.Play;
        elsa.turnPlayed = -1; // Ready to act
        elsa.ready = true;
        p1.play.push(elsa);

        // Setup P2: Target Character in play (Ready)
        const mickeyBase = harness.getCard('Mickey Mouse - Brave Little Tailor');
        if (!mickeyBase) throw new Error('Mickey Mouse not found in DB');

        const mickey = harness.createCard(p2, mickeyBase);
        mickey.zone = ZoneType.Play;
        mickey.ready = true;
        p2.play.push(mickey);

        // Identify Elsa's Activated Ability
        const activatedAbilities = getActivatedAbilities(elsa);
        console.log('Abilities:', elsa.abilities);
        expect(activatedAbilities.length).toBeGreaterThan(0);
        // Expecting "Freeze: Exert chosen opposing character."

        // Use Ability
        // Note: activateAbility expects the index in the card.abilities array?, or index of activated ability?
        // Usually it's the index in card.abilities of the ACTIVATED ability.
        // We need to find the index.
        const abilityIndex = elsa.abilities.findIndex(a => a.type === 'activated' || (a as any).cost);

        const result = await harness.turnManager.useAbility(p1, elsa.instanceId, abilityIndex);

        // Verify usage success
        expect(result).toBe(true);

        // Verify Mickey is Exerted
        // Harness auto-resolves choice to first valid option (Mickey)
        expect(mickey.ready).toBe(false);

        // Verify Elsa is Exerted (Cost)
        expect(elsa.ready).toBe(false);
    });
});
