/**
 * Integration Test: Keyword Abilities
 * 
 * Tests Bodyguard, Resist, Support, and other keyword mechanics
 */

import { SharedTestFixture } from '../../test-fixtures';
import { CardType, ZoneType } from '../../../engine/models';

describe('Keyword Abilities Integration', () => {
    let fixture: any;

    beforeAll(async () => {
        fixture = await SharedTestFixture.getInstance();
    });

    describe('Bodyguard Keyword', () => {
        it('should force challenge to target exerted Bodyguard character', async () => {
            const { game, turnManager, p1Id, p2Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            const player2 = game.state.players[p2Id];

            // Setup: Attacker for player 1
            const attacker = {
                instanceId: 'attacker-1',
                name: 'Attacker',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p1Id,
                strength: 3,
                willpower: 3,
                ready: true,
                turnPlayed: 0
            } as any;
            player1.play.push(attacker);

            // Setup: Exerted Bodyguard for opponent
            const bodyguard = {
                instanceId: 'bodyguard-1',
                name: 'Bodyguard Character',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p2Id,
                strength: 2,
                willpower: 4,
                ready: false, // Exerted
                parsedEffects: [{ action: 'keyword_bodyguard' }]
            } as any;
            player2.play.push(bodyguard);

            // Setup: Non-bodyguard target
            const normalTarget = {
                instanceId: 'target-1',
                name: 'Normal Character',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p2Id,
                strength: 1,
                willpower: 2,
                ready: false // Exerted (valid challenge target)
            } as any;
            player2.play.push(normalTarget);
            game.state.turnCount = 1;

            // Attempt to challenge the non-bodyguard
            const result = await turnManager.challenge(player1, 'attacker-1', 'target-1');

            // Should fail - must challenge bodyguard
            expect(result).toBe(false);
        });

        it('should allow challenging bodyguard when present', async () => {
            const { game, turnManager, p1Id, p2Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            const player2 = game.state.players[p2Id];

            // Setup: Attacker
            const attacker = {
                instanceId: 'attacker-2',
                name: 'Attacker',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p1Id,
                strength: 5,
                willpower: 3,
                ready: true,
                turnPlayed: 0
            } as any;
            player1.play.push(attacker);

            // Setup: Exerted Bodyguard
            const bodyguard = {
                instanceId: 'bodyguard-2',
                name: 'Bodyguard',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p2Id,
                strength: 2,
                willpower: 3,
                ready: false,
                damage: 0,
                parsedEffects: [{ action: 'keyword_bodyguard' }]
            } as any;
            player2.play.push(bodyguard);
            game.state.turnCount = 1;

            // Challenge the bodyguard
            const result = await turnManager.challenge(player1, 'attacker-2', 'bodyguard-2');

            // Should succeed - challenge was allowed
            expect(result).toBe(true);
            // Attacker should be exerted after challenge
            expect(attacker.ready).toBe(false);
        });
    });

    describe('Resist Keyword', () => {
        it('should reduce damage taken by resist amount', async () => {
            const { game, turnManager, p1Id, p2Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            const player2 = game.state.players[p2Id];

            // Setup: Character with Resist +2
            const resistChar = {
                instanceId: 'resist-1',
                name: 'Resist Character',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p2Id,
                strength: 2,
                willpower: 5,
                damage: 0,
                ready: false,
                meta: { resist: 2 }
            } as any;
            player2.play.push(resistChar);

            // Setup: Attacker with 4 strength
            const attacker = {
                instanceId: 'attacker-3',
                name: 'Strong Attacker',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p1Id,
                strength: 4,
                willpower: 3,
                ready: true,
                turnPlayed: 0
            } as any;
            player1.play.push(attacker);
            game.state.turnCount = 1;

            // Challenge the resist character
            await turnManager.challenge(player1, 'attacker-3', 'resist-1');

            // Should take 4 - 2 = 2 damage (resist reduces by 2)
            expect(resistChar.damage).toBe(2);
        });

        it('should prevent all damage if resist >= attack', async () => {
            const { game, turnManager, p1Id, p2Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            const player2 = game.state.players[p2Id];

            // Setup: Character with high Resist
            const highResist = {
                instanceId: 'resist-2',
                name: 'High Resist',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p2Id,
                strength: 1,
                willpower: 5,
                damage: 0,
                ready: false,
                meta: { resist: 5 }
            } as any;
            player2.play.push(highResist);

            // Setup: Weak attacker
            const attacker = {
                instanceId: 'attacker-4',
                name: 'Weak Attacker',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p1Id,
                strength: 2,
                willpower: 3,
                ready: true,
                turnPlayed: 0
            } as any;
            player1.play.push(attacker);
            game.state.turnCount = 1;

            await turnManager.challenge(player1, 'attacker-4', 'resist-2');

            // 2 - 5 = 0 damage (can't go negative)
            expect(highResist.damage).toBe(0);
        });
    });

    describe('Support Keyword', () => {
        it('should add strength to another character when questing', async () => {
            const { game, turnManager, p1Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];

            // Setup: Support character
            const supportChar = {
                instanceId: 'support-1',
                name: 'Support Character',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p1Id,
                strength: 3,
                willpower: 2,
                lore: 1,
                ready: true,
                turnPlayed: 0,
                parsedEffects: [{ action: 'keyword_support' }]
            } as any;
            player1.play.push(supportChar);

            // Setup: Target character for support
            const targetChar = {
                instanceId: 'target-support-1',
                name: 'Target Character',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p1Id,
                strength: 2,
                willpower: 3,
                ready: true,
                turnPlayed: 0
            } as any;
            player1.play.push(targetChar);
            game.state.turnCount = 1;

            const originalStrength = targetChar.strength;

            // Quest with support character
            await turnManager.quest(player1, 'support-1');

            // Target should have gained support character's strength
            expect(targetChar.strength).toBe(originalStrength + 3);
        });
    });

    describe('Evasive Keyword', () => {
        it('should prevent non-evasive characters from challenging', async () => {
            const { game, turnManager, p1Id, p2Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            const player2 = game.state.players[p2Id];

            // Setup: Non-evasive attacker
            const attacker = {
                instanceId: 'normal-attacker',
                name: 'Normal Attacker',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p1Id,
                strength: 4,
                willpower: 3,
                ready: true,
                turnPlayed: 0
            } as any;
            player1.play.push(attacker);

            // Setup: Evasive target
            const evasiveTarget = {
                instanceId: 'evasive-1',
                name: 'Evasive Character',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p2Id,
                strength: 1,
                willpower: 2,
                ready: false,
                parsedEffects: [{ action: 'keyword_evasive' }]
            } as any;
            player2.play.push(evasiveTarget);
            game.state.turnCount = 1;

            // Attempt to challenge evasive character
            const result = await turnManager.challenge(player1, 'normal-attacker', 'evasive-1');

            // Should fail - need evasive to challenge evasive
            expect(result).toBe(false);
        });

        it('should allow evasive characters to challenge evasive', async () => {
            const { game, turnManager, p1Id, p2Id } = fixture.createCleanGameState();
            const player1 = game.state.players[p1Id];
            const player2 = game.state.players[p2Id];

            // Setup: Evasive attacker
            const evasiveAttacker = {
                instanceId: 'evasive-attacker',
                name: 'Evasive Attacker',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p1Id,
                strength: 3,
                willpower: 3,
                ready: true,
                turnPlayed: 0,
                parsedEffects: [{ action: 'keyword_evasive' }]
            } as any;
            player1.play.push(evasiveAttacker);

            // Setup: Evasive target
            const evasiveTarget = {
                instanceId: 'evasive-target',
                name: 'Evasive Target',
                type: CardType.Character,
                zone: ZoneType.Play,
                ownerId: p2Id,
                strength: 2,
                willpower: 3,
                damage: 0,
                ready: false,
                parsedEffects: [{ action: 'keyword_evasive' }]
            } as any;
            player2.play.push(evasiveTarget);
            game.state.turnCount = 1;

            // Challenge should succeed
            const result = await turnManager.challenge(player1, 'evasive-attacker', 'evasive-target');

            expect(result).toBe(true);
            // Attacker should be exerted
            expect(evasiveAttacker.ready).toBe(false);
        });
    });
});
