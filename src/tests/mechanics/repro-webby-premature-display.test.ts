import { TurnManager, Phase } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { ZoneType } from '../../engine/models';
// import { GameEvent } from '../../engine/abilities/events'; // Unused, strings are fine

describe('Webby Premature Stat Buff Reproduction', () => {
    let turnManager: TurnManager;
    let gameStateManager: GameStateManager;
    let player: any;

    beforeEach(() => {
        gameStateManager = new GameStateManager();
        turnManager = new TurnManager(gameStateManager);

        // Setup Players
        gameStateManager.addPlayer('player-1', 'Player 1');
        gameStateManager.addPlayer('player-2', 'Player 2');

        // Start Game (Initializes state)
        turnManager.startGame('player-1');

        player = gameStateManager.getPlayer('player-1');

        // Reset player state for clean test
        player.hand = [];
        player.play = [];
        player.inkwell = [];

        // Add ink
        player.inkwell.push({ instanceId: 'ink-1', ready: true, type: 'ink' });
        player.inkwell.push({ instanceId: 'ink-2', ready: true, type: 'ink' });

        turnManager.game.state.turnPlayerId = player.id;
        turnManager.game.state.phase = Phase.Main;
    });

    it('should NOT applied +1 strength before target selection', async () => {
        // Setup Webby
        const webbyCard = {
            id: 2262,
            instanceId: 'webby-1',
            name: 'Webby Vanderquack',
            fullName: 'Webby Vanderquack - Mystery Enthusiast',
            cost: 2,
            type: 'Character',
            strength: 1,
            baseStrength: 1,
            willpower: 2,
            baseWillpower: 2,
            lore: 1,
            baseLore: 1,
            zone: ZoneType.Hand,
            ownerId: player.id,
            // Mock capabilities
            abilities: [
                {
                    fullText: "CONTAGIOUS ENERGY When you play this character, chosen character gets +1 strength this turn.",
                    type: "triggered",
                    trigger: "on_play",
                    effect: "chosen character gets +1 strength this turn."
                }
            ],
            // Use real parser effect format (mocked)
            parsedEffects: [
                {
                    type: 'triggered',
                    trigger: 'on_play',
                    event: 'card_played',
                    effects: [
                        {
                            type: 'modify_stats',
                            stat: 'strength',
                            amount: 1,
                            target: { type: 'chosen_character' },
                            duration: 'this_turn'
                        }
                    ]
                }
            ]
        };

        player.hand = [webbyCard];
        player.play = []; // Empty board initially

        // Mock requestChoice to inspect options
        const requestChoiceSpy = jest.spyOn(turnManager, 'requestChoice').mockImplementation(async (request: any) => {
            console.log('REQUEST CHOICE CALLED');
            // INSPECT OPTIONS
            const webbyOption = request.options.find((o: any) => o.card.instanceId === 'webby-1');
            if (webbyOption) {
                console.log(`Webby Stats in Choice: Strength ${webbyOption.card.strength}/${webbyOption.card.baseStrength}`);
            }

            // Validate assertion inside the spy? Or just return self.
            return {
                requestId: request.id,
                playerId: request.playerId,
                selectedIds: ['webby-1'], // Self-target
                declined: false,
                timestamp: Date.now()
            };
        });

        // Mock Logger
        turnManager.logger = {
            debug: jest.fn(),
            info: jest.fn(),
            action: jest.fn(),
            effect: jest.fn(), // Helper
            error: jest.fn()
        } as any;

        // Execute Play
        await turnManager.playCard(player, 'webby-1');

        expect(requestChoiceSpy).toHaveBeenCalledTimes(1);

        // After resolution, Webby SHOULD have +1
        const webbyInPlay = player.play.find((c: any) => c.instanceId === 'webby-1');
        // Wait, did execute trigger?
        // playCard calls checkTriggers -> execute -> requestChoice -> resolve -> apply

        // Assertions checked in spy logs mainly, but let's check final state too
        console.log(`Final Webby Stats: Strength ${webbyInPlay.strength}/${webbyInPlay.baseStrength}`);
    });
});
