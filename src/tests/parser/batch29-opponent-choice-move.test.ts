import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 29: Opponent Choice & Move to Location', () => {
    describe('Static/Triggered: Opponent Chooses', () => {
        it('should parse opponent chooses and deals damage (Tritons Decree)', () => {
            const card = {
                id: 'test-tritons-decree',
                name: "Triton's Decree",
                type: 'Action' as CardType,
                abilities: [{ fullText: "Each opponent chooses one of their characters and deals 2 damage to them." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated'); // Action
            expect((abilities[0] as any).effects[0].type).toBe('opponent_choice_damage');
            expect((abilities[0] as any).effects[0].amount).toBe(2);
        });

        it('should parse opponent chooses and returns to hand (Gunther)', () => {
            const card = {
                id: 'test-gunther',
                name: 'Gunther',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Sad-Eyed Puppy When this character is challenged and banished, each opponent chooses one of their characters and returns that card to their hand." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('character_challenged_and_banished');
            expect((abilities[0] as any).effects[0].type).toBe('opponent_choice_action');
            expect((abilities[0] as any).effects[0].action).toBe('return_to_hand');
        });
    });

    describe('Action: Move to Location', () => {
        it('should parse move characters to location (Voyage)', () => {
            const card = {
                id: 'test-voyage',
                name: 'Voyage',
                type: 'Action' as CardType,
                abilities: [{ fullText: "Move up to 2 characters of yours to the same location for free." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated'); // Action
            expect((abilities[0] as any).effects[0].type).toBe('move_to_location');
            expect((abilities[0] as any).effects[0].amount).toBe(2);
            expect((abilities[0] as any).effects[0].free).toBe(true);
        });
    });
});
