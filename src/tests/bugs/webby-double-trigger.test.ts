
import { TestHarness } from '../engine-test-utils';
import { CardType } from '../../engine/models';

describe('Webby Double Trigger Bug', () => {
    let harness: TestHarness;

    beforeEach(() => {
        harness = new TestHarness();
        // Mock the loader to avoid loading all cards
        harness.loader.getAllCards = () => [];
    });

    it('should only trigger when Webby is played, not when subsequent characters are played', async () => {
        await harness.initialize();
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Create Webby with the triggered ability
        const webby = harness.createCard(p1, {
            name: 'Webby Vanderquack',
            type: 'Character' as CardType,
            cost: 1,
            inkwell: true,
            abilities: [{
                type: 'triggered',
                trigger: 'on_play',
                effect: 'When you play this character, chosen character gets +1 ¤ this turn.',
                // Manual parsing simulation
                effects: [{
                    type: 'modify_stats',
                    target: 'chosen_character',
                    stat: 'lore',
                    amount: 1,
                    duration: 'turn'
                }]
            }]
        });

        // Create other cards
        const other = harness.createCard(p1, {
            name: 'Other Character',
            type: 'Character' as CardType,
            cost: 1
        });

        const target = harness.createCard(p1, {
            name: 'Target Character',
            type: 'Character' as CardType,
            cost: 1
        });
        target.zone = 'play';
        p1.play.push(target);

        // Set up hand
        harness.setHand(harness.p1Id, [webby, other]);
        harness.setInk(harness.p1Id, 10);
        harness.setTurn(harness.p1Id);

        // Spy on requestChoice to detect triggers
        const requestChoiceSpy = jest.spyOn(harness.turnManager, 'requestChoice');

        console.log('Webby Parsed Effects:', JSON.stringify(webby.parsedEffects, null, 2));

        // 1. Play Webby
        // We pass target to satisfy the choice if it happens synchronously in harness (it usually doesn't, choices are async)
        // But our harness mocks playCard by just calling resolveAction.
        // If ability triggers, it calls requestChoice.
        await harness.playCard(p1, webby);

        // Expect 1 choice request (for Webby's ability)
        expect(requestChoiceSpy).toHaveBeenCalledTimes(1);

        // Reset spy
        requestChoiceSpy.mockClear();

        // 2. Play Other Character
        await harness.playCard(p1, other);

        // Expect NO choice request (Webby should NOT trigger)
        expect(requestChoiceSpy).toHaveBeenCalledTimes(0);
    });
});
