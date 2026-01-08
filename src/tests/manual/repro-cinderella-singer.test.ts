import { TestHarness } from '../engine-test-utils';
import { CardType } from '../../engine/models';

describe('Cinderella - Ballroom Sensation Singer Bug', () => {
    let harness: TestHarness;

    beforeEach(() => {
        harness = new TestHarness();
    });

    it('should allow Cinderella (Singer 3) to sing Let the Storm Rage On (Cost 3)', async () => {
        // Manual Init
        await harness.loader.loadCards();
        harness.game.addPlayer(harness.p1Id, 'Player 1');
        harness.game.addPlayer(harness.p2Id, 'Player 2');

        const fillers = Array(30).fill('Tinker Bell - Tiny Tactician');
        harness.setDeck(harness.p1Id, fillers);
        harness.setDeck(harness.p2Id, fillers);

        harness.turnManager.startGame(harness.p1Id);
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Setup: P1 plays Cinderella from hand
        harness.setHand(p1.id, [
            {
                id: 9001,
                name: 'Cinderella - Ballroom Sensation',
                type: CardType.Character,
                cost: 1, // Cheap
                inkwell: true,
                strength: 1,
                willpower: 2,
                fullText: "Singer 3 (This character counts as cost 3 to sing\nsongs.)"
            },
            {
                id: 9002,
                name: 'Let the Storm Rage On',
                type: CardType.Action,
                cost: 3,
                inkwell: true,
                subtypes: ['Song'],
                fullText: "Deal 2 damage to chosen character. Draw a card."
            }
        ]);
        harness.setInk(p1.id, 10);

        // Play Cinderella
        await harness.playCard(p1, p1.hand[0]);
        const cinderella = p1.play[0];

        // Verify CANNOT sing immediately (Drying)
        const song = p1.hand[0]; // Remaining card
        const actionsTurn1 = harness.turnManager.getValidActions(p1.id);
        const singActionTurn1 = actionsTurn1.find(a =>
            a.type === 'SingSong' &&
            a.cardId === song.instanceId
        );
        expect(singActionTurn1).toBeUndefined();

        // Pass Turn (P1 -> P2)
        harness.turnManager.passTurn(harness.p1Id);

        // Pass Turn (P2 -> P1)
        harness.turnManager.passTurn(harness.p2Id);

        // Now P1 Turn 3 (Turn 2 was P2)
        // Cinderella should be ready and dry (playedThisTurn reset).
        const actionsTurn3 = harness.turnManager.getValidActions(p1.id);
        const singActionTurn3 = actionsTurn3.find(a =>
            a.type === 'SingSong' &&
            a.cardId === song.instanceId &&
            a.singerId === cinderella.instanceId
        );

        expect(singActionTurn3).toBeDefined();

        // Perform Action
        // Let's give P2 a character to target (need to re-add because we reset deck/play maybe? No, state persists)
        // But P2 didn't play anything. Let's add target dummy to P2 play.
        harness.setPlay(harness.p2Id, [{
            id: 9999,
            name: 'Target Dummy',
            type: CardType.Character,
            cost: 1,
            inkwell: false,
            strength: 1,
            willpower: 1,
            fullText: ""
        }]);

        harness.mockChoice(p1.id, [harness.game.getPlayer(harness.p2Id).play[0].instanceId]);

        await harness.turnManager.resolveAction({
            ...singActionTurn3!,
            targetId: harness.game.getPlayer(harness.p2Id).play[0].instanceId
        });

        expect(song.zone).toBe('Discard'); // Should be in discard
    });
});
