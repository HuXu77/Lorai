import { TestHarness } from '../engine-test-utils';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType, ZoneType } from '../../engine/models';

describe('Mother Knows Best Bug', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should parse correctly', () => {
        const motherKnowsBest = harness.loader.getAllCards().find(c => c.fullName === 'Mother Knows Best' || c.name === 'Mother Knows Best');
        if (!motherKnowsBest) throw new Error('Card not found');
        const parsed = parseToAbilityDefinition(motherKnowsBest);
        console.log('Parsed MKB:', JSON.stringify(parsed, null, 2));
        expect(parsed.length).toBeGreaterThan(0);
        // We will adjust the mock based on this log if needed
    });

    it('should return chosen opponent character to their hand', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);
        const p2 = harness.game.getPlayer(harness.p2Id);

        // Setup: P2 has a character in play
        const targetChar = p2.addCardToZone({
            id: 'p2-char-1',
            fullName: 'Target Character',
            name: 'Target',
            type: CardType.Character,
            cost: 3,
            strength: 2,
            willpower: 2,
            lore: 1
        } as any, ZoneType.Play);

        // Setup: P1 has Mother Knows Best in hand
        const motherKnowsBest = p1.addCardToZone({
            id: 'mkb-1',
            fullName: 'Mother Knows Best',
            name: 'Mother Knows Best',
            type: CardType.Action,
            cost: 3,
            subtypes: ['Song'],
            fullText: "Return chosen character to their player's hand.",
            fullTextSections: ["Return chosen character to their player's hand."],
            abilities: [],
            // parsedEffects: [] // REMOVED to force real parsing
        } as any, ZoneType.Hand);

        // Give P1 ink
        const ink = p1.addCardToZone({
            id: 'ink-1', name: 'Ink', type: CardType.Character, cost: 1
        } as any, ZoneType.Inkwell);
        ink.ready = true;
        p1.addCardToZone({ id: 'ink-2', name: 'Ink', type: CardType.Character, cost: 1 } as any, ZoneType.Inkwell).ready = true;
        p1.addCardToZone({ id: 'ink-3', name: 'Ink', type: CardType.Character, cost: 1 } as any, ZoneType.Inkwell).ready = true;

        harness.turnManager.startGame(harness.p1Id);

        // Spy on choice request to auto-select target
        const requestChoiceSpy = vi.spyOn(harness.turnManager, 'requestChoice');

        // Mock the choice response to select P2's character
        // We need to intercept the *next* call.
        // Since playCard waits for resolution, we can mock implementation once.
        /* 
           NOTE: In TestHarness, we might need a better way to inject choice responses 
           if registerChoiceHandler is used. 
           The TestHarness usually uses a default handler that picks the first option.
           We want to ensure we pick `targetChar`.
        */

        // Let's rely on harness.playCard's targetId parameter if supported, 
        // OR manually handling the choice if standard flow allows.
        // turnManager.playCard takes (player, cardId, singerId, shiftTargetId, targetId)

        // Execute play
        await harness.turnManager.playCard(
            p1,
            motherKnowsBest.instanceId,
            undefined, // singer
            undefined, // shift
            targetChar.instanceId // targetId - TurnManager *should* use this for 'chosen_character'
        );

        // Assertions
        const p2State = harness.game.getPlayer(harness.p2Id);

        // Character should be removed from Play
        const charInPlay = p2State.play.find(c => c.instanceId === targetChar.instanceId);
        expect(charInPlay).toBeUndefined();

        // Character should be in Hand
        const charInHand = p2State.hand.find(c => c.instanceId === targetChar.instanceId);
        expect(charInHand).toBeDefined();
        expect(charInHand?.zone).toBe(ZoneType.Hand);
    });
});
