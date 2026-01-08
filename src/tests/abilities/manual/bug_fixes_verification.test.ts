
import { TestHarness } from '../../engine-test-utils';
import { CardInstance, ZoneType, CardType, EffectAST } from '../../../engine/models';

describe('Bug Fix Verification: Ariel, Naveen, Raging Fire', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('Ariel - Spectacular Singer should be able to sing 5-cost songs', async () => {
        const player = harness.game.getPlayer(harness.p1Id);

        // 1. Add Ariel (ID 2) to play (ready)
        // Explicitly set parsedEffects to simulate a correctly parsed card
        const arielCard = harness.createCard(player, {
            id: 2,
            name: 'Ariel - Spectacular Singer',
            type: CardType.Character,
            cost: 3,
            parsedEffects: [
                { type: 'keyword', keyword: 'Singer', keywordValue: '5' } as any
            ]
        });
        arielCard.ready = true;
        player.play.push(arielCard);

        // 2. Add Let It Go (ID 163) to hand
        const letItGo = harness.createCard(player, {
            id: 163,
            name: 'Let It Go',
            type: CardType.Action,
            cost: 5,
            subtypes: ['Song']
        });

        player.hand.push(letItGo);

        // 3. Check singing logic
        const singValue = (harness.turnManager as any).getSingingValue(arielCard);
        expect(singValue).toBe(5);
        expect(singValue >= letItGo.cost).toBe(true);
    });

    it('Strength of a Raging Fire should deal damage equal to character count', async () => {
        const player1 = harness.game.getPlayer(harness.p1Id);
        const player2 = harness.game.getPlayer(harness.p2Id);

        // 1. Setup Board: Player 1 has 3 characters and 1 Item
        for (let i = 0; i < 3; i++) {
            const char = harness.createCard(player1, {
                id: 100 + i,
                name: `Char ${i}`,
                type: CardType.Character,
                cost: 1
            });
            player1.play.push(char);
        }

        // Add an item - should NOT be counted
        player1.play.push(harness.createCard(player1, {
            id: 888,
            name: 'My Item',
            type: CardType.Item,
            cost: 1
        }));

        // 2. Setup Target
        const target = harness.createCard(player2, {
            id: 200,
            name: 'Target Dummy',
            type: CardType.Character,
            cost: 1,
            willpower: 10
        });
        player2.play.push(target);

        // 3. Create the card
        const ragingFire = harness.createCard(player1, {
            id: 417,
            name: 'Strength of a Raging Fire',
            type: CardType.Action,
            cost: 3
        });

        const effectAST = {
            type: 'damage_equal_to_count',
            target: { type: 'chosen_character' },
            count: { count: 'your_characters' }
        } as any;

        // Register choice handler to select the target
        harness.turnManager.registerChoiceHandler(harness.p1Id, async (req) => {
            return {
                requestId: req.id,
                playerId: req.playerId,
                selectedIds: [target.instanceId],
                timestamp: Date.now()
            };
        });

        const executor = harness.turnManager.abilitySystem.executor as any;
        const context = {
            player: player1,
            card: ragingFire,
            gameState: harness.game,
            eventContext: {} as any
        };

        // 4. Exec
        await executor.execute(effectAST, context);

        // 5. Verify
        expect(target.damage).toBe(3);
    });

    it('Prince Naveen should prompt for song selection (play_for_free)', async () => {
        const player = harness.game.getPlayer(harness.p1Id);

        // 1. Setup Naveen
        const naveen = harness.createCard(player, {
            id: 959,
            name: 'Prince Naveen',
            type: CardType.Character,
            cost: 4
        });
        player.play.push(naveen);

        // 2. Setup Songs in Hand
        const song1 = harness.createCard(player, { id: 901, name: 'Song 1', type: CardType.Action, cost: 5, subtypes: ['Song'] });
        const song2 = harness.createCard(player, { id: 902, name: 'Song 2', type: CardType.Action, cost: 4, subtypes: ['Song'] });
        player.hand.push(song1, song2);

        // 3. Effect AST
        const effectAST = {
            type: 'play_for_free',
            target: {
                type: 'card',
                value: 'song',
                zone: 'hand',
                filters: [{ filter: 'cost', comparison: '<=', value: 6 }]
            },
            optional: true
        } as any;

        const executor = harness.turnManager.abilitySystem.executor as any;
        const spyHandler = jest.spyOn(executor, 'executePlayForFree');

        // Mocking resolveTargets is tricky as seen above, but for play_for_free we need to ensure checks pass
        // However, play_for_free internal logic does its own searching usually.
        // Actually, internal logic: executePlayForFree -> find cards -> if 0, return.
        // If choices > 0, optional check (handled) -> request choice.

        // We just want to check that executePlayForFree IS called.
        // And checkOptional is NOT called.
        // We will mock resolveTargets to return valid songs to ensure it doesn't bail early.
        // Since spying failed before, let's just spy on checkOptional (which is on the instance) 
        // and spy on executePlayForFree (method on instance).

        // We need to ensure resolveTargets returns something so executePlayForFree proceeds?
        // Actually executePlayForFree does:
        // const candidates = await this.resolveTargets(effect.target, context);
        // So we do need resolveTargets to work.
        // If spy fails, real resolveTargets runs.
        // Real resolveTargets for 'card' value 'song' in 'hand':
        // It should find song1 and song2 in player.hand.
        // So we DON'T need to mock it if the logic is correct!

        const checkOptionalSpy = jest.spyOn(executor, 'checkOptional');

        const context = {
            player: player,
            card: naveen,
            gameState: harness.game,
            eventContext: {} as any
        };

        await executor.execute(effectAST, context);

        expect(checkOptionalSpy).not.toHaveBeenCalled();
        expect(spyHandler).toHaveBeenCalled();
    });
});
