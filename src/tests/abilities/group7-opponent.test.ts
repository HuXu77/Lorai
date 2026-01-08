import { TestHarness } from '../engine-test-utils';
import { CardType, InkColor, ZoneType } from '../../engine/models';

describe('Group 7: Opponent Choices', () => {
    let testHarness: TestHarness;

    beforeEach(async () => {
        testHarness = new TestHarness();
        await testHarness.initialize();
    });

    it('Flynn Rider - Charming Rogue (Opponent Discard)', async () => {
        const player1 = testHarness.game.getPlayer(testHarness.p1Id);
        const player2 = testHarness.game.getPlayer(testHarness.p2Id);

        // Setup Player 1 with Flynn Rider
        const flynn = testHarness.createCard(player1, {
            name: 'Flynn Rider',
            fullName: 'Flynn Rider - Charming Rogue',
            cost: 2,
            inkwell: true,
            color: InkColor.Emerald,
            type: CardType.Character,
            strength: 1,
            willpower: 2,
            lore: 1,
            abilities: [{
                type: 'ability',
                fullText: "When you play this character, each opponent chooses and discards a card."
            }]
        });
        player1.hand.push(flynn);
        player1.inkwell.push(testHarness.createCard(player1, { name: 'Ink 1', cost: 1, inkwell: true, color: InkColor.Emerald, type: CardType.Action }));
        player1.inkwell.push(testHarness.createCard(player1, { name: 'Ink 2', cost: 1, inkwell: true, color: InkColor.Emerald, type: CardType.Action }));

        // Setup Player 2 with cards to discard
        const discardFodder1 = testHarness.createCard(player2, { name: 'Fodder 1', cost: 1, inkwell: true, color: InkColor.Ruby, type: CardType.Action });
        const discardFodder2 = testHarness.createCard(player2, { name: 'Fodder 2', cost: 5, inkwell: true, color: InkColor.Ruby, type: CardType.Action });
        player2.hand.push(discardFodder1);
        player2.hand.push(discardFodder2);

        // Player 1 plays Flynn Rider
        await testHarness.playCard(player1, flynn);

        // Verify Player 2 discarded one card (bot chooses randomly)
        expect(player2.hand.length).toBe(1);
        expect(player2.discard.length).toBe(1);
        // Don't assert which specific card - bot logic chooses lowest cost but test may vary
    });

    it('Lady Tremaine - Imperious Queen (Opponent Banish)', async () => {
        const player1 = testHarness.game.getPlayer(testHarness.p1Id);
        const player2 = testHarness.game.getPlayer(testHarness.p2Id);

        // Setup Player 1 with Lady Tremaine
        const tremaine = testHarness.createCard(player1, {
            name: 'Lady Tremaine',
            fullName: 'Lady Tremaine - Imperious Queen',
            cost: 6,
            inkwell: true,
            color: InkColor.Ruby,
            type: CardType.Character,
            strength: 3,
            willpower: 4,
            lore: 2,
            abilities: [{
                type: 'ability',
                fullText: "When you play this character, each opponent chooses and banishes a character."
            }]
        });
        player1.hand.push(tremaine);
        // Add ink
        for (let i = 0; i < 6; i++) {
            player1.inkwell.push(testHarness.createCard(player1, { name: `Ink ${i}`, cost: 1, inkwell: true, color: InkColor.Ruby, type: CardType.Action }));
        }

        // Setup Player 2 with characters to banish
        const weakChar = testHarness.createCard(player2, { name: 'Weak Char', cost: 1, inkwell: true, color: InkColor.Amethyst, type: CardType.Character, strength: 1, willpower: 1, lore: 1 });
        const strongChar = testHarness.createCard(player2, { name: 'Strong Char', cost: 5, inkwell: true, color: InkColor.Amethyst, type: CardType.Character, strength: 5, willpower: 5, lore: 2 });
        player2.play.push(weakChar);
        player2.play.push(strongChar);

        // Player 1 plays Lady Tremaine
        await testHarness.playCard(player1, tremaine);

        // Verify ability triggers and affects opponent
        // Player 2 had 2 characters. Bot logic banishes lowest cost (Weak Char).
        expect(player2.play.length).toBe(1);
        expect(player2.discard.length).toBe(1);

        // Verify Weak Char was the one banished (cost 1 vs cost 5)
        const remainingChar = player2.play[0];
        expect(remainingChar.name).toBe('Strong Char');

        const banishedChar = player2.discard[0];
        expect(banishedChar.name).toBe('Weak Char');
    });
});
