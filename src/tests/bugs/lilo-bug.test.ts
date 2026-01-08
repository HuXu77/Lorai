

import { TestHarness } from '../engine-test-utils';
import { ActionType } from '../../engine/models';

describe('Lilo - Escape Artist Bug', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initGame([], []);
    });

    it('should NOT trigger if Lilo is in hand or play', async () => {
        const player1 = harness.game.getPlayer(harness.p1Id);

        // Setup Lilo in HAND
        await harness.setHand(harness.p1Id, [
            {
                id: 'lilo-1',
                name: 'Lilo - Escape Artist',
                type: 'Character',
                cost: 2,
                inkwell: true,
                color: 'Amber',
                abilities: [
                    { fullText: "At the start of your turn, if this card is in your discard, you may play her and she enters play exerted." }
                ]
            }
        ]);

        // Start Turn
        // This usually triggers 'on_start_turn' effects
        await harness.turnManager.startTurn(harness.p1Id);

        // Assert NO pending effects/choices for Player 1
        const pendingChoice = (harness.game.state as any).pendingChoice;
        expect(pendingChoice).toBeUndefined();

        // Move to PLAY
        const lilo = player1.hand[0];
        await harness.setPlay(harness.p1Id, [lilo]);
        player1.hand = [];

        // Next turn (Player 2)
        await harness.turnManager.passTurn(harness.p1Id);
        // Back to Player 1
        await harness.turnManager.passTurn(harness.p2Id);

        // Assert NO pending effects for Player 1 (Lilo is in PLAY)
        const pendingChoice2 = (harness.game.state as any).pendingChoice;
        expect(pendingChoice2).toBeUndefined();
    });

    it('should TRIGGER if Lilo is in DISCARD', async () => {
        const player1 = harness.game.getPlayer(harness.p1Id);

        // Setup Lilo in DISCARD
        // We need 2 ink to play her
        await harness.setInk(harness.p1Id, 2);

        // Manual setDiscard since harness doesn't have it
        const lilo = {
            id: 'lilo-discarded',
            name: 'Lilo - Escape Artist',
            type: 'Character',
            cost: 2,
            inkwell: true,
            color: 'Amber',
            abilities: [
                { fullText: "At the start of your turn, if this card is in your discard, you may play her and she enters play exerted." }
            ],
            instanceId: 'lilo-discarded-instance',
            ownerId: harness.p1Id,
            zone: 'Discard', // ZoneType.Discard
            ready: true,
            damage: 0
        };
        player1.discard = [lilo as any];

        // IMPORTANT: Register card with ability system manually
        harness.turnManager.abilitySystem.registerCard(lilo as any);

        // Verify she is in discard
        expect(player1.discard.length).toBe(1);

        // Override harness choice handler to accept yes_no
        harness.turnManager.emitChoiceRequest = async (choice: any) => {
            (harness.game.state as any).pendingChoice = choice;
            if (choice.type === 'yes_no') {
                return {
                    requestId: choice.id,
                    playerId: choice.playerId,
                    selectedIds: ['yes'],
                    timestamp: Date.now()
                };
            }
            return {
                requestId: choice.id,
                playerId: choice.playerId,
                selectedIds: [],
                timestamp: Date.now()
            };
        };

        // Start Turn
        await harness.turnManager.startTurn(harness.p1Id);

        // Wait for async abilities to resolve (TurnManager event emission might not await listeners)
        await new Promise(resolve => setTimeout(resolve, 50));

        // Assert choice happened
        const pending = (harness.game.state as any).pendingChoice;
        expect(pending).toBeDefined();
        expect(pending.type).toBe('yes_no');

        // Since we auto-responded 'yes', Lilo should be in play now.

        // Assert:
        // 1. Lilo is in Play
        const liloInPlay = player1.play.find((c: any) => c.name === 'Lilo - Escape Artist');
        expect(liloInPlay).toBeDefined();

        // 2. Ink was reduced (2 ink cost)
        // Check inkwell for exerted cards
        const readyInk = player1.inkwell.filter(c => c.ready).length;
        // Total 2 ink, cost 2 -> 0 ready
        expect(readyInk).toBe(0);

        // 3. Lilo enters EXERTED
        expect(liloInPlay?.ready).toBe(false);
    });
});
