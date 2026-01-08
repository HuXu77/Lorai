
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TestHarness } from '../engine-test-utils';


describe('Bot Win State Bug Reproduction', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should end the game immediately when bot reaches 20 lore', async () => {
        const botPlayer = harness.getPlayer(harness.p2Id);
        const humanPlayer = harness.getPlayer(harness.p1Id);

        // 1. Setup Bot with 19 Lore and a ready character
        botPlayer.lore = 19;

        harness.setPlay(botPlayer.id, [{
            id: 88881,
            name: 'Quester',
            type: 'Character',
            strength: 2,
            willpower: 2,
            lore: 2, // Quests for 2, pushing to 21
            ready: true,
            playedTurn: -1
        }]);

        const quester = botPlayer.play[0];

        // 2. Force it to be Bot's turn
        harness.game.state.turnPlayerId = botPlayer.id;

        // 3. Quest with the character to win
        await harness.turnManager.quest(botPlayer, quester.instanceId);

        // 4. Verification
        // Game should be over
        expect(harness.game.state.winnerId).toBe(botPlayer.id);

        // After winning, there should be NO valid actions available for the bot
        const validActionsAfterWin = harness.turnManager.getValidActions(botPlayer.id);
        expect(validActionsAfterWin).toHaveLength(0);
    });
});
