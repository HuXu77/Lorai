
import { TestHarness } from '../engine-test-utils';
import { CardLoader } from '../../engine/card-loader';

describe('Rapunzel Targeting Bug', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initGame(['The Bare Necessities'], ['Rapunzel']);
    });

    it('should NOT allow choosing Rapunzel (Character)', async () => {
        const cardLoader = new CardLoader();
        await cardLoader.loadCards();

        let rapunzelReal: any;
        const allCards = cardLoader.getAllCards();

        for (const card of allCards) {
            if (card.fullName && card.fullName.includes('Rapunzel') && card.type === 'Character') {
                rapunzelReal = card;
                console.log('Found Rapunzel:', card.fullName, card.type);
                break;
            }
        }

        const player1 = harness.getPlayer(harness.p1Id);
        const bareNecessities = player1.hand.find(c => c.name === 'The Bare Necessities');

        const opponent = harness.getPlayer(harness.p2Id);
        opponent.hand = [];

        const rapunzelInstance: any = {
            ...(rapunzelReal || { name: 'Rapunzel', type: 'Character', fullName: 'Rapunzel' }),
            instanceId: 'i_rapunzel',
            zone: 'hand',
            ownerId: opponent.id
        };

        console.log('Rapunzel Instance Type:', rapunzelInstance.type);

        opponent.hand.push(rapunzelInstance);

        // Mock choice request
        let capturedOptions: any[] = [];
        harness.turnManager.requestChoice = async (req: any) => {
            capturedOptions = req.options;
            return {
                requestId: req.id,
                playerId: req.playerId,
                selectedIds: [],
                timestamp: Date.now()
            };
        };

        // Execute effect
        const effects = bareNecessities?.parsedEffects || [];
        const mainAbility = effects.find((e: any) => e.type === 'triggered');
        const parsedEffect = mainAbility.effects[0];

        // @ts-ignore
        const interactionHandler = harness.turnManager.abilitySystem.executor.familyHandlers.get('opponent_interaction');

        // @ts-ignore
        await interactionHandler.execute(parsedEffect, {
            player: player1,
            card: bareNecessities
        });

        const rapunzelOption = capturedOptions.find(o => o.id === 'i_rapunzel');

        // BUG FIX VERIFIED: Rapunzel IS present in options, but correctly marked as invalid
        // The UI should show both options, but only allow selecting valid ones
        expect(rapunzelOption).toBeDefined();
        expect(rapunzelOption.valid).toBe(false);
        expect(rapunzelOption.invalidReason).toBe('Cannot select Character');
    });
});
