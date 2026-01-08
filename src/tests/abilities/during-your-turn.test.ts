
import { TurnManager } from '../../engine/actions';
import { GameStateManager, PlayerState } from '../../engine/state';
import { ActionType, GameState, Player, ZoneType, CardInstance, CardType } from '../../engine/models';
import { SharedTestFixture } from '../test-fixtures';
import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('During Your Turn Triggers', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let player1: PlayerState;
    let player2: PlayerState;

    // Helper to find card
    const getCard = (cardId: string): CardInstance | undefined => {
        const allPlayers = [player1, player2];
        for (const p of allPlayers) {
            const zones = [p.play, p.discard, p.hand, p.inkwell, p.deck];
            for (const zone of zones) {
                const card = zone.find(c => c.instanceId === cardId);
                if (card) return card;
            }
        }
        return undefined;
    };

    beforeEach(async () => {
        const fixture = await SharedTestFixture.getInstance();

        game = new GameStateManager();
        game.addPlayer('Player 1');
        game.addPlayer('Player 2');

        // Get player IDs (they are generated)
        const p1Id = Object.keys(game.state.players)[0];
        const p2Id = Object.keys(game.state.players)[1];

        player1 = game.getPlayer(p1Id);
        player2 = game.getPlayer(p2Id);

        turnManager = new TurnManager(game);
    });

    it('should trigger "During your turn, whenever this character banishes..." only on your turn', async () => {
        // Mock Te Ka - Heartless: "During your turn, whenever this character banishes another character in a challenge, you gain 2 lore."
        const teKa: any = {
            id: 9999,
            name: 'Te Ka - Heartless',
            cost: 6,
            inkwell: true,
            type: 'Character' as CardType,
            strength: 5,
            willpower: 5,
            lore: 2,
            abilities: [{
                type: 'triggered',
                effect: 'During your turn, whenever this character banishes another character in a challenge, you gain 2 lore.'
            }]
        };

        // Parse abilities
        teKa.parsedEffects = parseToAbilityDefinition(teKa);

        // Mock Opponent Character
        const victim = {
            name: 'Victim',
            cost: 1,
            inkwell: true,
            type: 'Character' as CardType,
            strength: 1,
            willpower: 1,
            lore: 1
        };

        // Setup Board
        const teKaCard = player1.addCardToZone(teKa, ZoneType.Play);
        const victimCard = player2.addCardToZone(victim as any, ZoneType.Play);

        // Register with ability system
        (turnManager as any).abilitySystem.registerCard(teKaCard);

        teKaCard.ready = true; // Ready to challenge
        victimCard.ready = false; // Exerted to be challenged

        // Start Player 1's turn
        turnManager.startGame(player1.id);

        // Action: Te Ka challenges Victim
        await turnManager.resolveAction({
            type: ActionType.Challenge,
            playerId: player1.id,
            cardId: teKaCard.instanceId,
            targetId: victimCard.instanceId
        });
        // Check: Victim banished?
        // Victim should be in discard
        await new Promise(resolve => setTimeout(resolve, 100));
        const p2State = game.getPlayer(player2.id);
        console.log('Discard IDs:', p2State.discard.map((c: any) => c.instanceId));
        console.log('Victim ID:', victimCard.instanceId);
        expect(p2State.discard.find((c: any) => c.instanceId === victimCard.instanceId)).toBeDefined();

        // Check: Lore gain? (Should trigger)
        expect(player1.lore).toBe(2);

        // Reset for Opponent's turn test
        player1.lore = 0;
        const victimCard2 = player2.addCardToZone(victim as any, ZoneType.Play);
        // Force Te Ka to be challenged (hypothetically, if it had a defensive trigger, but here we just want to ensure no trigger on opponent turn)
        // Actually, the trigger is "whenever this character banishes", so we need Te Ka to banish someone on opponent's turn.
        // This happens if opponent challenges Te Ka and dies.

        const suicideBomber = {
            name: 'Bomber',
            cost: 1,
            inkwell: true,
            type: 'Character' as CardType,
            strength: 1,
            willpower: 1, // Will die to Te Ka's 5 strength
            lore: 1
        };
        const bomberCard = player2.addCardToZone(suicideBomber as any, ZoneType.Play);
        bomberCard.ready = true;
        teKaCard.ready = false; // Exerted to be challenged

        // End P1 turn, Start P2 turn
        await turnManager.resolveAction({
            type: ActionType.PassTurn,
            playerId: player1.id
        });

        // Action: Bomber challenges Te Ka
        await turnManager.resolveAction({
            type: ActionType.Challenge,
            playerId: player2.id,
            cardId: bomberCard.instanceId,
            targetId: teKaCard.instanceId
        });

        // Check: Bomber banished?
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(player2.discard.find(c => c.instanceId === bomberCard.instanceId)).toBeDefined();

        // Check: Lore gain? (Should NOT trigger because it's not P1's turn)
        expect(player1.lore).toBe(0);
    });
});
