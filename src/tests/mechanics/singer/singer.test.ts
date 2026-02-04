
import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../../engine-test-utils';
import { CardType } from '../../../engine/models';

describe('Mechanic: Singer', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('Ariel - Spectacular Singer (Singer 5) should be able to sing a cost 5 song', async () => {
        // Setup: Ariel in play (Singer 5), 0 Ink
        await harness.setPlay(harness.p1Id, ['Ariel - Spectacular Singer']);
        harness.setInk(harness.p1Id, 0);

        const ariel = harness.game.getPlayer(harness.p1Id).play[0];
        expect(ariel.ready).toBe(true);

        // Setup: Song of cost 5 in hand
        const songName = 'Five Cost Song';
        const mockSong = {
            name: songName,
            fullName: songName,
            type: 'Action' as CardType,
            subtypes: ['Song'],
            cost: 5,
            inkwell: false,
            abilities: []
        };
        harness.setHand(harness.p1Id, [mockSong]);
        const songInstance = harness.game.getPlayer(harness.p1Id).hand[0];

        // Execute: Sing the song
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: songInstance.instanceId,
            singerIds: [ariel.instanceId]
        } as any);

        expect(result).toBe(true);
        expect(ariel.ready).toBe(false); // Exerted

        // Verify song is played (in discard)
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.hand.length).toBe(0);
        expect(p1.discard.find(c => c.instanceId === songInstance.instanceId)).toBeDefined();
    });

    it('Cinderella - Ballroom Sensation (Singer 3) should NOT be able to sing a cost 4 song', async () => {
        // Setup: Cinderella in play (Singer 3), 0 Ink
        await harness.setPlay(harness.p1Id, ['Cinderella - Ballroom Sensation']);
        harness.setInk(harness.p1Id, 0);

        const cinderella = harness.game.getPlayer(harness.p1Id).play[0];

        // Setup: Song of cost 4 in hand
        const songName = 'Four Cost Song';
        const mockSong = {
            name: songName,
            fullName: songName,
            type: 'Action' as CardType,
            subtypes: ['Song'],
            cost: 4,
            inkwell: false,
            abilities: []
        };
        harness.setHand(harness.p1Id, [mockSong]);
        const songInstance = harness.game.getPlayer(harness.p1Id).hand[0];

        // Execute: Attempt to sing
        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: songInstance.instanceId,
            singerIds: [cinderella.instanceId]
        } as any);

        expect(result).toBe(false);
        expect(cinderella.ready).toBe(true); // Still ready

        // Verify song is NOT played (still in hand)
        const p1 = harness.game.getPlayer(harness.p1Id);
        expect(p1.hand.length).toBe(1);
    });

    it('Should exert the singer when singing', async () => {
        // Setup: Ariel in play (Singer 5)
        await harness.setPlay(harness.p1Id, ['Ariel - Spectacular Singer']);
        const ariel = harness.game.getPlayer(harness.p1Id).play[0];

        // Setup: Song of cost 1
        const songName = 'One Cost Song';
        const mockSong = {
            name: songName,
            fullName: songName,
            type: 'Action' as CardType,
            subtypes: ['Song'],
            cost: 1,
            inkwell: false,
            abilities: []
        };
        harness.setHand(harness.p1Id, [mockSong]);
        const songInstance = harness.game.getPlayer(harness.p1Id).hand[0];

        const result = await harness.turnManager.resolveAction({
            type: 'PlayCard' as any,
            playerId: harness.p1Id,
            cardId: songInstance.instanceId,
            singerIds: [ariel.instanceId]
        } as any);

        expect(result).toBe(true);
        expect(ariel.ready).toBe(false);
    });
});
