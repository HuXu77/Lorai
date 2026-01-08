import { SharedTestFixture } from '../test-fixtures';
import { ZoneType, CardType } from '../../engine/models';

describe('Megara Boost Quest Lore Bug Reproduction', () => {
    let fixture: any;

    beforeAll(async () => {
        fixture = await SharedTestFixture.getInstance();
    });

    it('should grant +1 lore when questing with a card under (Megara)', async () => {
        const { game, turnManager, p1Id } = fixture.createCleanGameState();
        const player1 = game.state.players[p1Id];

        // Setup: Megara in play with a card under her
        const megara = {
            instanceId: 'megara-1',
            name: 'Megara',
            fullName: 'Megara - Secret Keeper',
            type: CardType.Character,
            zone: ZoneType.Play,
            ready: true,
            ownerId: p1Id,
            cost: 3,
            lore: 1, // Base lore
            strength: 3,
            willpower: 4,
            turnPlayed: 0, // Played in a previous turn (dry)
            parsedEffects: [
                {
                    trigger: 'static',
                    type: 'static',
                    condition: { type: 'has_card_under' },
                    effects: [
                        { type: 'modify_stats', stat: 'lore', amount: 1 }
                    ]
                }
            ],
            meta: {
                cardsUnder: [
                    { instanceId: 'card-under-1', name: 'Boosted Card' }
                ]
            }
        } as any;

        player1.play.push(megara);
        // Explicitly register card to activate static abilities
        (turnManager as any).abilitySystem.registerCard(megara);

        player1.lore = 0; // Start at 0 lore
        game.state.turnCount = 1; // We're on turn 1

        // Execute Quest
        const result = await turnManager.quest(player1, 'megara-1');

        expect(result).toBe(true);
        // Base lore (1) + conditional lore from has_card_under (1) = 2
        expect(player1.lore).toBe(2);
    });

    it('should NOT grant bonus lore when questing WITHOUT a card under', async () => {
        const { game, turnManager, p1Id } = fixture.createCleanGameState();
        const player1 = game.state.players[p1Id];

        // Setup: Megara in play WITHOUT a card under her
        const megara = {
            instanceId: 'megara-2',
            name: 'Megara',
            fullName: 'Megara - Secret Keeper',
            type: CardType.Character,
            zone: ZoneType.Play,
            ready: true,
            ownerId: p1Id,
            cost: 3,
            lore: 1, // Base lore
            strength: 3,
            willpower: 4,
            turnPlayed: 0, // Played in a previous turn (dry)
            parsedEffects: [
                {
                    trigger: 'static',
                    type: 'static',
                    condition: { type: 'has_card_under' },
                    effects: [
                        { type: 'modify_stats', stat: 'lore', amount: 1 }
                    ]
                }
            ],
            meta: {
                cardsUnder: [] // No cards under
            }
        } as any;

        player1.play.push(megara);
        player1.lore = 0;
        game.state.turnCount = 1;

        // Execute Quest
        const result = await turnManager.quest(player1, 'megara-2');

        expect(result).toBe(true);
        // Base lore only = 1 (no bonus)
        expect(player1.lore).toBe(1);
    });
});
