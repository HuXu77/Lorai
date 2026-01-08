import { TestHarness } from '../engine-test-utils';
import { ActionType } from '../../engine/actions';
import { ZoneType } from '../../engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameEvent } from '../../engine/abilities/events';
import { CardType } from '../../engine/models';

describe('TDD Batch 7: Prevention & Move Damage', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    describe('1. Parser Test - AST Structure', () => {
        it('should parse "move up to 2 damage counters from chosen character to chosen opposing character"', () => {
            const card = {
                id: 'mama-odie-1',
                name: 'Mama Odie',
                abilities: [{
                    type: 'triggered',
                    event: 'on_play',
                    effect: "When you play this character, move up to 2 damage counters from chosen character to chosen opposing character."
                }]
            };

            const abilities = parseToAbilityDefinition(card as any);
            expect(abilities).toHaveLength(1);

            const ability = abilities[0] as any;
            const effect = ability.effects[0];

            expect(effect.type).toBe('move_damage');
            expect(effect.amount).toBe(2);
            expect(effect.from.type).toBe('chosen_character');
            expect(effect.to.type).toBe('chosen_opposing_character');
        });

        it('should parse "Prevent the next 2 damage that would be dealt to chosen character this turn"', () => {
            const card = {
                id: 'healing-glow-1',
                name: 'Healing Glow',
                abilities: [{
                    type: 'static', // Action card effect usually, but testing parsing here
                    effect: "Prevent the next 2 damage that would be dealt to chosen character this turn."
                }]
            };

            const abilities = parseToAbilityDefinition(card as any);
            expect(abilities).toHaveLength(1);

            const ability = abilities[0] as any;
            const effect = ability.effects[0];

            expect(effect.type).toBe('prevent_damage');
            expect(effect.amount).toBe(2);
            expect(effect.target.type).toBe('chosen_character');
            expect(effect.duration).toBe('turn');
        });
    });

    describe('2. Executor Test - Execution Logic', () => {
        it('should execute "move up to 2 damage counters"', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            // Add source character with damage (P1)
            const sourceChar = p1.addCardToZone({ name: 'Source Char', type: 'Character' as CardType, willpower: 5 } as any, ZoneType.Play);
            sourceChar.damage = 3;

            // Add target character (P2)
            const targetChar = p2.addCardToZone({ name: 'Target Char', type: 'Character' as CardType, willpower: 5 } as any, ZoneType.Play);

            // Add Mama Odie to hand
            const mamaOdie = p1.addCardToZone({
                id: 'mama-odie-1',
                name: 'Mama Odie',
                type: 'Character' as CardType,
                cost: 2,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, move up to 2 damage counters from chosen character to chosen opposing character."
                }]
            } as any, ZoneType.Hand);

            // Add Ink
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;

            harness.turnManager.startGame(p1.id);

            // Mock choices: Choice 1 = Source Char, Choice 2 = Target Char
            (harness.turnManager as any).mockPendingChoice = [sourceChar.instanceId, targetChar.instanceId];

            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: mamaOdie.instanceId
            });

            // Expect damage moved: 3 - 2 = 1 remaining on Source
            expect(sourceChar.damage).toBe(1);
            // Expect damage received: 0 + 2 = 2 on Target
            expect(targetChar.damage).toBe(2);
        });

        it('should execute "Prevent the next 2 damage"', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            // Add target character (P1)
            const targetChar = p1.addCardToZone({ name: 'Shielded Char', type: 'Character' as CardType, willpower: 5 } as any, ZoneType.Play);

            // Add Healing Glow to hand
            const healingGlow = p1.addCardToZone({
                id: 'healing-glow-exec',
                name: 'Healing Glow',
                type: 'Action' as CardType,
                cost: 1,
                abilities: [{
                    type: 'static', // Action effect
                    effect: "Prevent the next 2 damage that would be dealt to chosen character this turn."
                }]
            } as any, ZoneType.Hand);

            // Add Ink
            p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;

            harness.turnManager.startGame(p1.id);

            // Mock choice: Target Char
            (harness.turnManager as any).mockPendingChoice = [targetChar.instanceId];

            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: healingGlow.instanceId
            });

            // Verify damage shield added
            expect(targetChar.damageShields).toBeDefined();
            expect(targetChar.damageShields).toHaveLength(1);
            expect(targetChar.damageShields![0].amount).toBe(2);

            // Currently damage shields application logic (reducing incoming damage) is in DamageFamilyHandler or similar.
            // We assume that part exists, but here we verified the Executor correctly applied the shield state.
        });
    });
});
