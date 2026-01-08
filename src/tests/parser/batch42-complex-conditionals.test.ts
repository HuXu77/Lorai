import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { Card } from '../../engine/models';

describe('Batch 42: Complex Conditional Effects', () => {

    // 1. "If you have fewer than X cards in your hand" (Flynn Rider - Charming Rogue)
    // "Here Comes the Smolder: When you play this character, if you have fewer than 3 cards in your hand, each opponent chooses and discards a card."
    it('should parse "if you have fewer than X cards in your hand" condition', () => {
        const card: Card = {
            id: 'batch42-flynn',
            name: 'Flynn Rider',
            title: 'Charming Rogue',
            cost: 2,
            inkwell: true,
            type: 'character',
            abilities: [
                "Here Comes the Smolder When you play this character, if you have fewer than 3 cards in your hand, each opponent chooses and discards a card."
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');

        // Effect should be wrapped in conditional
        const effect = (abilities[0] as any).effects[0];
        expect(effect.type).toBe('conditional');
        expect(effect.condition.type).toBe('hand_size');
        expect(effect.condition.amount).toBe(3);
        expect(effect.condition.comparison).toBe('less_than');
        expect(effect.effect.type).toBe('opponent_discard_choice');
    });

    // 2. "While this character has no damage" (Razoul - Palace Guard)
    // "Palace Guard: While this character has no damage, he gets +2 ¤."
    it('should parse "while this character has no damage" condition', () => {
        const card: Card = {
            id: 'batch42-razoul',
            name: 'Razoul',
            title: 'Palace Guard',
            cost: 4,
            inkwell: false,
            type: 'character',
            abilities: [
                "Palace Guard While this character has no damage, he gets +2 ¤."
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static');
        expect((abilities[0] as any).condition).toEqual({
            type: 'has_no_damage',
            target: 'self'
        });
        expect((abilities[0] as any).effects[0].type).toBe('modify_stats');
        expect((abilities[0] as any).effects[0].stat).toBe('strength');
        expect((abilities[0] as any).effects[0].amount).toBe(2);
    });

    // 3. "Play for free if..." (LeFou - Instigator)
    // "Fan the Flames: During your turn, you may play this character for free if an opposing character was banished in a challenge this turn."
    it('should parse "play for free if..." condition', () => {
        const card: Card = {
            id: 'batch42-lefou',
            name: 'LeFou',
            title: 'Instigator',
            cost: 2,
            inkwell: true,
            type: 'character',
            abilities: [
                "Fan the Flames During your turn, you may play this character for free if an opposing character was banished in a challenge this turn."
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static');
        expect((abilities[0] as any).effects[0].type).toBe('play_for_free');
        expect((abilities[0] as any).condition).toEqual({
            type: 'event_occurred',
            event: 'character_banished_in_challenge',
            turn: 'this_turn'
        });
    });

    // 4. "If you have a character named X in play" (Anna - Loving Heart)
    // "A True Heart: When you play this character, if you have a character named Elsa in play, choose an opposing character. They can't quest during their next turn."
    it('should parse "if you have a character named X in play" condition', () => {
        const card: Card = {
            id: 'batch42-anna',
            name: 'Anna',
            title: 'Loving Heart',
            cost: 4,
            inkwell: true,
            type: 'character',
            abilities: [
                "A True Heart When you play this character, if you have a character named Elsa in play, choose an opposing character. They can't quest during their next turn."
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');

        // Effect should be wrapped in conditional
        const effect = (abilities[0] as any).effects[0];
        expect(effect.type).toBe('conditional');
        expect(effect.condition.type).toBe('presence');
        expect(effect.condition.filter.name).toBe('Elsa');
        expect(effect.effect.type).toBe('restriction');
        expect(effect.effect.restriction).toBe('cant_quest');
    });

    // 5. "While you have an exerted character here" (Ursula's Garden)
    // "Full of Weeds: While you have an exerted character here, opposing characters get -1 ◊."
    it('should parse "while you have an exerted character here" condition', () => {
        const card: Card = {
            id: 'batch42-ursulas-garden',
            name: "Ursula's Garden",
            title: 'Full of Weeds',
            cost: 2,
            inkwell: true,
            type: 'location',
            abilities: [
                "Full of Weeds While you have an exerted character here, opposing characters get -1 ◊."
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static');
        expect((abilities[0] as any).condition).toEqual({
            type: 'while_here_exerted'
        });
        expect((abilities[0] as any).effects[0].type).toBe('modify_stats');
        expect((abilities[0] as any).effects[0].stat).toBe('lore');
        expect((abilities[0] as any).effects[0].amount).toBe(-1);
    });

});
