import { TestHarness } from '../engine-test-utils';
import { ActionType } from '../../engine/actions';
import { ZoneType } from '../../engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameEvent } from '../../engine/abilities/events';
import { CardType } from '../../engine/models';

describe('TDD Batch 4: Conditional Effects', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    describe('1. Parser Test - AST Structure', () => {
        it('should parse "If you have 5 or more ink" (Belle)', () => {
            const card = {
                id: 'belle-1',
                name: 'Belle',
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, if you have 5 or more ink, draw a card."
                }]
            };

            const abilities = parseToAbilityDefinition(card as any);
            expect(abilities).toHaveLength(1);

            const ability = abilities[0] as any;
            expect(ability.effects[0].type).toBe('conditional');
            expect(ability.effects[0].condition).toEqual({ type: 'min_ink', amount: 5 });
            expect(ability.effects[0].effect).toEqual({ type: 'draw', amount: 1, optional: false });
        });

        it('should parse "If you have no cards in your hand" (Empty Hand)', () => {
            const card = {
                id: 'empty-hand-1',
                name: 'Empty Handed',
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, if you have no cards in your hand, gain 2 lore."
                }]
            };

            const abilities = parseToAbilityDefinition(card as any);
            expect(abilities).toHaveLength(1);

            const ability = abilities[0] as any;
            expect(ability.effects[0].type).toBe('conditional');
            expect(ability.effects[0].condition).toEqual({ type: 'empty_hand' });
            expect(ability.effects[0].effect).toEqual({ type: 'gain_lore', amount: 2 });
        });

        it('should parse "If this character is damaged" (Is Damaged)', () => {
            const card = {
                id: 'damaged-1',
                name: 'Damaged One',
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, if this character is damaged, draw a card."
                }]
            };

            const abilities = parseToAbilityDefinition(card as any);
            expect(abilities).toHaveLength(1);

            const ability = abilities[0] as any;
            expect(ability.effects[0].type).toBe('conditional');
            expect(ability.effects[0].condition).toEqual({ type: 'is_damaged', target: 'self' });
            expect(ability.effects[0].effect).toEqual({ type: 'draw', amount: 1, optional: false });
        });
    });

    describe('2. Executor Test - Effect Execution', () => {
        it('should execute "If you have 5 or more ink"', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            const belle = p1.addCardToZone({
                id: 'belle-exec-1',
                name: 'Belle',
                type: 'Character' as CardType,
                cost: 4,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, if you have 5 or more ink, draw a card."
                }]
            } as any, ZoneType.Hand);

            // Add 5 ink
            for (let i = 0; i < 5; i++) {
                p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            }

            // Add cards to deck for drawing
            p1.addCardToZone({ name: 'Deck Card 1', type: 'Action' as CardType } as any, ZoneType.Deck);
            p1.addCardToZone({ name: 'Deck Card 2', type: 'Action' as CardType } as any, ZoneType.Deck);

            harness.turnManager.startGame(p1.id);
            const initialHandSize = p1.hand.length; // 1 (Belle)

            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: belle.instanceId
            });

            // Hand size should be initial - 1 (played) + 1 (drawn) = initial
            // Wait, initial hand had Belle. After play, hand is empty. Then draw 1. So hand size 1.
            // Actually initialHandSize includes Belle.
            // Start: [Belle] (1)
            // Play: [] (0)
            // Draw: [Card] (1)
            expect(p1.hand.length).toBe(1);
            expect(p1.hand[0].instanceId).not.toBe(belle.instanceId);
        });

        it('should NOT execute "If you have 5 or more ink" if ink is low', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            const belle = p1.addCardToZone({
                id: 'belle-exec-2',
                name: 'Belle',
                type: 'Character' as CardType,
                cost: 4,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, if you have 5 or more ink, draw a card."
                }]
            } as any, ZoneType.Hand);

            // Add 4 ink
            for (let i = 0; i < 4; i++) {
                p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            }

            harness.turnManager.startGame(p1.id);

            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: belle.instanceId
            });

            // Should NOT draw
            expect(p1.hand.length).toBe(0);
        });

        it('should execute "If you have no cards in your hand"', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            const empty = p1.addCardToZone({
                id: 'empty-exec-1',
                name: 'Empty Handed',
                type: 'Character' as CardType,
                cost: 2,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, if you have no cards in your hand, gain 2 lore."
                }]
            } as any, ZoneType.Hand);

            // Ensure hand only has this card
            p1.hand = [empty];

            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;

            harness.turnManager.startGame(p1.id);
            const initialLore = p1.lore;

            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: empty.instanceId
            });

            // Hand is empty when effect resolves (card is in play)
            expect(p1.lore).toBe(initialLore + 2);
        });

        it('should execute "If this character is damaged"', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Create a card that enters play damaged (mocking a scenario or using a separate effect to damage it first)
            // Since we can't easily damage it *before* the on_play trigger resolves in a single action without complex setup,
            // let's use a "When you play an action, if this character is damaged..." scenario.

            const damagedChar = p1.addCardToZone({
                id: 'damaged-exec-1',
                name: 'Damaged One',
                type: 'Character' as CardType,
                cost: 2,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play an action, if this character is damaged, gain 1 lore."
                }]
            } as any, ZoneType.Play);

            // Manually register card because addCardToZone doesn't do it
            (harness.turnManager as any).abilitySystem.registerCard(damagedChar);

            // Damage the character
            damagedChar.damage = 1;

            const actionCard = p1.addCardToZone({
                id: 'action-1',
                name: 'Action',
                type: 'Action' as CardType,
                cost: 1
            } as any, ZoneType.Hand);

            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;

            harness.turnManager.startGame(p1.id);
            const initialLore = p1.lore;

            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: actionCard.instanceId
            });

            expect(p1.lore).toBe(initialLore + 1);
        });
    });
});
