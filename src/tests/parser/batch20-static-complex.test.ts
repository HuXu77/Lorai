import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 20: Static & Complex Triggers', () => {
    describe('Static: While Exerted', () => {
        it('should parse while exerted condition (Mother Gothel)', () => {
            const card = {
                id: 'test-gothel',
                name: 'Mother Gothel',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Skip the Drama, Stay with Mama\nWhile this character is exerted, opposing characters can't quest." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).condition.type).toBe('self_exerted');
            expect((abilities[0] as any).effects[0].type).toBe('restriction');
            expect((abilities[0] as any).effects[0].restriction).toBe('cant_quest');
        });
    });

    describe('Static: Multi-Subtype Buffs', () => {
        it('should parse multi-subtype buff (Grand Duke)', () => {
            const card = {
                id: 'test-duke',
                name: 'Grand Duke',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Yes, Your Majesty Your Prince, Princess, King, and Queen characters get +1 ¤." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).effects[0].type).toBe('modify_stats');
            expect((abilities[0] as any).effects[0].target.filter.subtypes).toContain('Prince');
            expect((abilities[0] as any).effects[0].target.filter.subtypes).toContain('Princess');
        });
    });

    describe('Static: Global Restrictions', () => {
        it('should parse cost-based restriction (Gantu)', () => {
            const card = {
                id: 'test-gantu',
                name: 'Gantu',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Under Arrest Characters with cost 2 or less can't challenge your characters." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).effects[0].type).toBe('restriction');
            expect((abilities[0] as any).effects[0].restriction).toBe('cant_challenge_yours');
        });
    });

    describe('Triggered: Whenever Challenges', () => {
        it('should parse whenever challenges (Shere Khan)', () => {
            const card = {
                id: 'test-khan',
                name: 'Shere Khan',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Don't Insult My Intelligence Whenever one of your characters challenges another character, gain 1 lore." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered'); // Correctly parsed as triggered
            expect((abilities[0] as any).event).toBe('card_challenges');
            expect((abilities[0] as any).effects[0].type).toBe('gain_lore');
        });
    });
});
