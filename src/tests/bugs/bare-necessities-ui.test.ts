

import { GameController } from '../../controllers/GameController';
import { ZoneType } from '../../engine/models';

const MockCard = {
    id: 'mock-card-id',
    name: 'Mock Card',
    fullName: 'Mock Card',
    cost: 1,
    ink: true,
    type: 'Character',
    color: 'Amber',
    strength: 1,
    willpower: 1,
    lore: 1,
    ready: true,
    abilities: [],
    effects: [],
    parsedEffects: []
};

describe('The Bare Necessities UI Data Integrity', () => {
    let controller: GameController;

    const bareNecessities = {
        ...MockCard,
        name: 'The Bare Necessities',
        fullName: 'The Bare Necessities',
        type: 'Action',
        abilities: [
            {
                type: 'triggered',
                fullText: "Chosen opponent reveals their hand and discards a non-character card of your choice.",
                effect: "chosen opponent reveals their hand and discards a non-character card of your choice"
            }
        ]
    };

    const targetCard = {
        ...MockCard,
        name: 'Target Item',
        fullName: 'Target Item',
        type: 'Item',
        cost: 2
    };

    beforeEach(() => {
        controller = new GameController({
            onStateChange: () => { },
            onLogEntry: () => { },
        });
        controller.initialize({
            player1Name: 'Player 1',
            player2Name: 'Bot',
            deck1Cards: [bareNecessities],
            deck2Cards: [targetCard],
            cardDatabase: [bareNecessities, targetCard]
        });
    });

    it('should generate a valid choice request with card objects when playing The Bare Necessities', async () => {
        const p1 = (controller as any).stateManager.getPlayer((controller as any).player1Id);
        const p2 = (controller as any).stateManager.getPlayer((controller as any).player2Id);

        // Finder helper
        const findCard = (p: any, name: string) => p.deck.find((c: any) => c.name === name) || p.hand.find((c: any) => c.name === name);

        const bareInst = findCard(p1, 'The Bare Necessities');
        const targetInst = findCard(p2, 'Target Item');

        // Move to Hand
        if (bareInst.zone === ZoneType.Deck) {
            p1.deck = p1.deck.filter(c => c !== bareInst);
            p1.hand.push(bareInst);
            bareInst.zone = ZoneType.Hand;
        }
        if (targetInst.zone === ZoneType.Deck) {
            p2.deck = p2.deck.filter(c => c !== targetInst);
            p2.hand.push(targetInst);
            targetInst.zone = ZoneType.Hand;
        }

        // Setup Ink for P1
        p1.inkwell.push({ ...MockCard, instanceId: 'ink1', ready: true });
        p1.inkwell.push({ ...MockCard, instanceId: 'ink2', ready: true });
        bareInst.cost = 0; // Free just in case

        // Force Main Phase
        (controller as any).stateManager.state.turnPlayerId = (controller as any).player1Id;
        (controller as any).stateManager.state.phase = 'Main';

        // Spy on turnManager.requestChoice to intercept data before it hits UI
        const requestChoiceSpy = jest.spyOn((controller as any).turnManager, 'requestChoice');

        // Play card directly via TurnManager to trigger effect
        // We need to pass the player state object
        await (controller as any).turnManager.playCard(p1, bareInst.instanceId);

        // Check if requestChoice was called
        expect(requestChoiceSpy).toHaveBeenCalled();

        const callArgs = requestChoiceSpy.mock.calls[0][0]; // First call, first arg (request)

        console.log('Intercepted Choice Request Type:', callArgs.type);
        console.log('Intercepted Choice Options count:', callArgs.options.length);
        if (callArgs.options.length > 0) {
            console.log('First Option Keys:', Object.keys(callArgs.options[0]));
            if (callArgs.options[0].card) {
                console.log('Option Card Name:', callArgs.options[0].card.name);
            } else {
                console.log('Option has NO CARD property');
            }
        }

        // The ability "reveals their hand and discards a non-character card" uses
        // a specialized compound choice type, not a simple target_card_in_hand
        expect(callArgs.type).toBe('reveal_opponent_hand_choose_discard');
        expect(callArgs.options.length).toBeGreaterThan(0);

        const option = callArgs.options[0];
        expect(option.card).toBeDefined();
        expect(option.card.name).toBe('Target Item');
    });
});
