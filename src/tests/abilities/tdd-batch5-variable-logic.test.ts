import { TestHarness } from '../engine-test-utils';
import { ActionType } from '../../engine/actions';
import { ZoneType } from '../../engine/models';
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameEvent } from '../../engine/abilities/events';
import { CardType } from '../../engine/models';

describe('TDD Batch 5: Variable Logic', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    describe('1. Parser Test - AST Structure', () => {
        it('should parse "gain 1 lore for each character you have in play"', () => {
            const card = {
                id: 'variable-lore-1',
                name: 'Lore Master',
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
            expect(ability.effects[0].effect).toEqual({ type: 'gain_lore', amount: 1 });
        });

        it('should parse "deal damage equal to the number of cards in your hand"', () => {
            const card = {
                id: 'variable-damage-1',
                name: 'Hand Smasher',
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, deal damage to chosen character equal to the number of cards in your hand."
                }]
            };

            const abilities = parseToAbilityDefinition(card as any);
            expect(abilities).toHaveLength(1);

            const ability = abilities[0] as any;
            expect(ability.effects[0].type).toBe('damage');
            expect(ability.effects[0].amount).toEqual({
                type: 'count',
                source: 'hand',
                owner: 'self'
            });
        });
    });

    describe('2. Executor Test - Variable Execution', () => {
        it('should execute "gain 1 lore for each character you have in play"', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Add 2 other characters
            p1.addCardToZone({ name: 'Char 1', type: 'Character' as CardType } as any, ZoneType.Play);
            p1.addCardToZone({ name: 'Char 2', type: 'Character' as CardType } as any, ZoneType.Play);

            const loreMaster = p1.addCardToZone({
                id: 'lore-master-1',
                name: 'Lore Master',
                type: 'Character' as CardType,
                cost: 4,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, gain 1 lore for each character you have in play."
                }]
            } as any, ZoneType.Hand);

            // Add ink
            for (let i = 0; i < 4; i++) {
                p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            }

            harness.turnManager.startGame(p1.id);
            const initialLore = p1.lore;

            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: loreMaster.instanceId
            });

            // Should gain 3 lore (2 existing + 1 self)
            // Note: "character you have in play" usually includes the one just played if it's an ETB effect
            expect(p1.lore).toBe(initialLore + 3);
        });

        it('should execute "deal damage equal to the number of cards in your hand"', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            // Target character
            const target = p2.addCardToZone({
                name: 'Target',
                type: 'Character' as CardType,
                willpower: 10
            } as any, ZoneType.Play);

            // Card to play
            const handSmasher = p1.addCardToZone({
                id: 'hand-smasher-1',
                name: 'Hand Smasher',
                type: 'Character' as CardType,
                cost: 4,
                abilities: [{
                    type: 'triggered',
                    effect: "When you play this character, deal damage to chosen character equal to the number of cards in your hand."
                }]
            } as any, ZoneType.Hand);

            // Add 2 other cards to hand
            p1.addCardToZone({ name: 'Card 1', type: 'Action' as CardType } as any, ZoneType.Hand);
            p1.addCardToZone({ name: 'Card 2', type: 'Action' as CardType } as any, ZoneType.Hand);

            // Add ink
            for (let i = 0; i < 4; i++) {
                p1.addCardToZone({ name: 'Ink', inkwell: true } as any, ZoneType.Inkwell).ready = true;
            }

            harness.turnManager.startGame(p1.id);

            // Mock choice
            harness.mockChoice(p1.id, [target.instanceId]);

            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: handSmasher.instanceId
            });

            // Hand size should be 2 (Card 1, Card 2) - Hand Smasher is now in play
            expect(target.damage).toBe(2);
        });
    });
});
