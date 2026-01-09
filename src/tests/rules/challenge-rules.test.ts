import { TurnManager } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { AbilitySystemManager } from '../../engine/abilities/ability-system';
import { ActionType, ZoneType } from '../../engine/models';
import { CardType } from '../../engine/models';

describe('Challenge Rules', () => {
    let turnManager: TurnManager;
    let game: GameStateManager;

    beforeEach(() => {
        game = new GameStateManager();
        turnManager = new TurnManager(game);

        // Setup two players
        game.addPlayer('player1', 'Player 1');
        game.addPlayer('player2', 'Player 2');
    });

    describe('Valid Challenge Targets', () => {
        test('should only allow challenging exerted characters, not items', () => {
            const player1 = game.getPlayer('player1');
            const player2 = game.getPlayer('player2');

            // Player 1 has a ready character
            const attacker = player1.addCardToZone({
                id: 1,
                name: 'Attacker',
                type: 'Character' as CardType,
                cost: 3,
                strength: 3,
                willpower: 3,
                lore: 1,
                inkwell: false,
                color: 'Amber',
                subtypes: [],
                rarity: 'Common'
            } as any, ZoneType.Play);
            attacker.ready = true;
            attacker.turnPlayed = 0; // Dry (can challenge)

            // Player 2 has an exerted ITEM
            const item = player2.addCardToZone({
                id: 2,
                name: 'Emerald Chromicon',
                type: 'Item' as CardType,
                cost: 2,
                inkwell: false,
                color: 'Emerald',
                subtypes: [],
                rarity: 'Rare'
            } as any, ZoneType.Play);
            item.ready = false; // Exerted

            // Player 2 also has an exerted CHARACTER
            const character = player2.addCardToZone({
                id: 3,
                name: 'Defender',
                type: 'Character' as CardType,
                cost: 2,
                strength: 2,
                willpower: 2,
                lore: 1,
                inkwell: false,
                color: 'Steel',
                subtypes: [],
                rarity: 'Common'
            } as any, ZoneType.Play);
            character.ready = false; // Exerted

            game.state.turnCount = 1;
            game.state.turnPlayerId = 'player1';

            // Get valid actions
            const actions = turnManager.getValidActions('player1');
            const challengeActions = actions.filter(a => a.type === ActionType.Challenge);

            // Should have exactly 1 challenge action (against the character, not the item)
            expect(challengeActions).toHaveLength(1);
            expect(challengeActions[0].targetId).toBe(character.instanceId);
            expect(challengeActions[0].targetId).not.toBe(item.instanceId);
        });

        test('should allow challenging locations', () => {
            const player1 = game.getPlayer('player1');
            const player2 = game.getPlayer('player2');

            // Player 1 has a ready character
            const attacker = player1.addCardToZone({
                id: 1,
                name: 'Attacker',
                type: 'Character' as CardType,
                cost: 3,
                strength: 3,
                willpower: 3,
                lore: 1,
                inkwell: false,
                color: 'Amber',
                subtypes: [],
                rarity: 'Common'
            } as any, ZoneType.Play);
            attacker.ready = true;
            attacker.turnPlayed = 0;

            // Player 2 has an exerted LOCATION
            const location = player2.addCardToZone({
                id: 2,
                name: 'The Great Illuminary',
                type: 'Location' as CardType,
                cost: 4,
                inkwell: false,
                color: 'Amber',
                subtypes: [],
                rarity: 'Rare',
                willpower: 5,
                moveCost: 2
            } as any, ZoneType.Play);
            location.ready = false; // Exerted

            game.state.turnCount = 1;
            game.state.turnPlayerId = 'player1';

            // Get valid actions
            const actions = turnManager.getValidActions('player1');
            const challengeActions = actions.filter(a => a.type === ActionType.Challenge);

            // Should have exactly 1 challenge action (against the location)
            expect(challengeActions).toHaveLength(1);
            expect(challengeActions[0].targetId).toBe(location.instanceId);
        });

        test('should allow challenging exerted characters only', () => {
            const player1 = game.getPlayer('player1');
            const player2 = game.getPlayer('player2');

            // Player 1 has a ready character
            const attacker = player1.addCardToZone({
                id: 1,
                name: 'Attacker',
                type: 'Character' as CardType,
                cost: 3,
                strength: 3,
                willpower: 3,
                lore: 1,
                inkwell: false,
                color: 'Amber',
                subtypes: [],
                rarity: 'Common'
            } as any, ZoneType.Play);
            attacker.ready = true;
            attacker.turnPlayed = 0;

            // Player 2 has a READY character (can't be challenged)
            const readyCharacter = player2.addCardToZone({
                id: 2,
                name: 'Ready Character',
                type: 'Character' as CardType,
                cost: 2,
                strength: 2,
                willpower: 2,
                lore: 1,
                inkwell: false,
                color: 'Steel',
                subtypes: [],
                rarity: 'Common'
            } as any, ZoneType.Play);
            readyCharacter.ready = true; // Ready

            // Player 2 has an EXERTED character (can be challenged)
            const exertedCharacter = player2.addCardToZone({
                id: 3,
                name: 'Exerted Character',
                type: 'Character' as CardType,
                cost: 2,
                strength: 2,
                willpower: 2,
                lore: 1,
                inkwell: false,
                color: 'Ruby',
                subtypes: [],
                rarity: 'Common'
            } as any, ZoneType.Play);
            exertedCharacter.ready = false; // Exerted

            game.state.turnCount = 1;
            game.state.turnPlayerId = 'player1';

            // Get valid actions
            const actions = turnManager.getValidActions('player1');
            const challengeActions = actions.filter(a => a.type === ActionType.Challenge);

            // Should have exactly 1 challenge action (against exerted character only)
            expect(challengeActions).toHaveLength(1);
            expect(challengeActions[0].targetId).toBe(exertedCharacter.instanceId);
            expect(challengeActions[0].targetId).not.toBe(readyCharacter.instanceId);
        });

        test('should not allow challenging items even if they have willpower', () => {
            const player1 = game.getPlayer('player1');
            const player2 = game.getPlayer('player2');

            // Player 1 has a ready character
            const attacker = player1.addCardToZone({
                id: 1,
                name: 'Attacker',
                type: 'Character' as CardType,
                cost: 3,
                strength: 3,
                willpower: 3,
                lore: 1,
                inkwell: false,
                color: 'Amber',
                subtypes: [],
                rarity: 'Common'
            } as any, ZoneType.Play);
            attacker.ready = true;
            attacker.turnPlayed = 0;

            // Player 2 has an exerted item with willpower (like some items have)
            const item = player2.addCardToZone({
                id: 2,
                name: 'Item With Willpower',
                type: 'Item' as CardType,
                cost: 2,
                willpower: 4, // Some items have willpower
                inkwell: false,
                color: 'Emerald',
                subtypes: [],
                rarity: 'Rare'
            } as any, ZoneType.Play);
            item.ready = false; // Exerted

            game.state.turnCount = 1;
            game.state.turnPlayerId = 'player1';

            // Get valid actions
            const actions = turnManager.getValidActions('player1');
            const challengeActions = actions.filter(a => a.type === ActionType.Challenge);

            // Should have NO challenge actions (items can't be challenged regardless of willpower)
            expect(challengeActions).toHaveLength(0);
        });
    });

    describe('Challenge Execution', () => {
        test('should fail to execute challenge against an item', async () => {
            const player1 = game.getPlayer('player1');
            const player2 = game.getPlayer('player2');

            // Player 1 has a ready character
            const attacker = player1.addCardToZone({
                id: 1,
                name: 'Attacker',
                type: 'Character' as CardType,
                cost: 3,
                strength: 3,
                willpower: 3,
                lore: 1,
                inkwell: false,
                color: 'Amber',
                subtypes: [],
                rarity: 'Common'
            } as any, ZoneType.Play);
            attacker.ready = true;
            attacker.turnPlayed = 0;

            // Player 2 has an item
            const item = player2.addCardToZone({
                id: 2,
                name: 'Item',
                type: 'Item' as CardType,
                cost: 2,
                inkwell: false,
                color: 'Emerald',
                subtypes: [],
                rarity: 'Rare'
            } as any, ZoneType.Play);
            item.ready = false;

            game.state.turnCount = 1;
            game.state.turnPlayerId = 'player1';

            // Attempt to challenge the item (should fail validation)
            const result = await turnManager.challenge(player1, attacker.instanceId, item.instanceId);

            // Should return false (invalid challenge)
            expect(result).toBe(false);

            // Item should still be in play
            expect(player2.play).toContain(item);

            // Attacker should still be ready (challenge didn't happen)
            expect(attacker.ready).toBe(true);
        });

        test('should successfully execute challenge against a location', async () => {
            const player1 = game.getPlayer('player1');
            const player2 = game.getPlayer('player2');

            // Player 1 has a ready character
            const attacker = player1.addCardToZone({
                id: 1,
                name: 'Attacker',
                type: 'Character' as CardType,
                cost: 3,
                strength: 3,
                willpower: 3,
                lore: 1,
                inkwell: false,
                color: 'Amber',
                subtypes: [],
                rarity: 'Common'
            } as any, ZoneType.Play);
            attacker.ready = true;
            attacker.turnPlayed = 0;

            // Player 2 has a location
            const location = player2.addCardToZone({
                id: 2,
                name: 'Location',
                type: 'Location' as CardType,
                cost: 4,
                inkwell: false,
                color: 'Emerald',
                subtypes: [],
                rarity: 'Rare',
                willpower: 5,
                moveCost: 2
            } as any, ZoneType.Play);
            location.ready = false;

            game.state.turnCount = 1;
            game.state.turnPlayerId = 'player1';

            // Attempt to challenge the location (should succeed)
            const result = await turnManager.challenge(player1, attacker.instanceId, location.instanceId);

            // Should return true (valid challenge)
            expect(result).toBe(true);

            // Location should still be in play (5 willpower - 3 damage = 2 remaining)
            expect(player2.play).toContain(location);
            expect(location.damage).toBe(3);

            // Attacker should be exerted
            expect(attacker.ready).toBe(false);
        });
    });
});
