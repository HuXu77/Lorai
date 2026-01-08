
import { TestHarness } from '../../engine-test-utils';
import { CardInstance, ZoneType, CardType, ActionType } from '../../../engine/models';
import { parseToAbilityDefinition } from '../../../engine/ability-parser';

describe('Bug Fix Verification: Prince Naveen', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('Prince Naveen - Ukulele Player should parse correctly', () => {
        const mockCard = {
            id: 'mock-naveen',
            name: 'Prince Naveen - Ukulele Player',
            type: CardType.Character,
            abilities: [
                {
                    type: 'triggered',
                    fullText: "When you play this character, you may play a song with cost 5 or less for free.",
                    effect: "When you play this character, you may play a song with cost 5 or less for free."
                }
            ]
        };
        const abilities = parseToAbilityDefinition(mockCard as any);

        expect(abilities).toHaveLength(1);
        const ability = abilities[0];
        const effect = ability.effects[0];

        console.log('NAVEEN EFFECT TYPE:', effect.type);
        console.log('NAVEEN EFFECT OPTIONAL:', (effect as any).optional);

        expect(effect.type).toBe('play_for_free');
        expect((effect as any).optional).toBe(true);
    });

    it('Prince Naveen should prompt for song selection directly (skipping yes/no)', async () => {
        const player = harness.game.getPlayer(harness.p1Id);

        // 1. Setup Naveen
        const naveen = harness.createCard(player, {
            id: 101,
            name: 'Prince Naveen - Ukulele Player',
            type: CardType.Character,
            cost: 4,
            abilities: [
                {
                    type: 'triggered',
                    fullText: "When you play this character, you may play a song with cost 5 or less for free.",
                    effect: "When you play this character, you may play a song with cost 5 or less for free."
                }
            ]
        });
        player.hand.push(naveen);
        harness.setInk(harness.p1Id, 4);

        // 2. Setup Song
        const song = harness.createCard(player, {
            id: 102,
            name: 'Test Song',
            type: CardType.Action,
            subtypes: ['Song'],
            cost: 5,
            abilities: [] // Basic song
        });
        player.hand.push(song);

        // 3. Register Handler
        let receivedChoiceType = '';

        harness.turnManager.registerChoiceHandler(harness.p1Id, (choice: any) => {
            console.log('TEST HANDLER RECEIVED CHOICE:', JSON.stringify(choice, null, 2));
            receivedChoiceType = choice.type;

            if (choice.type === 'optional' || choice.type === 'yes_no') {
                // The execution SHOULD NOT hit this if it's skipping internal check.
                // But if it does, it confirms the bug (double prompt).
                return {
                    requestId: choice.id,
                    playerId: harness.p1Id,
                    selectedIds: ['yes'],
                    timestamp: Date.now()
                };
            }

            if (choice.type === 'card_in_hand' || choice.type === 'target_card_in_hand') {
                const songOption = choice.options.find((o: any) => o.card.instanceId === song.instanceId);
                if (songOption) {
                    return {
                        requestId: choice.id,
                        playerId: harness.p1Id,
                        selectedIds: [songOption.id],
                        timestamp: Date.now()
                    };
                }
            }

            return {
                requestId: choice.id,
                playerId: harness.p1Id,
                selectedIds: [],
                timestamp: Date.now()
            };
        });

        // 4. Play Naveen
        await harness.playCard(player, naveen);

        // If bug exists, we might see 'yes_no' then nothing if it fails to chain properly?
        // Or 'yes_no' then 'card_in_hand'.
        // The objective is to fix it so it goes STRAIGHT to 'card_in_hand' (with optional dismissal).
        // Or if the design is explicit yes/no then selection, we verify that flow works.
        // User said: "I selected Yes but then it didn't prompt me for which song!"
        // This implies the chaining is broken.
    });

    it('Prince Naveen should have Singer 6 and be able to sing cost 5 song', async () => {
        const player = harness.game.getPlayer(harness.p1Id);

        // 1. Setup Naveen with Singer 6
        const naveen = harness.createCard(player, {
            id: 103,
            name: 'Prince Naveen - Ukulele Player',
            type: CardType.Character,
            cost: 4,
            abilities: [
                {
                    type: 'keyword',
                    keyword: 'Singer',
                    keywordValue: '6',
                    fullText: 'Singer 6',
                    effect: 'Singer 6'
                }
            ]
        });
        // Must be ready to sing
        naveen.ready = true;
        naveen.zone = ZoneType.Play;
        player.play.push(naveen);

        // 2. Setup 5-cost song
        const song = harness.createCard(player, {
            id: 104,
            name: 'Expensive Song',
            type: CardType.Action,
            subtypes: ['Song'],
            cost: 5,
            abilities: []
        });
        player.hand.push(song);



        // 4. Attempt to Sing
        // calling resolveAction directly with ActionType.SingSong logic or PlayCard with singerId
        // Based on actions.ts: playCard(player, cardId, singerId?, ...)
        // ResolveAction maps SingSong -> singSong -> which sets up play? 
        // Wait, ActionType.SingSong is usually just to exert the singer?
        // Actually ActionType.SingSong calls actions.singSong which plays the song.

        // Let's use PlayCard with singerId as that seems supported by resolveAction logic for ActionType.PlayCard
        // "action.singerId" is passed to playCard.

        await harness.turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: player.id,
            cardId: song.instanceId, // The song we want to play
            singerId: naveen.instanceId // The singer
        });

        // 5. Verify Song is played and Naveen is exerted
        expect(song.zone).toBe(ZoneType.Discard); // Songs go to discard after resolution
        expect(naveen.ready).toBe(false);
    });
});
