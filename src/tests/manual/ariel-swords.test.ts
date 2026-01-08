import { TestHarness } from '../engine-test-utils';
import { CardType } from '../../engine/models';

describe('Ariel Singer - Grab Your Sword', () => {
    let harness: TestHarness;

    beforeEach(() => {
        harness = new TestHarness();
    });

    it('should allow Ariel - Spectacular Singer (Singer 5) to sing Grab Your Sword (Cost 5)', async () => {
        await harness.initGame([], []);
        const p1 = harness.game.getPlayer(harness.p1Id);

        // Setup: P1 has Ariel in play (Cost 3, Singer 5)
        harness.setPlay(p1.id, [
            {
                name: 'Ariel - Spectacular Singer',
                // Assuming Ariel is Cost 3
                // We mock the singer ability since parser might not run in minimal mock
                // But actions.ts logic uses parsedEffects. Or getSingingValue parser.
                // Best to include fullText for parser if possible, or manually add ability
                fullText: "Singer 5 (This character counts as cost 5 to sing songs.)",
                parsedEffects: [
                    { keyword: 'singer', value: 5, trigger: 'static', type: 'static', effects: [] } as any
                ],
                ready: true,
                type: CardType.Character
            }
        ]);
        const ariel = p1.play[0];

        // Setup: P2 has a character (valid target for Grab Your Sword)
        const p2 = harness.game.getPlayer(harness.p2Id);
        harness.setPlay(p2.id, [
            { name: 'Target Dummy', type: CardType.Character }
        ]);

        // Setup: P1 has Grab Your Sword in hand (Cost 5)
        harness.setHand(p1.id, [
            {
                name: 'Grab Your Sword',
                type: CardType.Action,
                cost: 5, // Important: Cost 5
                subtypes: ['Song'],
                // Song requires cost 5 or more
                fullText: '(A character with cost 5 or more can ⟳ to sing this song for free.)'
            }
        ]);
        const sword = p1.hand[0];

        // Ensure Ariel is ready
        ariel.ready = true;

        // Check valid actions
        const actions = harness.turnManager.getValidActions(p1.id);
        const singAction = actions.find((a: any) =>
            a.type === 'SingSong' && a.cardId === sword.instanceId && a.singerId === ariel.instanceId
        );

        console.log(`Sing Actions found:`, actions.filter((a: any) => a.type === 'SingSong'));

        if (!singAction) {
            console.log("Ariel Singing Value:", (harness.turnManager as any).getSingingValue(ariel));
        }

        expect(singAction).toBeDefined();
    });
});
