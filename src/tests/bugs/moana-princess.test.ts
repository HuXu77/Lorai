
import { TestHarness } from '../engine-test-utils';
import { CardInstance, ZoneType, CardType } from '../../engine/models';

describe('Moana - Of Motunui Ability', () => {
    it('readies other Princess characters and prevents them from questing', async () => {
        const harness = new TestHarness();
        await harness.initialize();

        // Override emitChoiceRequest to MANUAL mode (don't auto-resolve)
        let resolveChoice: (response: any) => void;
        harness.turnManager.emitChoiceRequest = async (choice: any) => {
            (harness.game.state as any).pendingChoice = choice;
            return new Promise((resolve) => {
                resolveChoice = resolve;
            });
        };

        const p1 = harness.getPlayer(harness.p1Id);

        // 1. Setup Board
        // Moana - Of Motunui
        const moanaDef = harness.createCard(p1, {
            name: 'Moana - Of Motunui',
            type: CardType.Character,
            cost: 5,
            lore: 2,
            inkwell: true,
            abilities: [{
                type: 'triggered',
                fullText: 'WE CAN FIX IT Whenever this character quests, you may ready your other exerted Princess characters. If you do, they can\'t quest for the rest of this turn.',
                // Note: The parser logic will be tested here
            }]
        });

        // Cinderella - Gentle and Kind (Princess)
        const cinderellaDef = harness.createCard(p1, {
            name: 'Cinderella - Gentle and Kind',
            type: CardType.Character,
            cost: 4,
            lore: 2,
            inkwell: true,
            subtypes: ['Storyborn', 'Hero', 'Princess']
        });

        // Beast (Not a Princess)
        const beastDef = harness.createCard(p1, {
            name: 'Beast - Hardheaded',
            type: CardType.Character,
            cost: 3,
            lore: 1,
            inkwell: true,
            subtypes: ['Storyborn', 'Hero', 'Prince']
        });

        const moana = p1.addCardToZone(moanaDef, ZoneType.Play);
        harness.turnManager.abilitySystem.registerCard(moana);

        const cinderella = p1.addCardToZone(cinderellaDef, ZoneType.Play);
        harness.turnManager.abilitySystem.registerCard(cinderella);

        const beast = p1.addCardToZone(beastDef, ZoneType.Play);
        harness.turnManager.abilitySystem.registerCard(beast);

        // Exert Cinderella and Beast
        cinderella.ready = false;
        beast.ready = false;

        moana.ready = true;

        // 2. Quest with Moana
        // This should trigger "WE CAN FIX IT"
        // Note: We don't await here because it will hang waiting for choice!

        console.log('Moana Parsed Effects:', JSON.stringify(moana.parsedEffects, null, 2));

        const questPromise = harness.turnManager.quest(p1, moana.instanceId);

        // 3. Expect Choice Prompt (to ready Princesses)
        // Wait for choice to appear in loop
        let retries = 0;
        while (!(harness.game.state as any).pendingChoice && retries < 10) {
            await new Promise(r => setTimeout(r, 10));
            retries++;
        }

        const choice = (harness.game.state as any).pendingChoice!;
        expect(choice).toBeDefined();
        expect((harness.game.state as any).pendingChoice).not.toBeNull();

        // Moana's ability is "you *may* ready your other...". This is an optional effect targeting ALL matching cards.
        // So it prompts "Do you want to ready...?" (Yes/No).
        // It does NOT ask to select cards.

        // expect(choice.type).toBe('optional_prompt'); // Can verify type if known, usually 'optional_prompt' or 'confirm'

        // 4. Resolve Choice: Say "Yes"
        resolveChoice!({
            requestId: choice.id,
            playerId: p1.id,
            selectedIds: ['yes'], // Accept the optional effect
            timestamp: Date.now()
        });
        (harness.game.state as any).pendingChoice = null; // Clear pending

        // Now await the original action completion
        await questPromise;

        // 5. Verify State
        expect(cinderella.ready).toBe(true);
        expect(beast.ready).toBe(false);

        // 6. Verify Restriction: Cinderella Can't Quest
        // Attempt to quest with Cinderella (she is ready now)
        // This should return false because of the cant_quest restriction
        const questResult = await harness.turnManager.quest(p1, cinderella.instanceId);
        expect(questResult).toBe(false);
    });
});
