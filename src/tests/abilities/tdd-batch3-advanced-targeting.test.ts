import { TestHarness } from '../engine-test-utils';
import { ActionType } from '../../engine/actions';
import { ZoneType } from '../../engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameEvent } from '../../engine/abilities/events';
import { CardType } from '../../engine/models';

describe('TDD Batch 3: Advanced Targeting', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    describe('1. Parser Test - AST Structure', () => {
        it('should parse "Deal 1 damage to all characters" (Tinker Bell)', () => {
            const card = {
                id: 'tink-1',
                name: 'Tinker Bell',
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, deal 1 damage to all characters."
                }]
            };

            const abilities = parseToAbilityDefinition(card as any);
            expect(abilities).toHaveLength(1);

            const ability = abilities[0] as any;
            expect(ability.event).toBe(GameEvent.CARD_PLAYED);
            expect(ability.effects).toHaveLength(1);
            expect(ability.effects[0].type).toBe('damage');
            expect(ability.effects[0].amount).toBe(1);
            expect(ability.effects[0].target).toEqual({ type: 'all_characters' });
        });

        it('should parse "Banish all opposing characters" (Be Prepared mock)', () => {
            const card = {
                id: 'be-prepared-1',
                name: 'Be Prepared Mock',
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, banish all opposing characters."
                }]
            };

            const abilities = parseToAbilityDefinition(card as any);
            expect(abilities).toHaveLength(1);

            const ability = abilities[0] as any;
            expect(ability.effects[0].type).toBe('banish');
            expect(ability.effects[0].target).toEqual({ type: 'all_opposing_characters' });
        });

        it('should parse "Gain 1 lore for each character you have in play" (For Each)', () => {
            const card = {
                id: 'regal-1',
                name: 'Regal Presence',
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, gain 1 lore for each character you have in play."
                }]
            };

            const abilities = parseToAbilityDefinition(card as any);
            expect(abilities).toHaveLength(1);

            const ability = abilities[0] as any;
            expect(ability.effects[0].type).toBe('for_each');
            expect(ability.effects[0].variable).toBe('character');
            // "character you have in play" -> count of characters controlled by player
            expect(ability.effects[0].in).toEqual({ type: 'count', what: 'characters', filter: { controller: 'self', zone: 'play' } });
            expect(ability.effects[0].effect).toEqual({ type: 'gain_lore', amount: 1 });
        });
    });

    describe('2. Executor Test - Effect Execution', () => {
        it('should execute "Deal 1 damage to all characters"', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            // Setup P1
            // Setup Tinker Bell with correct ability text  matching real card
            const tink = p1.addCardToZone({
                id: 'tink-exec-1',
                name: 'Tinker Bell',
                type: 'Character' as CardType,
                cost: 2,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, deal 1 damage to each opposing character."
                }]
            } as any, ZoneType.Hand);

            const p1Char = p1.addCardToZone({ id: 'p1-char', name: 'Ally', type: 'Character' as CardType, willpower: 3 } as any, ZoneType.Play);

            // Setup P2
            const p2Char1 = p2.addCardToZone({ id: 'p2-char1', name: 'Enemy 1', type: 'Character' as CardType, willpower: 3 } as any, ZoneType.Play);
            const p2Char2 = p2.addCardToZone({ id: 'p2-char2', name: 'Enemy 2', type: 'Character' as CardType, willpower: 3 } as any, ZoneType.Play);

            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;

            harness.turnManager.startGame(p1.id);

            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: tink.instanceId
            });

            // Verify damage ONLY on opposing characters (p2's characters)
            // Player 1's characters (p1Char and Tink) should NOT take damage
            expect(p1Char.damage).toBe(0);
            expect(tink.damage).toBe(0);

            // Player 2's characters should take damage
            expect(p2Char1.damage).toBe(1);
            expect(p2Char2.damage).toBe(1);
        });

        it('should execute "Banish all opposing characters"', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            const killer = p1.addCardToZone({
                id: 'killer-1',
                name: 'Killer',
                type: 'Character' as CardType,
                cost: 2,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, banish all opposing characters."
                }]
            } as any, ZoneType.Hand);

            const p1Char = p1.addCardToZone({ id: 'p1-char', name: 'Ally', type: 'Character' as CardType } as any, ZoneType.Play);
            const p2Char1 = p2.addCardToZone({ id: 'p2-char1', name: 'Enemy 1', type: 'Character' as CardType } as any, ZoneType.Play);

            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;

            harness.turnManager.startGame(p1.id);

            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: killer.instanceId
            });

            // Verify p1Char is still in play
            expect(p1.play.find(c => c.instanceId === p1Char.instanceId)).toBeDefined();

            // Verify p2Char1 is banished (in discard)
            expect(p2.discard.find(c => c.instanceId === p2Char1.instanceId)).toBeDefined();
            expect(p2.play.find(c => c.instanceId === p2Char1.instanceId)).toBeUndefined();
        });

        it('should execute "Gain 1 lore for each character you have in play"', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            const loresmith = p1.addCardToZone({
                id: 'loresmith-1',
                name: 'Loresmith',
                type: 'Character' as CardType,
                cost: 2,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, gain 1 lore for each character you have in play."
                }]
            } as any, ZoneType.Hand);

            // Add 2 other characters
            p1.addCardToZone({ id: 'c1', name: 'C1', type: 'Character' as CardType } as any, ZoneType.Play);
            p1.addCardToZone({ id: 'c2', name: 'C2', type: 'Character' as CardType } as any, ZoneType.Play);

            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;

            harness.turnManager.startGame(p1.id);

            const initialLore = p1.lore;

            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: loresmith.instanceId
            });

            // Should count C1, C2, and Loresmith (since she is in play when effect resolves) -> 3 characters
            // So gain 3 lore.
            expect(p1.lore).toBe(initialLore + 3);
        });
    });
});
