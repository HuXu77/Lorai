import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 30: Complex Locations & Conditions', () => {
    describe('Static: Location Conditions', () => {
        it('should parse while you have exerted character here (Ursulas Garden)', () => {
            const card = {
                id: 'test-ursulas-garden',
                name: "Ursula's Garden",
                type: 'Location' as CardType,
                abilities: [{ fullText: "Abandon Hope While you have an exerted character here, opposing characters get -1 ◊." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).condition.type).toBe('while_here_exerted'); // Or 'while_here' with filter
            expect((abilities[0] as any).effects[0].type).toBe('modify_stats');
            expect((abilities[0] as any).effects[0].stat).toBe('lore');
            expect((abilities[0] as any).effects[0].amount).toBe(-1);
            expect((abilities[0] as any).effects[0].target.type).toBe('all_opposing_characters');
        });
    });

    describe('Static: Conditional Play', () => {
        it('should parse play for free if condition (LeFou)', () => {
            const card = {
                id: 'test-lefou',
                name: 'LeFou',
                type: 'Character' as CardType,
                abilities: [{ fullText: "I Learned from the Best During your turn, you may play this character for free if an opposing character was banished in a challenge this turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static'); // Or 'cost_reduction'
            expect((abilities[0] as any).effects[0].type).toBe('play_for_free');
            expect((abilities[0] as any).condition.type).toBe('event_occurred');
            expect((abilities[0] as any).condition.event).toBe('character_banished_in_challenge');
            expect((abilities[0] as any).condition.turn).toBe('this_turn');
        });
    });

    describe('Action: Conditional Effect', () => {
        it('should parse if ink condition (Capsize)', () => {
            const card = {
                id: 'test-capsize',
                name: 'Capsize',
                type: 'Action' as CardType,
                abilities: [{ fullText: "If you have 6 ⬡ or less, put the top 3 cards of your deck into your inkwell facedown." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static'); // Action
            expect((abilities[0] as any).condition.type).toBe('ink_count');
            expect((abilities[0] as any).condition.amount).toBe(6);
            expect((abilities[0] as any).condition.comparison).toBe('less_or_equal');
            expect((abilities[0] as any).effects[0].type).toBe('put_into_inkwell');
            expect((abilities[0] as any).effects[0].target).toBe('top_of_deck');
            expect((abilities[0] as any).effects[0].amount).toBe(3);
        });
    });
});
