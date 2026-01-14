import { TestHarness } from '../engine-test-utils';
import { CardType, ZoneType } from '../../engine/models';

describe('Demona - Scourge of the Wyvern Clan Engine Bugs', () => {
    let harness: TestHarness;
    let demonaCardData: any;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();

        demonaCardData = {
            name: "Demona - Scourge of the Wyvern Clan",
            type: CardType.Character,
            cost: 5,
            inkwell: true,
            strength: 5,
            willpower: 5,
            lore: 2,
            abilities: [
                {
                    fullText: "AD SAXUM COMMUTATE When you play this character, exert all opposing characters. Then, each player with fewer than 3 cards in their hand draws until they have 3."
                },
                {
                    fullText: "STONE BY DAY If you have 3 or more cards in your hand, this character can't ready."
                }
            ]
        };
    });

    it('should draw until 3 cards when played with fewer than 3 cards', async () => {
        const player = harness.game.getPlayer(harness.p1Id);

        // Setup Ink
        harness.setInk(player.id, 6);

        // Setup Deck with real cards
        harness.setDeck(player.id, ['Minnie Mouse - Always Classy', 'Goofy - Musketeer', 'Donald Duck - Musketeer', 'Mickey Mouse - Musketeer']);

        // Setup Hand: Only Demona
        const demonaInstance = harness.createCard(player, demonaCardData);
        player.hand = [demonaInstance];
        demonaInstance.zone = ZoneType.Hand;

        expect(player.hand.length).toBe(1);

        // Play Demona
        await harness.playCard(player, demonaInstance);

        // Expectation: Hand became 0 (played Demona), then drew 3 cards -> 3 cards.
        expect(player.hand.length).toBe(3);
    });

    it('should NOT ready at start of turn if hand has 3+ cards', async () => {
        const player = harness.game.getPlayer(harness.p1Id);

        // Setup Demona in play, exerted
        const demonaInstance = harness.createCard(player, demonaCardData);
        demonaInstance.zone = ZoneType.Play;
        demonaInstance.ready = false; // Exerted
        player.play.push(demonaInstance);

        // Register for static effects
        harness.game.state.turnPlayerId = player.id;
        if ((harness.turnManager as any).abilitySystem) {
            (harness.turnManager as any).abilitySystem.registerCard(demonaInstance);
        }

        // Setup Hand: 3 cards
        harness.setHand(player.id, ['Minnie Mouse - Always Classy', 'Goofy - Musketeer', 'Donald Duck - Musketeer']);
        expect(player.hand.length).toBe(3);

        // Simulate "Ready Phase"
        // Pass turn to Opponent -> P2 Turn
        await harness.turnManager.passTurn(player.id);

        // Pass turn back to Player -> P1 Turn (Ready Phase runs here)
        await harness.turnManager.passTurn(harness.p2Id);

        // Check if Demona readied
        const demonaInPlay = player.play.find(c => c.instanceId === demonaInstance.instanceId);
        expect(demonaInPlay?.ready).toBe(false);
    });

    it('should READY at start of turn if hand has < 3 cards', async () => {
        const player = harness.game.getPlayer(harness.p1Id);

        // Setup Demona in play, exerted
        const demonaInstance = harness.createCard(player, demonaCardData);
        demonaInstance.zone = ZoneType.Play;
        demonaInstance.ready = false;
        player.play.push(demonaInstance);

        if ((harness.turnManager as any).abilitySystem) {
            (harness.turnManager as any).abilitySystem.registerCard(demonaInstance);
        }

        // Setup Hand: 2 cards
        harness.setHand(player.id, ['Minnie Mouse - Always Classy', 'Goofy - Musketeer']);
        expect(player.hand.length).toBe(2);

        // Pass turn twice
        await harness.turnManager.passTurn(player.id);
        await harness.turnManager.passTurn(harness.p2Id);

        // Check if Demona readied
        const demonaInPlay = player.play.find(c => c.instanceId === demonaInstance.instanceId);
        expect(demonaInPlay?.ready).toBe(true);
    });
});
