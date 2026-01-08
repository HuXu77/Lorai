import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 34: Reveal & Heal Each', () => {
    describe('Action: Reveal Top Cards', () => {
        it('should parse reveal top cards and put specific type in hand (Invited to the Ball)', () => {
            const card = {
                id: 'test-invited-to-the-ball',
                name: 'Invited to the Ball',
                type: 'Action' as CardType,
                abilities: [{ fullText: "Reveal the top 2 cards of your deck. Put revealed character cards into your hand. Put the rest on the bottom of your deck in any order." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('reveal_and_draw');
            expect((abilities[0] as any).effects[0].amount).toBe(2);
            expect((abilities[0] as any).effects[0].filter.type).toBe('character');
        });
    });

    describe('Action/Item: Remove Damage from Each', () => {
        it('should parse remove damage from each of your characters (Cleansing Rainwater)', () => {
            const card = {
                id: 'test-cleansing-rainwater',
                name: 'Cleansing Rainwater',
                type: 'Item' as CardType,
                abilities: [{ fullText: "Ancient Power Banish this item — Remove up to 2 damage from each of your characters." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated');
            expect((abilities[0] as any).costs[0].type).toBe('banish');
            expect((abilities[0] as any).effects[0].type).toBe('heal');
            expect((abilities[0] as any).effects[0].amount).toBe(2);
            expect((abilities[0] as any).effects[0].target.type).toBe('all_characters');
            expect((abilities[0] as any).effects[0].target.owner).toBe('self');
        });

        it('should parse remove damage from each of your characters (First Aid)', () => {
            const card = {
                id: 'test-first-aid',
                name: 'First Aid',
                type: 'Action' as CardType,
                abilities: [{ fullText: "Remove up to 1 damage from each of your characters." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('heal');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
            expect((abilities[0] as any).effects[0].target.type).toBe('all_characters');
            expect((abilities[0] as any).effects[0].target.owner).toBe('self');
        });
    });

    describe('Triggered: Opponent Chooses and Exerts', () => {
        it('should parse opponent chooses and exerts (Anna)', () => {
            const card = {
                id: 'test-anna',
                name: 'Anna',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Growing Powers When you play this character, each opponent chooses and exerts one of their ready characters." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_played');
            expect((abilities[0] as any).effects[0].type).toBe('opponent_choice_action');
            expect((abilities[0] as any).effects[0].action).toBe('exert');
        });
    });
});
