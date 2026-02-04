import { TestHarness } from '../engine-test-utils';
import { GameEvent } from '../../engine/abilities/events';
import { ZoneType } from '../../engine/models';

describe('Enters Play Exerted Bug', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('Iago - Raucous Lookout should enter play exerted', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Iago - Raucous Lookout
        // Ability: "This character enters play exerted."
        const iago = harness.createCard(p1, {
            name: 'Iago - Raucous Lookout',
            type: 'Character',
            cost: 2,
            inkwell: true,
            abilities: [
                {
                    type: 'static',
                    effect: 'This character enters play exerted.',
                    // We need to match what the parser produces.
                    // Based on grep, the text is matched. 
                    // Let's assume the parser understands this phrase basically, 
                    // or at least produces a static ability.
                    // If the parser produces a specific effect object, we need to mock it if we manually create.
                    // But here we rely on the engine parsing the 'effect' string if we provided it?
                    // actually harness.createCard doesn't parse text -> ability. 
                    // It takes the abilities array as given.
                    // So we need to provide the "parsed" structure that the engine expects.
                    // The bug is likely that the engine DOESN'T handle this structure.
                    // 
                    // However, for a reproduction of an ENGINE bug (not parser bug), 
                    // we should manually try to put the card in play using `playCard`.
                    // But first we need to know what the parser outputs for this.
                    // I will check the parser output first or just assume a standard "enters_exerted" capability?
                    //
                    // Wait, if I manually define the ability in the test, I might bypass the parser bug.
                    // BUT the user says "When I played this character". So it's an end-to-end issue.
                    //
                    // To be safe, I will rely on the `setHand` and `playCard` flow if possible, 
                    // mimicking the real card data.
                }
            ]
        });

        // Let's manually define the ability structure as best we guess, 
        // OR better: use `harness.setHand` with the real card name and let the test harness 
        // load it from the card database if it exists?
        // The TestHarness seems to use `createCard` which creates a mock card.
        // `setPlay` uses `cardLoader` potentially?

        // Looking at `TestHarness.initialize`, it loads cards.
        // `harness.setHand` takes names.

        await harness.setHand(harness.p1Id, ['Iago - Raucous Lookout']);
        const iagoCard = p1.hand.find(c => c.name.includes('Iago'));

        if (!iagoCard) throw new Error('Iago not found in hand');

        // Add ink to pay for cost (using known card) - Cost is 4
        // We need 4 ink.
        harness.setInk(harness.p1Id, 4);

        // Ensure ink is ready
        // Re-fetch player to ensure we have latest state
        const p1Updated = harness.game.getPlayer(harness.p1Id);
        p1Updated.inkwell.forEach(c => c.ready = true);

        console.log(`[TEST-DEBUG] Inkwell size: ${p1Updated.inkwell.length}, Ready count: ${p1Updated.inkwell.filter(c => c.ready).length}`);

        // Play the card
        await harness.playCard(harness.p1Id, iagoCard.instanceId);

        // Check if it is in play
        const iagoInPlay = p1.play.find(c => c.instanceId === iagoCard.instanceId);
        expect(iagoInPlay).toBeDefined();

        // Check if exerted (ready should be false)
        if (iagoInPlay?.ready === false) {
            console.log('Iago is exerted (Correct behavior)');
        } else {
            console.log('BUG REPRODUCED: Iago is ready (Incorrect behavior)');
        }

        expect(iagoInPlay?.ready).toBe(false);
    });
});
