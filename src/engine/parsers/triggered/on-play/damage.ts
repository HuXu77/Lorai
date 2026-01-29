import { TriggerPattern } from '../types';
import { generateAbilityId, GameEvent } from '../../parser-utils';

export const DAMAGE_PATTERNS: TriggerPattern[] = [
    // Generic Damage
    {
        pattern: /^when you play this (?:character|item|action), deal (\d+) damage to chosen character/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'damage',
                    amount,
                    target: { type: 'chosen_character' }
                }],
                rawText: text
            } as any;
        }
    },
    // Deal Damage to Opposing (handles both "damaged opposing" and "opposing damaged" orderings)
    {
        pattern: /When you play this character, deal (\d+) damage to chosen (?:(damaged) )?(opposing )?(?:(damaged) )?character/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            const isDamaged = !!(match[2] || match[4]);
            const isOpposing = !!match[3];

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'damage',
                    amount,
                    target: {
                        type: isOpposing ? 'chosen_opposing_character' : 'chosen_character',
                        filter: isDamaged ? { damaged: true } : undefined
                    }
                }],
                rawText: text
            } as any;
        }
    },
    // Deal Damage equal to stat
    {
        pattern: /deal damage equal to their (strength|willpower|lore|¤|🛡️|⛉|◊|⬡) to chosen (opposing )?character/i,
        handler: (match, card, text) => {
            let stat = 'strength';
            const symbol = match[1].toLowerCase();
            if (['willpower', '🛡️', '⛉'].includes(symbol)) stat = 'willpower';
            if (['lore', '◊', '⬡'].includes(symbol)) stat = 'lore';
            const isOpposing = !!match[2];

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'damage',
                    amount: { type: 'attribute_of_self', attribute: stat },
                    target: {
                        type: isOpposing ? 'chosen_opposing_character' : 'chosen_character'
                    }
                }],
                rawText: text
            } as any;
        }
    },
    // Deal Damage equal to count of characters (Broom Master)
    {
        pattern: /deal damage equal to the number of (.+?) characters you have in play to chosen (opposing )?character/i,
        handler: (match, card, text) => {
            const subtype = match[1];
            const isOpposing = !!match[2];

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'damage',
                    amount: {
                        type: 'count',
                        source: 'play',
                        filter: { subtype }
                    },
                    target: {
                        type: isOpposing ? 'chosen_opposing_character' : 'chosen_character'
                    }
                }],
                rawText: text
            } as any;
        }
    },
    // Deal Damage to All
    {
        pattern: /deal (\d+) damage to all (opposing )?characters/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            const isOpposing = !!match[2];
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'damage',
                    amount,
                    target: { type: isOpposing ? 'all_opposing_characters' : 'all_characters' }
                }],
                rawText: text
            } as any;
        }
    },

    // Banish All Opposing (Tsunami)
    {
        pattern: /^(?:when you play this character, )?banish all opposing characters/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'banish',
                    target: { type: 'all_opposing_characters' }
                }],
                rawText: text
            } as any;
        }
    },
    // Banish Self vs Hand Choice (Madam Mim)
    {
        pattern: /^when you play this character, banish (?:her|him|them) or return another (\d+ )?chosen characters? of yours to your hand/i,
        handler: (match, card, text) => {
            const count = match[1] ? parseInt(match[1]) : 1;
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'modal_choice',
                    choices: [
                        {
                            type: 'banish',
                            target: { type: 'self' }
                        },
                        {
                            type: 'return_to_hand',
                            target: {
                                type: 'chosen_character',
                                count,
                                filter: { mine: true, other: true }
                            }
                        }
                    ]
                }],
                rawText: text
            } as any;
        }
    },
    // Opponent Choice Banish (Lady Tremaine)
    {
        pattern: /each opponent chooses and banishes one of their characters/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'opponent_choice_banish',
                    amount: 1
                }],
                rawText: text
            } as any;
        }
    },
    // Pattern #17: Remove damage from subtype characters (Goofy - Musketeer Swordsman)
    {
        pattern: /^when you play this character, you may remove up to (\d+) damage from each of your (.+?) characters/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            const subtype = match[2].trim();

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'remove_damage',
                    amount,
                    target: {
                        type: 'all_characters',
                        filter: { owned: true, subtype }
                    },
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Remove Damage (Heal)
    {
        pattern: /^when you play this character, remove up to (\d+) damage from one of your characters\. draw a card for each 1 damage removed this way/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'heal_and_draw',
                    amount, // Max amount to heal
                    target: { type: 'chosen_character', filter: { mine: true } }
                }],
                rawText: text
            } as any;
        }
    },
    // Remove Damage (Generic)
    {
        pattern: /^remove up to (\d+) damage from each of your characters/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'heal',
                    amount,
                    target: { type: 'all_characters', mine: true }
                }],
                rawText: text
            } as any;
        }
    },
    // Put Damage Counter
    {
        pattern: /when you play this character, (?:you may )?put (\d+) damage counters? on chosen character/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'put_damage_counter',
                    amount: amount,
                    target: { type: 'chosen_character' },
                    optional: text.match(/you may/i) ? true : false
                }],
                rawText: text
            } as any;
        }
    },
    // Gaston - Egotistical Bully (Lowest Cost Damage)
    {
        pattern: /when you play this character, deal (\d+) damage to the opposing character with the lowest cost/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'damage',
                    amount,
                    target: {
                        type: 'opposing_character',
                        criteria: 'lowest_cost'
                    }
                }],
                rawText: text
            } as any;
        }
    },
    // Cobra Pit: Deal damage to each opposing character (Jafar/You)
    {
        pattern: /when (?:jafar|you) plays? this (?:character|location), (?:he|you) deals? (\d+) damage to each opposing character/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'damage',
                    amount,
                    target: { type: 'all_opposing_characters' }
                }],
                rawText: text
            } as any;
        }
    },
    // Endless Staircase: Deal damage to highest cost opposing character(s) (Jafar/You)
    {
        pattern: /when (?:jafar|you) plays? this (?:character|location), (?:he|you) deals? (\d+) damage to the character with the highest cost each illumineer has in play/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'damage',
                    amount,
                    target: {
                        type: 'opposing_character',
                        criteria: 'highest_cost_per_player'
                    }
                }],
                rawText: text
            } as any;
        }
    }
];
