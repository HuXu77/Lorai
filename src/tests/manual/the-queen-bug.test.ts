
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TestHarness } from '../engine-test-utils';
import { CardInstance } from '../../engine/models';

describe('The Queen - Commanding Presence Bug Reproduction', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should trigger "Who Is The Fairest?" ability on quest', async () => {
        const player = harness.getPlayer(harness.p1Id);
        const opponent = harness.getPlayer(harness.p2Id);

        // 1. Setup Board
        // The Queen - Commanding Presence
        // "Whenever this character quests, chosen opposing character gets -4 Strength this turn and chosen character gets +4 Strength this turn."
        harness.setPlay(player.id, [
            {
                id: 99991, // Dummy ID
                name: 'The Queen',
                fullName: 'The Queen - Commanding Presence',
                cost: 5,
                type: 'Character',
                strength: 4,
                willpower: 3,
                lore: 2,
                subtypes: ['Floodborn', 'Villain', 'Queen', 'Sorcerer'],
                abilities: [
                    {
                        type: "triggered",
                        name: "WHO IS THE FAIREST?",
                        fullText: "WHO IS THE FAIREST? Whenever this character quests, chosen opposing character gets -4 ¤ this turn and chosen character gets +4 ¤ this turn.",
                        effect: "Whenever this character quests, chosen opposing character gets -4 ¤ this turn and chosen character gets +4 ¤ this turn."
                    }
                ],
                ready: true,
                playedTurn: -1
            },
            {
                id: 99992,
                name: 'Ally',
                type: 'Character',
                strength: 2,
                willpower: 2,
                ownerId: player.id
            }
        ]);
        const theQueen = player.play[0];

        // Dummy opponent character for target
        harness.setPlay(opponent.id, [{
            id: 99993,
            name: 'Villain',
            strength: 5,
            willpower: 5,
            type: 'Character'
        }]);

        // 2. Mock Request Choice to capture prompts
        const mockRequestChoice = jest.fn().mockImplementation(async (request: any) => {
            // We expect 2 choices or a combined sequence.
            // If this is triggered, we should verify the prompts/types.
            return {
                requestId: request.id,
                playerId: request.playerId,
                selectedIds: [request.options[0].id], // Just pick first valid
                declined: false
            };
        });
        (harness.turnManager as any).requestChoice = mockRequestChoice;

        // 3. Quest with The Queen
        // Ensure she is ready and can quest
        theQueen.ready = true;
        theQueen.playedTurn = -1;  // Played previously

        await harness.turnManager.quest(player, theQueen.instanceId);

        // 4. Verification
        // Expect triggered ability to fire.
        // It should result in choices for targets.
        expect(mockRequestChoice).toHaveBeenCalled();

        // Verify what was called
        const calls = mockRequestChoice.mock.calls;
        let foundDebuff = false;
        let foundBuff = false;

        calls.forEach((call: any) => {
            const req = call[0];
            // Debuff prompts usually look like "Choose opponent character..." or imply target selection
            // Buff prompts look like "Choose character..."
            // Or it might be a TARGET_OPPOSING_CHARACTER choice.

            console.log('Choice Request:', req.type, req.prompt);

            if (req.prompt && (req.prompt.includes('opposing character') || req.type === 'target_opposing_character')) {
                foundDebuff = true;
            }
            if (req.prompt && (req.prompt.includes('chosen character') || req.prompt.includes('gets +4') || req.type === 'target_character' || req.type === 'target_card')) {
                // If it's the second part 'chosen character' (implied any character)
                foundBuff = true;
            }
        });

        expect(foundDebuff).toBe(true);
        expect(foundBuff).toBe(true);
    });
});
