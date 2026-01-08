
import { TestHarness } from '../engine-test-utils';
import { CardType } from '../../engine/models';

describe('Singer Vanishing Bug', () => {
    let harness: TestHarness;

    beforeEach(() => {
        harness = new TestHarness();
        // Mock loader
        harness.loader.getAllCards = () => [];
    });

    it('should exert the singer but keep them in play when singing a song', async () => {
        await harness.initialize();
        const p1 = harness.game.getPlayer(harness.p1Id);

        // 1. Create a Singer (Cost 3, Ready)
        const singer = harness.createCard(p1, {
            name: 'Ariel - Spectacular Singer',
            type: 'Character' as CardType,
            cost: 3,
            inkwell: true,
            baseStrength: 2,
            baseWillpower: 3,
            excludeFromPlay: false // custom flag if needed, usually default false
        });
        singer.zone = 'play';
        singer.ready = true;
        p1.play.push(singer);

        // 2. Create a Song (Cost 3)
        const song = harness.createCard(p1, {
            name: 'Part of Your World',
            type: 'Action' as CardType,
            subtypes: ['Song'],
            cost: 3,
            inkwell: true
        });

        harness.setHand(harness.p1Id, [song]);
        harness.setInk(harness.p1Id, 0); // No ink, must sing
        harness.setTurn(harness.p1Id);

        // Verify initial state
        expect(p1.play.length).toBe(1);
        expect(p1.play[0].instanceId).toBe(singer.instanceId);
        expect(singer.ready).toBe(true);
        expect(p1.hand.length).toBe(1);

        // 3. Play the song using the singer
        // Using playCard with singerId
        await harness.playCard(p1, song, undefined);
        // Wait! harness.playCard signature:
        // playCard(playerOrId: any, cardOrName: any, targetOrCard?: string | CardInstance)
        // It doesn't support singerId argument directly in the helper!

        // I need to use turnManager directly or update helper.
        // Let's use turnManager directly to match page.tsx behavior exactly.

        await harness.turnManager.playCard(
            p1,
            song.instanceId,
            singer.instanceId, // singerId
            undefined // shiftTargetId
        );

        // 4. Verify Outcome

        // Singer should still be in play
        const singerInPlay = p1.play.find(c => c.instanceId === singer.instanceId);
        expect(singerInPlay).toBeDefined();

        // Singer should be exerted
        expect(singerInPlay?.ready).toBe(false);

        // Song should be in discard
        const songInDiscard = p1.discard.find(c => c.instanceId === song.instanceId);
        expect(songInDiscard).toBeDefined();
    });
});
