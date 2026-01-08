import { TurnManager } from '../engine/actions';
import { GameStateManager } from '../engine/state';
import { CardInstance, ZoneType, CardType } from '../engine/models';

describe('Quick Wins Verification', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    let player1: string;
    let player2: string;

    beforeEach(() => {
        game = new GameStateManager();
        player1 = game.addPlayer('Player 1');
        player2 = game.addPlayer('Player 2');
        turnManager = new TurnManager(game);
        turnManager.startGame(player1);
    });

    it('should reduce damage with Resist', () => {
        const card: CardInstance = {
            instanceId: 'c1',
            ownerId: player1,
            name: 'Resist Guard',
            id: 1,
            fullName: 'Resist Guard',
            color: 'Steel',
            subtypes: [],
            abilities: [],
            cost: 1,
            inkwell: true,
            type: CardType.Character,
            zone: ZoneType.Play,
            ready: true,
            damage: 0,
            willpower: 3,
            strength: 1,
            lore: 1,
            turnPlayed: 0,
            meta: { resist: 1 } // Resist +1
        } as CardInstance;
        game.getPlayer(player1).play.push(card);

        // Deal 2 damage
        // We access private method via any cast or just use challenge/resolveEffect if possible
        // But applyDamage is private. We can use resolveEffect with 'deal_damage'
        const effect = {
            action: 'deal_damage',
            amount: 2,
            target: 'chosen_character'
        };

        // Mock payload
        const payload = { targetId: 'c1' };

        // Resolve effect
        (turnManager as any).resolveEffect(game.getPlayer(player2), effect, undefined, undefined, payload);

        expect(card.damage).toBe(1); // 2 - 1 = 1
    });

    it('should prevent questing with Reckless', async () => {
        const card: CardInstance = {
            instanceId: 'c2',
            ownerId: player1,
            name: 'Reckless Charger',
            id: 2,
            fullName: 'Reckless Charger',
            color: 'Ruby',
            subtypes: [],
            abilities: [],
            cost: 1,
            inkwell: true,
            type: CardType.Character,
            zone: ZoneType.Play,
            ready: true, // Ready
            turnPlayed: 0, // Dry
            damage: 0,
            willpower: 3,
            strength: 1,
            lore: 1,
            meta: { hasReckless: true }
        } as CardInstance;
        game.getPlayer(player1).play.push(card);

        const result = await (turnManager as any).quest(game.getPlayer(player1), 'c2');
        expect(result).toBe(false);
    });

    it('should prevent targeting with Ward', () => {
        const card: CardInstance = {
            instanceId: 'c3',
            ownerId: player1,
            name: 'Warded Scout',
            id: 3,
            fullName: 'Warded Scout',
            color: 'Amber',
            subtypes: [],
            abilities: [],
            cost: 1,
            inkwell: true,
            type: CardType.Character,
            zone: ZoneType.Play,
            ready: true,
            damage: 1,
            willpower: 3,
            strength: 1,
            lore: 1,
            turnPlayed: 0,
            meta: { hasWard: true }
        } as CardInstance;
        game.getPlayer(player1).play.push(card);

        // Opponent tries to heal it (just to test targeting)
        const effect = {
            action: 'heal',
            amount: 1,
            target: 'chosen_character'
        };
        const payload = { targetId: 'c3' };

        // Resolve effect by opponent
        (turnManager as any).resolveEffect(game.getPlayer(player2), effect, undefined, undefined, payload);

        // Should fail, damage remains 1
        expect(card.damage).toBe(1);

        // Owner tries to heal it
        (turnManager as any).resolveEffect(game.getPlayer(player1), effect, undefined, undefined, payload);

        // Should succeed, damage becomes 0
        expect(card.damage).toBe(0);
    });
});
