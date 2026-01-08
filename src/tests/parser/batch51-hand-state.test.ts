import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameEvent } from '../../engine/abilities/events';

describe('Batch 51: Hand Size & State Conditions', () => {
    describe('Hand Size Conditions (Static)', () => {
        it('should parse "While you have no cards in hand" static buff', () => {
            const text = "While you have no cards in hand, this character gets +2 strength.";
            const mockCard = {
                id: 1,
                name: 'Test Card',
                abilities: [text]
            };
            const abilities = parseToAbilityDefinition(mockCard as any);

            expect(abilities).toHaveLength(1);
            const ability = abilities[0] as any;
            expect(ability.type).toBe('static');
            expect(ability.condition).toEqual({ type: 'hand_empty' });
            expect(ability.effects[0].type).toBe('modify_stats');
            expect(ability.effects[0].stat).toBe('strength');
            expect(ability.effects[0].amount).toBe(2);
        });
    });

    describe('Exerted State Conditions (Static)', () => {
        it('should parse "While this character is exerted" keyword grant', () => {
            const text = "While this character is exerted, this character has Evasive.";
            const mockCard = {
                id: 1,
                name: 'Test Card',
                abilities: [text]
            };
            const abilities = parseToAbilityDefinition(mockCard as any);

            expect(abilities).toHaveLength(1);
            const ability = abilities[0] as any;
            expect(ability.type).toBe('static');
            expect(ability.condition).toEqual({
                type: 'self_exerted'
            });
            expect(ability.effects[0].type).toBe('grant_keyword');
            expect(ability.effects[0].keyword).toBe('Evasive');
        });
    });
});
