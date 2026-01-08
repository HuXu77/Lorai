import { SharedTestFixture } from '../test-fixtures';
import { CardType, ZoneType } from '../../engine/models';

describe('Mother Knows Best Reproduction', () => {
    let fixture: any;

    beforeAll(async () => {
        fixture = await SharedTestFixture.getInstance();
    });

    it('should parse Mother Knows Best as return_to_hand with chosen_character target', async () => {
        const card = fixture.getCardByName('Mother Knows Best');
        expect(card).toBeDefined();

        const parsedAbilities = fixture.parseAbilities(card);
        console.log('[DEBUG] Mother Knows Best parsed abilities:', JSON.stringify(parsedAbilities, null, 2));

        // Expect the ability to contain a return_to_hand effect
        const returnEffect = parsedAbilities.find((e: any) =>
            e.action === 'return_to_hand' ||
            e.type === 'return_to_hand' ||
            (e.effects && e.effects.some((ef: any) => ef.type === 'return_to_hand' || ef.action === 'return_to_hand'))
        );

        expect(returnEffect).toBeDefined();
    });

    it('should execute return_to_hand and move opponent character back to hand', async () => {
        const { game, turnManager, p1Id, p2Id } = fixture.createCleanGameState();
        const player1 = game.state.players[p1Id];
        const player2 = game.state.players[p2Id];

        // Setup: Opponent has a character in play
        const opponentChar = {
            instanceId: 'opp-char-1',
            name: 'Target Character',
            fullName: 'Target Character',
            type: CardType.Character,
            zone: ZoneType.Play,
            ready: true,
            ownerId: p2Id,
            cost: 3
        } as any;
        player2.play.push(opponentChar);

        // Setup: Player has enough ink
        for (let i = 0; i < 5; i++) {
            player1.inkwell.push({
                name: 'Ink',
                instanceId: `ink-${i}`,
                zone: ZoneType.Inkwell,
                ready: true
            } as any);
        }

        // Get the parsed card
        const motherCard = fixture.getCardByName('Mother Knows Best');
        expect(motherCard).toBeDefined();

        const parsedAbilities = fixture.parseAbilities(motherCard);
        console.log('[DEBUG] Parsed effects:', JSON.stringify(parsedAbilities, null, 2));

        // Manually create a context to execute the effect
        const { EffectExecutor } = require('../../engine/abilities/executor');
        const executor = new EffectExecutor();
        executor.setTurnManager(turnManager);

        // Find return_to_hand effect
        const effectToExecute = parsedAbilities.find((e: any) =>
            e.type === 'return_to_hand' ||
            e.action === 'return_to_hand' ||
            (e.effects && e.effects.some((ef: any) => ef.type === 'return_to_hand'))
        );

        if (!effectToExecute) {
            console.log('[DEBUG] No return_to_hand effect found, failing test');
            expect(effectToExecute).toBeDefined();
            return;
        }

        // Mock the choice response
        (turnManager as any).mockPendingChoice = ['opp-char-1'];

        const context = {
            player: player1,
            card: motherCard,
            abilityName: 'Mother Knows Best',
            eventContext: {}
        };

        await executor.execute(effectToExecute, context);

        // Verify: Opponent character should be in hand now
        expect(player2.hand.find((c: any) => c.instanceId === 'opp-char-1')).toBeDefined();
        expect(player2.play.find((c: any) => c.instanceId === 'opp-char-1')).toBeUndefined();
    });
});
