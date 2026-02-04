import { TestHarness } from '../engine-test-utils';
import { ZoneType } from '../../engine/models';
import { GameEvent } from '../../engine/abilities/events';

describe('Leaves Play Return Bug', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('Olaf should not be able to return himself to hand when leaving play', async () => {
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Setup via setPlay
        await harness.setPlay(harness.p1Id, ['Olaf - Helping Hand', 'Mickey Mouse - True Friend']);
        const olafInstance = p1.play.find(c => c.name.includes('Olaf'));
        const mickeyInstance = p1.play.find(c => c.name.includes('Mickey'));

        if (!olafInstance || !mickeyInstance) throw new Error('Cards not set up');

        // Move Olaf to discard to simulate "leaves play" state
        // UPDATE: To reproduce the bug, we suspect the event fires while Olaf is still in play.
        // So we comment out the move.
        // p1.play = p1.play.filter(c => c.instanceId !== olafInstance.instanceId);
        // olafInstance.zone = ZoneType.Discard;
        // p1.discard.push(olafInstance);

        // Define the target AST we want to test
        const targetAST = {
            type: 'chosen_character',
            filter: { mine: true }
        };

        // Create context
        const context = {
            game: harness.game,
            player: p1,
            card: olafInstance, // Source of the ability (Olaf in discard)
            abilityName: "Olaf's Ability",
            eventContext: {
                event: GameEvent.CARD_LEAVES_PLAY,
                card: olafInstance,
                player: p1
            }
        };

        // Directly resolve targets
        // We need access to the executor. It's usually private or protected in AbilitySystem.
        // But TestHarness might expose it, or we cast to any.
        const executor = (harness.turnManager.abilitySystem as any).executor;

        // resolveTargets returns the LIST of valid targets? 
        // No, resolveTargets returns the RESOLVED targets (the ones CHOSEN).
        // BUT resolveTargets calls requestChoice.
        // We want to see what options are offered in requestChoice.

        // So we need to intercept the choice request, just like before.
        // But we call resolveTargets manually.

        let choiceOptions: any[] = [];
        harness.turnManager.registerChoiceHandler(harness.p1Id, async (req) => {
            choiceOptions = req.options;
            // Select Mickey
            const mickeyOption = req.options.find((o: any) => o.value === mickeyInstance.instanceId);
            return {
                requestId: req.id,
                playerId: req.playerId,
                selectedIds: [mickeyOption ? mickeyOption.value : req.options[0].value],
                timestamp: Date.now()
            };
        });

        // Trigger resolution
        await executor.resolveTargets(targetAST, context);

        // Now check choiceOptions
        // Check if options included Olaf
        // Since the event is CARD_LEAVES_PLAY for Olaf, he should be excluded from target options
        // even if he is technically still in the play array at this moment.
        const olafOption = choiceOptions.find(o => o.value === olafInstance.instanceId);

        expect(olafOption).toBeUndefined();
    });
});
