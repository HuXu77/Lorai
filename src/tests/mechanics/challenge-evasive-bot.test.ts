import { TurnManager } from '../../engine/actions';
import { PlayerState } from '../../engine/state';
import { CardType, ZoneType, ActionType, GameState } from '../../engine/models';
import { getValidActions } from '../../engine/ai/valid-actions';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Bot Evasive Challenge Loop', () => {
    let gameState: GameState;
    let turnManager: TurnManager;
    let botPlayer: PlayerState;
    let opponentPlayer: PlayerState;

    beforeEach(() => {
        // Setup minimal game state
        botPlayer = {
            id: 'player-bot',
            name: 'Bot',
            deck: [],
            hand: [],
            discard: [],
            play: [],
            inkwell: [],
            lore: 0,
            loreGoal: 20,
            ready: true
        } as any;

        opponentPlayer = {
            id: 'player-human',
            name: 'Human',
            deck: [],
            hand: [],
            discard: [],
            play: [],
            inkwell: [],
            lore: 0,
            loreGoal: 20,
            ready: true
        } as any;

        gameState = {
            players: {
                [botPlayer.id]: botPlayer,
                [opponentPlayer.id]: opponentPlayer
            },
            turnPlayerId: botPlayer.id,
            activePlayerId: botPlayer.id,
            turnCount: 1,
            phase: 'main',
            activeEffects: []
        } as any;

        turnManager = new TurnManager(gameState);
        // Mock ability system if needed, or rely on defaults
        (turnManager as any).game = {
            state: gameState,
            getPlayer: (id: string) => gameState.players[id],
            getOpponent: (id: string) => id === botPlayer.id ? opponentPlayer : botPlayer
        };
    });

    it('should NOT generate challenge action against Evasive character if attacker lacks Evasive', () => {
        // Setup Attacker (Non-Evasive)
        const attacker = {
            instanceId: 'attacker-1',
            name: 'Captain Hook - Forceful Duelist',
            title: 'Forceful Duelist',
            cost: 1,
            type: CardType.Character,
            ready: true, // Ready to challenge
            turnPlayed: 0, // Dry
            strength: 1,
            willpower: 2,
            keywords: ['Challenger +2'], // NOT Evasive
            ownerId: botPlayer.id,
            zone: ZoneType.Play
        };
        botPlayer.play.push(attacker as any);

        // Setup Defender (Evasive)
        const defender = {
            instanceId: 'defender-1',
            name: 'Pongo - Ol Rascal',
            title: 'Ol Rascal',
            cost: 4,
            type: CardType.Character,
            ready: false, // Exerted (valid target for normal challenge)
            strength: 2,
            willpower: 3,
            keywords: ['Evasive'], // HAS Evasive
            ownerId: opponentPlayer.id,
            zone: ZoneType.Play,
            exerted: true
        };
        opponentPlayer.play.push(defender as any);

        // Get Valid Actions
        const actions = getValidActions(turnManager, botPlayer.id);

        // Filter for Challenge actions
        const challengeActions = actions.filter(a => a.type === ActionType.Challenge);
        // Note: ActionType enum might be string 'challenge'. Checking valid-actions.ts for exact string.

        // valid-actions.ts uses ActionType.Challenge. Let's assume it matches 'challenge'.

        // Expect NO challenge actions targeting the evasive character
        const invalidChallenge = challengeActions.find(a => a.targetId === defender.instanceId);

        expect(invalidChallenge).toBeUndefined();
    });

    it('should NOT generate challenge action if Defender has "Evasive" (case insensitive/dirty)', () => {
        // Setup Attacker
        const attacker = {
            instanceId: 'attacker-2',
            name: 'Simba',
            type: CardType.Character,
            ready: true,
            turnPlayed: 0,
            keywords: [],
            ownerId: botPlayer.id,
            zone: ZoneType.Play
        };
        botPlayer.play.push(attacker as any);

        // Setup Defender with weird casing or whitespace
        const defender = {
            instanceId: 'defender-2',
            name: 'Goofy - Daredevil',
            type: CardType.Character,
            ready: false,
            keywords: ['evasive'], // Lowercase
            ownerId: opponentPlayer.id,
            zone: ZoneType.Play,
            exerted: true
        };
        opponentPlayer.play.push(defender as any);

        const actions = getValidActions(turnManager, botPlayer.id);
        const invalidChallenge = actions.find(a => a.targetId === defender.instanceId && a.type === ActionType.Challenge);

        expect(invalidChallenge).toBeUndefined();
    });
});
