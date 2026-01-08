import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameEvent } from '../../engine/abilities/events';

describe('Batch 52: Combat & Challenge Mechanics', () => {
    describe('Static Combat Abilities', () => {
        it('should parse "This character can challenge ready characters"', () => {
            const text = "This character can challenge ready characters.";
            const mockCard = {
                id: 1,
                name: 'Test Card',
                abilities: [text]
            };
            const abilities = parseToAbilityDefinition(mockCard as any);

            expect(abilities).toHaveLength(1);
            const ability = abilities[0] as any;
            expect(ability.type).toBe('static');
            expect(ability.effects[0].type).toBe('ability_grant');
            expect(ability.effects[0].ability).toBe('challenge_ready_characters');
        });
    });

    describe('Triggered Combat Abilities', () => {
        it('should parse "When this character is banished in a challenge"', () => {
            const text = "When this character is banished in a challenge, return this card to your hand.";
            const mockCard = {
                id: 1,
                name: 'Test Card',
                abilities: [text]
            };
            const abilities = parseToAbilityDefinition(mockCard as any);

            expect(abilities).toHaveLength(1);
            const ability = abilities[0] as any;
            expect(ability.type).toBe('triggered');
            expect(ability.event).toBe(GameEvent.CHARACTER_BANISHED_IN_CHALLENGE);
            expect(ability.effects[0].type).toBe('return_to_hand');
            expect(ability.effects[0].target.type).toBe('self');
        });

        it('should parse "Whenever this character challenges"', () => {
            const text = "Whenever this character challenges, gain 2 lore.";
            const mockCard = {
                id: 1,
                name: 'Test Card',
                abilities: [text]
            };
            const abilities = parseToAbilityDefinition(mockCard as any);

            expect(abilities).toHaveLength(1);
            const ability = abilities[0] as any;
            expect(ability.type).toBe('triggered');
            expect(ability.event).toBe(GameEvent.CARD_CHALLENGES);
            expect(ability.effects[0].type).toBe('gain_lore');
            expect(ability.effects[0].amount).toBe(2);
        });

        it('should parse "Whenever this character is challenged"', () => {
            const text = "Whenever this character is challenged, banish the challenging character.";
            const mockCard = {
                id: 1,
                name: 'Test Card',
                abilities: [text]
            };
            const abilities = parseToAbilityDefinition(mockCard as any);

            expect(abilities).toHaveLength(1);
            const ability = abilities[0] as any;
            expect(ability.type).toBe('triggered');
            expect(ability.event).toBe(GameEvent.CARD_CHALLENGED);
            expect(ability.effects[0].type).toBe('banish');
            expect(ability.effects[0].target.type).toBe('challenging_character');
        });
    });
});
