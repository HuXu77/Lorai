import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Batches 16-17: More Common Patterns', () => {
    describe('Activated: Gain Lore', () => {
        it('should parse simple gain lore (The Sorcerer\'s Spellbook)', () => {
            const card = {
                id: 'test-spellbook',
                name: 'The Sorcerer\'s Spellbook',
                type: 'Item',
                abilities: [{ fullText: "Knowledge ⟳, 1 ⬡ — gain 1 lore." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('gain_lore');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
        });
    });

    describe('Activated: Return with Filter', () => {
        it('should parse return with keyword filter (Dragon Gem)', () => {
            const card = {
                id: 'test-gem',
                name: 'Dragon Gem',
                type: 'Item',
                abilities: [{ fullText: "Bring Back to Life ⟳, 3 ⬡ — return a character card with support from your discard to your hand." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('return_from_discard');
            expect((abilities[0] as any).effects[0].target.keyword).toBe('support');
        });
    });

    describe('Implicit: Can Challenge Ready', () => {
        it('should parse can challenge ready (Pick a Fight)', () => {
            const card = {
                id: 'test-pick',
                name: 'Pick a Fight',
                type: 'Action',
                abilities: [{ fullText: "Chosen character can challenge ready characters this turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].ability).toBe('can_challenge_ready');
        });
    });

    describe('Implicit: Gain Lore For Each', () => {
        it('should parse gain lore for each (Pack Tactics)', () => {
            const card = {
                id: 'test-pack',
                name: 'Pack Tactics',
                type: 'Action',
                abilities: [{ fullText: "Gain 1 lore for each damaged character opponents have in play." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('gain_lore');
            expect((abilities[0] as any).effects[0].per).toBe('damaged_opponent_character');
        });
    });
});
