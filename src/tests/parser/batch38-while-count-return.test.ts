import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 38: While Count & Return', () => {
    describe('Static: While Named Character in Play', () => {
        it('should parse while you have a character named X in play (Chief Bogo)', () => {
            const card = {
                id: 'test-chief-bogo',
                name: 'Chief Bogo',
                type: 'Character' as CardType,
                abilities: [{ fullText: "You Like Gazelle Too? While you have a character named Gazelle in play, this character gains Singer 6." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).effects[0].condition.type).toBe('presence');
            expect((abilities[0] as any).effects[0].condition.filter.name).toBe('Gazelle');
            expect((abilities[0] as any).effects[0].type).toBe('grant_keyword');
            expect((abilities[0] as any).effects[0].keyword).toBe('Singer');
            expect((abilities[0] as any).effects[0].amount).toBe(6);
        });
    });

    describe('Action: Count and Debuff', () => {
        it('should parse count characters and debuff chosen (Rescue Rangers Away!)', () => {
            const card = {
                id: 'test-rescue-rangers',
                name: 'Rescue Rangers Away!',
                type: 'Action' as CardType,
                abilities: [{
                    fullText: "Count the number of characters you have in play. Chosen character loses ¤ equal to that number until the start of your next turn.",
                    effect: "Count the number of characters you have in play. Chosen character loses ¤ equal to that number until the start of your next turn."
                }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('modify_stats_by_count');
            expect((abilities[0] as any).effects[0].stat).toBe('strength');
            expect((abilities[0] as any).effects[0].amountMultiplier).toBe(-1);
            expect((abilities[0] as any).effects[0].countTarget.type).toBe('all_characters');
            expect((abilities[0] as any).effects[0].countTarget.filter.mine).toBe(true);
            expect((abilities[0] as any).effects[0].target.type).toBe('chosen_character');
            expect((abilities[0] as any).effects[0].duration).toBe('until_start_of_next_turn');
        });
    });

    describe('Activated: Return from Discard', () => {
        it('should parse activated return specific type from discard (Pooh Pirate Ship)', () => {
            const card = {
                id: 'test-pooh-pirate-ship',
                name: 'Pooh Pirate Ship',
                type: 'Item' as CardType,
                abilities: [{ fullText: "Make a Rescue ⟳, 3 ⬡ — Return a Pirate character card from your discard to your hand." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated');
            expect((abilities[0] as any).costs[0].type).toBe('exert');
            expect((abilities[0] as any).costs[1].amount).toBe(3);
            expect((abilities[0] as any).effects[0].type).toBe('return_from_discard');
            expect((abilities[0] as any).effects[0].target.type).toBe('card_in_discard');
            expect((abilities[0] as any).effects[0].target.filter.cardType).toBe('character');
            expect((abilities[0] as any).effects[0].target.filter.subtype).toBe('pirate');
        });
    });
});
