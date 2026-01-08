import { TestHarness } from '../engine-test-utils';
import { CardInstance, ZoneType } from '../../../src/engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { ActionType } from '../../../src/engine/actions';

describe('Pete - Games Referee Reproduction', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initGame([], []); // Start with empty hands
    });

    it('should prevent opponent from playing actions after Pete is played', async () => {
        const player1 = harness.getPlayer(harness.p1Id);
        const player2 = harness.getPlayer(harness.p2Id); // Bot/Opponent

        // 1. Setup Player 2 (Bot) with Pete
        const peteText = "When you play this character, opponents can't play actions until the start of your next turn.";
        const peteDef: any = {
            id: 8888, // Mock ID
            name: 'Pete',
            fullName: 'Pete - Games Referee',
            type: 'Character',
            cost: 3,
            fullText: peteText,
            fullTextSections: [peteText]
        };
        // Parse the ability dynamically to verify parser pattern
        peteDef.parsedEffects = parseToAbilityDefinition(peteDef);

        harness.setHand(harness.p2Id, [peteDef]);
        harness.setInk(harness.p2Id, 5);

        // 2. Setup Player 1 (User) with an Action card
        const dragonFireDef: any = {
            name: 'Dragon Fire',
            type: 'Action',
            instanceId: 'dragon-fire-1',
            cost: 5,
            inkwell: false,
            zone: ZoneType.Hand
        };
        player1.hand.push(dragonFireDef);

        harness.setInk(harness.p1Id, 5);

        // 3. Player 2 plays Pete
        // Pass turn to Player 2 first
        await harness.turnManager.passTurn(player1.id);
        expect(harness.game.state.turnPlayerId).toBe(harness.p2Id);

        await harness.playCard(player2, peteDef as any);

        // Verify Pete is in play
        const peteCard = player2.play.find((c: any) => c.name === 'Pete');
        expect(peteCard).toBeDefined();

        // 4. Verify Player 1 cannot play actions
        // Switch turn to Player 1
        await harness.turnManager.passTurn(player2.id);

        // Verify it is Player 1's turn
        expect(harness.game.state.turnPlayerId).toBe(harness.p1Id);

        // Try to play 'Dragon Fire' (should fail)
        const success = await harness.playCard(player1.id, 'Dragon Fire', 'Pete');
        expect(success).toBe(false);

        const dragonFireInHand = player1.hand.find((c: any) => c.name === 'Dragon Fire');
        if (!dragonFireInHand) throw new Error('Dragon Fire should be in hand');
        expect(dragonFireInHand.zone).toBe(ZoneType.Hand);

        // 5. Verify Player 1 CAN play characters
        const mickeyCard: any = {
            name: 'Mickey Mouse',
            fullName: 'Mickey Mouse',
            instanceId: 'mickey-mouse-1',
            type: 'Character',
            cost: 1,
            inkwell: true,
            zone: ZoneType.Hand,
            strength: 1,
            willpower: 3
        };
        player1.hand.push(mickeyCard);

        harness.setInk(player1.id, 5);

        const charSuccess = await harness.playCard(player1, mickeyCard);
        expect(charSuccess).toBe(true);
    });

    it('should prevent opponent from Singing songs after Pete is played', async () => {
        const player1 = harness.getPlayer(harness.p1Id);
        const player2 = harness.getPlayer(harness.p2Id);

        // 1. Setup Player 2 (Bot) with Pete in play
        const peteText = "When you play this character, opponents can't play actions until the start of your next turn.";
        const peteDef: any = {
            id: 8888,
            name: 'Pete',
            fullName: 'Pete - Games Referee',
            type: 'Character',
            cost: 3,
            fullText: peteText
        };
        peteDef.parsedEffects = parseToAbilityDefinition(peteDef);

        harness.setHand(harness.p2Id, [peteDef]);
        harness.setInk(harness.p2Id, 5);

        // Player 2 plays Pete
        await harness.turnManager.passTurn(player1.id); // P2 turn
        await harness.playCard(player2, peteDef as any);

        // 2. Setup Player 1 with a Song and a Singer
        const songCard: any = {
            id: 7777,
            name: 'A Whole New World',
            fullName: 'A Whole New World',
            type: 'Action',
            subtypes: ['Song'],
            instanceId: 'song-1',
            cost: 5,
            zone: ZoneType.Hand,
            fullText: "Sing Together 5. Each player discards their hand and draws 7 cards."
        };
        songCard.parsedEffects = parseToAbilityDefinition(songCard);

        const singerCard: any = {
            id: 6666,
            name: 'Singer Mickey',
            type: 'Character',
            instanceId: 'singer-1',
            cost: 5,
            zone: ZoneType.Play,
            ready: true,
            ownerId: player1.id
        };

        player1.hand.push(songCard);
        player1.play.push(singerCard);

        // Switch to Player 1
        await harness.turnManager.passTurn(player2.id);

        // 3. Attempt to Sing
        const success = await harness.turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: player1.id,
            cardId: songCard.instanceId,
            singerIds: [singerCard.instanceId]
        });

        // Expect failure
        expect(success).toBe(false);

        // Verify card still in hand
        const songInHand = player1.hand.find((c: any) => c.instanceId === songCard.instanceId);
        expect(songInHand).toBeDefined();
        // Verify singer is NOT exerted
        expect(singerCard.ready).toBe(true);
    });
});
