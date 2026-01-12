
import { TestHarness } from '../engine-test-utils';
import { GameEvent } from '../../engine/events';
import { ZoneType } from '../../engine/models';

describe('Strength of a Raging Fire Animation Bug', () => {
    let harness: TestHarness;

    beforeEach(() => {
        harness = new TestHarness();
    });

    it('should parse and execute correctly without extraneous events', async () => {
        await harness.initialize();
        const player1 = harness.game.getPlayer(harness.p1Id);
        const player2 = harness.game.getPlayer(harness.p2Id);

        // 1. Give Player 2 a character to target (Target Dummy)
        const targetChar: any = {
            id: 'dummy-char',
            instanceId: 'dummy-char-1',
            name: 'Target Dummy',
            type: 'Character',
            strength: 1,
            willpower: 5,
            cost: 1,
            inkwell: true,
            zone: ZoneType.Play,
            ownerId: player2.id,
            damage: 0
        };
        player2.play.push(targetChar);

        // 2. Give Player 1 "Strength of a Raging Fire"
        const strengthCard: any = {
            id: 'strength-fire',
            instanceId: 'strength-fire-1',
            name: 'Strength of a Raging Fire',
            fullName: 'Strength of a Raging Fire',
            type: 'Action', // Songs are Actions
            cost: 3,
            inkwell: true,
            fullText: "Deal damage to chosen character equal to the number of characters you have in play.",
            zone: ZoneType.Hand,
            ownerId: player1.id,
            subtypes: ['Song']
        };
        player1.hand.push(strengthCard);
        harness.setInk(player1.id, 5);

        // 3. Give Player 1 a character so damage is > 0 (e.g. 2 characters)
        const p1Char1: any = {
            id: 'p1-char-1',
            instanceId: 'p1-char-1',
            name: 'Soldier',
            type: 'Character',
            zone: ZoneType.Play,
            ownerId: player1.id
        };
        const p1Char2: any = {
            id: 'p1-char-2',
            instanceId: 'p1-char-2',
            name: 'Soldier',
            type: 'Character',
            zone: ZoneType.Play,
            ownerId: player1.id
        };
        player1.play.push(p1Char1, p1Char2);

        // 4. Play the card
        console.log('--- Playing Strength of a Raging Fire ---');
        // We need to spy on events
        const events: any[] = [];
        const originalEmit = harness.turnManager.abilitySystem.emitEvent;
        harness.turnManager.abilitySystem.emitEvent = async (event, data) => {
            events.push({ event, data });
            return originalEmit.call(harness.turnManager.abilitySystem, event, data);
        };

        const success = await harness.playCard(player1, strengthCard, targetChar);
        expect(success).toBe(true);

        // 5. Analyze events
        console.log('--- Events Emitted ---');
        events.forEach(e => {
            console.log(`Event: ${e.event}`, e.data ? JSON.stringify(e.data, null, 2) : '');
        });

        // Check damage amount (should be 2)
        expect(targetChar.damage).toBe(2);

        // Check for suspicious strength change events
        // If the UI shows "+1", maybe a strength change event was emitted?
        const strengthEvents = events.filter(e => e.event === 'strength_change' || e.event === 'STRENGTH_CHANGE');
        if (strengthEvents.length > 0) {
            console.warn('FOUND STRENGTH CHANGE EVENTS:', strengthEvents);
        }

        // Also look for log messages that might indicate misinterpretation
    });
});
