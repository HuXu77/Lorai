import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { Card } from '../../engine/models';

describe('Batch 39: End of Turn & Named Buffs', () => {
    describe('Trigger: At the end of your turn', () => {
        it('should parse end of turn with condition and optional effect (Bernard)', () => {
            const card: Card = {
                id: 'bernard-1',
                name: 'Bernard',
                abilities: [
                    {
                        type: 'triggered',
                        fullText: "At the end of your turn, if this character is exerted, you may ready another chosen character of yours."
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).trigger.type).toBe('end_of_turn');
            expect((abilities[0] as any).condition).toBeDefined();
            expect((abilities[0] as any).condition.type).toBe('self_exerted');
            expect((abilities[0] as any).effects[0].type).toBe('ready');
            expect((abilities[0] as any).effects[0].optional).toBe(true);
            expect((abilities[0] as any).effects[0].target.type).toBe('chosen_character');
            expect((abilities[0] as any).effects[0].target.filter.mine).toBe(true);
            expect((abilities[0] as any).effects[0].target.filter.other).toBe(true);
        });

        it('should parse end of turn with complex condition (Mr. Smee)', () => {
            const card: Card = {
                id: 'mr-smee-1',
                name: 'Mr. Smee',
                abilities: [
                    {
                        type: 'triggered',
                        fullText: "At the end of your turn, if this character is exerted and you don't have a Captain character in play, deal 1 damage to this character."
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).trigger.type).toBe('end_of_turn');
            expect((abilities[0] as any).conditions.length).toBe(2);
            // Condition 1: Exerted
            expect((abilities[0] as any).conditions.some((c: any) => c.type === 'self_exerted')).toBe(true);
            // Condition 2: No Captain in play
            const noCaptain = (abilities[0] as any).conditions.find((c: any) => c.type === 'count_check');
            expect(noCaptain).toBeDefined();
            expect(noCaptain.amount).toBe(0);
            expect(noCaptain.filter.subtype).toBe('Captain');

            expect((abilities[0] as any).effects[0].type).toBe('damage');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
            expect((abilities[0] as any).effects[0].target.type).toBe('self');
        });
    });

    describe('Static: Named Character Buffs', () => {
        it('should parse named character stat buff (Flotsam)', () => {
            const card: Card = {
                id: 'flotsam-1',
                name: 'Flotsam',
                abilities: [
                    {
                        type: 'static',
                        fullText: "Your characters named Jetsam get +3 ¤."
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).effects[0].type).toBe('modify_stats');
            expect((abilities[0] as any).effects[0].stat).toBe('strength');
            expect((abilities[0] as any).effects[0].amount).toBe(3);
            expect((abilities[0] as any).effects[0].target.type).toBe('all_characters');
            expect((abilities[0] as any).effects[0].target.filter.name).toBe('Jetsam');
            expect((abilities[0] as any).effects[0].target.filter.mine).toBe(true);
        });

        it('should parse named character stat buff (Trigger)', () => {
            const card: Card = {
                id: 'trigger-1',
                name: 'Trigger',
                abilities: [
                    {
                        type: 'static',
                        fullText: "Your characters named Nutsy get +1 ◊."
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).effects[0].type).toBe('modify_stats');
            expect((abilities[0] as any).effects[0].stat).toBe('lore');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
            expect((abilities[0] as any).effects[0].target.type).toBe('all_characters');
            expect((abilities[0] as any).effects[0].target.filter.name).toBe('Nutsy');
            expect((abilities[0] as any).effects[0].target.filter.mine).toBe(true);
        });
    });
});
