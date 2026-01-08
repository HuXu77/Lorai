import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { Card } from '../../engine/models';

describe('Batch 12: Time/State-based Effects', () => {

    // 1. "During your turn" Triggers
    // Mulan - Imperial Soldier
    it('should parse "During your turn, whenever this character banishes another character in a challenge, your other characters get +1 ¤ this turn"', () => {
        const card = {
            id: 'mulan',
            name: 'Mulan',
            abilities: [
                {
                    type: 'triggered',
                    effect: 'During your turn, whenever this character banishes another character in a challenge, your other characters get +1 ¤ this turn.'
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('challenge_banish');
        expect(abilities[0].triggerFilter.source).toBe('self');
        expect((abilities[0] as any).eventConditions).toEqual([{ type: 'during_your_turn' }]);

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('modify_stats');
        expect(effects[0].stat).toBe('strength');
        expect(effects[0].amount).toBe(1);
        expect(effects[0].target.type).toBe('other_characters');
    });

    // Belle - Strange but Special
    it('should parse "During your turn, you may put an additional card from your hand into your inkwell facedown"', () => {
        const card = {
            id: 'belle',
            name: 'Belle',
            abilities: [
                {
                    type: 'static',
                    effect: 'During your turn, you may put an additional card from your hand into your inkwell facedown.'
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('static');

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('additional_ink');
        expect((abilities[0] as any).condition).toEqual({ type: 'during_your_turn' });
    });

    // 2. "While exerted" Static Abilities
    // Captain Hook - Ruthless Pirate
    it('should parse "While this character is exerted, opposing characters with Evasive gain Reckless"', () => {
        const card = {
            id: 'captain-hook',
            name: 'Captain Hook',
            abilities: [
                {
                    type: 'static',
                    effect: 'While this character is exerted, opposing characters with Evasive gain Reckless.'
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('static');

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('grant_keyword');
        expect(effects[0].keyword).toBe('Reckless');
        expect(effects[0].target.type).toBe('all_opposing_characters');
        expect(effects[0].target.filter.keyword).toBe('evasive');
        expect((abilities[0] as any).condition).toEqual({ type: 'self_exerted' });
    });

    // 3. Inkwell Interactions
    // Gramma Tala - Storyteller
    it('should parse "When this character is banished, you may put this card into your inkwell facedown and exerted"', () => {
        const card = {
            id: 'gramma-tala',
            name: 'Gramma Tala',
            abilities: [
                {
                    type: 'triggered',
                    effect: 'When this character is banished, you may put this card into your inkwell facedown and exerted.'
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('card_banished');

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('move_to_inkwell');
        expect(effects[0].target.type).toBe('self');
        expect(effects[0].exerted).toBe(true);
        expect(effects[0].optional).toBe(true);
    });

    // Hades - Infernal Schemer
    it('should parse "When you play this character, you may put chosen opposing character into their player\'s inkwell facedown"', () => {
        const card = {
            id: 'hades',
            name: 'Hades',
            abilities: [
                {
                    type: 'triggered',
                    effect: 'When you play this character, you may put chosen opposing character into their player\'s inkwell facedown.'
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('card_played');

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('put_into_inkwell');
        expect(effects[0].target.type).toBe('chosen_opposing_character');
        expect(effects[0].optional).toBe(true);
    });

});
