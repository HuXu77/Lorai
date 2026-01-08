import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 37: Conditional Play & Restrictions', () => {
    describe('Static: Play Character with Shift (Morph)', () => {
        it('should parse play any character with shift on this character (Morph)', () => {
            const card = {
                id: 'test-morph',
                name: 'Morph',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Mimicry You may play any character with Shift on this character as if this character had any name." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).effects[0].type).toBe('allow_shift_on_self');
        });
    });

    describe('Static: Conditional Play (Mirabel)', () => {
        it('should parse cant play unless condition (Mirabel Madrigal)', () => {
            const card = {
                id: 'test-mirabel',
                name: 'Mirabel Madrigal',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Not Without My Family You can't play this character unless you have 5 or more characters in play." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).effects[0].restriction).toBe('cant_play_unless');
            expect((abilities[0] as any).effects[0].condition.type).toBe('presence');
            expect((abilities[0] as any).effects[0].condition.amount).toBe(5);
        });
    });

    describe('Triggered: Opponent Can\'t Play Actions (Pete)', () => {
        it('should parse opponents cant play actions until next turn (Pete)', () => {
            const card = {
                id: 'test-pete',
                name: 'Pete',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Blow the Whistle When you play this character, opponents can't play actions until the start of your next turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).effects[0].type).toBe('restriction');
            expect((abilities[0] as any).effects[0].restriction).toBe('cant_play_actions');
            expect((abilities[0] as any).effects[0].target.type).toBe('all_opponents');
            expect((abilities[0] as any).effects[0].duration).toBe('until_source_next_start');
        });
    });
});
