import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { Card } from '../../engine/models';

describe('Batch 4: "While" Static Conditions', () => {

    // "While this character is challenging"
    // Example: Captain Hook - Forceful Duelist
    // "While this character is challenging, this character gets +2 ¤."
    it('should parse "While this character is challenging"', () => {
        const card: Card = {
            id: 'captain-hook-forceful-duelist',
            name: 'Captain Hook',
            fullName: 'Captain Hook - Forceful Duelist',
            abilities: [
                {
                    type: 'static',
                    fullText: "While this character is challenging, this character gets +2 ¤."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('static');
        expect((abilities[0] as any).condition.type).toBe('while_challenging');
        expect((abilities[0] as any).effects[0].type).toBe('modify_stats');
        expect((abilities[0] as any).effects[0].stat).toBe('strength');
        expect((abilities[0] as any).effects[0].amount).toBe(2);
    });

    // "While you have no cards in your hand"
    // Example: Donald Duck - Musketeer
    // "While you have no cards in your hand, this character gets +1 ◊ and Evasive."
    it('should parse "While you have no cards in your hand"', () => {
        const card: Card = {
            id: 'donald-duck-musketeer',
            name: 'Donald Duck',
            fullName: 'Donald Duck - Musketeer',
            abilities: [
                {
                    type: 'static',
                    fullText: "While you have no cards in your hand, this character gets +1 ◊ and Evasive."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('static');
        expect((abilities[0] as any).condition.type).toBe('hand_empty');
        expect((abilities[0] as any).effects.length).toBe(2);
        expect((abilities[0] as any).effects[0].type).toBe('modify_stats');
        expect((abilities[0] as any).effects[0].stat).toBe('lore');
        expect((abilities[0] as any).effects[1].type).toBe('grant_keyword');
        expect((abilities[0] as any).effects[1].keyword).toBe('Evasive');
    });

    // "While this character is at a location"
    // Example: Generic
    // "While this character is at a location, this character gets +1 🛡️."
    it('should parse "While this character is at a location"', () => {
        const card: Card = {
            id: 'generic-location-buff',
            name: 'Generic',
            fullName: 'Generic - Location Buff',
            abilities: [
                {
                    type: 'static',
                    fullText: "While this character is at a location, this character gets +1 🛡️."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('static');
        expect((abilities[0] as any).condition.type).toBe('at_any_location');
        expect((abilities[0] as any).effects[0].type).toBe('modify_stats');
        expect((abilities[0] as any).effects[0].stat).toBe('willpower');
    });

    // "While you have a character named X in play"
    // Example: Generic
    // "While you have a character named Hercules in play, this character gets +1 ¤."
    it('should parse "While you have a character named X in play"', () => {
        const card: Card = {
            id: 'generic-presence-buff',
            name: 'Generic',
            fullName: 'Generic - Presence Buff',
            abilities: [
                {
                    type: 'static',
                    fullText: "While you have a character named Hercules in play, this character gets +1 ¤."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('static');
        expect((abilities[0] as any).effects[0].condition.type).toBe('presence');
        expect((abilities[0] as any).effects[0].condition.filter.name).toBe('Hercules');
        expect((abilities[0] as any).effects[0].type).toBe('modify_stats');
    });
});
