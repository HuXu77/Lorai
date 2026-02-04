import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';
import { CardType } from '../../../engine/models';

describe('Mechanic: Sing Together', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should allow multiple characters to sing together when combined cost meets requirement', async () => {
        // Setup: P1 has two characters (cost 3 and cost 4) in play
        await harness.setPlay(harness.p1Id, [
            'Elsa - Queen Regent', // Cost 4
            'Elsa - Snow Queen'    // Cost 3
        ]);
        harness.setInk(harness.p1Id, 0); // No ink needed for Sing Together

        const p1 = harness.game.getPlayer(harness.p1Id);
        const elsa1 = p1.play[0]; // Cost 4
        const elsa2 = p1.play[1]; // Cost 3
        elsa1.ready = true;
        elsa2.ready = true;

        // Setup: Sing Together 7 song in hand
        const songName = 'Sing Together 7 Song';
        const mockSong = {
            name: songName,
            fullName: songName,
            type: 'Action' as CardType,
            subtypes: ['Song'],
            cost: 10, // High cost, but Sing Together makes it free
            inkwell: false,
            abilities: [],
            parsedEffects: [
                {
                    type: 'static',
                    keyword: 'sing_together',
                    amount: 7 // Requires combined cost of 7
                }
            ]
        };
        harness.setHand(harness.p1Id, [mockSong]);
        const songInstance = harness.game.getPlayer(harness.p1Id).hand[0];

        // Execute: Sing the song with both characters (3 + 4 = 7, meets requirement)
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: songInstance.instanceId,
            singerIds: [elsa1.instanceId, elsa2.instanceId]
        } as any);

        expect(result).toBe(true);

        // Verify: Both characters are exerted
        const p1After = harness.game.getPlayer(harness.p1Id);
        const elsa1After = p1After.play.find(c => c.instanceId === elsa1.instanceId);
        const elsa2After = p1After.play.find(c => c.instanceId === elsa2.instanceId);
        expect(elsa1After?.ready).toBe(false);
        expect(elsa2After?.ready).toBe(false);

        // Verify: Song is played (in discard)
        expect(p1After.hand.length).toBe(0);
        expect(p1After.discard.find(c => c.instanceId === songInstance.instanceId)).toBeDefined();
    });

    it('should NOT allow Sing Together when combined cost is insufficient', async () => {
        // Setup: P1 has two low-cost characters (cost 2 and cost 3)
        await harness.setPlay(harness.p1Id, [
            'Archimedes - Highly Educated Owl', // Cost 1
            'Elsa - Snow Queen'                  // Cost 3
        ]);
        harness.setInk(harness.p1Id, 0);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const archimedes = p1.play[0]; // Cost 1
        const elsa = p1.play[1];       // Cost 3
        archimedes.ready = true;
        elsa.ready = true;

        // Setup: Sing Together 7 song in hand
        const songName = 'Sing Together 7 Song';
        const mockSong = {
            name: songName,
            fullName: songName,
            type: 'Action' as CardType,
            subtypes: ['Song'],
            cost: 10,
            inkwell: false,
            abilities: [],
            parsedEffects: [
                {
                    type: 'static',
                    keyword: 'sing_together',
                    amount: 7 // Requires combined cost of 7
                }
            ]
        };
        harness.setHand(harness.p1Id, [mockSong]);
        const songInstance = harness.game.getPlayer(harness.p1Id).hand[0];

        // Execute: Attempt to sing (1 + 3 = 4, does NOT meet requirement of 7)
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: songInstance.instanceId,
            singerIds: [archimedes.instanceId, elsa.instanceId]
        } as any);

        expect(result).toBe(false);

        // Verify: Characters are still ready
        const p1After = harness.game.getPlayer(harness.p1Id);
        const archimedesAfter = p1After.play.find(c => c.instanceId === archimedes.instanceId);
        const elsaAfter = p1After.play.find(c => c.instanceId === elsa.instanceId);
        expect(archimedesAfter?.ready).toBe(true);
        expect(elsaAfter?.ready).toBe(true);

        // Verify: Song is still in hand
        expect(p1After.hand.length).toBe(1);
    });

    it('should allow 3+ characters to sing together', async () => {
        // Setup: P1 has three characters (cost 2, 2, 3)
        await harness.setPlay(harness.p1Id, [
            'Dr. Facilier - Charlatan',  // Cost 2
            'Elsa - Snow Queen',          // Cost 3
            'Archimedes - Highly Educated Owl' // Cost 1
        ]);
        harness.setInk(harness.p1Id, 0);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const facilier = p1.play[0]; // Cost 2
        const elsa = p1.play[1];     // Cost 3
        const archimedes = p1.play[2]; // Cost 1
        facilier.ready = true;
        elsa.ready = true;
        archimedes.ready = true;

        // Setup: Sing Together 6 song in hand
        const songName = 'Sing Together 6 Song';
        const mockSong = {
            name: songName,
            fullName: songName,
            type: 'Action' as CardType,
            subtypes: ['Song'],
            cost: 8,
            inkwell: false,
            abilities: [],
            parsedEffects: [
                {
                    type: 'static',
                    keyword: 'sing_together',
                    amount: 6
                }
            ]
        };
        harness.setHand(harness.p1Id, [mockSong]);
        const songInstance = harness.game.getPlayer(harness.p1Id).hand[0];

        // Execute: Sing with all three (2 + 3 + 1 = 6, meets requirement)
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: songInstance.instanceId,
            singerIds: [facilier.instanceId, elsa.instanceId, archimedes.instanceId]
        } as any);

        expect(result).toBe(true);

        // Verify: All three characters are exerted
        const p1After = harness.game.getPlayer(harness.p1Id);
        const facilierAfter = p1After.play.find(c => c.instanceId === facilier.instanceId);
        const elsaAfter = p1After.play.find(c => c.instanceId === elsa.instanceId);
        const archimedesAfter = p1After.play.find(c => c.instanceId === archimedes.instanceId);
        expect(facilierAfter?.ready).toBe(false);
        expect(elsaAfter?.ready).toBe(false);
        expect(archimedesAfter?.ready).toBe(false);

        // Verify: Song is played
        expect(p1After.hand.length).toBe(0);
        expect(p1After.discard.find(c => c.instanceId === songInstance.instanceId)).toBeDefined();
    });

    it('should NOT allow Sing Together with exerted characters', async () => {
        // Setup: P1 has two characters, one is exerted
        await harness.setPlay(harness.p1Id, [
            'Elsa - Queen Regent', // Cost 4
            'Elsa - Snow Queen'    // Cost 3
        ]);
        harness.setInk(harness.p1Id, 0);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const elsa1 = p1.play[0];
        const elsa2 = p1.play[1];
        elsa1.ready = true;
        elsa2.ready = false; // Exerted!

        // Setup: Sing Together 7 song
        const songName = 'Sing Together 7 Song';
        const mockSong = {
            name: songName,
            fullName: songName,
            type: 'Action' as CardType,
            subtypes: ['Song'],
            cost: 10,
            inkwell: false,
            abilities: [],
            parsedEffects: [
                {
                    type: 'static',
                    keyword: 'sing_together',
                    amount: 7
                }
            ]
        };
        harness.setHand(harness.p1Id, [mockSong]);
        const songInstance = harness.game.getPlayer(harness.p1Id).hand[0];

        // Execute: Attempt to sing with exerted character
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: songInstance.instanceId,
            singerIds: [elsa1.instanceId, elsa2.instanceId]
        } as any);

        expect(result).toBe(false);

        // Verify: Song is still in hand
        const p1After = harness.game.getPlayer(harness.p1Id);
        expect(p1After.hand.length).toBe(1);
    });

    it('should use Singer value instead of cost when higher', async () => {
        // Setup: P1 has Ariel (Singer 5, cost 4) and low-cost character
        await harness.setPlay(harness.p1Id, [
            'Ariel - Spectacular Singer', // Singer 5, cost 4
            'Elsa - Snow Queen'            // Cost 3
        ]);

        harness.setInk(harness.p1Id, 0);

        const p1 = harness.game.getPlayer(harness.p1Id);
        const ariel = p1.play[0]; // Singer 5
        const elsa = p1.play[1];  // Cost 3
        ariel.ready = true;
        elsa.ready = true;

        // Setup: Sing Together 8 song
        const songName = 'Sing Together 8 Song';
        const mockSong = {
            name: songName,
            fullName: songName,
            type: 'Action' as CardType,
            subtypes: ['Song'],
            cost: 12,
            inkwell: false,
            abilities: [],
            parsedEffects: [
                {
                    type: 'static',
                    keyword: 'sing_together',
                    amount: 8
                }
            ]
        };
        harness.setHand(harness.p1Id, [mockSong]);
        const songInstance = harness.game.getPlayer(harness.p1Id).hand[0];

        // Execute: Sing together (Singer 5 + Cost 3 = 8, meets requirement)
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: songInstance.instanceId,
            singerIds: [ariel.instanceId, elsa.instanceId]
        } as any);

        expect(result).toBe(true);

        // Verify: Both exerted
        const p1After = harness.game.getPlayer(harness.p1Id);
        const arielAfter = p1After.play.find(c => c.instanceId === ariel.instanceId);
        const elsaAfter = p1After.play.find(c => c.instanceId === elsa.instanceId);
        expect(arielAfter?.ready).toBe(false);
        expect(elsaAfter?.ready).toBe(false);

        // Verify: Song played
        expect(p1After.hand.length).toBe(0);
        expect(p1After.discard.find(c => c.instanceId === songInstance.instanceId)).toBeDefined();
    });
});
