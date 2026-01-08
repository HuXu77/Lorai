import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Missing Patterns Batch 1', () => {
    describe('Olympus Would Be That Way', () => {
        it('should parse "your characters get +3 ¤ while challenging a location this turn"', () => {
            const card = {
                id: 'test-olympus',
                name: 'Olympus Would Be That Way',
                type: 'Action' as CardType,
                abilities: [{ fullText: "Your characters get +3 ¤ while challenging a location this turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated'); // Action
            expect((abilities[0] as any).effects[0].type).toBe('modify_stats');
            expect((abilities[0] as any).effects[0].stat).toBe('strength');
            expect((abilities[0] as any).effects[0].amount).toBe(3);
            expect((abilities[0] as any).effects[0].condition.type).toBe('while_challenging_location');
        });
    });

    describe('Golden Harp', () => {
        it('should parse "At the end of your turn, if you didn\'t play a song this turn, banish this character"', () => {
            const card = {
                id: 'test-golden-harp',
                name: 'Golden Harp',
                type: 'Item' as CardType,
                abilities: [{ fullText: "Stolen Away At the end of your turn, if you didn't play a song this turn, banish this character." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('turn_end');
            expect((abilities[0] as any).condition.type).toBe('not_played_song_this_turn');
            expect((abilities[0] as any).effects[0].type).toBe('banish');
            expect((abilities[0] as any).effects[0].target.type).toBe('self');
        });
    });

    describe('Pluto', () => {
        it('should parse "When you play this character, you may remove up to 3 damage from one of your characters"', () => {
            const card = {
                id: 'test-pluto',
                name: 'Pluto',
                type: 'Character' as CardType,
                abilities: [{ fullText: "To the Rescue When you play this character, you may remove up to 3 damage from one of your characters." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_played');
            expect((abilities[0] as any).effects[0].type).toBe('heal');
            expect((abilities[0] as any).effects[0].amount).toBe(3);
            expect((abilities[0] as any).effects[0].target.type).toBe('chosen_character');
            expect((abilities[0] as any).effects[0].target.filter.mine).toBe(true);
        });
    });

    describe('Hades', () => {
        it('should parse "⟳, banish one of your other characters — Play a character with the same name as the banished character for free"', () => {
            const card = {
                id: 'test-hades',
                name: 'Hades',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Here's the Trade-off ⟳, banish one of your other characters — Play a character with the same name as the banished character for free." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated');
            expect((abilities[0] as any).costs.length).toBe(2);
            expect((abilities[0] as any).costs[0].type).toBe('exert');
            expect((abilities[0] as any).costs[1].type).toBe('banish');
            expect((abilities[0] as any).costs[1].target).toBe('other_character');
            expect((abilities[0] as any).effects[0].type).toBe('play_card');
            expect((abilities[0] as any).effects[0].free).toBe(true);
            expect((abilities[0] as any).effects[0].target.type).toBe('card_from_hand');
            expect((abilities[0] as any).effects[0].target.filter.name).toBe('same_as_banished');
        });
    });
});
