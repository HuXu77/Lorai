import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 27: Cant Ready & Locations', () => {
    describe('Triggered: Cant Ready', () => {
        it('should parse cant ready effect (Anna)', () => {
            const card = {
                id: 'test-anna',
                name: 'Anna',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Loving Heart When you play this character, if you have a character named Elsa in play, choose an opposing character. The chosen character doesn't ready at the start of their next turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_played');
            expect(abilities[0].event).toBe('card_played');

            // Effect should be wrapped in conditional
            const effect = (abilities[0] as any).effects[0];
            expect(effect.type).toBe('conditional');
            expect(effect.condition.type).toBe('presence');
            expect(effect.condition.filter.name).toBe('Elsa');

            expect(effect.effect.type).toBe('restriction');
            expect(effect.effect.restriction).toBe('cant_ready');
            expect(effect.effect.duration).toBe('next_turn_start');
        });

        it('should parse cant ready effect (Ursula)', () => {
            const card = {
                id: 'test-ursula',
                name: 'Ursula',
                type: 'Character' as CardType,
                abilities: [{ fullText: "You're Too Late Whenever this character quests, chosen opposing character can't ready at the start of their next turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_quested');
            expect((abilities[0] as any).effects[0].type).toBe('restriction');
            expect((abilities[0] as any).effects[0].restriction).toBe('cant_ready');
            expect((abilities[0] as any).effects[0].duration).toBe('next_turn');
        });
    });

    describe('Static: Location Abilities', () => {
        it('should parse cant be challenged while here (Tianas Palace)', () => {
            const card = {
                id: 'test-tianas-palace',
                name: "Tiana's Palace",
                type: 'Location' as CardType,
                abilities: [{ fullText: "Night Out Characters can't be challenged while here." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).effects[0].type).toBe('restriction');
            expect((abilities[0] as any).effects[0].restriction).toBe('cant_be_challenged');
            expect((abilities[0] as any).condition.type).toBe('while_here');
        });
    });

    describe('Triggered: Location Abilities', () => {
        it('should parse whenever banished while here (Motunui)', () => {
            const card = {
                id: 'test-motunui',
                name: 'Motunui',
                type: 'Location' as CardType,
                abilities: [{ fullText: "Reincarnation Whenever a character is banished while here, you may put that card into your inkwell facedown and exerted." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_banished');
            expect((abilities[0] as any).condition.type).toBe('while_here');
            expect((abilities[0] as any).effects[0].type).toBe('put_into_inkwell');
        });
    });
});
