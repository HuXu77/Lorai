import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameEvent } from '../../engine/abilities/events';

describe('Batch 50: Turn-Based Triggers & Conditions', () => {
    describe('End of Turn Triggers', () => {
        it('should parse simple end of turn trigger', () => {
            const text = "At the end of your turn, ready this character.";
            const mockCard = {
                id: 1,
                name: 'Test Card',
                abilities: [text]
            };
            const abilities = parseToAbilityDefinition(mockCard as any);

            expect(abilities).toHaveLength(1);
            const ability = abilities[0] as any;
            expect(ability.type).toBe('triggered');
            expect(ability.event).toBe(GameEvent.END_OF_TURN);
            expect(ability.effects[0].type).toBe('ready');
            expect(ability.effects[0].target.type).toBe('self');
        });

        it('should parse end of turn trigger with condition (Simba - Protective Cub)', () => {
            const text = "At the end of your turn, if this character is exerted, you may ready another chosen character of yours.";
            const mockCard = {
                id: 1,
                name: 'Simba',
                abilities: [text]
            };
            const abilities = parseToAbilityDefinition(mockCard as any);

            expect(abilities).toHaveLength(1);
            const ability = abilities[0] as any;
            expect(ability.type).toBe('triggered');
            expect(ability.event).toBe(GameEvent.END_OF_TURN);
            expect(ability.condition).toEqual({
                type: 'self_exerted'
            });
            expect(ability.effects[0].type).toBe('ready');
            expect(ability.effects[0].target.type).toBe('chosen_character');
            expect(ability.effects[0].target.filter.mine).toBe(true);
            expect(ability.effects[0].target.filter.other).toBe(true);
            expect(ability.effects[0].optional).toBe(true);
        });
    });

    describe('Start of Turn Triggers', () => {
        it('should parse simple start of turn trigger', () => {
            const text = "At the start of your turn, draw a card.";
            const mockCard = {
                id: 1,
                name: 'Test Card',
                abilities: [text]
            };
            const abilities = parseToAbilityDefinition(mockCard as any);

            expect(abilities).toHaveLength(1);
            const ability = abilities[0] as any;
            expect(ability.type).toBe('triggered');
            expect(ability.event).toBe(GameEvent.TURN_START);
            expect(ability.effects[0].type).toBe('draw');
            expect(ability.effects[0].amount).toBe(1);
        });
    });

    describe('During Your Turn Static Abilities', () => {
        it('should parse "During your turn" static buff', () => {
            const text = "During your turn, this character gets +2 strength.";
            const mockCard = {
                id: 1,
                name: 'Test Card',
                abilities: [text]
            };
            const abilities = parseToAbilityDefinition(mockCard as any);

            expect(abilities).toHaveLength(1);
            const ability = abilities[0] as any;
            expect(ability.type).toBe('static');
            expect(ability.condition).toEqual({ type: 'during_your_turn' });
            expect(ability.effects[0].type).toBe('modify_stats');
            expect(ability.effects[0].stat).toBe('strength');
            expect(ability.effects[0].amount).toBe(2);
        });

        it('should parse "During your turn" keyword grant', () => {
            const text = "During your turn, this character has Evasive.";
            const mockCard = {
                id: 1,
                name: 'Test Card',
                abilities: [text]
            };
            const abilities = parseToAbilityDefinition(mockCard as any);

            expect(abilities).toHaveLength(1);
            const ability = abilities[0] as any;
            expect(ability.type).toBe('static');
            expect(ability.condition).toEqual({ type: 'during_your_turn' });
            expect(ability.effects[0].type).toBe('grant_keyword');
            expect(ability.effects[0].keyword).toBe('Evasive');
        });
    });
});
