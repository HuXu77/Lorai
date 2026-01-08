import { GameStateManager } from '../../engine/state';
import { TurnManager } from '../../engine/actions';
import { HeuristicBot } from '../../ai/heuristic-bot';
import { CardLoader } from '../../engine/card-loader';
import { ZoneType } from '../../engine/models';

describe('Optional Effects - Bot Integration', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let bot: HeuristicBot;
    let playerId: string;

    beforeEach(async () => {
        game = new GameStateManager();
        playerId = game.addPlayer('TestBot');
        turnManager = new TurnManager(game);
        bot = new HeuristicBot(turnManager);
        bot.onGameStart(playerId, game.state);
    });

    it('should handle optional draw effect with bot', async () => {
        const player = game.getPlayer(playerId);

        // Load Bobby Zimuruski card
        const loader = new CardLoader();
        await loader.loadCards();
        const bobby = loader.getAllCards().find(c => c.fullName === 'Bobby Zimuruski - Spray Cheese Kid');

        if (!bobby) {
            console.warn('Bobby Zimuruski not found, skipping test');
            return;
        }

        // Add Bobby to hand
        const bobbyInstance = player.addCardToZone(bobby, ZoneType.Hand);

        // Register with ability system
        (turnManager as any).abilitySystem.registerCard(bobbyInstance);

        // Add some ink to play Bobby
        for (let i = 0; i < bobby.cost; i++) {
            const inkCard = loader.getAllCards()[i];
            const inkInstance = player.addCardToZone(inkCard, ZoneType.Inkwell);
            inkInstance.ready = true;
        }

        // Add cards to deck so we can draw
        for (let i = 0; i < 5; i++) {
            player.addCardToZone(loader.getAllCards()[i % 10], ZoneType.Deck);
        }

        // Start game and mock choice requests to use bot
        turnManager.startGame(playerId);
        (turnManager as any).requestChoice = (request: any) => {
            return bot.respondToChoiceRequest(request);
        };

        // Play Bobby - should trigger optional ability
        const initialHandSize = player.hand.length;
        const initialDeckSize = player.deck.length;

        console.log('Before playing Bobby:');
        console.log('  Hand size:', initialHandSize);
        console.log('  Deck size:', initialDeckSize);

        // Play the card (this should trigger Bobby's ability)
        await turnManager.playCard(player, bobbyInstance.instanceId);

        console.log('After playing Bobby:');
        console.log('  Hand size:', player.hand.length);
        console.log('  Deck size:', player.deck.length);
        console.log('  Play area:', player.play.length);

        // Bot should accept optional draw (default behavior)
        // Hand size should: -1 (Bobby played) +1 (draw) -1 (discard) = -1
        // So hand should be 1 less than initial

        // Bobby should be in play
        expect(player.play.some(c => c.name === 'Bobby Zimuruski')).toBe(true);

        // If bot accepted (which it should by default):
        // Initial hand had Bobby + other cards
        // After: Lost Bobby, drew 1, discarded 1 = net -1
        // If bot declined: Lost Bobby = net -1
        // Both cases result in -1, but we can check deck changed

        // Deck should have changed if draw happened
        if (initialDeckSize > 0) {
            expect(player.deck.length).toBeLessThan(initialDeckSize);
        }
    });

    it('should handle yes/no choice requests from optional effects', () => {
        const request = {
            id: 'test-choice',
            type: 'yes_no',
            playerId: playerId,
            prompt: 'Draw a card?',
            options: [
                { id: 'yes', label: 'Yes', card: null, valid: true },
                { id: 'no', label: 'No', card: null, valid: true }
            ],
            source: { card: null, player: game.getPlayer(playerId) },
            timestamp: Date.now()
        };

        const response = bot.respondToChoiceRequest(request);

        console.log('Bot response to yes/no:', response);

        expect(response).toBeDefined();
        expect(response.selectedIds).toBeDefined();
        expect(response.selectedIds.length).toBeGreaterThan(0);

        // Bot should choose either 'yes' or 'no'
        const choice = response.selectedIds[0];
        expect(['yes', 'no']).toContain(choice);

        console.log(`Bot chose: ${choice}`);
    });
});
