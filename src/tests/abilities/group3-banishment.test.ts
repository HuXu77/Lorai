import { TestHarness } from '../engine-test-utils';
import { CardType, ZoneType } from '../../engine/models';

describe('Group 3: Banishment Triggers', () => {
    let testHarness: TestHarness;

    beforeEach(async () => {
        testHarness = new TestHarness();
        await testHarness.initialize();
    });

    describe('Draw on Banish (Bruni)', () => {
        it('should draw a card when banished', async () => {
            const player = testHarness.createPlayer('Player 1');
            testHarness.setTurn(player.id);

            // Setup Bruni
            const bruni = testHarness.createCard(player, {
                name: 'Bruni - Fire Spirit',
                type: CardType.Character,
                cost: 2,
                willpower: 2,
                abilities: [{
                    type: 'ability',
                    fullText: 'When this character is banished, you may draw a card.'
                }]
            });

            // Manually inject parsed effect since we want to test the trigger logic specifically
            // (or rely on recalculateEffects if parser is fully integrated)
            bruni.parsedEffects = [{
                trigger: 'on_banished',
                action: 'draw',
                target: 'player',
                amount: 1,
                rawText: 'When this character is banished, you may draw a card.'
            }];

            const bruniInPlay = player.addCardToZone(bruni, ZoneType.Play);

            // Setup deck to draw from
            player.deck.push(testHarness.createCard(player, { name: 'Card to Draw', type: CardType.Action }));

            const initialHandSize = player.hand.length;

            // Banish Bruni by damage
            bruniInPlay.damage = 2;
            await (testHarness.turnManager as any).checkBanishment(player, bruniInPlay);

            // Verify Bruni is in discard
            expect(bruniInPlay.zone).toBe(ZoneType.Discard);
            expect(player.discard).toContain(bruniInPlay);
            expect(player.play).not.toContain(bruniInPlay);

            // Verify card drawn
            expect(player.hand.length).toBe(initialHandSize + 1);
        });
    });

    describe('Return to Inkwell on Banish (Ludwig Von Drake)', () => {
        it('should put card into inkwell when banished', async () => {
            const player = testHarness.createPlayer('Player 1');
            testHarness.setTurn(player.id);

            // Setup Ludwig
            // Ludwig has "When this character is banished, you may put this card into your inkwell facedown and exerted."
            const ludwig = testHarness.createCard(player, {
                name: 'Ludwig Von Drake',
                type: CardType.Character,
                cost: 5,
                willpower: 3,
                inkwell: true,
                abilities: [{
                    type: 'ability',
                    fullText: 'When this character is banished, you may put this card into your inkwell facedown and exerted.'
                }]
            });

            // Parse effect for Ludwig
            ludwig.parsedEffects = [{
                trigger: 'on_banished',
                type: 'put_into_inkwell',
                target: { type: 'self' } as any,
                exerted: true,
                rawText: 'When this character is banished, you may put this card into your inkwell facedown and exerted.'
            }];

            const ludwigInPlay = player.addCardToZone(ludwig, ZoneType.Play);
            testHarness.turnManager.abilitySystem.registerCard(ludwigInPlay);

            const initialInkCount = player.inkwell.length;

            // Banish Ludwig
            ludwigInPlay.damage = 3;
            await (testHarness.turnManager as any).checkBanishment(player, ludwigInPlay);

            // Verify Ludwig is in inkwell (NOT discard)
            expect(ludwigInPlay.zone).toBe(ZoneType.Inkwell);
            expect(player.inkwell).toContain(ludwigInPlay);
            expect(player.discard).not.toContain(ludwigInPlay);
            expect(player.play).not.toContain(ludwigInPlay);

            // Verify ink count increased
            expect(player.inkwell.length).toBe(initialInkCount + 1);

            // Verify exerted state
            expect(ludwigInPlay.ready).toBe(false);
        });
    });

    describe('Generic Banishment Trigger (Cheshire Cat)', () => {
        it('should trigger generic effect when banished', async () => {
            const player = testHarness.createPlayer('Player 1');
            testHarness.setTurn(player.id);

            // Setup Generic Card
            const generic = testHarness.createCard(player, {
                name: 'Generic Banished',
                type: CardType.Character,
                cost: 2,
                willpower: 2,
                abilities: [{
                    type: 'ability',
                    fullText: 'When this character is banished, draw 2 cards.'
                }]
            });

            // Using the new generic parsing structure
            generic.parsedEffects = [{
                trigger: 'on_banished',
                action: 'draw',
                target: 'player',
                amount: 2,
                rawText: 'When this character is banished, draw 2 cards.',
                params: {
                    chainedEffect: {
                        trigger: 'effect',
                        action: 'draw',
                        target: 'player',
                        amount: 2,
                        rawText: 'draw 2 cards'
                    }
                }
            }];

            const genericInPlay = player.addCardToZone(generic, ZoneType.Play);

            player.deck.push(testHarness.createCard(player, { name: 'C1', type: CardType.Action }));
            player.deck.push(testHarness.createCard(player, { name: 'C2', type: CardType.Action }));

            const initialHandSize = player.hand.length;

            // Banish
            genericInPlay.damage = 2;
            await (testHarness.turnManager as any).checkBanishment(player, genericInPlay);

            // Verify effect (draw 2)
            expect(player.hand.length).toBe(initialHandSize + 2);
        });
    });
});
