import { TestHarness } from '../engine-test-utils';
import { ActionType } from '../../engine/actions';
import { ZoneType } from '../../engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('TDD Batch 2: Opponent Discard & Reveal', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    describe('1. Parser Test - AST Structure', () => {
        it('should parse Ursula - Deceiver ability', () => {
            const card = {
                id: 1,
                name: 'Ursula',
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, chosen opponent reveals their hand and discards a song card of your choice."
                }]
            };

            const abilities = parseToAbilityDefinition(card as any);
            expect(abilities).toHaveLength(1);

            const ability = abilities[0] as any;
            expect(ability.event).toBe('card_played');

            // Expected AST structure for the effect
            // Expected AST structure for the effect
            expect(ability.effects).toHaveLength(1);
            expect(ability.effects[0].type).toBe('opponent_reveal_and_discard');
            expect(ability.effects[0].target).toEqual({ type: 'chosen_opponent' });
            expect(ability.effects[0].filter).toEqual({ cardType: 'song' });
            expect(ability.effects[0].chooser).toBe('you');
        });

        it('should parse Mowgli - Man Cub ability', () => {
            const card = {
                id: 2,
                name: 'Mowgli',
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, chosen opponent reveals their hand and discards a non-character card of their choice."
                }]
            };

            const abilities = parseToAbilityDefinition(card as any);
            expect(abilities).toHaveLength(1);

            const ability = abilities[0] as any;

            expect(ability.effects).toHaveLength(1);
            expect(ability.effects[0].type).toBe('opponent_reveal_and_discard');
            expect(ability.effects[0].filter).toEqual({ excludeCardType: 'character' });
            expect(ability.effects[0].chooser).toBe('opponent'); // 'their choice' = opponent chooses
        });
    });

    describe('2. Executor Test - Effect Execution', () => {
        it('should execute reveal hand and discard song (Ursula)', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            // Setup P1 with Ursula
            const ursula = p1.addCardToZone({
                id: 'ursula-exec-1',
                name: 'Ursula',
                type: 'Character' as CardType,
                cost: 2,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, chosen opponent reveals their hand and discards a song card of your choice."
                }]
            } as any, ZoneType.Hand);

            // Register card with ability system
            (harness.turnManager as any).abilitySystem.registerCard(ursula);

            // Setup P1 ink
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;

            // Setup P2 with Song and Character
            const song = p2.addCardToZone({ name: 'Let It Go', type: 'Action' as CardType, subtypes: ['Song'] } as any, ZoneType.Hand);
            const char = p2.addCardToZone({ name: 'Mickey', type: 'Character' as CardType } as any, ZoneType.Hand);

            harness.turnManager.startGame(p1.id);

            // Play Ursula
            // We need to specify the discard choice in the payload if it's "your choice"
            // The system should prompt or accept a choice. 
            // For now, we assume the action payload carries the choice.
            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: ursula.instanceId,
                targetId: p2.id, // Chosen opponent
                payload: {
                    discardChoiceId: song.instanceId // P1 chooses this card to be discarded
                }
            });

            // Verify Song is discarded
            expect(p2.discard.find(c => c.instanceId === song.instanceId)).toBeDefined();
            expect(p2.hand.find(c => c.instanceId === song.instanceId)).toBeUndefined();

            // Verify Character remains
            expect(p2.hand.find(c => c.instanceId === char.instanceId)).toBeDefined();
        });

        it('should execute reveal hand and discard non-character (Mowgli)', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            // Setup P1 with Mowgli
            const mowgli = p1.addCardToZone({
                id: 'mowgli-exec-1',
                name: 'Mowgli',
                type: 'Character' as CardType,
                cost: 2,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, chosen opponent reveals their hand and discards a non-character card of their choice."
                }]
            } as any, ZoneType.Hand);

            // Register card with ability system
            (harness.turnManager as any).abilitySystem.registerCard(mowgli);

            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;

            // Setup P2 with Item and Character
            const item = p2.addCardToZone({ name: 'Dinglehopper', type: 'Item' as CardType } as any, ZoneType.Hand);
            const char = p2.addCardToZone({ name: 'Mickey', type: 'Character' as CardType } as any, ZoneType.Hand);

            harness.turnManager.startGame(p1.id);

            // Play Mowgli
            // "their choice" implies P2 chooses. 
            // In a real game, this would be an interrupt or a separate action.
            // For simplicity in this test, we might pass the choice in the payload 
            // OR the system might auto-select if only one valid option, 
            // OR we might need to mock the opponent's choice.
            // Let's assume we pass it in payload for now to verify the effect logic.
            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: mowgli.instanceId,
                targetId: p2.id,
                payload: {
                    discardChoiceId: item.instanceId
                }
            });

            // Verify Item is discarded
            expect(p2.discard.find(c => c.instanceId === item.instanceId)).toBeDefined();

            // Verify Character remains
            expect(p2.hand.find(c => c.instanceId === char.instanceId)).toBeDefined();
        });
    });

    describe('3. Error Cases', () => {
        it('should handle no valid targets to discard', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            const ursula = p1.addCardToZone({
                id: 'ursula-1',
                name: 'Ursula',
                type: 'Character' as CardType,
                cost: 2,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, chosen opponent reveals their hand and discards a song card of your choice."
                }]
            } as any, ZoneType.Hand);

            // Register card with ability system
            (harness.turnManager as any).abilitySystem.registerCard(ursula);

            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;

            // P2 has only characters (no songs)
            p2.addCardToZone({ name: 'Mickey', type: 'Character' as CardType } as any, ZoneType.Hand);

            harness.turnManager.startGame(p1.id);

            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: ursula.instanceId,
                targetId: p2.id
            });

            // Verify nothing discarded
            expect(p2.discard.length).toBe(0);
            expect(p2.hand.length).toBe(1);
        });
    });
});
