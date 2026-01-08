import { TestHarness } from '../engine-test-utils';
import { ActionType, CardType } from '../../engine/models';
import { GameEvent } from '../../engine/abilities/events';

describe('Baloo - von Bruinwald XIII Bug', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initGame([], []);
    });

    it('should gain 2 lore when Baloo is banished', async () => {
        const player1 = harness.game.getPlayer(harness.p1Id);
        const player2 = harness.game.getPlayer(harness.p2Id);

        if (!player1 || !player2) throw new Error('Players not initialized');

        // Place Baloo in play for Player 1
        harness.setPlay(harness.p1Id, [
            {
                id: 3001,
                name: 'Baloo',
                fullName: 'Baloo - von Bruinwald XIII',
                type: CardType.Character,
                strength: 4,
                willpower: 6,
                lore: 1,
                turnPlayed: 0,
                ready: true,
                parsedEffects: [
                    {
                        type: 'triggered',
                        event: 'card_banished', // GameEvent.CARD_BANISHED value
                        triggerFilter: { self: true }, // Only trigger for THIS card
                        effects: [
                            {
                                type: 'gain_lore',
                                amount: 2
                            }
                        ],
                        abilityName: 'When Baloo is banished'
                    }
                ]
            } as any
        ]);

        // Place an attacker for Player 2 to banish Baloo
        harness.setPlay(harness.p2Id, [
            {
                id: 3002,
                name: 'Strong Attacker',
                type: CardType.Character,
                strength: 8, // Enough to banish Baloo (willpower 6)
                willpower: 8,
                lore: 1,
                turnPlayed: 0,
                ready: true
            } as any
        ]);

        const baloo = player1.play[0];
        const attacker = player2.play[0];

        // Record initial lore
        const initialLore = player1.lore;
        expect(initialLore).toBe(0);

        // Start Player 2's turn for challenge
        harness.turnManager.startTurn(harness.p2Id);

        // Exert Baloo so it can be challenged
        baloo.ready = false;

        // Player 2 challenges Baloo
        await harness.turnManager.resolveAction({
            type: ActionType.Challenge,
            playerId: player2.id,
            cardId: attacker.instanceId,
            targetId: baloo.instanceId
        });

        // Verify Baloo was banished (should be in discard)
        expect(player1.play.find(c => c.name === 'Baloo')).toBeUndefined();
        expect(player1.discard.find(c => c.name === 'Baloo')).toBeDefined();

        // Verify Player 1 gained 2 lore from Baloo's ability
        console.log('[DEBUG] Player 1 lore after banish:', player1.lore);
        expect(player1.lore).toBe(initialLore + 2);
    });
});
