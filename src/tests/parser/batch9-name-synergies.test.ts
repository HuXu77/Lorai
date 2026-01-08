import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { Card } from '../../engine/models';

describe('Batch 9: Name-based Synergies & Conditional Triggers', () => {
    it('should parse "Your characters named [Name] gain [Keyword]"', () => {
        const card: Card = {
            id: 'jetsam-ursula',
            name: 'Jetsam',
            fullName: 'Jetsam - Ursula\'s Spy',
            abilities: [
                {
                    type: 'static',
                    fullText: "Your characters named Flotsam gain Evasive."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('grant_keyword');
        expect(effects[0].keyword).toBe('Evasive');
        expect(effects[0].target.type).toBe('all_characters');
        expect(effects[0].target.filter.name).toBe('Flotsam');
        expect(effects[0].target.filter.mine).toBe(true);
    });

    it('should parse "Your characters named [Name] gain [Stat]"', () => {
        const card: Card = {
            id: 'tinker-bell-peter-pan',
            name: 'Tinker Bell',
            fullName: 'Tinker Bell - Peter Pan\'s Ally',
            abilities: [
                {
                    type: 'static',
                    fullText: "Your characters named Peter Pan gain Challenger +1."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('grant_keyword'); // Challenger is a keyword with value
        expect(effects[0].keyword).toBe('Challenger');
        expect(effects[0].amount).toBe(1);
        expect(effects[0].target.type).toBe('all_characters');
        expect(effects[0].target.filter.name).toBe('Peter Pan');
        expect(effects[0].target.filter.mine).toBe(true);
    });

    it('should parse "When you play this character, if you have a character named [Name] in play, [Effect]"', () => {
        const card: Card = {
            id: 'anna-heir-to-arendelle',
            name: 'Anna',
            fullName: 'Anna - Heir to Arendelle',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "When you play this character, if you have a character named Elsa in play, chosen opposing character doesn't ready at the start of their next turn."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('card_played');

        // Effect should be wrapped in conditional
        const effect = (abilities[0] as any).effects[0];
        expect(effect.type).toBe('conditional');
        expect(effect.condition.type).toBe('presence');
        expect(effect.condition.filter.name).toBe('Elsa');

        expect(effect.effect.type).toBe('restriction');
        expect(effect.effect.restriction).toBe('cant_ready');
        expect(effect.effect.target.type).toBe('chosen_opposing_character');
    });

    it('should parse "Whenever you play a character named [Name], [Effect]"', () => {
        // Hypothetical or future card pattern, but good to cover generic name triggers
        const card: Card = {
            id: 'generic-name-trigger',
            name: 'Generic',
            fullName: 'Generic Name Trigger',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "Whenever you play a character named Stitch, you may draw a card."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('card_played');
        expect(abilities[0].triggerFilter.name).toBe('Stitch');

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('draw');
        expect(effects[0].amount).toBe(1);
        expect(effects[0].optional).toBe(true);
    });
    it('should parse standalone keyword "Rush"', () => {
        const card = {
            id: 'test-rush',
            abilities: [
                { type: 'static', fullText: 'Rush' }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('static');
        expect((abilities[0] as any).keyword).toBe('rush');
    });
});
