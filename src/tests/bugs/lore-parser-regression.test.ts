
import { TestHarness } from '../engine-test-utils';
import { ZoneType } from '../../engine/models';

describe('Bot Lore Bug', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should have baseLore equal to lore for a standard character', async () => {
        const p2Id = harness.p2Id; // Bot is usually P2
        const p2 = harness.game.getPlayer(p2Id);

        // Create a character for the bot
        // "Mickey Mouse - Detective" has 1 Lore typically (or 2?)
        // Let's use a card we know the stats of, or check any card.
        // In the screenshot, "Flynn Rider" has +1 Lore badge.
        // Let's use "Mickey Mouse - Detective".

        // We'll manually insert it to verify standard creation behavior used in tests first,
        // but the bug might be in how the actual game initializes decks.
        // Use setPlay to load the real card data using the harness loader
        harness.setPlay(p2Id, ['Flynn Rider - Charming Rogue']);
        const card = p2.play[0];
        console.log('Created Card:', JSON.stringify(card, null, 2));

        // Trigger recalculation
        harness.turnManager.recalculateEffects();

        // Check states after recalculation
        console.log('Card after recalc:', JSON.stringify(card, null, 2));
        console.log('Active Effects:', JSON.stringify(harness.turnManager.game.state.activeEffects, null, 2));

        // Verify initial state
        expect(card.lore).toBeDefined();
        expect(card.baseLore).toBeDefined();
        expect(card.lore).toBeGreaterThan(0);
        expect(card.baseLore).toBe(card.lore);

        // If this passes, the issue might be in how the `startGame` or deck loading works 
        // for the specific "Bot" flow in the app, which might be different from TestHarness.
    });

    it('should correctly parse Wasabi triggered ability and NOT grant static lore buff', async () => {
        const players = Object.values(harness.turnManager.game.state.players);
        const p2Id = players[1].id;

        // Use setPlay to load Wasabi
        // Wasabi - Methodical Engineer has text: "When you play this character... gains 1 lore."
        // Before fix: Parsed as static +1 Lore.
        // After fix: Parsed only as Triggered Ability (or not at all by static parser).
        harness.setPlay(p2Id, ['Wasabi - Methodical Engineer']);
        const card = harness.turnManager.game.getPlayer(p2Id).play[0];
        console.log('Created Wasabi:', JSON.stringify(card, null, 2));

        // Trigger recalculation
        harness.turnManager.recalculateEffects();

        // Log effects for debug
        console.log('Wasabi Active Effects:', JSON.stringify(harness.turnManager.game.state.activeEffects, null, 2));

        // Wasabi is 3/3/2 (Lore 2).
        // If bug present, Lore would be 3.
        expect(card.lore).toBeDefined();
        expect(card.baseLore).toBeDefined();
        expect(card.baseLore).toBe(card.lore);
    });
});
