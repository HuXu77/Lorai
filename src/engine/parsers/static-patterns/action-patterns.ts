/**
 * Action Card Patterns Module
 * 
 * Handles patterns for action card effects:
 * - Damage dealing (Deal X damage to chosen character)
 * - Banishing (Banish chosen character)
 * - Ready/Exert (Ready chosen character)
 * - Draw/Discard combinations
 */

import { PatternHandler } from './types';
import { parseTargetFilter } from '../pattern-matchers';

export const actionPatterns: PatternHandler[] = [
    // "Banish chosen character." / "Banish chosen opposing character."
    {
        name: 'banish_chosen_strength',
        pattern: /banish chosen(?: opposing)? character with (\d+)\s*(?:strength|cost|lore|willpower|attack|\u00A4)?\s*or more/i,
        handle: (text, match) => [{
            type: 'banish',
            target: {
                type: 'chosen_character',
                filter: {
                    strengthMin: parseInt(match[1]),
                    ...(text.includes('opposing') ? { opponent: true } : {})
                }
            }
        }],
        priority: 110
    },

    // "Banish chosen character." / "Banish chosen opposing character."
    {
        name: 'banish_chosen',
        pattern: /^banish chosen(?: opposing)? character/i,
        handle: (text) => [{
            type: 'banish',
            target: {
                type: 'chosen_character',
                filter: text.includes('opposing') ? { opponent: true } : {}
            }
        }],
        priority: 100
    },

    // "Banish chosen character with cost X or less."
    {
        name: 'banish_cost_filter',
        pattern: /banish chosen character with cost (\d+) or less/i,
        handle: (text, match) => [{
            type: 'banish',
            target: {
                type: 'chosen_character',
                filter: { costMax: parseInt(match[1]) }
            },
            optional: text.includes('you may')
        }],
        priority: 95
    },

    // "Banish all opposing [filtered] characters"
    {
        name: 'banish_all_filtered',
        pattern: /^banish all opposing (.+?) characters/i,
        handle: (text, match) => [{
            type: 'banish',
            target: {
                type: 'all_characters',
                filter: {
                    opponent: true,
                    [match[1].toLowerCase()]: true
                }
            }
        }],
        priority: 90
    },

    // "Deal X damage to chosen character."
    {
        name: 'deal_damage_chosen',
        pattern: /^(?:you may )?deal (\d+) damage to chosen(?: opposing| damaged)? character/i,
        handle: (text, match) => [{
            type: 'damage',
            amount: parseInt(match[1]),
            target: { type: 'chosen_character', filter: parseTargetFilter(text) },
            optional: text.match(/you may/i) ? true : false
        }],
        priority: 85
    },

    // "Deal X damage to up to Y chosen characters."
    {
        name: 'deal_damage_multiple',
        pattern: /^(?:you may )?deal (\d+) damage to (?:up to )?(\d+) chosen characters/i,
        handle: (text, match) => [{
            type: 'damage',
            amount: parseInt(match[1]),
            target: {
                type: 'chosen_character',
                count: parseInt(match[2]),
                filter: parseTargetFilter(text)
            },
            optional: text.match(/you may/i) ? true : false
        }],
        priority: 80
    },

    // "Deal damage equal to the number of cards in your hand"
    {
        name: 'deal_damage_variable',
        pattern: /^(?:you may )?deal damage to chosen(?: opposing| damaged)? character equal to the number of (.+)/i,
        handle: (text, match) => {
            const variableText = match[1].toLowerCase();
            let amount: any = { type: 'count', source: 'unknown' };

            if (variableText.includes('cards in your hand')) {
                amount = { type: 'count', source: 'hand', owner: 'self' };
            } else if (variableText.includes('cards in their hand')) {
                amount = { type: 'count', source: 'hand', owner: 'opponent' };
            }

            return [{
                type: 'damage',
                amount,
                target: { type: 'chosen_character', filter: parseTargetFilter(text) },
                optional: text.match(/you may/i) ? true : false
            }];
        },
        priority: 75
    },

    // "Deals X damage to each opposing [filtered] character"
    {
        name: 'deal_damage_mass_filtered',
        pattern: /deals? (\d+) damage to each opposing (damaged|exerted) characters?/i,
        handle: (text, match) => [{
            type: 'damage',
            amount: parseInt(match[1]),
            target: {
                type: 'all_characters',
                filter: {
                    opponent: true,
                    [match[2].toLowerCase()]: true
                }
            }
        }],
        priority: 70
    },

    // "Ready chosen character."
    {
        name: 'ready_chosen_character',
        pattern: /^ready chosen character/i,
        handle: () => [{
            type: 'ready',
            target: { type: 'chosen_character' }
        }],
        priority: 65
    },

    // "Ready chosen item."
    {
        name: 'ready_chosen_item',
        pattern: /^(?:you may )?ready chosen item/i,
        handle: (text) => [{
            type: 'ready',
            target: { type: 'chosen_item' },
            optional: text.match(/you may/i) ? true : false
        }],
        priority: 60
    },

    // "Exert chosen character."
    {
        name: 'exert_chosen_character',
        pattern: /^exert chosen(?: damaged)? character/i,
        handle: (text) => [{
            type: 'exert',
            target: {
                type: 'chosen_character',
                filter: text.includes('damaged') ? { damaged: true } : {}
            }
        }],
        priority: 55
    },

    // "Each player draws a card."
    {
        name: 'each_player_draws',
        pattern: /^each player draws a card/i,
        handle: () => [{
            type: 'draw',
            amount: 1,
            target: { type: 'all_players' }
        }],
        priority: 50
    },

    // "Each player chooses and discards a card."
    {
        name: 'each_player_discards',
        pattern: /^each player chooses and discards a card/i,
        handle: () => [{
            type: 'discard',
            amount: 1,
            target: { type: 'all_players' }
        }],
        priority: 45
    },

    // "Discard your hand."
    {
        name: 'discard_hand',
        pattern: /^discard (?:your )?hand/i,
        handle: () => [{
            type: 'discard_hand',
            target: { type: 'self' }
        }],
        priority: 40
    }
];
