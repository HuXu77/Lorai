import { TestHarness } from '../engine-test-utils';
import { ActionType } from '../../engine/actions';
import { ZoneType } from '../../engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameEvent } from '../../engine/abilities/events';
import { CardType } from '../../engine/models';

describe('TDD Batch 6: Complex Loops', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    describe('1. Parser Test - AST Structure', () => {
        it('should parse "For each other character you have in play, deal 1 damage to it"', () => {
            const card = {
                id: 'loop-damage-1',
                name: 'Damage Spreader',
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, for each other character you have in play, deal 1 damage to it."
                }]
            };

            const abilities = parseToAbilityDefinition(card as any);
            expect(abilities).toHaveLength(1);

            const ability = abilities[0] as any;
            const effect = ability.effects[0];

            expect(effect.type).toBe('for_each');
            expect(effect.variable).toBe('target');
            // Source should be "other characters you have in play" -> "all_characters" with filter?
            // Or "other_characters"?
            // Let's assume the parser maps it to a TargetAST
            expect(effect.source.type).toBe('all_characters');
            // Note: "other" implies excluding self, which might be a filter or a specific type

            expect(effect.effect.type).toBe('damage');
            expect(effect.effect.amount).toBe(1);
            expect(effect.effect.target.type).toBe('variable');
            expect(effect.effect.target.name).toBe('target');
        });
    });

    describe('2. Executor Test - Loop Execution', () => {
        it('should execute "For each other character you have in play, deal 1 damage to it"', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Add 2 other characters
            const char1 = p1.addCardToZone({ name: 'Char 1', type: 'Character' as CardType, willpower: 5 } as any, ZoneType.Play);
            const char2 = p1.addCardToZone({ name: 'Char 2', type: 'Character' as CardType, willpower: 5 } as any, ZoneType.Play);

            const damageSpreader = p1.addCardToZone({
                id: 'damage-spreader-1',
                name: 'Damage Spreader',
                type: 'Character' as CardType,
                cost: 4,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, for each other character you have in play, deal 1 damage to it."
                }]
            } as any, ZoneType.Hand);

            // Add ink
            for (let i = 0; i < 4; i++) {
                p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            }

            harness.turnManager.startGame(p1.id);

            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: damageSpreader.instanceId
            });

            // Char 1 and Char 2 should have 1 damage
            expect(char1.damage).toBe(1);
            expect(char2.damage).toBe(1);

            // Damage Spreader (self) should NOT have damage (because "other")
            const spreaderInPlay = p1.play.find(c => c.instanceId === damageSpreader.instanceId);
            expect(spreaderInPlay?.damage).toBe(0);
        });
    });
});
