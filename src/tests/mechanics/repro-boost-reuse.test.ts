import { SharedTestFixture } from '../test-fixtures';
import { ZoneType, CardType } from '../../engine/models';

describe('Boost Usage Limits Reproduction', () => {
    it('should only allow Boost to be used once per turn', async () => {
        const fixture = await SharedTestFixture.getInstance();
        const { game, turnManager, p1Id } = fixture.createCleanGameState();
        const player1 = game.state.players[p1Id];

        // Setup: Mock Deck and Hand
        player1.deck = [
            { name: 'Card 1', instanceId: 'deck-1', zone: ZoneType.Deck } as any,
            { name: 'Card 2', instanceId: 'deck-2', zone: ZoneType.Deck } as any
        ];

        // Setup: Inkwell
        for (let i = 0; i < 10; i++) {
            player1.inkwell.push({
                name: 'Ink',
                instanceId: `ink-${i}`,
                zone: ZoneType.Inkwell,
                ready: true
            } as any);
        }

        // Setup: Put "Ariel" in play and ready
        const ariel = {
            instanceId: 'ariel-1',
            name: 'Ariel - Spectacular Singer',
            fullName: 'Ariel - Spectacular Singer',
            cost: 3,
            inkwell: true,
            type: CardType.Character,
            zone: ZoneType.Play,
            ready: true,
            abilities: [
                {
                    type: 'activated',
                    keyword: 'Boost',
                    cost: { ink: 1 },
                    fullText: 'Boost 1 ⬡',
                    effect: 'boost',
                    amount: 1
                }
            ],
            parsedEffects: [
                {
                    trigger: 'activated',
                    keyword: 'Boost',
                    cost: { ink: 1 },
                    effect: 'boost',
                    amount: 1
                }
            ],
            meta: {}
        } as any;

        player1.play.push(ariel);
        game.state.turnCount = 1; // Initialize turn count for ability tracking

        // Execute Boost First Time (ability index 0)
        const result1 = turnManager.useAbility(player1, 'ariel-1', 0);

        expect(result1).toBe(true);
        expect(player1.inkwell.filter(c => c.ready).length).toBe(9); // 10 - 1
        expect(ariel.meta?.usedAbilities?.['boost']).toBe(1); // Used on turn 1

        // Execute Boost Second Time (Should Fail)
        const result2 = turnManager.useAbility(player1, 'ariel-1', 0);

        expect(result2).toBe(false);
        expect(player1.inkwell.filter(c => c.ready).length).toBe(9); // Should NOT decrease again
    });
});
