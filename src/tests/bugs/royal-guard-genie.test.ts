import { TestHarness } from '../engine-test-utils';
import { expect, describe, it, beforeEach } from 'vitest';
import { ActionType } from '../../engine/actions';

describe("Royal Guard & Genie Bugs", () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it("Royal Guard should gain Challenger +1 when player draws a card", async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Setup Royal Guard in play
        harness.setPlay(harness.p1Id, ["Royal Guard - Octopus Soldier"]);
        harness.setDeck(harness.p1Id, ["Mickey Mouse - Detective"]); // Add card to deck so draw works
        const guardInstance = p1.play[0];

        expect(guardInstance.name).toContain("Royal Guard");

        harness.turnManager.startTurn(harness.p1Id);

        const initialChallenger = (guardInstance as any).challenger || 0;
        expect(initialChallenger).toBe(0);

        // Draw a card
        await harness.turnManager.drawCards(harness.p1Id, 1);

        const newChallenger = (guardInstance as any).challenger || 0;

        expect(newChallenger).toBeGreaterThan(initialChallenger);
    });

    it("Genie - Supportive Friend should prompt correctly and shuffle into deck", async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Setup Genie in play and ready
        harness.setPlay(harness.p1Id, ["Genie - Supportive Friend"]);
        const genie = p1.play[0];
        genie.ready = true;
        genie.turnPlayed = -1; // Ensure dry

        // Setup deck
        harness.setDeck(harness.p1Id, ["Mickey Mouse - Detective", "Mickey Mouse - Detective", "Mickey Mouse - Detective", "Mickey Mouse - Detective"]);
        const initialDeckSize = p1.deck.length; // 4
        const initialHandSize = p1.hand.length; // 0

        // Start turn
        harness.turnManager.startTurn(harness.p1Id);

        // Quest
        await harness.turnManager.quest(p1, genie.instanceId);

        const genieInPlay = p1.play.find(c => c.instanceId === genie.instanceId);
        const genieInDeck = p1.deck.find(c => c.fullName === "Genie - Supportive Friend");
        const genieInHand = p1.hand.find(c => c.fullName === "Genie - Supportive Friend");

        // Genie could be in deck OR drawn into hand (since we shuffle before drawing)
        expect(genieInDeck || genieInHand).toBeDefined();
        expect(genieInPlay).toBeUndefined();

        expect(p1.deck.length + p1.hand.length).toBe(initialDeckSize + 1 + initialHandSize); // Conservation of cards (4 + 1 = 5)
    });
});

