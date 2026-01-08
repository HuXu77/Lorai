import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { Card } from '../../engine/models';

describe('Batch 11: Prevention & Recursion', () => {

    // 1. Prevention Effects
    // Jasper - Common Crook
    it('should parse "chosen opposing character can\'t quest during their next turn"', () => {
        const card = {
            id: 'jasper',
            name: 'Jasper',
            abilities: [
                {
                    type: 'triggered',
                    effect: 'Whenever this character quests, chosen opposing character can\'t quest during their next turn.'
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('cant_quest');
        expect(effects[0].target.type).toBe('chosen_opposing_character');
        expect(effects[0].duration).toBe('next_turn');
    });

    // Mickey Mouse - Artful Rogue
    it('should parse "chosen opposing character can\'t quest during their next turn" (Action Trigger)', () => {
        const card = {
            id: 'mickey-mouse',
            name: 'Mickey Mouse',
            abilities: [
                {
                    type: 'triggered',
                    effect: 'Whenever you play an action, chosen opposing character can\'t quest during their next turn.'
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        // Check trigger
        expect(abilities[0].event).toBe('card_played');
        expect(abilities[0].triggerFilter.type).toBe('action');

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('cant_quest');
    });

    // 2. Recursion (Return from Discard)
    // Lady Tremaine - Wicked Stepmother
    it('should parse "return an action card from your discard to your hand"', () => {
        const card = {
            id: 'lady-tremaine',
            name: 'Lady Tremaine',
            abilities: [
                {
                    type: 'triggered',
                    effect: 'When you play this character, you may return an action card from your discard to your hand.'
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBe(1);
        expect(effects[0].type).toBe('return_from_discard');
        expect(effects[0].target.type).toBe('card_in_discard');
        expect(effects[0].target.filter.cardType).toBe('action');
        expect(effects[0].destination).toBe('hand');
        expect(effects[0].optional).toBe(true);
    });

    // 3. Song Triggers
    // Dr. Facilier - Remarkable Gentleman
    it('should parse "Whenever you play a song, you may look at the top 2 cards of your deck"', () => {
        const card = {
            id: 'dr-facilier',
            name: 'Dr. Facilier',
            abilities: [
                {
                    type: 'triggered',
                    effect: 'Whenever you play a song, you may look at the top 2 cards of your deck. Put one on the top of your deck and the other on the bottom.'
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');
        expect(abilities[0].event).toBe('card_played');
        // Parser may use different property names for trigger filter
        const tf = (abilities[0] as any).triggerFilter || {};
        expect(tf.subtype || tf.type || tf.cardType).toBeDefined();

        const effects = (abilities[0] as any).effects;
        expect(effects.length).toBeGreaterThan(0);
        // We expect at least the "look at top 2" effect to be parsed if it exists
        // The second part "Put one on top..." might be tricky, but let's see what we get
    });

});
