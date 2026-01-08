import { TestHarness } from '../engine-test-utils';
import { ActionType, ZoneType, CardType } from '../../engine/models';

describe('Ariel Singer Verification', () => {
    let harness: TestHarness;

    beforeEach(() => {
        harness = new TestHarness();
    });

    it('should allow Ariel - Spectacular Singer to sing A Whole New World', async () => {
        // Init with empty hands
        await harness.initGame([], []);
        const player = harness.game.getPlayer(harness.p1Id);

        // Setup Ariel in play (dry) using setPlay
        harness.setPlay(player.id, [{
            name: 'Ariel',
            fullName: 'Ariel - Spectacular Singer',
            cost: 3,
            baseCost: 3,
            fullText: "Singer 5 (This character counts as cost 5 to sing songs.)\nMUSICAL DEBUT When you play this character, look at the top 4 cards...",
            subtypes: ['Character', 'Storyborn', 'Hero', 'Princess'],
            parsedEffects: [
                { keyword: 'singer', value: 5, trigger: 'static', type: 'static', effects: [] } as any
            ],
            turnPlayed: harness.game.state.turnCount - 1,
            ready: true,
            type: CardType.Character
        }]);

        const ariel = player.play[0];

        // Setup A Whole New World in hand using setHand
        harness.setHand(player.id, [{
            name: 'A Whole New World',
            subtypes: ['Song'],
            cost: 5, // Important: verify this is > 3
            baseCost: 5,
            type: CardType.Action
        }]);

        const song = player.hand[0];

        // Verify Singing Value - Access private method via casting
        const singValue = (harness.turnManager as any).getSingingValue(ariel);
        console.log(`Ariel Singing Value: ${singValue} (Expected: 5)`);
        expect(singValue).toBeGreaterThan(4);

        // Get Valid Actions
        const actions = harness.turnManager.getValidActions(player.id);
        const singActions = actions.filter(a => a.type === ActionType.SingSong && a.cardId === song.instanceId);

        console.log('Sing Actions:', JSON.stringify(singActions, null, 2));

        // Should find at least one sing action with Ariel
        const arielSingAction = singActions.find(a => a.singerId === ariel.instanceId);
        expect(arielSingAction).toBeDefined();
    });
});
