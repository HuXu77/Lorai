import { TestHarness } from '../engine-test-utils';
import { ActionType, ZoneType, CardType } from '../../engine/models';

describe('Strength of a Raging Fire Reproduction', () => {
    let harness: TestHarness;

    beforeEach(() => {
        harness = new TestHarness();
    });

    it('should deal damage equal to number of characters in play', async () => {
        await harness.initGame([], []);
        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        // Setup: P1 has 3 characters in play
        harness.setPlay(p1.id, [
            { name: 'Char 1', type: CardType.Character },
            { name: 'Char 2', type: CardType.Character },
            { name: 'Char 3', type: CardType.Character }
        ]);

        // Setup: P2 has a target character
        harness.setPlay(p2.id, [
            { name: 'Target', willpower: 10, type: CardType.Character } // High willpower to survive
        ]);
        const target = p2.play[0];

        // Setup: P1 has the song in hand
        harness.setHand(p1.id, [
            {
                id: 999,
                name: 'Strength of a Raging Fire',
                type: CardType.Action,
                subtypes: ['Song'],
                fullText: 'Deal damage to chosen character equal to the number of characters you have in play.'
            }
        ]);
        const song = p1.hand[0];

        // Play the song targeting the opponent's character
        await harness.playCard(p1, song, target);

        // Expect damage on target to trigger.
        // If ability is parsed correctly, damage should be 3.
        // If failed, damage might be 0 or undefined.
        console.log(`Target Damage: ${target.damage}`);
        expect(target.damage).toBe(3);
    });
});
