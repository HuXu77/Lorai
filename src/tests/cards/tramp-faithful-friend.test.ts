import { TestHarness } from "../engine-test-utils";
import { ZoneType, CardType } from "../../engine/models";

describe('Reproduction: Tramp Ward Ability', () => {
    let testHarness: TestHarness;

    beforeEach(() => {
        testHarness = new TestHarness();
        testHarness.initialize();
    });

    it('should grant Ward to Tramp only during your turn', () => {
        const player = testHarness.createPlayer('player1');
        const opponent = testHarness.createPlayer('player2'); // Not turn player initially

        // Mock ability system on turn manager if not present (TestHarness usually handles this)
        const abilitySystem = testHarness.turnManager.abilitySystem;

        // Create Tramp with the static ability
        const tramp: CardInstance = {
            id: 'tramp-id', // ID Required
            name: 'Tramp',
            fullName: 'Tramp - Street-Smart Dog',
            cost: 3,
            inkwell: true,
            strength: 3,
            willpower: 3,
            lore: 1,
            type: CardType.Character,
            parsedEffects: [
                {
                    id: 'ability-static',
                    cardId: 'tramp-id',
                    type: 'static',
                    fullText: 'STREET SMART During your turn, this character has Ward.',
                    effects: [{
                        type: 'keyword',
                        keyword: 'Ward',
                        condition: {
                            type: 'during_your_turn'
                        }
                    } as any],
                    duration: 'continuous'
                }
            ]
        };

        // Add to play
        const trampInPlay = player.addCardToZone(tramp, ZoneType.Play);

        // Register with ability system
        abilitySystem.registerCard(trampInPlay);

        // 1. Check Player's Turn (Should have Ward)
        testHarness.turnManager.game.state.turnPlayerId = player.id; // Set to player's turn
        // Ensure abilitySystem has the method (it might not yet, failing the test)
        if (typeof (abilitySystem as any).getModifiedKeywords !== 'function') {
            throw new Error("AbilitySystem.getModifiedKeywords is not implemented!");
        }

        const keywordsMyTurn = (abilitySystem as any).getModifiedKeywords(trampInPlay, player);
        console.log('Keywords My Turn:', keywordsMyTurn);
        expect(keywordsMyTurn).toContain('Ward');

        // 2. Check Opponent's Turn (Should NOT have Ward)
        testHarness.turnManager.game.state.turnPlayerId = opponent.id;
        const keywordsOppTurn = (abilitySystem as any).getModifiedKeywords(trampInPlay, player);
        expect(keywordsOppTurn).not.toContain('Ward');

    });
});
