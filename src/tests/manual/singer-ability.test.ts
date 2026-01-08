
import { describe, it, expect, beforeEach } from '@jest/globals';
import { TestHarness } from '../engine-test-utils';
import { ActionType } from '../../engine/actions';

describe('Singer Ability - Cinderella Sings Song', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should allow Cinderella with Singer 3 to sing a song', async () => {
        const player = harness.getPlayer(harness.p1Id);

        // 1. Setup: Cinderella in play (Singer 3, cost 1), song in hand
        harness.setPlay(player.id, [{
            id: 219,
            name: 'Cinderella',
            fullName: 'Cinderella - Ballroom Sensation',
            fullText: 'Singer 3 (This character counts as cost 3 to sing songs.)',
            cost: 1,
            type: 'Character',
            strength: 1,
            willpower: 2,
            lore: 1,
            subtypes: ['Storyborn', 'Hero', 'Princess'],
            keywordAbilities: ['Singer'],
            abilities: [{
                type: 'static',
                name: 'Singer 3',
                fullText: 'Singer 3 (This character counts as cost 3 to sing songs.)',
                effect: 'Singer 3'
            }],
            ready: true,
            playedTurn: -1
        }]);

        // Add song to hand
        player.hand.push({
            instanceId: 'song-1',
            id: 417,
            name: 'Strength of a Raging Fire',
            fullName: 'Strength of a Raging Fire',
            cost: 3,
            type: 'Action',
            subtypes: ['Song'],
            ownerId: player.id,
            zone: 'hand' as any
        } as any);

        const cinderella = player.play[0];
        const song = player.hand[0];

        // 2. Get valid actions - should include SingSong
        const validActions = harness.turnManager.getValidActions(player.id);

        const singSongActions = validActions.filter(a => a.type === ActionType.SingSong);
        console.log('SingSong actions:', singSongActions);

        expect(singSongActions.length).toBeGreaterThan(0);

        // Find the specific action for Cinderella singing this song
        const cinderellaSingsAction = singSongActions.find(
            a => a.cardId === song.instanceId && a.singerId === cinderella.instanceId
        );
        expect(cinderellaSingsAction).toBeDefined();
    });

    it('should NOT allow a cost 2 character without Singer to sing a song', async () => {
        const player = harness.getPlayer(harness.p1Id);

        // 1. Setup: Cheap character (cost 2, no Singer) in play, song in hand
        harness.setPlay(player.id, [{
            id: 99999,
            name: 'Cheap Character',
            cost: 2,
            type: 'Character',
            strength: 1,
            willpower: 2,
            lore: 1,
            subtypes: [],
            ready: true,
            playedTurn: -1
        }]);

        // Add song to hand
        player.hand.push({
            instanceId: 'song-1',
            id: 417,
            name: 'Strength of a Raging Fire',
            cost: 3,
            type: 'Action',
            subtypes: ['Song'],
            ownerId: player.id,
            zone: 'hand' as any
        } as any);

        // 2. Get valid actions - should NOT include SingSong for this character
        const validActions = harness.turnManager.getValidActions(player.id);

        const singSongActions = validActions.filter(a => a.type === ActionType.SingSong);
        console.log('SingSong actions for cost 2 char:', singSongActions);

        expect(singSongActions.length).toBe(0);
    });
});
