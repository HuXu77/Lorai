import { TestHarness } from '../engine-test-utils';

describe('Strength of a Raging Fire Reproduction', () => {
    let harness: TestHarness;

    beforeEach(async () => {
    harness = new TestHarness();
    await harness.initialize();
});

it('should deal damage equal to number of characters in play', async() => {
    await harness.initGame(['Strength of a Raging Fire'], []);
    const p1 = harness.game.getPlayer(harness.p1Id);
    const p2 = harness.game.getPlayer(harness.p2Id);

    // Setup: P1 has 3 characters in play
    harness.setPlay(p1.id, [
        'Mickey Mouse - Brave Little Tailor',
        'Olaf - Friendly Snowman',
        'Elsa - Snow Queen'
    ], false);

    // Setup: P2 has a target character
    harness.setPlay(p2.id, ['Maleficent - Monstrous Dragon'], false);
    const target = p2.play[0];

    // Setup: P1 has the song in hand
    harness.setHand(p1.id, ['Strength of a Raging Fire']);
    const song = p1.hand[0];

    // Provide ink to play the card (costs 3)
    harness.setInk(p1.id, 3);

    // Register choice handler to select target
    harness.turnManager.registerChoiceHandler(p1.id, (request: any) => {
        if(request.type === 'select_target' || request.type === 'chosen_character') {
    return { selectedIds: [target.instanceId] };
}
            return { selectedIds: [] };
        });

// Play the song targeting the opponent's character
await harness.turnManager.resolveAction({
    type: 'PlayCard',
    playerId: p1.id,
    cardId: song.instanceId,
    targetId: target.instanceId
});

// Expect damage on target to be 3 (equal to number of P1's characters)
console.log(`Target Damage: ${target.damage}`);
expect(target.damage).toBe(3);
    });
});
