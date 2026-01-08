import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batches 18-19: Final Push Patterns', () => {
    describe('Whenever Challenges', () => {
        it('should parse whenever challenges (Shere Khan)', () => {
            const card = {
                id: 'test-khan',
                name: 'Shere Khan',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Don't Insult My Intelligence Whenever one of your characters challenges another character, gain 1 lore." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('gain_lore');
        });
    });

    describe('Compound When and Whenever', () => {
        it('should parse compound with keyword grant (John Silver)', () => {
            const card = {
                id: 'test-silver',
                name: 'John Silver',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Pick Your Fights When you play this character and whenever he quests, chosen opposing character gains reckless during their next turn. (they can't quest and must challenge if able.)" }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(2); // One for play, one for quest
            expect((abilities[0] as any).effects[0].keyword).toBe('Reckless');
        });
    });

    describe('Deal Damage to Each Opposing', () => {
        it('should parse damage to each opposing (Chief Bogo)', () => {
            const card = {
                id: 'test-bogo',
                name: 'Chief Bogo',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Insubordination! Whenever you play a floodborn character, deal 1 damage to each opposing character." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('damage');
            expect((abilities[0] as any).effects[0].target.type).toBe('each_opposing_character');
        });
    });

    describe('Mass Keyword Grant', () => {
        it('should parse mass keyword grant (Li Shang)', () => {
            const card = {
                id: 'test-shang',
                name: 'Li Shang',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Archery Lesson Whenever this character quests, your characters gain evasive this turn. (they can challenge characters with evasive.)" }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].keyword).toBe('evasive');
            expect((abilities[0] as any).effects[0].target.type).toBe('all_characters');
        });
    });
});
