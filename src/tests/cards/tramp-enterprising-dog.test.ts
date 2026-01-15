import { TestHarness } from './engine-test-utils';
import { CardInstance, ZoneType, CardType } from '../engine/models';
import { parseToAbilityDefinition } from '../engine/ability-parser';

describe('Reproduction: Tramp - Street-Smart Dog Draw Ability', () => {
    let testHarness: TestHarness;

    beforeEach(async () => {
        testHarness = new TestHarness();
        await testHarness.initialize();
    });

    it('should prompt to draw directly (no optional prompt) and then discard', async () => {
        const player = testHarness.getPlayer(testHarness.p1Id);

        // 1. Setup: 2 other characters in play
        const char1 = testHarness.createCard(player, {
            name: 'Char 1',
            type: CardType.Character,
            cost: 1,
            inkwell: true,
            strength: 1,
            willpower: 1,
            lore: 1
        });
        const char2 = testHarness.createCard(player, {
            name: 'Char 2',
            type: CardType.Character,
            cost: 1,
            inkwell: true,
            strength: 1,
            willpower: 1,
            lore: 1
        });

        player.play.push(char1, char2);

        // 2. Tramp in hand
        const tramp = testHarness.createCard(player, {
            name: 'Tramp',
            fullName: 'Tramp - Street-Smart Dog',
            type: CardType.Character,
            cost: 7,
            inkwell: true,
            strength: 2,
            willpower: 6,
            lore: 2,
            abilities: [
                {
                    type: 'triggered',
                    fullText: "When you play this character, you may draw a card for each other character you have in play, then choose and discard that many cards."
                }
            ]
        });

        // Force parse to ensure abilities are ready
        tramp.parsedEffects = parseToAbilityDefinition(tramp) as any;
        player.hand.push(tramp);

        // Ensure deck has cards to draw
        testHarness.setDeck(player.id, ['Captain Hook', 'Captain Hook', 'Captain Hook', 'Captain Hook']);

        testHarness.setInk(player.id, 10);

        // 3. Setup Async Choice Interception
        // 3. Setup Async Choice Interception
        let pendingResolver: ((ids: string[]) => void) | null = null;
        let capturedChoice: any = null;

        testHarness.turnManager.emitChoiceRequest = async (choice: any) => {
            console.log('Intercepted Choice:', choice.prompt);
            capturedChoice = choice;
            return new Promise<any>((resolve) => {
                pendingResolver = (selectedIds: string[]) => {
                    resolve({
                        requestId: choice.id,
                        playerId: choice.playerId,
                        selectedIds: selectedIds,
                        timestamp: Date.now()
                    });
                };
            });
        };

        const waitForChoice = async () => {
            let tries = 0;
            while (!capturedChoice && tries < 50) {
                await new Promise(r => setTimeout(r, 10));
                tries++;
            }
            if (!capturedChoice) throw new Error("Timed out waiting for choice");
        };

        // 4. Play Tramp (without awaiting immediately)
        const playPromise = testHarness.playCard(player, tramp);

        // 5. Verify Prompt 1: "Do you want to use...?" (Yes/No)
        console.log('Waiting for Optional Prompt...');
        await waitForChoice();
        expect(capturedChoice.prompt).toContain('When you play this character, you may draw');
        expect(capturedChoice.options).toHaveLength(2); // Yes/No

        // Resolve Optional Choice: "Yes"
        capturedChoice = null;
        if (pendingResolver) pendingResolver(['yes']);

        // 6. Verify Prompt 2: "Draw how many?"
        console.log('Waiting for Draw Choice...');
        await waitForChoice();

        // Verify Prompt Content
        // Prompt should be "Draw how many cards?..."
        expect(capturedChoice.prompt).toContain('Draw how many cards');

        // Options: 0 to 2 (since we have 2 other chars: Char 1, Char 2)
        const drawOptions = capturedChoice.options;
        expect(drawOptions.length).toBe(3);
        expect(drawOptions[0].id).toBe('0');
        expect(drawOptions[2].id).toBe('2');

        // Resolve Draw Choice: "2"
        capturedChoice = null;
        if (pendingResolver) pendingResolver(['2']);

        // 7. Verify Prompt 3: "Discard"
        console.log('Waiting for Discard Choice...');
        await waitForChoice(); // Wait for next choice request

        expect(capturedChoice.prompt).toContain('discard');
        // prompt should be "Choose 2 card(s) to discard"
        expect(capturedChoice.min).toBe(2);

        // Resolve Discard Choice: Choose dummies
        const options = capturedChoice.options;
        // The deck was set with 'Captain Hook's, and we drew 2. 
        // We had Tramp in hand (played it).
        // Setup: player.hand.push(tramp). Play -> Hand = []. Draw 2 -> Hand = [C1, C2]. Discard 2 -> Hand = [].

        // Let's grab IDs from options
        const discardIds = [options[0].id, options[1].id];

        console.log('Resolving Discard Choice with', discardIds);
        capturedChoice = null;
        if (pendingResolver) pendingResolver(discardIds);

        // 8. Wait for Play to Finish
        console.log('Waiting for Play to finish...');
        await playPromise;
        console.log('Play finished.');

        // 9. Assertions
        // Hand size check: Started with Tramp (played). Drew 2. Discarded 2. Hand = 0.
        expect(player.hand.length).toBe(0);
        expect(player.discard.length).toBe(2);
    });
});
