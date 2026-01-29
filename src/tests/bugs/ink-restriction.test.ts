
import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { CardInstance, ZoneType } from '../../engine/models';

describe('Ink Restriction Bug', () => {
    let stateManager: GameStateManager;
    let turnManager: TurnManager;
    let player: any;

    beforeEach(() => {
        stateManager = new GameStateManager();
        turnManager = new TurnManager(stateManager);
        const playerId = stateManager.addPlayer('player1', 'Player 1');
        player = stateManager.getPlayer(playerId);
        turnManager.startGame(playerId);
    });

    it('should allow inking after playing a card (spending ink)', async () => {
        // Setup: Give player 5 ink, all ready
        for (let i = 0; i < 5; i++) {
            player.inkwell.push({
                instanceId: `ink-${i}`,
                name: 'Ink',
                zone: ZoneType.Inkwell,
                ready: true,
                inkwell: true
            } as CardInstance);
        }

        // Give player a card to play (Cost 2)
        const cardToPlay: CardInstance = {
            instanceId: 'card-play',
            name: 'Playable Card',
            cost: 2,
            inkwell: true,
            zone: ZoneType.Hand,
            ownerId: player.id,
            ready: true,
            type: 'Character'
        } as any;
        player.hand.push(cardToPlay);

        // Give player a card to INK
        const cardToInk: CardInstance = {
            instanceId: 'card-ink',
            name: 'Inkable Card',
            cost: 3,
            inkwell: true,
            zone: ZoneType.Hand,
            ownerId: player.id,
            ready: true,
            type: 'Character'
        } as any;
        player.hand.push(cardToInk);

        player.inkedThisTurn = false;

        // 1. Play the card (Spending 2 ink)
        const playResult = await turnManager.playCard(player, cardToPlay.instanceId);
        expect(playResult).toBe(true);

        // Use manual ready check since playCard handles exertion via helpers often mocked/complex
        // But simply check inkwell for exerted cards if implemented
        // Actually, just check inkedThisTurn is still false
        expect(player.inkedThisTurn).toBe(false);

        // 2. Attempt to Ink the second card
        const inkResult = turnManager.inkCard(player, cardToInk.instanceId);

        // EXPECTATION: Should be true
        expect(inkResult).toBe(true);
        expect(player.inkedThisTurn).toBe(true);
        expect(player.inkwell.length).toBe(6); // 5 initial + 1 new
    });
});
