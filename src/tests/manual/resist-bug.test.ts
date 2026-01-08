import { TestHarness } from '../engine-test-utils';
import { CardType } from '../../engine/models';

describe('Resist Bug Verification', () => {
    let harness: TestHarness;

    beforeEach(() => {
        harness = new TestHarness();
    });

    it('should reduce damage by Resist amount', async () => {
        await harness.initGame([], []);
        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        // Setup: P2 has "The Troubadour" (Resist +1)
        harness.setPlay(p2.id, [
            {
                id: 1444,
                name: 'The Troubadour',
                type: CardType.Character,
                willpower: 5,
                fullText: "Resist +1 (Damage dealt to this character is\nreduced by 1.)"
            }
        ]);
        const troubadour = p2.play[0];

        // Setup: P1 has "Let The Storm Rage On" (Deal 2 damage)
        harness.setHand(p1.id, [
            {
                id: 9991,
                name: 'Let The Storm Rage On',
                type: CardType.Action,
                fullText: 'Deal 2 damage to chosen character. Draw a card.'
            }
        ]);
        const storm = p1.hand[0];

        // Verify initial state
        expect(troubadour.damage).toBe(0);

        // Play the action
        await harness.playCard(p1, storm, troubadour);

        // Expect damage: 2 - 1 (Resist) = 1
        console.log(`Troubadour Damage: ${troubadour.damage}`);
        expect(troubadour.damage).toBe(1);
    });
});
