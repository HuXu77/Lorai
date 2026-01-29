import { TurnManager, Phase } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { GameLogger } from '../../engine/logger';
import { AbilitySystemManager } from '../../engine/abilities/ability-system';
import { CardInstance, ZoneType } from '../../engine/models';
import { executePlayCard } from '../../engine/game-actions/play-card-action';

describe('Card Play - Hand Removal Bug Reproduction', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let player: any;

    beforeEach(() => {
        game = new GameStateManager();
        player = game.getPlayer(game.addPlayer('player1', 'Player'));
        turnManager = new TurnManager(game, new GameLogger());
        (turnManager as any).eventBus = { emit: vi.fn() }; // Mock eventBus
        turnManager.abilitySystem = new AbilitySystemManager(turnManager);

        // Set phase to Main
        game.state.phase = Phase.Main;
        game.state.turnPlayerId = player.id;
    });

    const createCard = (id: string, name: string, cost: number, type: string = 'Character'): CardInstance => ({
        instanceId: id,
        id: 1,
        number: 1,
        setCode: 'TST',
        name,
        fullName: name,
        cost,
        type,
        color: 'Amber',
        inkwell: true,
        subtypes: [],
        ownerId: player.id,
        zone: ZoneType.Hand,
        ready: true,
        lore: 1,
        strength: 1,
        willpower: 1,
        damage: 0,
        turnPlayed: 0,
        meta: {},
        abilities: [],
        parsedEffects: []
    } as any);

    it('should remove card from hand when played', async () => {
        // 1. Setup Card to Play
        const cardToPlay = createCard('card-to-play', 'Mickey Mouse', 2);
        player.hand = [cardToPlay];

        // 2. Setup Inkwell
        for (let i = 0; i < 3; i++) {
            const ink = createCard(`ink-${i}`, `Ink ${i}`, 1);
            ink.zone = ZoneType.Inkwell;
            ink.ready = true;
            player.inkwell.push(ink);
        }

        const initialHandSize = player.hand.length;
        const initialReadyInk = player.inkwell.filter((c: any) => c.ready).length;

        // 3. Play the card
        const result = await executePlayCard(
            turnManager,
            player,
            cardToPlay.instanceId
        );

        // 4. Verify Success
        expect(result).toBe(true);

        // 5. Verify Ink Consumption
        const finalReadyInk = player.inkwell.filter((c: any) => c.ready).length;
        expect(finalReadyInk).toBe(initialReadyInk - cardToPlay.cost);

        // 6. Verify Card Removal from Hand --- THIS IS THE KEY CHECK
        const cardInHand = player.hand.find((c: any) => c.instanceId === cardToPlay.instanceId);
        expect(cardInHand).toBeUndefined();
        expect(player.hand.length).toBe(initialHandSize - 1);

        // 7. Verify Card is in Play
        const cardInPlay = player.play.find((c: any) => c.instanceId === cardToPlay.instanceId);
        expect(cardInPlay).toBeDefined();
        expect(cardInPlay?.zone).toBe(ZoneType.Play);
    });

    it('should remove action card from hand when played', async () => {
        // 1. Setup Action Card
        const actionCard = createCard('action-card', 'Dragon Fire', 2, 'Action');
        player.hand = [actionCard];

        // 2. Setup Inkwell
        for (let i = 0; i < 3; i++) {
            const ink = createCard(`ink-${i}`, `Ink ${i}`, 1);
            ink.zone = ZoneType.Inkwell;
            ink.ready = true;
            player.inkwell.push(ink);
        }

        const initialHandSize = player.hand.length;

        // 3. Play the action
        const result = await executePlayCard(
            turnManager,
            player,
            actionCard.instanceId
        );

        expect(result).toBe(true);

        // 4. Verify Card Removal from Hand
        const cardInHand = player.hand.find((c: any) => c.instanceId === actionCard.instanceId);
        expect(cardInHand).toBeUndefined();
        expect(player.hand.length).toBe(initialHandSize - 1);

        // 5. Verify Card is in Discard
        const cardInDiscard = player.discard.find((c: any) => c.instanceId === actionCard.instanceId);
        expect(cardInDiscard).toBeDefined();
        expect(cardInDiscard?.zone).toBe(ZoneType.Discard);
    });
});
