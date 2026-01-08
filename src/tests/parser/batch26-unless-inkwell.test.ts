import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 26: Unless & Inkwell', () => {
    describe('Static: Unless Conditions', () => {
        it('should parse cant quest unless condition (Bashful)', () => {
            const card = {
                id: 'test-bashful',
                name: 'Bashful',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Oh, Gosh! This character can't quest unless you have another Seven Dwarfs character in play." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).effects[0].type).toBe('restriction');
            expect((abilities[0] as any).effects[0].restriction).toBe('cant_quest');
            expect((abilities[0] as any).condition.type).toBe('unless_presence');
            expect((abilities[0] as any).condition.filter.subtype).toBe('seven dwarfs');
        });

        it('should parse cant challenge or quest unless location (Treasure Guardian)', () => {
            const card = {
                id: 'test-treasure-guardian',
                name: 'Treasure Guardian',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Who Disturbs My Slumber? This character can't challenge or quest unless it is at a location." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).effects[0].type).toBe('restriction');
            expect((abilities[0] as any).effects[0].restriction).toBe('cant_challenge_or_quest');
            expect((abilities[0] as any).condition.type).toBe('unless_location');
        });
    });

    describe('Triggered: Put into Inkwell', () => {
        it('should parse put banished item into inkwell (Tinker Bell)', () => {
            const card = {
                id: 'test-tinker-bell-giant',
                name: 'Tinker Bell',
                type: 'Character' as CardType,
                abilities: [{ fullText: "I Can Use That Whenever one of your items is banished, you may put that card into your inkwell facedown and exerted." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_banished');
            expect((abilities[0] as any).triggerFilter.type).toBe('item');
            expect((abilities[0] as any).triggerFilter.mine).toBe(true);
            expect((abilities[0] as any).effects[0].type).toBe('put_into_inkwell');
            expect((abilities[0] as any).effects[0].target).toEqual({ type: 'trigger_card' });
        });
    });

    describe('Activated: Put into Inkwell', () => {
        it('should parse put top card into inkwell (Heart of Te Fiti)', () => {
            const card = {
                id: 'test-heart-te-fiti',
                name: 'Heart of Te Fiti',
                type: 'Item' as CardType,
                abilities: [{ fullText: "Create Life ⟳, 2 ⬡ — Put the top card of your deck into your inkwell facedown and exerted." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated');
            expect((abilities[0] as any).costs[0].type).toBe('exert');
            expect((abilities[0] as any).costs[1].amount).toBe(2);
            expect((abilities[0] as any).effects[0].type).toBe('put_into_inkwell');
            expect((abilities[0] as any).effects[0].target).toEqual({ type: 'top_card_of_deck' });
        });
    });
});
