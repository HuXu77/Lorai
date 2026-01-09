
import { TestHarness } from '../engine-test-utils';
import { CardInstance, ZoneType, CardType } from '../../engine/models';

describe('Queen\'s Sensor Core Ability', () => {
    it('only grants lore if Princess or Queen is in play', async () => {
        const harness = new TestHarness();
        await harness.initialize();

        const p1 = harness.getPlayer(harness.p1Id);

        // 1. Setup Board: Sensor Core only
        const sensorCore = harness.createCard(p1, {
            name: 'Queen\'s Sensor Core',
            type: CardType.Item,
            cost: 2,
            inkwell: true,
            abilities: [{
                type: 'triggered',
                fullText: 'At the start of your turn, if you have a Princess or Queen character in play, gain 1 lore.',
            }]
        });

        console.log('Sensor Core Parsed Effects:', JSON.stringify(sensorCore.parsedEffects, null, 2));

        p1.addCardToZone(sensorCore, ZoneType.Play);
        harness.turnManager.abilitySystem.registerCard(sensorCore);
        p1.lore = 0;

        // 2. Start Turn (Condition Failed)
        // Should NOT trigger lore gain
        harness.turnManager.startTurn(p1.id);
        expect(p1.lore).toBe(0);

        // End turn to reset for next pass
        harness.turnManager.passTurn(p1.id);
        // Bot turn (pass back)
        harness.turnManager.passTurn(harness.p2Id);

        // 3. Add a Princess
        const cinderella = harness.createCard(p1, {
            name: 'Cinderella',
            type: CardType.Character,
            cost: 1,
            subtypes: ['Princess']
        });
        p1.addCardToZone(cinderella, ZoneType.Play);
        harness.turnManager.abilitySystem.registerCard(cinderella);

        // 4. Start Turn (Condition Met)
        harness.turnManager.startTurn(p1.id);
        expect(p1.lore).toBe(1);
    });
});
