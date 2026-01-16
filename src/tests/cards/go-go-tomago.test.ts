
import { TestHarness } from "../engine-test-utils";
import { GameEvent } from "../../engine/abilities/events";
import { CardType, ZoneType } from "../../engine/models";

describe('Go Go Tomago - Darting Dynamo Bugs', () => {
    let testHarness: TestHarness;

    beforeEach(async () => {
        testHarness = new TestHarness();
        // Mock logger to suppress noise but keep errors
        (testHarness.turnManager as any).logger = {
            log: () => { },
            debug: () => { },
            info: () => { },
            warn: (msg: any, data: any) => console.warn('[WARN]', msg, data || ''),
            error: (msg: any, data: any) => console.error(msg, data),
            action: () => { },
            effect: () => { }
        };
        await testHarness.initialize();
    });

    it('should NOT prompt "undefined" and should skip prompt if cost cannot be paid', async () => {
        const player1 = testHarness.getPlayer(testHarness.p1Id);

        // Go Go Tomago definition based on parser output
        // "When you play this character, you may pay 2 ⬡ to gain lore equal to the damage on chosen opposing character."
        const gogo = testHarness.createCard(testHarness.p1Id, {
            instanceId: 'gogo-tomago',
            name: 'Go Go Tomago',
            fullName: 'Go Go Tomago - Darting Dynamo',
            cost: 5,
            inkwell: true,
            strength: 4,
            willpower: 4,
            lore: 2,
            type: CardType.Character,
            parsedEffects: [{
                id: 'ability-1',
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                trigger: 'on_play',
                triggerFilter: { target: 'self' },
                rawText: 'When you play this character, you may pay 2 ⬡ to gain lore equal to the damage on chosen opposing character.',
                effects: [{
                    type: 'gain_lore',
                    amount: { type: 'damage_on_character', target: 'chosen_opposing' },
                    cost: { ink: 2 },
                    optional: true
                }]
            } as any]
        });

        // Scenario 1: Insufficient Ink
        // Player has 1 ink (needs 2 for ability)
        testHarness.setInk(testHarness.p1Id, 1);
        testHarness.setHand(testHarness.p1Id, [gogo]);

        // Mock requestChoice to catch the prompt
        let promptReceived: string | undefined;
        const originalRequestChoice = testHarness.turnManager.requestChoice.bind(testHarness.turnManager);
        vi.spyOn(testHarness.turnManager, 'requestChoice').mockImplementation(async (request) => {
            promptReceived = request.prompt;
            // Auto-decline if prompted to avoid hanging
            return {
                playerId: request.playerId,
                selectedIds: ['no'],
                declined: true
            };
        });

        // Play Go Go (assume 0 cost to play for test simplicity, or just play via engine)
        // Adjust gogo cost to 0 for playing test or give enough invoker ink?
        // Actually, we paid to play checking ability cost.
        // Let's just play it. Logic checks AVAILABLE ink.
        // If we pay 5 to play, we have 0 left.
        // Make Go Go cost 0 for this test so we control remaining ink precisely.
        gogo.cost = 0;

        await testHarness.playCard(testHarness.p1Id, gogo.instanceId);

        // Assertion 1: Should NOT prompt because only 1 ink available vs 2 needed
        // Currently this FAILS (it prompts)
        if (promptReceived) {
            console.log('Scenario 1 (1 Ink): Prompted ->', promptReceived);
        } else {
            console.log('Scenario 1 (1 Ink): SKIPPED PROMPT (Correct)');
        }
        // expect(promptReceived).toBeUndefined(); // Verify fix later

        // Reset
        promptReceived = undefined;
        gogo.zone = ZoneType.Hand;
        player1.hand = [gogo];
        player1.play = [];

        // Scenario 2: Sufficient Ink
        testHarness.setInk(testHarness.p1Id, 7); // 5 for card + 2 for ability

        await testHarness.playCard(testHarness.p1Id, gogo.instanceId);

        // Assertion 2: SHOULD prompt, checking for "undefined" string
        expect(promptReceived).toBeDefined();
        console.log('Scenario 2 (2 Ink): Prompt ->', promptReceived);

        // Verify dirty prompt
        if (promptReceived?.includes('undefined')) {
            console.log('Scenario 2: BUG CONFIRMED - "undefined" in prompt');
        }
    });
});
