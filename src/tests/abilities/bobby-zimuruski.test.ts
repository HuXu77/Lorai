import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Bobby Zimuruski Optional May-Then Ability', () => {
    it('should parse "may draw...then discard" with only draw as optional', () => {
        const card = {
            id: 2014,
            name: 'Bobby Zimuruski',
            fullName: 'Bobby Zimuruski - Spray Cheese Kid',
            abilities: [{
                effect: "When you play this character, you may draw a card, then choose and discard a card.",
                fullText: "SO CHEESY When you play this character, you\\nmay draw a card, then choose and discard a card.",
                name: "SO CHEESY",
                type: "triggered"
            }],
            cost: 1,
            type: 'Character' as CardType,
            inkwell: true,
            color: 'Emerald'
        };

        const abilities = parseToAbilityDefinition(card as any);

        console.log('\n=== BOBBY PARSE TEST ===');
        console.log('Abilities:', JSON.stringify(abilities, null, 2));

        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].effects.length).toBe(2);

        // First effect should be draw with optional=true
        const drawEffect: any = abilities[0].effects[0];
        console.log('Draw effect:', JSON.stringify(drawEffect, null, 2));
        expect(drawEffect.type).toBe('draw');
        expect(drawEffect.optional).toBe(true);

        // Second effect should be discard WITHOUT optional
        const discardEffect: any = abilities[0].effects[1];
        console.log('Discard effect:', JSON.stringify(discardEffect, null, 2));
        expect(['discard', 'choose_and_discard']).toContain(discardEffect.type);
        expect(discardEffect.optional).toBeUndefined(); // Should NOT be optional!
    });
});


import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { ZoneType } from '../../engine/models';

describe('Bobby Zimuruski Execution', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let executor: any;
    let p1Id: string;

    beforeEach(() => {
        game = new GameStateManager();
        p1Id = game.addPlayer('Player 1');
        game.addPlayer('Player 2');
        turnManager = new TurnManager(game);
        executor = turnManager.abilitySystem.executor;
    });

    it('should prompt user for optional draw', async () => {
        const p1 = game.getPlayer(p1Id);

        // Setup scenarios
        p1.deck = [{ instanceId: 'd1', name: 'Card 1' }] as any;
        p1.hand = [];

        const card = { instanceId: 'bobby', name: 'Bobby Zimuruski', ownerId: p1Id };
        const context = {
            player: p1,
            card: card,
            gameState: game,
            abilityName: 'SO CHEESY'
        };

        // Parsed ability structure for Bobby
        const ability = {
            type: 'triggered',
            effects: [
                { type: 'draw', amount: 1, optional: true },
                { type: 'discard', amount: 1 } // Note: this might be 'choose_and_discard' or similar based on parser
            ]
        };

        // Mock requestChoice
        turnManager.requestChoice = vi.fn()
            .mockResolvedValueOnce({ selectedIds: ['yes'] }) // Say YES to draw
            .mockResolvedValueOnce({ selectedIds: ['d1'] }); // Select card to discard (if implemented)

        await executor.execute(ability, context);

        // Expect YES_NO prompt for optional draw
        expect(turnManager.requestChoice).toHaveBeenCalled();
        const call1 = (turnManager.requestChoice as vi.Mock).mock.calls[0][0];
        // Check if the FIRST call was a YES/NO prompt
        // If current impl ignores proper optional, it might just be the discard choice

        // We want to VERIFY if it happened.
        // If the implementation is missing, this expectation might fail or key properties will be missing.
        console.log('Call 1 Type:', call1.type);
        console.log('Call 1 Prompt:', call1.prompt);
        expect(call1.prompt).toContain('SO CHEESY');

        if (call1.type === 'yes_no') {
            console.log('Confirmed: Prompted for optional.');
        } else {
            console.log('Confirmed: DID NOT prompt for optional.');
        }
    });

    it('should NOT discard if user declines to draw', async () => {
        const p1 = game.getPlayer(p1Id);
        p1.deck = [{ instanceId: 'd1', name: 'Card 1' }] as any;
        p1.hand = [{ instanceId: 'h1', name: 'Hand Card 1' }] as any;

        const context = {
            player: p1,
            card: { instanceId: 'bobby', name: 'Bobby Zimuruski', ownerId: p1Id },
            gameState: game,
            abilityName: 'SO CHEESY',
            abilityText: 'When you play this character, you may draw a card, then choose and discard a card.'
        };

        const ability = {
            type: 'triggered',
            effects: [
                { type: 'draw', amount: 1, optional: true },
                { type: 'discard', amount: 1 }
            ]
        };

        // Mock requestChoice with YES_NO prompt handling
        turnManager.requestChoice = vi.fn().mockImplementation(async (req) => {
            if (req.type === 'confirm') return { selectedIds: ['no'] };
            return { selectedIds: ['h1'] };
        });

        // Spy on logic
        // We can't easily spy on executor methods directly unless we re-assign them or use spyOn on the prototype/instance
        // But we can check if requestChoice was called a second time (for discard)

        await executor.execute(ability, context);

        expect(turnManager.requestChoice).toHaveBeenCalled();
        const call1 = (turnManager.requestChoice as vi.Mock).mock.calls[0][0];

        console.log('Prompt:', call1.prompt);
        // Expect prompt to contain the text now (once fixed)
        // expect(call1.prompt).toContain('choose and discard'); 

        // CRITICAL CHECK: Did it ask to discard?
        // If we said NO to draw, and it still asks to discard, that's a bug.
        // Discard usually asks for a choice of card.
        const calls = (turnManager.requestChoice as vi.Mock).mock.calls;
        if (calls.length > 1) {
            console.log('BUG CONFIRMED: Discard triggered even after No');
        } else {
            console.log('Confirmed: Discard skipped.');
        }

        // Assert dependent on desired behavior.
        // If "May draw... then discard" implies the whole sequence is optional, calls.length should be 1.
        expect(calls.length).toBe(1);
    });
});
