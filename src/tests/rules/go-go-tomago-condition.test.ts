import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { TestHarness } from '../engine-test-utils';
import { CardType } from '../../engine/models';

describe('Go Go Tomago - Conditional Lore Gain', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should gain 0 lore when played with fewer than 2 other characters', async () => {
        // Setup: Player 1 starts with 1 character in play
        harness.setPlay('Player 1', [
            { name: 'Lady', cost: 1, type: 'Character' as CardType, strength: 1, willpower: 2, lore: 1 }
        ]);

        // Player has Go Go in hand
        harness.setHand('Player 1', [
            {
                name: 'Go Go Tomago', cost: 2, type: 'Character' as CardType, strength: 2, willpower: 2, lore: 1,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, if you have 2 or more other characters in play, gain 1 lore.",
                    fullText: "TEAMWORK When you play this character, if you have 2 or more other characters in play, gain 1 lore.",
                    name: "TEAMWORK"
                }]
            }
        ]);

        // Give player enough ink
        harness.setInk('Player 1', 2);

        const initialLore = harness.getPlayer('Player 1').lore;

        // Play Go Go Tomago (only 1 other character, need 2+)
        await harness.playCard('Player 1', 'Go Go Tomago');

        // Should NOT gain lore because condition not met
        expect(harness.getPlayer('Player 1').lore).toBe(initialLore);
    });

    it('should gain 1 lore when played with 2 or more other characters', async () => {
        // Setup: Player 1 starts with 2 characters in play
        harness.setPlay('Player 1', [
            { name: 'Lady', cost: 1, type: 'Character' as CardType, strength: 1, willpower: 2, lore: 1 },
            { name: 'Daisy Duck', cost: 2, type: 'Character' as CardType, strength: 2, willpower: 3, lore: 2 }
        ]);

        // Player has Go Go in hand
        harness.setHand('Player 1', [
            {
                name: 'Go Go Tomago', cost: 2, type: 'Character' as CardType, strength: 2, willpower: 2, lore: 1,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, if you have 2 or more other characters in play, gain 1 lore.",
                    fullText: "TEAMWORK When you play this character, if you have 2 or more other characters in play, gain 1 lore.",
                    name: "TEAMWORK"
                }]
            }
        ]);

        // Give player enough ink
        harness.setInk('Player 1', 2);

        const initialLore = harness.getPlayer('Player 1').lore;

        // Play Go Go Tomago (2 other characters NOW!)
        await harness.playCard('Player 1', 'Go Go Tomago');

        // SHOULD gain 1 lore because condition IS met
        expect(harness.getPlayer('Player 1').lore).toBe(initialLore + 1);
    });

    it('should gain 1 lore when played with 4 other characters', async () => {
        // Setup: Player 1 starts with 4 characters in play (like in the simulation)
        harness.setPlay('Player 1', [
            { name: 'Lady', cost: 1, type: 'Character' as CardType, strength: 1, willpower: 2, lore: 1 },
            { name: 'Lady', cost: 1, type: 'Character' as CardType, strength: 1, willpower: 2, lore: 1 },
            { name: 'Lady', cost: 1, type: 'Character' as CardType, strength: 1, willpower: 2, lore: 1 },
            { name: 'Webby Vanderquack', cost: 1, type: 'Character' as CardType, strength: 1, willpower: 2, lore: 1 }
        ]);

        // Player has Go Go in hand
        harness.setHand('Player 1', [
            {
                name: 'Go Go Tomago', cost: 2, type: 'Character' as CardType, strength: 2, willpower: 2, lore: 1,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, if you have 2 or more other characters in play, gain 1 lore.",
                    fullText: "TEAMWORK When you play this character, if you have 2 or more other characters in play, gain 1 lore.",
                    name: "TEAMWORK"
                }]
            }
        ]);

        // Give player enough ink
        harness.setInk('Player 1', 3);

        const initialLore = harness.getPlayer('Player 1').lore;

        // Play Go Go Tomago (4 other characters - way more than 2!)
        await harness.playCard('Player 1', 'Go Go Tomago');

        // SHOULD gain 1 lore because condition IS met (4 >= 2)
        expect(harness.getPlayer('Player 1').lore).toBe(initialLore + 1);
    });

    it('should NOT trigger when opponent plays a card', async () => {
        // Setup: Player 1 has Go Go Tomago in play with 2 other characters
        harness.setPlay('Player 1', [
            { name: 'Lady', cost: 1, type: 'Character' as CardType, strength: 1, willpower: 2, lore: 1 },
            { name: 'Mowgli', cost: 2, type: 'Character' as CardType, strength: 1, willpower: 2, lore: 2 },
            {
                name: 'Go Go Tomago', cost: 2, type: 'Character' as CardType, strength: 2, willpower: 2, lore: 1,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, if you have 2 or more other characters in play, gain 1 lore.",
                    fullText: "TEAMWORK When you play this character, if you have 2 or more other characters in play, gain 1 lore.",
                    name: "TEAMWORK"
                }]
            }
        ]);

        // Player 2 has a card to play
        harness.setHand('Player 2', [
            { name: 'Merlin', cost: 3, type: 'Character' as CardType, strength: 0, willpower: 3, lore: 2 }
        ]);

        // Give Player 2 enough ink
        harness.setInk('Player 2', 3);

        const player1InitialLore = harness.getPlayer('Player 1').lore;

        // Player 2 plays Merlin - this should NOT trigger Player 1's Go Go Tomago ability
        await harness.playCard('Player 2', 'Merlin');

        // Player 1's lore should NOT change (Go Go Tomago only triggers "when YOU play this character")
        expect(harness.getPlayer('Player 1').lore).toBe(player1InitialLore);
    });
});
